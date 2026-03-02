
import Modal from '../../../ui/components/Modal';
import { LoaderFunctionArguments } from '../../types/LoaderFunctionArguments';
import BillOfProcessForm from '../../../components/inventory/bill-of-process/BillOfProcessForm';
import { fetchBillOfProcessByBillOfProcessId } from '../../../ui/scripts/ApiFunctions';

const EditBillOfProcess:React.FC = () => {
    return (
    <Modal allowBackdropClose={false}>
      <BillOfProcessForm method='post' />
    </Modal>
  );
}

export default EditBillOfProcess;
  
export async function loader({params}:LoaderFunctionArguments)  {
  const billOfProcessId = params.billOfProcessId ? params.billOfProcessId : '0';
  if(!isNaN(+billOfProcessId) && +billOfProcessId > 0)
  {
    return fetchBillOfProcessByBillOfProcessId(billOfProcessId).catch(()=> {throw new Error('Unable to fetch the bill of process with ID = ' + billOfProcessId)});
  }
}