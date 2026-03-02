import { Outlet, useNavigation } from 'react-router-dom';
import BillOfProcess from '../../../components/inventory/bill-of-process/BillOfProcess';
import { LoaderFunctionArguments } from '../../types/LoaderFunctionArguments';
import { fetchBillOfProcessByBillOfProcessId, fetchSubAssemblyAndFinishedGoodPartsList } from '../../../ui/scripts/ApiFunctions';
import LoadingModal from '../../../ui/components/LoadingModal';

const InventoryBillOfProcess:React.FC = () => {
  const navigation = useNavigation();
  
  return (
    <>
      {navigation.state !== 'idle' && <LoadingModal />}
      {navigation.state === 'idle' && 
      <>
        <Outlet />
        <BillOfProcess />
      </>
      }
    </>
  );
}

export default InventoryBillOfProcess;

async function loadWithBillOfProcessId(billOfProcessId:string) {
  const [parts, billOfProcess] = await Promise.all([
    fetchSubAssemblyAndFinishedGoodPartsList().catch(()=> {throw new Error('Unable to fetch the subassembly and finished good parts.')}),
    fetchBillOfProcessByBillOfProcessId(billOfProcessId).catch(()=> {throw new Error('Unable to fetch the bill of process with ID = ' + billOfProcessId)})
 ])
 return ([ parts, billOfProcess ]);
}

async function loadWithoutBillOfProcessId() {  
  return [await fetchSubAssemblyAndFinishedGoodPartsList().catch(()=> {throw new Error('Unable to fetch the subassembly and finished good parts.')}),undefined];
}

export async function loader({params}:LoaderFunctionArguments) {
  const billOfProcessId = params.billOfProcessId ? params.billOfProcessId : '0';
  if(!isNaN(+billOfProcessId) && +billOfProcessId > 0)
  {
    return loadWithBillOfProcessId(billOfProcessId);
  }

  return loadWithoutBillOfProcessId();
}
