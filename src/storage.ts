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
  balances.update((f) => {
    /* eslint-disable no-param-reassign */
    f.date = new Map();
    f.employee = new Map();
    f.item = new Map();
    /* eslint-enable no-param-reassign */

    for (let i = 0; i < SubFilLogs.length; i += 1) {
      const log = SubFilLogs[i];
      filteredLogSubscribe(f.date, log.date, log.value);
      filteredLogSubscribe(f.employee, log.employee, log.value);
      filteredLogSubscribe(f.item, log.item, log.value);
    }
    return f;
  });
});
