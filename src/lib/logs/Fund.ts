import type { ArmouryLog } from './Armoury';
import ArmouryLogManager from './Armoury';
import {
  changeSubscribe,
  commonViewerColumns,
  LogType,
  numberCompareFn,
  type Balances,
  type Changes,
  type Filter,
} from './common';

export interface FundLog extends ArmouryLog {
  value: number;
}

function valueSubscribe(data: Balances[Filter], key: string, value: number) {
  return data.set(key, (data.get(key) || 0) + value);
}

export default class FundLogManager extends ArmouryLogManager {
  protected regex = /(.*)\t(\+|-)\s*(\d+)(?:\s*\(£(\d+)\))\t(.*?)(?:\t(.*))\t(.*)/;

  /* eslint-disable-next-line class-methods-use-this */
  convert([line, name, sign, amount, value, item, identifier, date]: string[]): FundLog {
    const negative = sign === '-';
    const vehicleTransaction = line.includes('Insurance') || line.includes('Purchase');

    return {
      ...super.convert([line, name, sign, amount, item, identifier, date]),
      value: vehicleTransaction ? -amount : parseInt(`${(negative ? '-' : '')}${value}`, 10),
    };
  }

  storageCallbacks = {
    balancesAndChanges(b: Balances, c: Changes, l: FundLog) {
      valueSubscribe(b.date, l.date, l.value);
      valueSubscribe(b.employee, l.employee, l.value);
      valueSubscribe(b.item, l.item, l.value);
      changeSubscribe(c, l.item, l.quantity);
    },
    filteredLogs: this.commonStorageCallbacks.filteredLogs,
    filters: this.commonStorageCallbacks.filters,
  };

  type = LogType.Fund;

  viewerColumns = [
    commonViewerColumns.rank,
    commonViewerColumns.employee,
    commonViewerColumns.quantity,
    commonViewerColumns.item,
    {
      name: 'Value',
      prop: 'value',
      compareFn: numberCompareFn,
    },
    commonViewerColumns.identifier,
    commonViewerColumns.date,
  ];
}
