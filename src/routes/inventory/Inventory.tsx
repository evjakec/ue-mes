import { Outlet } from 'react-router-dom';
import classes from './Inventory.module.css'
import { SubHeaderLink } from '../../ui/types/sub-header-link';
import SubHeader from '../../ui/components/SubHeader';

const subHeaderLinks:SubHeaderLink[] = [
  {navigateTo:"/inventory/part", navigateText:"Parts" },
  {navigateTo:"/inventory/dashboard", navigateText:"Inventory" },
  {navigateTo:"/inventory/billOfMaterial", navigateText:"Bill of Materials" },
  {navigateTo:"/inventory/billOfProcess", navigateText:"Bill of Process" }]; 

const Inventory:React.FC = () => {
  return (
    <>
    <SubHeader subHeaderNavLinkList={subHeaderLinks} />
    <main className={classes.inventoryMain}>
      <Outlet />
    </main>
    </>
  );
}

export default Inventory;
