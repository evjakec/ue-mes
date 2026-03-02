
import SupplierForm from '../../../components/inventory/supplier/SupplierForm';
import Modal from '../../../ui/components/Modal';

const NewSupplier:React.FC = () => {
    console.log('in route');
    return (
        
    <Modal allowBackdropClose={false}>
      <SupplierForm method='post' />
    </Modal>
  );
}

export default NewSupplier;
