import { InventoryLocationEntity } from "../models/inventory-location-entity";

type InventoryLocationWithQuantityViewModel = {
    inventoryLocation: InventoryLocationEntity;
    inventoryItemQuantity:number;
}

export type {InventoryLocationWithQuantityViewModel};