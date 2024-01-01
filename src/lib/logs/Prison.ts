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
  inmate: string;
  sentenceId: number;
  jobAction: string;
  details: string;
}

export default class PrisonLogManager extends LogManager<PrisonLog> {
  protected regex = /(.*)\t(\d+)\t(.*)\t(.*)\t(.*)\t(.*)/;

  /* eslint-disable-next-line class-methods-use-this */
  convert([, inmate, sentenceId, date, action, job, details]: string[]): PrisonLog {
    let quantity = action === 'PRISON_ADMISSION' ? 1 : 0;
    quantity = ['PRISON_RELEASED', 'PRISON_RELEASED_EARLY', 'PRISON_ESCAPE'].includes(action) ? -1 : quantity;
    const jobPrefix = `[${(job !== 'GOV' ? job.match(/(\b\w)/g)?.join('') : 'SYS')}]`;
    const employee = details.includes('Officer') ? `${jobPrefix} ${details.split(': ')[1]}` : 'SYSTEM';

    return {
      ...PrisonLogManager.extractDate(date),
      action,
      employee,
      details: details.includes('Officer') ? 'N/A' : details,
      inmate: inmate.replace(/(\w)(\w*)/g, (_, w1, w2) => w1.toUpperCase() + w2.toLowerCase()),
      jobAction: `${jobPrefix} ${action}`,
      quantity,
      sentenceId: parseInt(sentenceId, 10),
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
      name: 'Inmate',
      prop: 'inmate',
      compareFn: stringCompareFn,
    },
    commonViewerColumns.employee,
    {
      name: '#Sentence',
      prop: 'sentenceId',
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
