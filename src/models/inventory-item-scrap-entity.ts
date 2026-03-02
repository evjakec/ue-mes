import { UserEntity } from "./authorization/user-entity";
import { DefectEntity } from "./defect-entity";
import { InventoryItemEntity } from "./inventory-item-entity";

type InventoryItemScrapEntity = {
    inventoryItemScrapId: number;
    inventoryItem: InventoryItemEntity;
    defect:DefectEntity;
    user:UserEntity;
    quantity:number;
    comment: string;
    scrapDate: Date;
    scrapDateUtc?: Date;
    lastModifiedBy: string;
    lastModifiedTime: Date;
    lastModifiedTimeUtc: Date;
}

export type {InventoryItemScrapEntity};