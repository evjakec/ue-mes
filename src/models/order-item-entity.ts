import { OrderEntity } from "./order-entity";
import { OrderItemAttributeEntity } from "./order-item-attribute-entity";
import { PartEntity } from "./part-entity";

type OrderItemEntity = {
    orderItemId: number;
    order: OrderEntity;
    finishedPart: PartEntity;
    quantity: number;
    lastModifiedBy: string;
    lastModifiedTime: Date;
    lastModifiedTimeUtc: Date;
    orderItemAttributes:OrderItemAttributeEntity[];
}

export type {OrderItemEntity};