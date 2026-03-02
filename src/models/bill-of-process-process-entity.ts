import { BillOfProcessEntity } from "./bill-of-process-entity";
import { BillOfProcessProcessWorkElementEntity } from "./bill-of-process-process-work-element-entity";
import { ProcessEntity } from "./global/process-entity";

type BillOfProcessProcessEntity = {
    billOfProcessProcessId: number;
    billOfProcess: BillOfProcessEntity;
    process: ProcessEntity;
    sequence: number;
    lastModifiedBy: string;
    lastModifiedTime: Date;
    lastModifiedTimeUtc: Date;
    billOfProcessProcessWorkElements: BillOfProcessProcessWorkElementEntity[];
}

export type {BillOfProcessProcessEntity};