
import Modal from '../../../ui/components/Modal';
import { LoaderFunctionArguments } from '../../types/LoaderFunctionArguments';
import BillOfProcessWorkElementForm from '../../../components/inventory/bill-of-process/BillOfProcessWorkElementForm';
import { fetchBillOfProcessProcessById } from '../../../ui/scripts/ApiFunctions';
import WorkElementSetupContextProvider from '../../../store/work-element-setup-context';

const EditBillOfProcessWorkElements:React.FC = () => {
    return (
    <Modal allowBackdropClose={false}>
        <WorkElementSetupContextProvider>
          <BillOfProcessWorkElementForm method='post' />
        </WorkElementSetupContextProvider>
    </Modal>
  );
}

export default EditBillOfProcessWorkElements;

// We will load the selected BOP process object in the Edit Work Element form because the link is mapped to a BOP Process ID.
// All work element changes will be stored in state until the user clicks "Save" on the form
export async function loader({params}:LoaderFunctionArguments)  {
  const billOfProcessId = params.billOfProcessId ? params.billOfProcessId : '0';
  const billOfProcessProcessId = params.billOfProcessProcessId ? params.billOfProcessProcessId : '0';
  
  // If the params are not found correctly for some reason, then just allow the route to fail by not returning anything from the loader
  if(!isNaN(+billOfProcessId) && +billOfProcessId > 0 && !isNaN(+billOfProcessProcessId) && +billOfProcessProcessId > 0)
  {
      return fetchBillOfProcessProcessById(billOfProcessProcessId).catch(()=> {throw new Error('Unable to fetch the work elements for BOP process ID = ' + billOfProcessProcessId)});
  }
}