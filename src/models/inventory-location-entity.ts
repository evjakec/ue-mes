import { InventoryLocationTypeEntity } from "./inventory-location-type-entity";

type InventoryLocationEntity = {
    inventoryLocationId: number;
    inventoryLocationType:InventoryLocationTypeEntity;
    name: string;
    lastModifiedBy: string;
    lastModifiedTime: Date;
    lastModifiedTimeUtc: Date;
}

export type {InventoryLocationEntity};