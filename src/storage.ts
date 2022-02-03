// eslint-disable-next-line import/no-extraneous-dependencies
import { derived, writable } from 'svelte/store';

export interface Log {
  date: string;
  fulldate: Date;
  rank: string;
  employee: string;
  item: string;
  quantity: number;
  value: number;
}

export interface Change {
  positive: number;
  negative: number;
  diff: number;
}

export type Filter = 'date' | 'employee' | 'item';
export type Filters = Record<Filter, Map<string, boolean>>;
export type Balances = Record<Filter, Map<string, number>>;

export const logs = writable<Log[]>([]);
export const balances = writable<Balances>({
  date: new Map(),
  employee: new Map(),
  item: new Map(),
});
export const filters = writable<Filters>({
  date: new Map(),
  employee: new Map(),
  item: new Map(),
});
export const changes = writable<Map<string, Change>>(new Map());

function logSubscribe(data: Filters[Filter], value: string) {
  if (data.has(value)) {
    return;
  }

  data.set(value, true);
}

logs.subscribe((subLogs) => {
  filters.update((f) => {
    for (let i = 0; i < subLogs.length; i += 1) {
      const log = subLogs[i];
      logSubscribe(f.date, log.date);
      logSubscribe(f.employee, log.employee);
      logSubscribe(f.item, log.item);
    }
    return f;
  });
});

export const filteredLogs = derived(
  [logs, filters],
  ([$logs, $filters]) => $logs.filter((l) => $filters.date.get(l.date)
    && $filters.employee.get(l.employee)
    && $filters.item.get(l.item)),
);

function filteredLogSubscribe(data: Balances[Filter], key: string, value: number) {
  return data.set(key, (data.get(key) || 0) + value);
}

filteredLogs.subscribe((SubFilLogs) => {
  balances.update((b) => {
    changes.update((c) => {
      /* eslint-disable no-param-reassign */
      b.date = new Map();
      b.employee = new Map();
      b.item = new Map();
      c = new Map();
      /* eslint-enable no-param-reassign */

      for (let i = 0; i < SubFilLogs.length; i += 1) {
        const log = SubFilLogs[i];
        filteredLogSubscribe(b.date, log.date, log.value);
        filteredLogSubscribe(b.employee, log.employee, log.value);
        filteredLogSubscribe(b.item, log.item, log.value);

        const key = log.quantity > 0 ? 'positive' : 'negative';
        const change = c.get(log.item) || { positive: 0, negative: 0, diff: 0 };
        change[key] += log.quantity;
        change.diff = change.positive + change.negative;
        c.set(log.item, change);
      }

      return c;
    });

    return b;
  });
});
