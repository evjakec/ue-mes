import { Outlet, useNavigation } from 'react-router-dom';
import { LoaderFunctionArguments } from '../../types/LoaderFunctionArguments';
import BillOfMaterial from '../../../components/inventory/bill-of-material/BillOfMaterial';
import { fetchBillOfMaterialByBillOfMaterialId, fetchSubAssemblyAndFinishedGoodPartsList } from '../../../ui/scripts/ApiFunctions';
import LoadingModal from '../../../ui/components/LoadingModal';

const InventoryBillOfMaterial:React.FC = () => {
  const navigation = useNavigation();
  
  return (
    <>
    {navigation.state !== 'idle' && <LoadingModal />}
    {navigation.state === 'idle' && 
      <>
        <Outlet />
        <BillOfMaterial />
      </>
    }
    </>
  );
}

export default InventoryBillOfMaterial;


async function loadWithBillOfMaterialId(billOfMaterialId:string) {
  const [parts, billOfMaterial] = await Promise.all([
    fetchSubAssemblyAndFinishedGoodPartsList().catch(()=> {throw new Error('Unable to fetch the subassembly and finished good parts.')}),
    fetchBillOfMaterialByBillOfMaterialId(+billOfMaterialId).catch(()=> {throw new Error('Unable to fetch the bill of material with ID = ' + billOfMaterialId)})
 ])
 return ([ parts, billOfMaterial ]);
}

async function loadWithoutBillOfMaterialId() {  
  return [await fetchSubAssemblyAndFinishedGoodPartsList().catch(()=> {throw new Error('Unable to fetch the subassembly and finished good parts.')}),undefined];
}

export async function loader({params}:LoaderFunctionArguments) {
  const billOfMaterialId = params.billOfMaterialId ? params.billOfMaterialId : '0';
  if(!isNaN(+billOfMaterialId) && +billOfMaterialId > 0)
  {
    return loadWithBillOfMaterialId(billOfMaterialId);
  }

  return loadWithoutBillOfMaterialId();
}
