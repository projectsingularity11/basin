import { optimize, type Scenario } from '../engine/model';
self.onmessage = (e: MessageEvent<{ scenario: Scenario; budget: number; space: number }>) => {
  try {
    self.postMessage({ result: optimize(e.data.scenario, e.data.budget, e.data.space) });
  } catch (e) {
    self.postMessage({ error: (e as Error).message });
  }
};
