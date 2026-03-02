import { WorkElementTypeAttributeListItemEntity } from "./work-element-type-attribute-list-item-entity";
import { WorkElementTypeEntity } from "./work-element-type-entity";

type WorkElementTypeAttributeEntity = {
    workElementTypeAttributeId: number;
    workElementType:WorkElementTypeEntity;
    name: string;
    isRequiredAtSetup: boolean;
    isRequiredAtRun: boolean;
    lastModifiedBy: string;
    lastModifiedTime: Date;
    lastModifiedTimeUtc: Date;
    workElementTypeAttributeListItems:WorkElementTypeAttributeListItemEntity[];
}

export type {WorkElementTypeAttributeEntity};