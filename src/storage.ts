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
export const quantities = writable<Map<string, number>>(new Map());

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
    quantities.update((q) => {
      /* eslint-disable no-param-reassign */
      b.date = new Map();
      b.employee = new Map();
      b.item = new Map();
      q = new Map();
      /* eslint-enable no-param-reassign */

      for (let i = 0; i < SubFilLogs.length; i += 1) {
        const log = SubFilLogs[i];
        filteredLogSubscribe(b.date, log.date, log.value);
        filteredLogSubscribe(b.employee, log.employee, log.value);
        filteredLogSubscribe(b.item, log.item, log.value);
        filteredLogSubscribe(q, log.item, log.quantity);
      }

      return q;
    });

    return b;
  });
});
