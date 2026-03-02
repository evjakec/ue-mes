import { ItemAttributeTypeEntity } from "./item-attribute-type-entity";
import { PartEntity } from "./part-entity";

type PartItemAttributeTypeEntity = {
    partOrderItemAttributeTypeId?: number;
    part: PartEntity;
    itemAttributeType: ItemAttributeTypeEntity;
    isRequired: boolean;
    lastModifiedBy: string;
    lastModifiedTime?: Date;
    lastModifiedTimeUtc?: Date;
}

export type {PartItemAttributeTypeEntity};