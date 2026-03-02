import { BillOfProcessProcessWorkElementEntity } from "../models/bill-of-process-process-work-element-entity";
import { OrderItemUnitWorkElementHistoryEntity } from "../models/order-item-unit-work-element-history-entity";

// This view model will be used to map BOP work elements to any matching history in the run screen.
// The mapping could be achieved through regular script, but this view model will clean up the code by not having to do lookups each time something changes.
type WorkElementAndOrderItemUnitHistoryViewModel = {
    workElement: BillOfProcessProcessWorkElementEntity;
    orderItemUnitWorkElementHistory:OrderItemUnitWorkElementHistoryEntity;
}

export type {WorkElementAndOrderItemUnitHistoryViewModel};

