'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

export function SmoothScroll() {
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = window.matchMedia('(pointer: fine)');
    let scroll: Lenis | undefined;

    function sync() {
      scroll?.destroy();
      scroll = undefined;
      if (motion.matches || !pointer.matches) return;
      scroll = new Lenis({
        autoRaf: true,
        lerp: 0.12,
        stopInertiaOnNavigate: true,
        allowNestedScroll: true,
        prevent: (node) =>
          Boolean(
            node.closest(
              'dialog, .earth-map-panel, .lab-viewport, .table-wrap, input, select, textarea',
            ),
          ),
      });
    }

    sync();
    motion.addEventListener('change', sync);
    pointer.addEventListener('change', sync);
    return () => {
      scroll?.destroy();
      motion.removeEventListener('change', sync);
      pointer.removeEventListener('change', sync);
    };
  }, []);

  return null;
}
