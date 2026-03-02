import { Outlet, useNavigation } from 'react-router-dom';
import Site from '../components/home/Site';
import classes from './Home.module.css'
import { fetchLocalSite } from '../ui/scripts/ApiFunctions';
import LoadingModal from '../ui/components/LoadingModal';

const Home:React.FC = () => {
  const navigation = useNavigation();

  return (
    <>
    {navigation.state !== 'idle' && <LoadingModal />}
    {navigation.state === 'idle' && 
      <>
        <Outlet />
        <main className={classes.mainContentContainer}>
          <Site />
        </main>
      </>
    }
    </>
  );
}

export default Home;

export async function loader() {
  return fetchLocalSite().catch(()=> {throw new Error('Unable to fetch the site information.')});
}
