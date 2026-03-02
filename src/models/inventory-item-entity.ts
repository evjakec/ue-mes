import { InventoryItemAttributeEntity } from "./inventory-item-attribute";
import { InventoryItemTypeEntity } from "./inventory-item-type-entity";
import { InventoryLocationEntity } from "./inventory-location-entity";
import { PartEntity } from "./part-entity";
import { SupplierEntity } from "./supplier-entity";

type InventoryItemEntity = {
    inventoryItemId: number;
    inventoryItemType:InventoryItemTypeEntity;
    inventoryLocation:InventoryLocationEntity;
    part:PartEntity;
    supplier:SupplierEntity;
    serialNumber: string;
    quantity: number;
    lastModifiedBy: string;
    lastModifiedTime: Date;
    lastModifiedTimeUtc: Date;
    inventoryItemAttributesConcatenated:string;
    inventoryItemAttributes:InventoryItemAttributeEntity[];
}

export type {InventoryItemEntity};