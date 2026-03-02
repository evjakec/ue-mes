import { BillOfProcessProcessWorkElementAttributeEntity } from "../models/bill-of-process-process-work-element-attribute-entity";
import { OrderItemUnitDataCollectionEntity } from "../models/order-item-unit-data-collection-entity";

// This view model will be used to map data collection work element attributes to any matching order item unit data collection values in the run screen.
// The mapping could be achieved through regular script, but this view model will clean up the code by not having to do lookups each time something changes.
type DataCollectionWorkElementAndOrderItemUnitValueViewModel = {
    dataCollectionWorkElementAttribute: BillOfProcessProcessWorkElementAttributeEntity;
    orderItemUnitDataCollection:OrderItemUnitDataCollectionEntity;
}

export type {DataCollectionWorkElementAndOrderItemUnitValueViewModel};

