import { Outlet, useNavigation } from 'react-router-dom';
import RunMain from '../../components/run/RunMain'
import RunMainContextProvider from '../../store/run-main-context';
import LoadingModal from '../../ui/components/LoadingModal';
import { fetchOrderItemUnitEquipmentAndUserByEquipment, fetchOrderItemUnitEquipmentAndUserBySerialNumber } from '../../ui/scripts/ApiFunctions';
import { LoaderFunctionArguments } from '../types/LoaderFunctionArguments';

const Run:React.FC = () => {
  const navigation = useNavigation();

  return (
    <>
    {navigation.state !== 'idle' && <LoadingModal />}
    {navigation.state === 'idle' && 
      <>
        <Outlet />
        <main>
            <RunMainContextProvider>
              <RunMain />
            </RunMainContextProvider>
        </main>
      </>
    }
    </>    
  );
}

export default Run;

async function loadWithSerialNumber(serialNumber:string) {
  return await fetchOrderItemUnitEquipmentAndUserBySerialNumber(serialNumber).catch(()=> {throw new Error('Unable to fetch the serial number.  Please check the entry and try again.')});
}

async function loadWithEquipment(equipmentName:string) {
  return await fetchOrderItemUnitEquipmentAndUserByEquipment(equipmentName).catch(()=> {throw new Error('Unable to fetch the equipment.  Please check the entry and try again.')});
}

export async function loader({params}:LoaderFunctionArguments) {
  const serialNumberOrEquipment = params.serialNumberOrEquipment ? params.serialNumberOrEquipment : '';
  if(serialNumberOrEquipment.length > 0 && !isNaN(+serialNumberOrEquipment) && +serialNumberOrEquipment > 0)
  {
    return loadWithSerialNumber(serialNumberOrEquipment);
  }
  else if(serialNumberOrEquipment.length > 0 && isNaN(+serialNumberOrEquipment))
  {
    return loadWithEquipment(serialNumberOrEquipment);
  }

  return undefined;
}
