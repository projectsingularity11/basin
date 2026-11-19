import { investigate, type StudyOptions } from '../engine/watershed';
import type { Scenario } from '../engine/model';
self.onmessage = (event: MessageEvent<{ scenario: Scenario; options: StudyOptions }>) => {
  try {
    self.postMessage({ result: investigate(event.data.scenario, event.data.options) });
  } catch (error) {
    self.postMessage({ error: (error as Error).message });
  }
};
