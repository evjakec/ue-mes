import { Outlet, useNavigation } from 'react-router-dom';
import InventoryDashboard from '../../../components/inventory/inventory/InventoryDashboard';
import { fetchInventoryItemsSummed } from '../../../ui/scripts/ApiFunctions';
import LoadingModal from '../../../ui/components/LoadingModal';

const InventoryMain:React.FC = () => {
  const navigation = useNavigation();

  return (
    <>
    {navigation.state !== 'idle' && <LoadingModal />}
    {navigation.state === 'idle' && 
      <>
        <Outlet />
        <InventoryDashboard />
      </>
    }
    </>
  );
}

export default InventoryMain;

export async function loader() {
  return fetchInventoryItemsSummed().catch(()=> {throw new Error('Unable to fetch the inventory.')});
}
