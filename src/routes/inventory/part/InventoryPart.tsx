import { Link, Outlet, useNavigation } from 'react-router-dom';
import PartList from '../../../components/inventory/part/PartList';
import classes from './InventoryPart.module.css';
import { fetchAllActivePartsList } from '../../../ui/scripts/ApiFunctions';
import LoadingModal from '../../../ui/components/LoadingModal';
import { useContext } from 'react';
import { UserContext } from '../../../store/user-context';

const InventoryPart:React.FC = () => {
  const navigation = useNavigation();
  
  // Context
  const {loggedInUser} = useContext(UserContext);
  
  return (
    <>
    {navigation.state !== 'idle' && <LoadingModal />}
    {navigation.state === 'idle' && 
      <>
      <Outlet />
        <p>
          <Link to="/inventory/part/create-part" className={`${loggedInUser && loggedInUser.userId && loggedInUser.userId > 0 ? classes['button'] : classes['disabledButton']}`} >
            New Part
          </Link>
        </p>
        <PartList />
    </>
    }
    </>
  );
}

export default InventoryPart;

export async function loader() {
  return fetchAllActivePartsList().catch(()=> {throw new Error('Unable to fetch the active parts list.')});
}
