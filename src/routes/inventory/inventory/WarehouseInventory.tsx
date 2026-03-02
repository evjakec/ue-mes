
import Modal from '../../../ui/components/Modal';
import WarehouseInventoryForm from '../../../components/inventory/inventory/WarehouseInventoryForm';

const WarehouseInventory:React.FC = () => {
    return (
    <Modal allowBackdropClose={false}>
      <WarehouseInventoryForm method='post' sourceLocation='Receiving' />
    </Modal>
  );
}

export default WarehouseInventory;
