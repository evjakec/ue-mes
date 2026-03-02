import { ItemAttributeTypeEntity } from "./item-attribute-type-entity";
import { OrderItemEntity } from "./order-item-entity";

type OrderItemAttributeEntity = {
    orderItemAttributeId: number;
    orderItem: OrderItemEntity;
    itemAttributeType: ItemAttributeTypeEntity;
    attributeValue:string;
    lastModifiedBy: string;
    lastModifiedTime: Date;
    lastModifiedTimeUtc: Date;
}

export type {OrderItemAttributeEntity};