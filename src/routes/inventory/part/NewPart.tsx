
import Modal from '../../../ui/components/Modal';
import PartForm from '../../../components/inventory/part/PartForm';
import { fetchItemAttributeTypes } from '../../../ui/scripts/ApiFunctions';

const NewPart:React.FC = () => {
    return (
    <Modal allowBackdropClose={false}>
      <PartForm method='post' />
    </Modal>
  );
}

export default NewPart;

export async function loader()  {
  return [undefined, await fetchItemAttributeTypes().catch(()=> {throw new Error('Unable to fetch the item attribute types')})];
}