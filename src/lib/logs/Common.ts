import type { Readable, Writable } from 'svelte/store';
import type { Log } from '.';

export type Filter = 'date' | 'employee' | 'item' | 'jobAction' | 'vehicle';

export type Balances = Record<Filter, Map<string, number>>;

export interface Change {
  positive: number;
  negative: number;
  diff: number;
}

export type Changes = Map<string, Change>;

export type Filters = Record<Filter, Map<string, boolean>>;

export interface LogCommon {
  [key: string]: string | number | Date;
  date: string;
  employee: string;
  fulldate: Date;
  quantity: number;
}

export enum LogType {
  Armoury = 1,
  Evidence = 2,
  Fund = 3,
  Prison = 4,
  Vehicle = 5,
}

export interface SortingColumn<T> {
  name: string;
  prop: keyof T;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  compareFn: (a: any, b: any, asc: boolean) => number;
}

export interface Storage {
  balances: Writable<Balances>;
  changes: Writable<Changes>;
  filteredLogs: Readable<Log[]>;
  filters: Writable<Filters>;
  logs: Writable<Log[]>;
}

export abstract class LogManager<T extends Log> {
  protected abstract regex: RegExp;

  abstract convert(parts: string[]): T;

  import(line: string) {
    const parts = line.match(this.regex);

    if (!parts) {
      return null;
    }

    return this.convert(parts);
  }

  isType(line: string) {
    return this.regex.test(line);
  }

  abstract type: LogType;

  abstract viewerColumns: SortingColumn<T>[];

  abstract storageCallbacks: {
    balancesAndChanges(b: Balances, c: Changes, l: T): void,
    filters(f: Filters, l: T): void,
    filteredLogs(l: T[], f: Filters): T[],
  };

  protected static extractDate(date: string) {
    const fulldate = new Date(date.replace(/st|nd|rd|th/, ''));
    const month = fulldate.getMonth() + 1;

    return {
      date: `${fulldate.getFullYear()}-${month < 10 ? '0' : ''}${month}-${fulldate.getDate() < 10 ? '0' : ''}${fulldate.getDate()}`,
      fulldate,
    };
  }
}

export function changeSubscribe(data: Map<string, Change>, key: string, quantity: number) {
  const dir = quantity > 0 ? 'positive' : 'negative';
  const change = data.get(key) || { positive: 0, negative: 0, diff: 0 };

  change[dir] += quantity;
  change.diff = change.positive + change.negative;
  data.set(key, change);
}

export function logSubscribe(data: Filters[Filter], value: string) {
  if (data.has(value)) {
    return;
  }

  data.set(value, true);
}

export function numberCompareFn(a: number, b: number, asc: boolean) {
  return asc ? a - b : b - a;
}

export function stringCompareFn(a: string, b: string, asc: boolean) {
  return asc ? a.localeCompare(b) : b.localeCompare(a);
}

export const commonViewerColumns = {
  date: {
    name: 'Date',
    prop: 'fulldate',
    compareFn: numberCompareFn,
  },
  employee: {
    name: 'Employee',
    prop: 'employee',
    compareFn: stringCompareFn,
  },
  identifier: {
    name: 'Identifier',
    prop: 'identifier',
    compareFn: stringCompareFn,
  },
  item: {
    name: 'Item',
    prop: 'item',
    compareFn: stringCompareFn,
  },
  quantity: {
    name: 'Quantity',
    prop: 'quantity',
    compareFn: numberCompareFn,
  },
  rank: {
    name: 'Rank',
    prop: 'rank',
    compareFn: stringCompareFn,
  },
};
