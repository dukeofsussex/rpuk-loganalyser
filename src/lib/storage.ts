// eslint-disable-next-line import/no-extraneous-dependencies
import { derived, writable } from 'svelte/store';

export enum LogType {
  Default = 1,
  Fund = 2,
  Vehicle = 3,
}

export interface LogCommon {
  date: string;
  employee: string;
  fulldate: Date;
  quantity: number;
}

export interface Log extends LogCommon {
  item: string;
  rank: string;
}

export interface FundLog extends Log {
  value: number;
}

export interface VehicleLog extends LogCommon {
  vehicle: string;
}

export interface Change {
  positive: number;
  negative: number;
  diff: number;
}

export type Filter = 'date' | 'employee' | 'item' | 'vehicle';
export type Filters = Record<Filter, Map<string, boolean>>;
export type Balances = Record<Filter, Map<string, number>>;

let currentLogType: LogType;

export const logType = writable<LogType>();
export const logs = writable<(Log | FundLog | VehicleLog)[]>([]);
export const balances = writable<Balances>({
  date: new Map(),
  employee: new Map(),
  item: new Map(),
  vehicle: new Map(),
});
export const filters = writable<Filters>({
  date: new Map(),
  employee: new Map(),
  item: new Map(),
  vehicle: new Map(),
});
export const changes = writable<Map<string, Change>>(new Map());

function logSubscribe(data: Filters[Filter], value: string) {
  if (data.has(value)) {
    return;
  }

  data.set(value, true);
}

// Bad to use get()
logType.subscribe((type) => {
  currentLogType = type;
});

logs.subscribe((subLogs) => {
  filters.update((f) => {
    for (let i = 0; i < subLogs.length; i += 1) {
      const log = subLogs[i];
      logSubscribe(f.date, log.date);
      logSubscribe(f.employee, log.employee);

      if (currentLogType === LogType.Vehicle) {
        logSubscribe(f.vehicle, (log as VehicleLog).vehicle);
      } else {
        logSubscribe(f.item, (log as Log).item);
      }
    }
    return f;
  });
});

export const filteredLogs = derived(
  [logs, filters],
  ([$logs, $filters]) => $logs.filter((l) => $filters.date.get(l.date)
    && $filters.employee.get(l.employee)
    && (currentLogType === LogType.Vehicle
      ? $filters.vehicle.get((l as VehicleLog).vehicle)
      : $filters.item.get((l as Log).item))),
);

function filteredLogSubscribe(data: Balances[Filter], key: string, value: number) {
  return data.set(key, (data.get(key) || 0) + value);
}

function changeSubscribe(data: Map<string, Change>, key: string, quantity: number) {
  const dir = quantity > 0 ? 'positive' : 'negative';
  const change = data.get(key) || { positive: 0, negative: 0, diff: 0 };
  change[dir] += quantity;
  change.diff = change.positive + change.negative;
  data.set(key, change);
}

filteredLogs.subscribe((SubFilLogs) => {
  balances.update((b) => {
    changes.update((c) => {
      /* eslint-disable no-param-reassign */
      b.date = new Map();
      b.employee = new Map();
      b.item = new Map();
      b.vehicle = new Map();
      c = new Map();
      /* eslint-enable no-param-reassign */

      for (let i = 0; i < SubFilLogs.length; i += 1) {
        const log = SubFilLogs[i];

        if (currentLogType === LogType.Fund) {
          filteredLogSubscribe(b.date, log.date, (log as FundLog).value);
          filteredLogSubscribe(b.employee, log.employee, (log as FundLog).value);
          filteredLogSubscribe(b.item, (log as FundLog).item, (log as FundLog).value);
        } else {
          changeSubscribe(c, log.date, log.quantity);
          changeSubscribe(c, log.employee, log.quantity);
        }

        const identifier = currentLogType === LogType.Vehicle
          ? (log as VehicleLog).vehicle
          : (log as Log).item;

        changeSubscribe(c, identifier, log.quantity);
      }

      return c;
    });

    return b;
  });
});
