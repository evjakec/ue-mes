import { InventoryItemEntity } from "../models/inventory-item-entity";
import { InventoryLocationEntity } from "../models/inventory-location-entity";

type MoveInventoryItemViewModel = {
    inventoryItem: InventoryItemEntity;
    destinationLocation:InventoryLocationEntity;
    quantityToMove: number;
    moveAllQuantity: boolean;
    isChanged:boolean;
}

export type {MoveInventoryItemViewModel};