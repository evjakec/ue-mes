import { useContext, useEffect, useState } from "react";
import { OrderItemUnitEquipmentAndUserViewModel } from "../../view-models/order-item-unit-equipment-user-view-model";
import { fetchOrderItemUnitsByOrderItemIds, fetchPartAndOrderItemsViewModelToStartAtEquipment, pauseOrderItemUnitWorkElementHistory, postStartOrderItemUnit } from "../../ui/scripts/ApiFunctions";
import { PartAndOrderItemsViewModel } from "../../view-models/part-order-items-view-model";
import classes from './RunStartOrderItem.module.css'
import { getAttributeValueByName, millimetersToInches } from "../../ui/scripts/CommonFunctions";
import { BiPlayCircle } from "react-icons/bi";
import ProgressBar from "../../ui/components/ProgressBar";
import { OrderItemUnitEntity } from "../../models/order-item-unit-entity";
import { PartEntity } from "../../models/part-entity";
import { OrderItemEntity } from "../../models/order-item-entity";
import { StartOrderItemUnitViewModel } from "../../view-models/start-order-item-unit-view-model";
import { OrderItemUnitWorkElementHistoryEntity } from "../../models/order-item-unit-work-element-history-entity";
import { UserContext } from "../../store/user-context";
import ErrorDisplay from "../../ui/components/ErrorDisplay";
import LoadingModal from "../../ui/components/LoadingModal";

