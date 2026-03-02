import { OrderItemEntity } from "../../models/order-item-entity";
import OrderItem from "./OrderItem";

const OrderItemList:React.FC<{orderItems:OrderItemEntity[]}> = (props) => {
    return (
    <div>
      {props.orderItems.map(orderItem =>
        <OrderItem key={orderItem.orderItemId} orderItem={orderItem} />
      )}
    </div>
    )
}

export default OrderItemList;