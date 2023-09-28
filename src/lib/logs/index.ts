import type { ArmouryLog } from './Armoury';
import type { EvidenceLog } from './Evidence';
import type { FundLog } from './Fund';
import type { PrisonLog } from './Prison';
import type { VehicleLog } from './Vehicle';

export type Log = ArmouryLog | EvidenceLog | FundLog | PrisonLog | VehicleLog;

export * from './Armoury';
export { default as ArmouryLogManager } from './Armoury';
export * from './Common';
export * from './Evidence';
export { default as EvidenceLogManager } from './Evidence';
export * from './Fund';
export { default as FundLogManager } from './Fund';
export * from './Prison';
export { default as PrisonLogManager } from './Prison';
export * from './Vehicle';
export { default as VehicleLogManager } from './Vehicle';
