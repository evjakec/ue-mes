import { PartItemAttributeTypeEntity } from "./part-item-attribute-type-entity";
import {UnitOfMeasureEntity} from "./unit-of-measure-entity";

type PartEntity = {
    partId?: number;
    partType: string;
    partNumber: string;
    partRevision: string;
    description: string;
    isActive: boolean;
    unitOfMeasure: UnitOfMeasureEntity;
    lastModifiedBy: string;
    lastModifiedTime?: Date;
    lastModifiedTimeUtc?: Date;
    partItemAttributeTypes:PartItemAttributeTypeEntity[];
}

export type {PartEntity};