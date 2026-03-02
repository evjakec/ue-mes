
import Modal from '../../../ui/components/Modal';
import ReceiveNewInventoryForm from '../../../components/inventory/inventory/ReceiveNewInventoryForm';

const ReceiveNewInventory:React.FC = () => {
    return (
    <Modal allowBackdropClose={false}>
      <ReceiveNewInventoryForm method='post' sourceLocation='New' />
    </Modal>
  );
}

export default ReceiveNewInventory;
