import { ItemAttributeTypeEntity } from "./item-attribute-type-entity";
import { InventoryItemEntity } from "./inventory-item-entity";

type InventoryItemAttributeEntity = {
    inventoryItemAttributeId: number;
    inventoryItem: InventoryItemEntity;
    itemAttributeType: ItemAttributeTypeEntity;
    attributeValue:string;
    lastModifiedBy: string;
    lastModifiedTime: Date;
    lastModifiedTimeUtc: Date;
}

export type {InventoryItemAttributeEntity};