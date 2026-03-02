import { Link, useLoaderData } from "react-router-dom";
import { InventoryItemEntity } from "../../../models/inventory-item-entity";
import InventoryList from "./InventoryList";
import classes from './InventoryDashboard.module.css'
import { BiHistory } from "react-icons/bi";
import InventoryLocationSumChart from "./InventoryLocationSumChart";
import { useContext } from "react";
import { UserContext } from "../../../store/user-context";

const InventoryDashboard: React.FC = () => {
  const inventoryItemList = useLoaderData() as InventoryItemEntity[];
  
  // Context
  const {loggedInUser} = useContext(UserContext);
  
  const inventoryHistoryClickEventHandler = (buttonEvent:React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
    {
      buttonEvent.preventDefault();
    }

  return (
    <>
    <div className={classes.inventoryDashboardCharts}>
        <div className={classes.inventoryDashboardChart1}>
            <InventoryLocationSumChart inventoryItems={inventoryItemList} />
        </div>
        <div className={classes.inventoryDashboardChart2}>
            {/* <Link to="/inventory/dashboard/receive-new-inventory" className={classes.button} >
            Receive New Inventory
            </Link> */}
        </div>
        <div className={classes.inventoryDashboardChart3}>
            {/* <Link to="/inventory/dashboard/receive-new-inventory" className={classes.button} >
            Receive New Inventory
            </Link> */}
        </div>
        <div className={classes.inventoryDashboardChart4}>
            {/* <Link to="/inventory/dashboard/receive-new-inventory" className={classes.button} >
            Receive New Inventory
            </Link> */}
        </div>
    </div>
    <div className={classes.inventoryListActions}>
        <div className={classes.inventoryListActionsLeft}>
            <Link to="/inventory/dashboard/inventory-locations" className={`${loggedInUser && loggedInUser.userId && loggedInUser.userId > 0 ? classes['button'] : classes['disabledButton']}`} >
            Inventory Locations
            </Link>
            <Link to="/inventory/dashboard/receive-new-inventory" className={`${loggedInUser && loggedInUser.userId && loggedInUser.userId > 0 ? classes['button'] : classes['disabledButton']}`} >
            Receive New Inventory
            </Link>
            <Link to="/inventory/dashboard/warehouse-inventory" className={`${loggedInUser && loggedInUser.userId && loggedInUser.userId > 0 ? classes['button'] : classes['disabledButton']}`} >
            Warehouse Inventory
            </Link>
        </div>
        <div className={classes.inventoryListActionsRight}>
            <button className={classes.actionButton} onClick={inventoryHistoryClickEventHandler}><BiHistory size={24}  />History</button>
        </div>
    </div>
    <div>
        {inventoryItemList !== undefined && inventoryItemList.length > 0 &&
        <InventoryList inventoryItems={inventoryItemList} />
        }
        {(inventoryItemList === undefined || inventoryItemList.length === 0) &&
        <div>Sorry, no inventory to be found</div>
        }   
    </div>
    </>
  );
};

export default InventoryDashboard;
