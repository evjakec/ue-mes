import { useEffect, useState } from "react";
import { OrderItemUnitEquipmentAndUserViewModel } from "../../view-models/order-item-unit-equipment-user-view-model";
import classes from './RunQuality.module.css'
import { OrderItemUnitWorkElementHistoryEntity } from "../../models/order-item-unit-work-element-history-entity";
import RunScrapOrderItemUnit from "./RunScrapOrderItemUnit";

const RunQuality:React.FC<{orderItemUnitEquipmentAndUser:OrderItemUnitEquipmentAndUserViewModel,
    isOrderItemUnitEquipmentAndUserLoaded:boolean,
    onModalOrderItemUnitScrapped:(scrappedSerialNumber:string)=>void,
    onModalQualityCancel:()=>void}> = (props) => {
  
    // Context
    // const {loggedInUser} = useContext(UserContext);
    
    // Constants
    const isUnitScrapped = props.orderItemUnitEquipmentAndUser && props.orderItemUnitEquipmentAndUser.orderItemUnit && props.orderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitScrap && props.orderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitScrap.orderItemUnitScrapId > 0;

    // State variables
    const [orderItemUnitWorkElementInProgress, setOrderItemUnitWorkElementInProgress] = useState({} as OrderItemUnitWorkElementHistoryEntity);   
      
    useEffect(() => {
        if(props.isOrderItemUnitEquipmentAndUserLoaded && props.orderItemUnitEquipmentAndUser.equipment !== undefined)
        {
            // If a unit is already loaded, we need to determine if it is in progress by filtering for an In Progress work element and setting it in state.
            if(props.orderItemUnitEquipmentAndUser.orderItemUnit !== undefined)
            {
                const inProgressOrderItemUnitWorkElementHistory = props.orderItemUnitEquipmentAndUser.orderItemUnit
                    && props.orderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitWorkElementHistories
                    && props.orderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitWorkElementHistories.find(orderItemUnitWorkElementHistory => orderItemUnitWorkElementHistory.workElementStatus.name === "In Progress");
                    
                if(inProgressOrderItemUnitWorkElementHistory && inProgressOrderItemUnitWorkElementHistory.orderItemUnitWorkElementHistoryId > 0)
                {
                    setOrderItemUnitWorkElementInProgress({...inProgressOrderItemUnitWorkElementHistory, orderItemUnit:props.orderItemUnitEquipmentAndUser.orderItemUnit});
                }
            }
        }
        }, [props.isOrderItemUnitEquipmentAndUserLoaded,props.orderItemUnitEquipmentAndUser.equipment,props.orderItemUnitEquipmentAndUser.orderItemUnit]);
        
  return (
      <div>
        <div className={classes.qualityContainer}>
            <div className={classes.qualityContainerScrap}>
                {!isUnitScrapped 
                    && orderItemUnitWorkElementInProgress
                    && orderItemUnitWorkElementInProgress.orderItemUnitWorkElementHistoryId > 0 &&
                <div className={classes.warningContainer}><p><b>Note:</b> Scrapping unit <b>{props.orderItemUnitEquipmentAndUser.orderItemUnit && props.orderItemUnitEquipmentAndUser.orderItemUnit.serialNumber}</b> will pause the active work element as it is incomplete.</p></div>}
                <div className={classes.qualityScrapOrderItemUnit}>
                    <RunScrapOrderItemUnit orderItemUnitEquipmentAndUser={props.orderItemUnitEquipmentAndUser}
                        workElementInProgress={orderItemUnitWorkElementInProgress && orderItemUnitWorkElementInProgress.orderItemUnitWorkElementHistoryId > 0}
                        onRunScrapOrderItemUnitComplete={props.onModalOrderItemUnitScrapped}
                        onRunScrapOrderItemUnitCancel={props.onModalQualityCancel} />
                </div>
            </div>
            {/* Will figure this out later.  Will probably tie it to a rework equipment station table */}
            {/* {orderItemUnitWorkElementInProgress 
                && orderItemUnitWorkElementInProgress.orderItemUnitWorkElementHistoryId > 0 
                && orderItemUnitWorkElementInProgress.orderItemUnit.orderItemUnitScrap
                && orderItemUnitWorkElementInProgress.orderItemUnit.orderItemUnitScrap.orderItemUnitScrapId > 0 &&
            <div className={classes.qualityReworkContainer}>
                <div className={classes.qualityReworkOrderItemUnit}>
                    <p>Rework form goes here</p>
                </div>
            </div>} */}
        </div>
      </div>
  );
}

export default RunQuality;