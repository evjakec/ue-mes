import { UserEntity } from "../models/authorization/user-entity";
import { EquipmentEntity } from "../models/global/equipment-entity";
import { OrderItemUnitEntity } from "../models/order-item-unit-entity";

type OrderItemUnitEquipmentAndUserViewModel = {
    orderItemUnit: OrderItemUnitEntity;
    equipment:EquipmentEntity;
    user: UserEntity;
}

export type {OrderItemUnitEquipmentAndUserViewModel};