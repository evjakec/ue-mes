import { Outlet } from 'react-router-dom';
import classes from './RootOrders.module.css'
import OrdersHeader from '../../components/orders/OrdersHeader';

const RootOrdersLayout:React.FC = () => {
  return (
    <>
      <OrdersHeader />
      <main className={classes.mainContentContainer}>
        <Outlet />
      </main>
    </>
  );
}

export default RootOrdersLayout;