import { OrderItemEntity } from "../models/order-item-entity";
import { PartEntity } from "../models/part-entity";

type PartAndOrderItemsViewModel = {
    partToAssemble: PartEntity;
    activeOrderItems:OrderItemEntity[];
}

export type {PartAndOrderItemsViewModel};