import { BillOfMaterialPartEntity } from "./bill-of-material-part-entity";
import { PartEntity } from "./part-entity";

type BillOfMaterialEntity = {
    billOfMaterialId: number;
    name:string;
    description:string;
    part: PartEntity;
    effectiveStartDate: Date;
    effectiveStartDateUtc: Date;
    effectiveEndDate: Date;
    effectiveEndDateUtc: Date;
    lastModifiedBy: string;
    lastModifiedTime?: Date;
    lastModifiedTimeUtc?: Date;
    billOfMaterialParts:BillOfMaterialPartEntity[];
}

export type {BillOfMaterialEntity};