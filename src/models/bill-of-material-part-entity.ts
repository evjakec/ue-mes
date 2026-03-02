import { BillOfMaterialEntity } from "./bill-of-material-entity";
import { PartEntity } from "./part-entity";

type BillOfMaterialPartEntity = {
    billOfMaterialPartId: number;
    billOfMaterial: BillOfMaterialEntity;
    part: PartEntity;
    quantity: number;
    lastModifiedBy: string;
    lastModifiedTime: Date;
    lastModifiedTimeUtc: Date;
}

export type {BillOfMaterialPartEntity};