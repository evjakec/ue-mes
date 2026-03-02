import { UserEntity } from "../models/authorization/user-entity";
import { EquipmentEntity } from "../models/global/equipment-entity";
import { OrderItemEntity } from "../models/order-item-entity";
import { PartEntity } from "../models/part-entity";

type StartOrderItemUnitViewModel = {
    orderItem:OrderItemEntity;
    part: PartEntity;
    equipment:EquipmentEntity;
    user:UserEntity;
}

export type {StartOrderItemUnitViewModel};