import { BillOfProcessProcessWorkElementEntity } from "./bill-of-process-process-work-element-entity";
import { WorkElementTypeAttributeEntity} from './work-element-type-attribute-entity'

type BillOfProcessProcessWorkElementAttributeEntity = {
    billOfProcessProcessWorkElementAttributeId: number;
    billOfProcessWorkElement:BillOfProcessProcessWorkElementEntity;
    workElementTypeAttribute: WorkElementTypeAttributeEntity;
    attributeValue: string;
    lastModifiedBy: string;
    lastModifiedTime?: Date;
    lastModifiedTimeUtc?: Date;
}

export type {BillOfProcessProcessWorkElementAttributeEntity};