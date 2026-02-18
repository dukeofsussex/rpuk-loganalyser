import { commonViewerColumns, LogType } from './Common';
import EvidenceLogManager from './Evidence';
import type { EvidenceLog } from './Evidence';

export interface ArmouryLog extends EvidenceLog {
  identifier: string;
}

export default class ArmouryLogManager extends EvidenceLogManager {
  protected regex = /(.*)\t(\+|-)\s*([\d.]+)\t(.*)\t(.*)\t(.*) [ap]m/;

  /* eslint-disable-next-line class-methods-use-this */
  convert([line, name, sign, amount, item, identifier, date]: string[]): ArmouryLog {
    const negative = sign === '-';
    const vehicleTransaction = line.includes('Insurance') || line.includes('Purchase');

    return {
      ...super.convert([line, name, sign, amount, item, date]),
      identifier,
      quantity: vehicleTransaction ? -1 : parseInt(`${(negative ? '-' : '')}${amount}`, 10),
    };
  }

  storageCallbacks = this.commonStorageCallbacks;

  type = LogType.Armoury;

  viewerColumns = [
    commonViewerColumns.rank,
    commonViewerColumns.employee,
    commonViewerColumns.quantity,
    commonViewerColumns.item,
    commonViewerColumns.identifier,
    commonViewerColumns.date,
  ];
}
