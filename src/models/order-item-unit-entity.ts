import { OrderItemEntity } from "./order-item-entity";
import { OrderItemUnitConsumptionEntity } from "./order-item-unit-consumption-entity";
import { OrderItemUnitDataCollectionEntity } from "./order-item-unit-data-collection-entity";
import { OrderItemUnitScrapEntity } from "./order-item-unit-scrap-entity";
import { OrderItemUnitWorkElementHistoryEntity } from "./order-item-unit-work-element-history-entity";
import { PartEntity } from "./part-entity";

type OrderItemUnitEntity = {
    orderItemUnitId: number;
    orderItem:OrderItemEntity
    serialNumber: string;
    part:PartEntity;
    lastModifiedBy: string;
    lastModifiedTime?: Date;
    lastModifiedTimeUtc?: Date;
    orderItemUnitWorkElementHistories:OrderItemUnitWorkElementHistoryEntity[];
    orderItemUnitDataCollections:OrderItemUnitDataCollectionEntity[];
    orderItemUnitConsumptions:OrderItemUnitConsumptionEntity[];
    orderItemUnitScrap:OrderItemUnitScrapEntity;
}

export type {OrderItemUnitEntity};