'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { oceanSubmersion } from './water-motion';

const recordings = ['/dive/waves.mp3', '/dive/hydrophone.mp3'];

type SoundGraph = {
  context: AudioContext;
  master: GainNode;
  surface: GainNode;
  submerged: GainNode;
  controller: AbortController;
};

export function OceanSound({ story }: { story: RefObject<HTMLDivElement | null> }) {
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const sound = useRef<SoundGraph>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const graph = sound.current;
      const element = story.current;
      if (!graph || !element) return;
      const { height, top, bottom } = element.getBoundingClientRect();
      const mix = oceanSubmersion(top, innerHeight);
      const time = graph.context.currentTime;
      graph.surface.gain.setTargetAtTime(Math.cos((mix * Math.PI) / 2) * 0.72, time, 0.19);
      graph.submerged.gain.setTargetAtTime(Math.sin((mix * Math.PI) / 2) * 0.8, time, 0.19);
      const active = height > 0 && bottom > 0 && !document.hidden;
      graph.master.gain.setTargetAtTime(enabled && active ? 0.58 : 0, time, 0.2);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    document.addEventListener('visibilitychange', schedule);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      document.removeEventListener('visibilitychange', schedule);
    };
  }, [enabled, story]);

  useEffect(
    () => () => {
      const graph = sound.current;
      sound.current = null;
      graph?.controller.abort();
      if (graph) void graph.context.close().catch(() => {});
    },
    [],
  );

  async function toggle() {
    setMessage('');
    if (enabled) {
      setEnabled(false);
      return;
    }
    if (sound.current) {
      try {
        await sound.current.context.resume();
        setEnabled(true);
      } catch {
        setMessage('Ocean sound is unavailable.');
      }
      return;
    }

    let graph: SoundGraph | undefined;
    try {
      const context = new AudioContext();
      const master = context.createGain();
      const surface = context.createGain();
      const submerged = context.createGain();
      master.gain.value = 0;
      surface.gain.value = 0;
      submerged.gain.value = 0;
      surface.connect(master);
      submerged.connect(master);
      master.connect(context.destination);
      graph = { context, master, surface, submerged, controller: new AbortController() };
      sound.current = graph;
      const { signal } = graph.controller;
      setEnabled(true);
      const [, buffers] = await Promise.all([
        context.resume(),
        Promise.all(
          recordings.map(async (url) => {
            const response = await fetch(url, { signal });
            if (!response.ok) throw new Error('Ocean recording unavailable');
            return context.decodeAudioData(await response.arrayBuffer());
          }),
        ),
      ]);
      if (sound.current !== graph) return;

      buffers.forEach((buffer, index) => {
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(index === 0 ? surface : submerged);
        source.start();
      });
    } catch {
      if (graph?.controller.signal.aborted) return;
      if (graph) {
        graph.controller.abort();
        void graph.context.close().catch(() => {});
      }
      sound.current = null;
      setEnabled(false);
      setMessage('Ocean sound is unavailable.');
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void toggle()}
        aria-label={enabled ? 'Mute ocean sound' : 'Enable ocean sound'}
        title={enabled ? 'Mute ocean sound' : 'Enable ocean sound'}
      >
        {enabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
      </button>
      {message && (
        <span className="ocean-sound-status" role="status">
          {message}
        </span>
      )}
    </>
  );
}
