import { WorkElementTypeEntity } from "./work-element-type-entity";
import {BillOfProcessProcessWorkElementAttributeEntity} from "./bill-of-process-process-work-element-attribute-entity"
import { BillOfProcessProcessEntity } from "./bill-of-process-process-entity";

type BillOfProcessProcessWorkElementEntity = {
    billOfProcessProcessWorkElementId: number;
    billOfProcessProcess:BillOfProcessProcessEntity;
    workElementType:WorkElementTypeEntity;
    name: string;
    sequence: number;
    isRequired: boolean;
    isActive: boolean;
    lastModifiedBy: string;
    lastModifiedTime?: Date;
    lastModifiedTimeUtc?: Date;
    billOfProcessProcessWorkElementAttributes:BillOfProcessProcessWorkElementAttributeEntity[];
}

export type {BillOfProcessProcessWorkElementEntity};