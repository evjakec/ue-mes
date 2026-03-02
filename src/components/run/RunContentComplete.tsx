import {useContext, useEffect, useState } from "react";
import classes from './RunContentComplete.module.css'
import { OrderItemUnitEquipmentAndUserViewModel } from "../../view-models/order-item-unit-equipment-user-view-model";
import { BillOfProcessEntity } from "../../models/bill-of-process-entity";
import { EquipmentEntity } from "../../models/global/equipment-entity";
import { OrderItemUnitWorkElementHistoryEntity } from "../../models/order-item-unit-work-element-history-entity";
import { WorkElementStatusEntity } from "../../models/work-element-status-entity";
import { UserContext } from "../../store/user-context";
import { fetchAllInventoryLocations, fetchInventoryItemBySerialNumber, fetchInventoryItemTypes, fetchOrderItemUnitEquipmentAndUserBySerialNumber, postAddInventory, postAddOrderItemUnitWorkElementHistory } from "../../ui/scripts/ApiFunctions";
import { InventoryLocationEntity } from "../../models/inventory-location-entity";
import { InventoryItemEntity } from "../../models/inventory-item-entity";
import { InventoryItemTypeEntity } from "../../models/inventory-item-type-entity";
import LoadingModal from "../../ui/components/LoadingModal";
import { RunMainContext } from "../../store/run-main-context";
import { InventoryItemAttributeEntity } from "../../models/inventory-item-attribute";
import { SupplierEntity } from "../../models/supplier-entity";
import { useNavigate } from "react-router-dom";

