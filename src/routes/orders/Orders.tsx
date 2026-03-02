import { Outlet, useNavigation } from 'react-router-dom';
import OrderList from '../../components/orders/OrderList';
import { LoaderFunctionArguments } from '../types/LoaderFunctionArguments';
import { fetchOrdersByOrderState } from '../../ui/scripts/ApiFunctions';
import LoadingModal from '../../ui/components/LoadingModal';

const Orders:React.FC = () => {
  const navigation = useNavigation();
  
  return (
    <>
    {navigation.state !== 'idle' && <LoadingModal />}
    {navigation.state === 'idle' && 
      <>
        <Outlet />
        <OrderList />
      </>
    }
    </>
  );
}

export default Orders;

export async function loader({request}:LoaderFunctionArguments)  {
  const url = new URL(request.url);
  const pathNameArray = url.pathname.split('/');
  const orderState = pathNameArray.length === 3 ? pathNameArray[2] : 'all';
  return fetchOrdersByOrderState(orderState).catch(()=> {throw new Error('Unable to fetch the orders with state = ' + orderState)});
}
