import { WorkElementTypeAttributeEntity } from "./work-element-type-attribute-entity";

type WorkElementTypeAttributeListItemEntity = {
    workElementTypeAttributeListItemId: number;
    workElementTypeAttribute:WorkElementTypeAttributeEntity;
    name: string;
    description: string;
    lastModifiedBy: string;
    lastModifiedTime: Date;
    lastModifiedTimeUtc: Date;
}

export type {WorkElementTypeAttributeListItemEntity};