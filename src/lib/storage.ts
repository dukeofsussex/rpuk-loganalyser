// eslint-disable-next-line import/no-extraneous-dependencies
import { derived, writable } from 'svelte/store';
import type {
  Balances,
  Changes,
  Filter,
  Filters,
  Log,
  LogManager,
  LogType,
} from './logs';

export const balances = writable<Balances>({
  date: new Map(),
  employee: new Map(),
  item: new Map(),
  jobAction: new Map(),
  vehicle: new Map(),
});
export const changes = writable<Changes>(new Map());
export const filters = writable<Filters>({
  date: new Map(),
  employee: new Map(),
  item: new Map(),
  jobAction: new Map(),
  vehicle: new Map(),
});
export const logs = writable<Log[]>([]);
export const logManager = writable<LogManager<Log>>();
export const logType = writable<LogType>();

let currentLogManager: LogManager<Log> | undefined;

// Bad to use get()
logManager.subscribe((manager) => {
  currentLogManager = manager;
});

logs.subscribe((subLogs) => {
  filters.update((f) => {
    for (let i = 0; i < subLogs.length; i += 1) {
      const log = subLogs[i];

      currentLogManager?.storageCallbacks.filters(f, log);
    }

    return f;
  });
});

export const filteredLogs = derived(
  [logs, filters],
  ([$logs, $filters]) => currentLogManager?.storageCallbacks.filteredLogs($logs, $filters) ?? [],
);

filteredLogs.subscribe((SubFilLogs) => {
  balances.update((b) => {
    changes.update((c) => {
      /* eslint-disable no-param-reassign */
      Object.keys(b).forEach((k) => {
        b[k as Filter] = new Map();
      });
      c = new Map();
      /* eslint-enable no-param-reassign */

      for (let i = 0; i < SubFilLogs.length; i += 1) {
        const log = SubFilLogs[i];

        currentLogManager?.storageCallbacks.balancesAndChanges(b, c, log);
      }

      return c;
    });

    return b;
  });
});
