import {
  changeSubscribe,
  commonViewerColumns,
  logSubscribe,
  LogManager,
  LogType,
  numberCompareFn,
  stringCompareFn,
  type Balances,
  type Changes,
  type LogCommon,
  type Filters,
} from './Common';

export interface PrisonLog extends LogCommon {
  citizenId: number;
  imprisonmentId: number;
  jobAction: string;
  details: string;
}

export default class PrisonLogManager extends LogManager<PrisonLog> {
  protected regex = /(?:\[(\d+)\]\s(.*)|0)\t(\d+)\t(.*)\t(.*)\t(.*)\t(.*)/;

  /* eslint-disable-next-line class-methods-use-this */
  convert([, citizenId, name, imprisonmentId, date, action, job, details]: string[]): PrisonLog {
    let quantity = action === 'PRISON_ADMISSION' ? 1 : 0;
    quantity = ['PRISON_RELEASED', 'PRISON_RELEASED_EARLY', 'PRISON_ESCAPE'].includes(action) ? -1 : quantity;
    const jobPrefix = name ? job.match(/(\b\w)/g)?.join('') : 'SYS';

    return {
      ...PrisonLogManager.extractDate(date),
      action,
      citizenId: parseInt(citizenId, 10) || 0,
      employee: `[${jobPrefix}] ${name || 'SYSTEM'}`,
      details,
      imprisonmentId: parseInt(imprisonmentId, 10),
      jobAction: `[${jobPrefix}] ${action}`,
      quantity,
    };
  }

  storageCallbacks = {
    balancesAndChanges(_: Balances, c: Changes, l: PrisonLog) {
      changeSubscribe(c, l.date, l.quantity);
      changeSubscribe(c, l.employee, l.quantity);
      changeSubscribe(c, l.jobAction, l.quantity);
    },
    filteredLogs(l: PrisonLog[], f: Filters) {
      return l.filter((log) => f.date.get(log.date)
        && f.employee.get(log.employee)
        && f.jobAction.get(log.jobAction));
    },
    filters(f: Filters, l: PrisonLog) {
      logSubscribe(f.date, l.date);
      logSubscribe(f.employee, l.employee);
      logSubscribe(f.jobAction, l.jobAction);
    },
  };

  type = LogType.Prison;

  viewerColumns = [
    {
      name: 'Citizen Id',
      prop: 'citizenId',
      compareFn: numberCompareFn,
    },
    commonViewerColumns.employee,
    {
      name: 'Imprisonment Id',
      prop: 'imprisonmentId',
      compareFn: numberCompareFn,
    },
    {
      name: '[Job] Action',
      prop: 'jobAction',
      compareFn: stringCompareFn,
    },
    {
      name: 'Details',
      prop: 'details',
      compareFn: stringCompareFn,
    },
    commonViewerColumns.date,
  ];
}
