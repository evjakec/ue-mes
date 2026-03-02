
import Modal from '../../../ui/components/Modal';
import { LoaderFunctionArguments } from '../../types/LoaderFunctionArguments';
import BillOfMaterialForm from '../../../components/inventory/bill-of-material/BillOfMaterialForm';
import { fetchBillOfMaterialByBillOfMaterialId } from '../../../ui/scripts/ApiFunctions';

const EditBillOfMaterial:React.FC = () => {
    return (
    <Modal allowBackdropClose={false}>
      <BillOfMaterialForm method='post' />
    </Modal>
  );
}

export default EditBillOfMaterial;

export async function loader({params}:LoaderFunctionArguments)  {
    const billOfMaterialId = params.billOfMaterialId ? params.billOfMaterialId : '0';
    if(!isNaN(+billOfMaterialId) && +billOfMaterialId > 0)
    {
        return fetchBillOfMaterialByBillOfMaterialId(+billOfMaterialId).catch(()=> {throw new Error('Unable to fetch the bill of material with ID = ' + billOfMaterialId)});
    }
  }