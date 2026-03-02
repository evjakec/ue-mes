import { BillOfProcessProcessEntity } from "./bill-of-process-process-entity";
import { PartEntity } from "./part-entity";

type BillOfProcessEntity = {
    billOfProcessId: number;
    name: string;
    description: string;
    part: PartEntity;
    effectiveStartDate: Date;
    effectiveStartDateUtc: Date;
    effectiveEndDate: Date;
    effectiveEndDateUtc: Date;
    lastModifiedBy: string;
    lastModifiedTime?: Date;
    lastModifiedTimeUtc?: Date;
    billOfProcessProcesses:BillOfProcessProcessEntity[];
}

export type {BillOfProcessEntity};