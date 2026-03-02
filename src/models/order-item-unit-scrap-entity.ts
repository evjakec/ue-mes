import { UserEntity } from "./authorization/user-entity";
import { DefectEntity } from "./defect-entity";
import { EquipmentEntity } from "./global/equipment-entity";
import { OrderItemUnitEntity } from "./order-item-unit-entity";

type OrderItemUnitScrapEntity = {
    orderItemUnitScrapId: number;
    orderItemUnit:OrderItemUnitEntity;
    equipment:EquipmentEntity;
    defect:DefectEntity;
    user:UserEntity;
    comment: string;
    scrapDate: Date;
    scrapDateUtc?: Date;
    lastModifiedBy: string;
    lastModifiedTime?: Date;
    lastModifiedTimeUtc?: Date;
}

export type {OrderItemUnitScrapEntity};