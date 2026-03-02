
import Modal from '../../../ui/components/Modal';
import PartForm from '../../../components/inventory/part/PartForm';
import { LoaderFunctionArguments } from '../../types/LoaderFunctionArguments';
import { fetchItemAttributeTypes, fetchPartByPartId } from '../../../ui/scripts/ApiFunctions';

const EditPart:React.FC = () => {
    return (
    <Modal allowBackdropClose={false}>
      <PartForm method='post' />
    </Modal>
  );
}

export default EditPart;
  
export async function loader({params}:LoaderFunctionArguments)  {
  const partId = params.partId ? params.partId : '0';
  if(!isNaN(+partId) && +partId > 0)
  {
    const [part, orderItemAttributeTypes] = await Promise.all([
      fetchPartByPartId(partId).catch(()=> {throw new Error('Unable to fetch the part with id = ' + partId)}),
      fetchItemAttributeTypes().catch(()=> {throw new Error('Unable to fetch the item attribute types')})
    ]);
    
    return ([ part, orderItemAttributeTypes ]);
  }
}