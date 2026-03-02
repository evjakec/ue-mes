
import InventoryLocationForm from '../../../components/inventory/inventory/InventoryLocationForm';
import Modal from '../../../ui/components/Modal';
import { fetchInventoryLocationTypes, fetchInventoryLocationsWithItemsSummed } from '../../../ui/scripts/ApiFunctions';

const InventoryLocations:React.FC = () => {
    return (
    <Modal allowBackdropClose={false}>
      <InventoryLocationForm method='post' />
    </Modal>
  );
}

export default InventoryLocations;
  
export async function loader()  {
  const [inventoryLocations, inventoryLocationTypes] = await Promise.all([
      fetchInventoryLocationsWithItemsSummed().catch(()=> {throw new Error('Unable to fetch the inventory locations')}),
      fetchInventoryLocationTypes().catch(()=> {throw new Error('Unable to fetch the inventory location types')})
    ]);
    
    return ([ inventoryLocations, inventoryLocationTypes ]);
}
