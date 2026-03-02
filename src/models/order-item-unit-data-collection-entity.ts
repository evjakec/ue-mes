import { UserEntity } from "./authorization/user-entity";
import { BillOfProcessProcessWorkElementAttributeEntity } from "./bill-of-process-process-work-element-attribute-entity";
import { EquipmentEntity } from "./global/equipment-entity";
import { OrderItemUnitEntity } from "./order-item-unit-entity";

type OrderItemUnitDataCollectionEntity = {
    orderItemUnitDataCollectionId: number;
    orderItemUnit:OrderItemUnitEntity;
    equipment:EquipmentEntity;
    user:UserEntity;
    billOfProcessProcessWorkElementAttribute:BillOfProcessProcessWorkElementAttributeEntity;
    collectedValue: string;
    collectedDate: Date;
    collectedDateUtc?: Date;
    lastModifiedBy: string;
    lastModifiedTime?: Date;
    lastModifiedTimeUtc?: Date;
}

export type {OrderItemUnitDataCollectionEntity};