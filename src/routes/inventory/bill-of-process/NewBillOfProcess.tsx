
import Modal from '../../../ui/components/Modal';
import { LoaderFunctionArguments } from '../../types/LoaderFunctionArguments';
import BillOfProcessForm from '../../../components/inventory/bill-of-process/BillOfProcessForm';
import { fetchPartByPartId } from '../../../ui/scripts/ApiFunctions';

const NewBillOfProcess:React.FC = () => {
    return (
    <Modal allowBackdropClose={false}>
      <BillOfProcessForm method='post' />
    </Modal>
  );
}

export default NewBillOfProcess;

// We will load the part object in the New Bill Of Process form because the link is mapped to a Part ID  
  export async function loader({params}:LoaderFunctionArguments)  {
    const partId = params.partId ? params.partId : '0';
    if(!isNaN(+partId) && +partId > 0)
    {
        return fetchPartByPartId(partId).catch(()=> {throw new Error('Unable to fetch the part with ID = ' + partId)});
    }
  }