import { UserEntity } from "./authorization/user-entity";
import { BillOfProcessProcessWorkElementAttributeEntity } from "./bill-of-process-process-work-element-attribute-entity";
import { EquipmentEntity } from "./global/equipment-entity";
import { OrderItemUnitEntity } from "./order-item-unit-entity";
import { OrderItemUnitWorkElementHistoryEntity } from "./order-item-unit-work-element-history-entity";

type OrderItemUnitConsumptionEntity = {
    orderItemUnitConsumptionId: number;
    orderItemUnit:OrderItemUnitEntity;
    equipment:EquipmentEntity;
    user:UserEntity;
    billOfProcessProcessWorkElementAttribute:BillOfProcessProcessWorkElementAttributeEntity;
    consumedSerialNumber: string;
    isConsumed:boolean;
    consumedDate: Date;
    consumedDateUtc: Date;
    removedDate?: Date;
    removedDateUtc?: Date;
    lastModifiedBy: string;
    lastModifiedTime?: Date;
    lastModifiedTimeUtc?: Date;
}

export type {OrderItemUnitConsumptionEntity};