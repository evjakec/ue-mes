
import Modal from '../../../ui/components/Modal';
import { LoaderFunctionArguments } from '../../types/LoaderFunctionArguments';
import BillOfMaterialPartListForm from '../../../components/inventory/bill-of-material/BillOfMaterialPartListForm';
import { fetchBillOfMaterialByBillOfMaterialId, fetchRawMaterialAndSubAssemblyPartsList } from '../../../ui/scripts/ApiFunctions';

const EditBillOfMaterialPartList:React.FC = () => {
    return (
    <Modal allowBackdropClose={false}>
      <BillOfMaterialPartListForm method='POST' />
    </Modal>
  );
}

export default EditBillOfMaterialPartList;

async function loadWithBillOfMaterialId(billOfMaterialId:string) {
  const [partsList, billOfMaterial] = await Promise.all([
    fetchRawMaterialAndSubAssemblyPartsList().catch(()=> {throw new Error('Unable to fetch the raw material and subassembly parts.')}),
    fetchBillOfMaterialByBillOfMaterialId(+billOfMaterialId).catch(()=> {throw new Error('Unable to fetch the bill of material with ID = ' + billOfMaterialId)})
  ]);

  return ([partsList, billOfMaterial ]);
}

export async function loader({params}:LoaderFunctionArguments)  {
    const billOfMaterialId = params.billOfMaterialId ? params.billOfMaterialId : '0';
    if(!isNaN(+billOfMaterialId) && +billOfMaterialId > 0)
    {
        return loadWithBillOfMaterialId(billOfMaterialId);
    }
  }