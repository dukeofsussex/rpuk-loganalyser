import {
  changeSubscribe,
  commonViewerColumns,
  logSubscribe,
  LogManager,
  LogType,
  type Balances,
  type Changes,
  type Filters,
  type LogCommon,
} from './Common';

export interface EvidenceLog extends LogCommon {
  item: string;
  rank: string;
}

export default class EvidenceLogManager extends LogManager<EvidenceLog> {
  protected regex = /(.*)\t(\+|-)\s*(\d+)\t(.*?)\t(.*)/;

  /* eslint-disable-next-line class-methods-use-this */
  convert([, name, sign, amount, item, date]: string[]): EvidenceLog {
    const nameParts = name.split(' ');
    const negative = sign === '-';

    return {
      ...EvidenceLogManager.extractDate(date),
      employee: nameParts.slice(-2).join(' '),
      item,
      quantity: parseInt(`${(negative ? '-' : '')}${amount}`, 10),
      rank: nameParts.slice(0, -2).join(' '),
    };
  }

  protected commonStorageCallbacks = {
    balancesAndChanges(_: Balances, c: Changes, l: EvidenceLog) {
      changeSubscribe(c, l.date, l.quantity);
      changeSubscribe(c, l.employee, l.quantity);
      changeSubscribe(c, l.item, l.quantity);
    },
    filteredLogs(l: EvidenceLog[], f: Filters) {
      return l.filter((log) => f.date.get(log.date)
        && f.employee.get(log.employee)
        && f.item.get(log.item));
    },
    filters(f: Filters, l: EvidenceLog) {
      logSubscribe(f.date, l.date);
      logSubscribe(f.employee, l.employee);
      logSubscribe(f.item, l.item);
    },
  };

  storageCallbacks = this.commonStorageCallbacks;

  type = LogType.Evidence;

  viewerColumns = [
    commonViewerColumns.rank,
    commonViewerColumns.employee,
    commonViewerColumns.quantity,
    commonViewerColumns.item,
    commonViewerColumns.date,
  ];
}
