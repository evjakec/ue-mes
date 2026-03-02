import { CustomerEntity } from "./customer-entity";
import { OrderItemEntity } from "./order-item-entity";

type OrderEntity = {
    orderId: number;
    number: string;
    orderState: string;
    customer: CustomerEntity;
    totalQuantity: number;
    lastModifiedBy: string;
    lastModifiedTime: Date;
    lastModifiedTimeUtc: Date;
    orderItems:OrderItemEntity[];
}

export type {OrderEntity};