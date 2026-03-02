import { BillOfProcessProcessWorkElementAttributeEntity } from "../models/bill-of-process-process-work-element-attribute-entity";
import { OrderItemUnitConsumptionEntity } from "../models/order-item-unit-consumption-entity";

// This view model will be used to map consumption work element attributes to any matching order item unit consumption values in the run screen.
// The mapping could be achieved through regular script, but this view model will clean up the code by not having to do lookups each time something changes.
type ConsumptionWorkElementAndOrderItemUnitValueViewModel = {
    consumptionWorkElementAttribute: BillOfProcessProcessWorkElementAttributeEntity;
    orderItemUnitConsumption:OrderItemUnitConsumptionEntity;
}

export type {ConsumptionWorkElementAndOrderItemUnitValueViewModel};