const RunContentComplete: React.FC<{orderItemUnitEquipmentAndUser:OrderItemUnitEquipmentAndUserViewModel, 
    billOfProcess:BillOfProcessEntity,
    equipmentList:EquipmentEntity[],
    onSetOrderItemUnitEquipmentAndUserHandler:(updatedOrderItemUnitEquipmentAndUserViewModel:OrderItemUnitEquipmentAndUserViewModel)=>void,
    onSetIsOrderItemUnitEquipmentAndUserLoadedHandler:(updatedOrderItemUnitEquipmentAndUserViewModel:OrderItemUnitEquipmentAndUserViewModel)=>void}> = (props) => {

    // This component will only be displayed if the activer OrderItemUnit has completed all work elements but has yet to move to the next process.
    // No logic is required to check for completed work elements.  Assume it is done.
    // Then, we need to display an informative message or actions to the user based on the location.
    // If there is a next process in line, present a list of equipment for the given process and allow the user to choose the next one.  This is needed becuase there could be more than 1 equipment per process.
    // If there are no more process steps to complete, then inform the user.  If this is a sub assembly, we may add a label option later, but for now, just show a message.
    // If it is complete and it is a FG assembly, present the Finished Goods validation screen so they can validate and move it to FG
    const [isLastProcessInBop, setIsLastProcessInBop] = useState(false);
    const [nextEquipmentList, setNextEquipmentList] = useState([] as EquipmentEntity[]);
    const [inventoryLocationList, setInventoryLocationList] =  useState([] as InventoryLocationEntity[]);
    const [inventoryItemTypeList, setInventoryItemTypeList] = useState([] as InventoryItemTypeEntity[]);
    const [serialNumberInventoryItem, setSerialNumberInventoryItem] = useState({} as InventoryItemEntity);
    const [isLoading, setIsLoading] = useState(false);
  
    // Context
    const {loggedInUser} = useContext(UserContext);
    const {setComponentError, sendOrderItemUnitMovedToNextEquipment} = useContext(RunMainContext);
  
    // Router
    const navigate = useNavigate();

    const moveToFinishedGoodsClickHandler = () => {
        // API call to validate and move to FG.
        // When clicked, the rules modal should open with loading dialogs next to each rule.  As they succeed\fail, they will update in the view
    }

    const addToInventoryClickHandler = () => {
        // API call to validate and move to inventory.
        // When clicked, the rules modal should open with loading dialogs next to each rule.  As they succeed\fail, they will update in the view
        // Assuming valid, the end result is a sub assembly item added to the Production inventory location.
        setIsLoading(true);

        const productionInventoryLocation = inventoryLocationList.find(inventoryLocation => inventoryLocation.inventoryLocationType.name === 'Production');
        
        // When the MES is deployed, a default supplier of the manufacturer will be added with ID = 1.  
        // Will look to move this into configuration later, but for now, it is safe to hardcode this in.
        const inventoryItem = {
            inventoryItemId:0,
            inventoryItemType: inventoryItemTypeList.find(inventoryItemType => inventoryItemType.name === 'Serial'),
            inventoryLocation:productionInventoryLocation,
            part:props.orderItemUnitEquipmentAndUser.orderItemUnit.part,
            supplier:{supplierId:1} as SupplierEntity,
            serialNumber:props.orderItemUnitEquipmentAndUser.orderItemUnit.serialNumber,
            quantity:1,
            inventoryItemAttributes:[] as InventoryItemAttributeEntity[],
            lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : ''
        } as InventoryItemEntity;

        postAddInventory(inventoryItem).then(() => {
            fetchInventoryItemBySerialNumber(props.orderItemUnitEquipmentAndUser.orderItemUnit.serialNumber).then(fetchedInventoryItem => {
                if(fetchedInventoryItem != null)
                {
                    setSerialNumberInventoryItem(fetchedInventoryItem);
                }
                setIsLoading(false);
            }).catch((fetchError) => {
                setComponentError(fetchError);
                setIsLoading(false);
            });
        }).catch((fetchError) => {
            setComponentError(fetchError);
            setIsLoading(false);
        });;
    }

    const setNextEquipmentAndRefreshHandler = (buttonEvent:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setIsLoading(true);
        // get equip by ID
        const nextEquipmentSelected = props.equipmentList.find(equipment => equipment.equipmentId.toString() === buttonEvent.currentTarget.id);
        const currentEquipmentName = props.orderItemUnitEquipmentAndUser && props.orderItemUnitEquipmentAndUser.equipment && props.orderItemUnitEquipmentAndUser.equipment.equipmentId > 0 ? props.orderItemUnitEquipmentAndUser.equipment.name : '';

        if(nextEquipmentSelected !== undefined && nextEquipmentSelected.equipmentId > 0)
        {
            // Once the next equipment is clicked, the logic will first add the In Progress work element history for the first element.
            // Then, we can set the RunMain props to refresh the client with the updated data.
            const matchingBopProcessForNextEquipment = props.billOfProcess.billOfProcessProcesses.find(bopProcess => bopProcess.process.processId === nextEquipmentSelected.process.processId);
            const firstWorkElementInBopProcess = matchingBopProcessForNextEquipment?.billOfProcessProcessWorkElements.find(workElement => workElement.sequence === 1);

            const orderItemUnitWorkElementHistory = {
                orderItemUnitWorkElementHistoryId:0,
                orderItemUnit:props.orderItemUnitEquipmentAndUser.orderItemUnit,
                billOfProcessProcessWorkElement:firstWorkElementInBopProcess,
                equipment:nextEquipmentSelected,
                user:loggedInUser,
                workElementStatus:{} as WorkElementStatusEntity,
                startDate: new Date(),
                startDateUtc: new Date(),
                lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : ''
            } as OrderItemUnitWorkElementHistoryEntity;

            postAddOrderItemUnitWorkElementHistory(orderItemUnitWorkElementHistory).then(() => {
                fetchOrderItemUnitEquipmentAndUserBySerialNumber(props.orderItemUnitEquipmentAndUser.orderItemUnit.serialNumber).then(fetchedOrderItemUnitEquipmentAndUser => {
                    setIsLoading(false);
                    if(fetchedOrderItemUnitEquipmentAndUser != null)
                    {
                        //props.onSetOrderItemUnitEquipmentAndUserHandler(fetchedOrderItemUnitEquipmentAndUser);  
                        //props.onSetIsOrderItemUnitEquipmentAndUserLoadedHandler(fetchedOrderItemUnitEquipmentAndUser);
                        // props.onSetOrderItemUnitEquipmentAndUserHandler({} as OrderItemUnitEquipmentAndUserViewModel);  
                        // props.onSetIsOrderItemUnitEquipmentAndUserLoadedHandler({} as OrderItemUnitEquipmentAndUserViewModel);
                        if(currentEquipmentName && currentEquipmentName.length > 0) {
                            // Notify all other clients that the unit has moved
                            sendOrderItemUnitMovedToNextEquipment(currentEquipmentName);
                        }
                        
                        navigate('/run/' + nextEquipmentSelected.name);
                    }
                    
                }).catch((fetchError) => {
                    setComponentError(fetchError);
                    setIsLoading(false);
                });
            }).catch((fetchError) => {
                setComponentError(fetchError);
                setIsLoading(false);
            });;
        }
    }
       
    useEffect(() => {
        const lastProcessInBillOfProcess = props.billOfProcess.billOfProcessProcesses && props.billOfProcess.billOfProcessProcesses.sort((processA, processB) => processA.sequence - processB.sequence)[props.billOfProcess.billOfProcessProcesses.length - 1];
        const isLastProcess = lastProcessInBillOfProcess.process.processId === props.orderItemUnitEquipmentAndUser.equipment.process.processId
        setIsLastProcessInBop(isLastProcess);
        if(!isLastProcess)
        {
            // Since we haven't reached the end, let's assign the next equipment list so the operator can choose the next equipment.
            const currentEquipmentProcess = props.billOfProcess.billOfProcessProcesses && props.billOfProcess.billOfProcessProcesses.find(process => process.process.processId === props.orderItemUnitEquipmentAndUser.equipment.process.processId);
            const nextProcessInSequence = props.billOfProcess.billOfProcessProcesses && currentEquipmentProcess && props.billOfProcess.billOfProcessProcesses.find(process => process.sequence === (currentEquipmentProcess.sequence+1));
            if(nextProcessInSequence && nextProcessInSequence.billOfProcessProcessId > 0)
            {
                setNextEquipmentList(props.equipmentList && props.equipmentList.filter(equipment => equipment.process.processId === nextProcessInSequence.process.processId));
            }
        }

        fetchAllInventoryLocations().then((inventoryLocationResult) => {
            setInventoryLocationList(inventoryLocationResult);
        });

        fetchInventoryItemTypes().then((inventoryItemTypesResult) => {
            setInventoryItemTypeList(inventoryItemTypesResult);
        });

        fetchInventoryItemBySerialNumber(props.orderItemUnitEquipmentAndUser.orderItemUnit.serialNumber).then(fetchedInventoryItem => {
            if(fetchedInventoryItem != null)
            {
                setSerialNumberInventoryItem(fetchedInventoryItem);
            }
        });
    },[props.billOfProcess.billOfProcessProcesses,props.orderItemUnitEquipmentAndUser, props.equipmentList]);

    return (
    <>
        {isLoading && <LoadingModal />}
        <div className={classes.completedAssemblyContainer}>
            <div className={classes.completedAssemblyMessage}>Assembly for <b>{props.orderItemUnitEquipmentAndUser.orderItemUnit.serialNumber}</b> at equipment <b>{props.orderItemUnitEquipmentAndUser.equipment.name}</b> is <b>complete</b>.</div>
            {isLastProcessInBop 
                && props.orderItemUnitEquipmentAndUser.orderItemUnit.part.partType === "finishedGood" 
                && loggedInUser && loggedInUser.userId && loggedInUser.userId > 0 &&
            <div>
                {serialNumberInventoryItem &&
                serialNumberInventoryItem.inventoryLocation &&
                serialNumberInventoryItem.inventoryLocation.inventoryLocationType &&
                serialNumberInventoryItem.inventoryLocation.inventoryLocationType.name === "Finished Goods" &&
                    <div>This unit has already been moved to Finished Goods.</div>
                }
                {(!serialNumberInventoryItem ||
                !serialNumberInventoryItem.inventoryLocation ||
                !serialNumberInventoryItem.inventoryLocation.inventoryLocationType ||
                serialNumberInventoryItem.inventoryLocation.inventoryLocationType.name !== "Finished Goods") &&
                    <>
                        <div>If you are ready to validate this unit and move it to finished goods, click the button below.</div>
                        <button type='button' className={classes.contentCompleteButton} onClick={moveToFinishedGoodsClickHandler}>Move to Finished Goods</button>
                    </>
                }
            </div>
            }
            {isLastProcessInBop 
                && props.orderItemUnitEquipmentAndUser.orderItemUnit.part.partType === "subAssembly" 
                && loggedInUser && loggedInUser.userId && loggedInUser.userId > 0 &&
            <div>
                {serialNumberInventoryItem &&
                serialNumberInventoryItem.inventoryLocation &&
                serialNumberInventoryItem.inventoryLocation.inventoryLocationType &&
                serialNumberInventoryItem.inventoryLocation.inventoryLocationType.name === "Production" &&
                    <div>This unit has already been added to inventory.</div>
                }
                {(!serialNumberInventoryItem ||
                !serialNumberInventoryItem.inventoryLocation ||
                !serialNumberInventoryItem.inventoryLocation.inventoryLocationType ||
                serialNumberInventoryItem.inventoryLocation.inventoryLocationType.name !== "Production") &&
                    <>
                        <div>If you are ready to validate this unit and add it to inventory, click the button below.</div>
                        <button type='button' className={classes.contentCompleteButton} onClick={addToInventoryClickHandler}>Add to Inventory</button>
                    </>
                }
            </div>
            }
            {!isLastProcessInBop 
            && loggedInUser && loggedInUser.userId && loggedInUser.userId > 0 && 
            <div>
                <div><b>Choose the next equipment below to begin assembling the next process.</b></div>
                {
                    nextEquipmentList.map(nextEquipment => {
                        return <div key={nextEquipment.equipmentId}><button type='button' id={nextEquipment.equipmentId.toString()} key={nextEquipment.equipmentId} className={classes.contentCompleteButton} onClick={setNextEquipmentAndRefreshHandler}>{nextEquipment.name}</button></div>
                    })
                }
            </div>
            }
        </div>
    </>
    );
}

export default RunContentComplete;