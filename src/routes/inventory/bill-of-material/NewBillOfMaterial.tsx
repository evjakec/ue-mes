
import Modal from '../../../ui/components/Modal';
import { LoaderFunctionArguments } from '../../types/LoaderFunctionArguments';
import BillOfMaterialForm from '../../../components/inventory/bill-of-material/BillOfMaterialForm';
import { fetchPartByPartId } from '../../../ui/scripts/ApiFunctions';

const NewBillOfMaterial:React.FC = () => {
    return (
    <Modal allowBackdropClose={false}>
      <BillOfMaterialForm method='post' />
    </Modal>
  );
}

export default NewBillOfMaterial;

// We will load the part object in the New Bill Of Material form because the link is mapped to a Part ID
  
  export async function loader({params}:LoaderFunctionArguments)  {
    const partId = params.partId ? params.partId : '0';
    if(!isNaN(+partId) && +partId > 0)
    {
        return fetchPartByPartId(partId).catch(()=> {throw new Error('Unable to fetch the part with ID = ' + partId)});
    }
  }