
import Modal from '../../../ui/components/Modal';
import { LoaderFunctionArguments } from '../../types/LoaderFunctionArguments';
import BillOfProcessProcessListForm from '../../../components/inventory/bill-of-process/BillOfProcessProcessListForm';
import { fetchBillOfProcessByBillOfProcessId, fetchProcessesNotAssignedToBillOfProcess } from '../../../ui/scripts/ApiFunctions';

const EditBillOfProcessProcessList:React.FC = () => {
    return (
    <Modal allowBackdropClose={false}>
      <BillOfProcessProcessListForm method='post' />
    </Modal>
  );
}

export default EditBillOfProcessProcessList;

async function loadWithBillOfProcessId(billOfProcessId:string) {
  const [parts, billOfProcess] = await Promise.all([
    fetchProcessesNotAssignedToBillOfProcess(billOfProcessId).catch(()=> {throw new Error('Unable to fetch the processes not assigned to bill of process with ID = ' + billOfProcessId)}),
    fetchBillOfProcessByBillOfProcessId(billOfProcessId).catch(()=> {throw new Error('Unable to fetch the bill of process with ID = ' + billOfProcessId)})
 ])
 return ([ parts, billOfProcess ]);
}

export async function loader({params}:LoaderFunctionArguments)  {
    const billOfProcessId = params.billOfProcessId ? params.billOfProcessId : '0';
    
    // TODO : add numeric check for hacked URLs
    return loadWithBillOfProcessId(billOfProcessId);
  }