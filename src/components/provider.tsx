'use client';
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useLocalArray } from '@/lib/local-store';
import { DEFAULT, validateScenario, type Scenario, type Run } from '@/engine/model';
type Saved = { id: string; scenario: Scenario };
type State = {
  scenario: Scenario;
  setScenario: (s: Scenario) => void;
  run: Run | null;
  setRun: (r: Run | null) => void;
  saved: Saved[];
  save: (name?: string) => void;
  remove: (id: string) => void;
  notice: string;
  notify: (s: string) => void;
};
function savedRecord(v: unknown): Saved {
  if (!v || typeof v !== 'object' || !('id' in v) || !('scenario' in v))
    throw Error('Invalid record');
  return { id: String(v.id), scenario: validateScenario(v.scenario) };
}
const Context = createContext<State | null>(null);
export function Provider({ children }: { children: ReactNode }) {
  const [scenario, setScenario] = useState<Scenario>(DEFAULT),
    [run, setRun] = useState<Run | null>(null),
    [notice, notify] = useState('');
  const {
    records: saved,
    error: storageError,
    persist: writeSaved,
  } = useLocalArray('basin-scenarios', savedRecord);
  useEffect(() => {
    if (notice) {
      const id = setTimeout(() => notify(''), 5000);
      return () => clearTimeout(id);
    }
  }, [notice]);
  function persist(next: Saved[]) {
    try {
      writeSaved(next);
      return true;
    } catch {
      notify('Browser storage is unavailable or full. Export JSON to preserve your work.');
      return false;
    }
  }
  function save(name?: string) {
    const next = { ...scenario, name: name || scenario.name };
    if (persist([...saved, { id: crypto.randomUUID(), scenario: next }]))
      notify('Scenario saved on this device.');
  }
  return (
    <Context.Provider
      value={{
        scenario,
        setScenario,
        run,
        setRun,
        saved,
        save,
        remove: (id) => persist(saved.filter((s) => s.id !== id)),
        notice,
        notify,
      }}
    >
      {storageError && (
        <div role="alert" className="error">
          {storageError}
        </div>
      )}
      {children}
      {notice && (
        <div role="status" className="toast">
          {notice}
        </div>
      )}
    </Context.Provider>
  );
}
export function useBasin() {
  const c = useContext(Context);
  if (!c) throw Error('Missing provider');
  return c;
}
export function download(name: string, data: unknown) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
