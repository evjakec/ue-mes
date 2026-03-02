

import { UserEntity } from "./authorization/user-entity";
import { BillOfProcessProcessWorkElementEntity } from "./bill-of-process-process-work-element-entity";
import { OrderItemUnitEntity } from "./order-item-unit-entity";
import { WorkElementStatusEntity } from "./work-element-status-entity";

type OrderItemUnitWorkElementHistoryEntity = {
    orderItemUnitWorkElementHistoryId: number;
    orderItemUnit:OrderItemUnitEntity;
    billOfProcessProcessWorkElement:BillOfProcessProcessWorkElementEntity;
    workElementStatus: WorkElementStatusEntity;
    user:UserEntity;
    startDate: Date;
    startDateUtc: Date;
    endDate?: Date;
    endDateUtc?: Date;
    lastModifiedBy: string;
    lastModifiedTime?: Date;
    lastModifiedTimeUtc?: Date;
}

export type {OrderItemUnitWorkElementHistoryEntity};