const RunStartOrderItem:React.FC<{orderItemUnitEquipmentAndUser:OrderItemUnitEquipmentAndUserViewModel,
    isOrderItemUnitEquipmentAndUserLoaded:boolean,
    onModalOrderItemUnitStarted:(startedSerialNumber:string)=>void}> = (props) => {
  
    // Context
    const {loggedInUser} = useContext(UserContext);
    
    // State variables
    const [partAndOrderItemViewModelList,setPartAndOrderItemViewModelList] = useState([] as PartAndOrderItemsViewModel[]);
    const [existingOrderItemUnitsForOrderItems,setExistingOrderItemUnitsForOrderItems] = useState([] as OrderItemUnitEntity[]);
    const [orderItemUnitWorkElementInProgress, setOrderItemUnitWorkElementInProgress] = useState({} as OrderItemUnitWorkElementHistoryEntity);
    const [componentError, setComponentError] = useState({} as Error);
    const [isLoading, setIsLoading] = useState(false);
  
    const startOrderItemAndRefresh = (partToAssemble:PartEntity, orderItem:OrderItemEntity) => {           
        if(props.isOrderItemUnitEquipmentAndUserLoaded && props.orderItemUnitEquipmentAndUser.equipment !== undefined && loggedInUser !== undefined && loggedInUser.loginName !== undefined)
        {
            setIsLoading(true);

            const newOrderItemUnit = {
                orderItem:orderItem,
                part:partToAssemble,
                equipment:props.orderItemUnitEquipmentAndUser.equipment,
                user:loggedInUser,
                lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : ''
            } as StartOrderItemUnitViewModel;

            // If an existing item is in progress, we will first pause.  Otherwise, proceed with starting a new order item unit.
            if(orderItemUnitWorkElementInProgress && orderItemUnitWorkElementInProgress.orderItemUnitWorkElementHistoryId > 0)
            {
                pauseOrderItemUnitWorkElementHistory({...orderItemUnitWorkElementInProgress,user:loggedInUser}).then(() => {
                    postStartOrderItemUnit(newOrderItemUnit).then((serialNumberResult) => {
                        props.onModalOrderItemUnitStarted(serialNumberResult);
                        setIsLoading(false);
                    }).catch((fetchError) => {
                        setComponentError(fetchError);
                        setIsLoading(false);
                    });
                }).catch((fetchError) => {
                    setComponentError(fetchError);
                    setIsLoading(false);
                });
            }
            else
            {
                postStartOrderItemUnit(newOrderItemUnit).then((serialNumberResult) => {
                    props.onModalOrderItemUnitStarted(serialNumberResult);
                    setIsLoading(false);
                }).catch((fetchError) => {
                    setComponentError(fetchError);
                    setIsLoading(false);
                });
            }
        }
    }    
      
    useEffect(() => {
        if(props.isOrderItemUnitEquipmentAndUserLoaded && props.orderItemUnitEquipmentAndUser.equipment !== undefined)
        {
            setIsLoading(true);
            fetchPartAndOrderItemsViewModelToStartAtEquipment(props.orderItemUnitEquipmentAndUser.equipment.name).then((orderItemsResult) => {
                setPartAndOrderItemViewModelList(orderItemsResult);
                
                const orderItemIdsArray = Array.from(new Set(orderItemsResult.map((partAndOrderItemsViewModel) => {return partAndOrderItemsViewModel.activeOrderItems.map(orderItem => {return orderItem.orderItemId})})));
                if(orderItemIdsArray && orderItemIdsArray.length === 1)
                {
                    fetchOrderItemUnitsByOrderItemIds(orderItemIdsArray[0]).then(orderItemUnitsResult => {
                        setExistingOrderItemUnitsForOrderItems(orderItemUnitsResult);
                        setIsLoading(false);
                    }).catch((fetchError) => {
                        setComponentError(fetchError);
                        setIsLoading(false);
                    });
                }
                else 
                {
                    setIsLoading(false);
                }
            }).catch((fetchError) => {
                setComponentError(fetchError);
                setIsLoading(false);
            });

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
        {isLoading && <LoadingModal />}
        <div className={classes.orderItemsContainer}>
        {componentError !== undefined && componentError.message && componentError.message.length > 0 && <ErrorDisplay title={'Error'} message={componentError.message} />}
        {orderItemUnitWorkElementInProgress && orderItemUnitWorkElementInProgress.orderItemUnitWorkElementHistoryId > 0 &&
            <div className={classes.warningContainer}><p><b>Note:</b> Starting a new unit will pause <b>{props.orderItemUnitEquipmentAndUser.orderItemUnit && props.orderItemUnitEquipmentAndUser.orderItemUnit.serialNumber}</b> as it is incomplete.</p></div>
        }
        <div className={classes.orderItemsListHeader}>
            <div>Order Number</div>
            <div>Order State</div>
            <div>Part Number</div>
            <div>Part Description</div>
            <div>H x W x T</div>
            <div>Progress</div>
        </div>
        <div className={classes.orderItemsList}>
        {partAndOrderItemViewModelList.length > 0 &&
        partAndOrderItemViewModelList.map(partAndOrderItemViewModel => {
            return partAndOrderItemViewModel.activeOrderItems.length > 0 &&
            partAndOrderItemViewModel.activeOrderItems.map(activeOrderItem => {
                return (
                    <div key={activeOrderItem.orderItemId} className={classes.orderItem}>
                        <div>{activeOrderItem.order.number}</div>
                        <div>{activeOrderItem.order.orderState}</div>
                        <div>{partAndOrderItemViewModel.partToAssemble.partNumber + '(' + partAndOrderItemViewModel.partToAssemble.partRevision + ')'}</div>
                        <div>{partAndOrderItemViewModel.partToAssemble.description}</div>
                        <div>{millimetersToInches(+getAttributeValueByName('Height (mm)',activeOrderItem)) + '" x ' + millimetersToInches(+getAttributeValueByName('Width (mm)',activeOrderItem))  + '" x ' + millimetersToInches(+getAttributeValueByName('Thickness (mm)',activeOrderItem)) + '"'}</div>
                        <div><ProgressBar completedItems={(existingOrderItemUnitsForOrderItems.filter(orderItemUnit => orderItemUnit.orderItem.orderItemId === activeOrderItem.orderItemId).length)} totalItems={activeOrderItem.quantity} /></div>
                        <div><button id={activeOrderItem.orderItemId.toString()} type='button' className={classes.startButton} onClick={() => startOrderItemAndRefresh(partAndOrderItemViewModel.partToAssemble, activeOrderItem)}><div>Start</div><BiPlayCircle size={24} /></button></div>
                    </div>
                );
            });
        })
        }
        </div>
      </div>
    </div>
  );
}

export default RunStartOrderItem;