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

export interface VehicleLog extends LogCommon {
  quantity: -1 | 1;
  location: string;
  vehicle: string;
}

export default class VehicleLogManager extends LogManager<VehicleLog> {
  protected regex = /(.*)\t(.*)\t(Retrieved|Stored)\t(.*)\t(.*[ap]m)/;

  /* eslint-disable-next-line class-methods-use-this */
  convert([, name, vehicle, type, location, date]: string[]): VehicleLog {
    return {
      ...VehicleLogManager.extractDate(date),
      employee: name,
      location,
      quantity: type === 'Retrieved' ? -1 : 1,
      vehicle,
    };
  }

  storageCallbacks = {
    balancesAndChanges(_: Balances, c: Changes, l: VehicleLog) {
      changeSubscribe(c, l.date, l.quantity);
      changeSubscribe(c, l.employee, l.quantity);
      changeSubscribe(c, l.vehicle, l.quantity);
    },
    filteredLogs(l: VehicleLog[], f: Filters) {
      return l.filter((log) => f.date.get(log.date)
        && f.employee.get(log.employee)
        && f.vehicle.get(log.vehicle));
    },
    filters(f: Filters, l: VehicleLog) {
      logSubscribe(f.date, l.date);
      logSubscribe(f.employee, l.employee);
      logSubscribe(f.vehicle, l.vehicle);
    },
  };

  type = LogType.Vehicle;

  viewerColumns = [
    commonViewerColumns.employee,
    {
      name: 'Action',
      prop: 'quantity',
      compareFn: numberCompareFn,
    },
    {
      name: 'Vehicle',
      prop: 'vehicle',
      compareFn: stringCompareFn,
    },
    {
      name: 'Location',
      prop: 'location',
      compareFn: stringCompareFn,
    },
    commonViewerColumns.date,
  ];
}
