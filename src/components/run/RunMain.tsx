import { useCallback, useContext, useEffect, useState } from "react";
import RunActions from "./RunActions";
import RunContent from "./RunContent";
import RunHeader from "./RunHeader";
import classes from './RunMain.module.css'
import { OrderItemUnitEquipmentAndUserViewModel } from "../../view-models/order-item-unit-equipment-user-view-model";
// import { BillOfMaterialEntity } from "../../models/bill-of-material-entity";
// import { BillOfProcessEntity } from "../../models/bill-of-process-entity";
// import { OrderItemUnitWorkElementHistoryEntity } from "../../models/order-item-unit-work-element-history-entity";
// import { WorkElementStatusEntity } from "../../models/work-element-status-entity";
// import { UserContext } from "../../store/user-context";
// import { fetchBillOfMaterialByPart, fetchBillOfProcessByPart, fetchOrderItemUnitEquipmentAndUserBySerialNumber, postAddOrderItemUnitWorkElementHistory } from "../../ui/scripts/ApiFunctions";
import { RunMainContext } from "../../store/run-main-context";
import ErrorDisplay from "../../ui/components/ErrorDisplay";
import LoadingModal from "../../ui/components/LoadingModal";
import { useLoaderData, useParams } from "react-router-dom";

const RunMain:React.FC =() => {

  // State variables
  // const [isOrderItemUnitEquipmentAndUserLoaded, setIsOrderItemUnitEquipmentAndUserLoaded] = useState(false);
  // const [loadedUnitBillOfMaterial, setLoadedUnitBillOfMaterial] = useState({} as BillOfMaterialEntity);
  // const [loadedUnitBillOfProcess, setLoadedUnitBillOfProcess] = useState({} as BillOfProcessEntity);
  const [isLoading, setIsLoading] = useState(false);

  // Context
  // const {loggedInUser} = useContext(UserContext);
  const {equipmentList, 
    componentError,  
    orderItemUnitEquipmentAndUser,setOrderItemUnitEquipmentAndUser,
    isOrderItemUnitEquipmentAndUserLoaded, setIsOrderItemUnitEquipmentAndUserLoaded,
    loadedUnitBillOfMaterial, 
    loadedUnitBillOfProcess} = useContext(RunMainContext);
  
  // Loader and router params
  const loadedOrderItemEquipmentAndUser = useLoaderData() as OrderItemUnitEquipmentAndUserViewModel;
  const routerParams = useParams();

  // Constants
  const isWorkElementInProgress = orderItemUnitEquipmentAndUser.orderItemUnit && 
  orderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitWorkElementHistories && 
  orderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitWorkElementHistories.some(orderItemUnitWorkElementHistory => orderItemUnitWorkElementHistory.workElementStatus.name === "In Progress")
  
  const isLoaderDataNeeded = useCallback(():boolean => {
    const isLoadedOrderItemEquipmentAndUserOrderItemUnitLoaded = loadedOrderItemEquipmentAndUser && loadedOrderItemEquipmentAndUser.orderItemUnit && loadedOrderItemEquipmentAndUser.orderItemUnit.orderItemUnitId > 0;
    const isLoadedOrderItemEquipmentAndUserEquipmentLoaded = loadedOrderItemEquipmentAndUser && loadedOrderItemEquipmentAndUser.equipment && loadedOrderItemEquipmentAndUser.equipment.equipmentId > 0;
    const isLoaderOrderItemEquipmentAndUserLoaded = isLoadedOrderItemEquipmentAndUserOrderItemUnitLoaded || isLoadedOrderItemEquipmentAndUserEquipmentLoaded;
    const isOrderItemUnitEquipmentAndUserOrderItemUnitLoaded = orderItemUnitEquipmentAndUser && orderItemUnitEquipmentAndUser.orderItemUnit && orderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitId > 0;
    const isOrderItemUnitEquipmentAndUserEquipmentLoaded = orderItemUnitEquipmentAndUser && orderItemUnitEquipmentAndUser.equipment && orderItemUnitEquipmentAndUser.equipment.equipmentId > 0;
    const serialOrEquipmentFromRouterParams = routerParams && routerParams.serialNumberOrEquipment && routerParams.serialNumberOrEquipment.length > 0 ? routerParams.serialNumberOrEquipment : '';
    
    if(serialOrEquipmentFromRouterParams.length > 0 && !isNaN(+serialOrEquipmentFromRouterParams) && +serialOrEquipmentFromRouterParams > 0)
    {
      return (isLoaderOrderItemEquipmentAndUserLoaded 
        && (!isOrderItemUnitEquipmentAndUserOrderItemUnitLoaded || (isOrderItemUnitEquipmentAndUserOrderItemUnitLoaded && orderItemUnitEquipmentAndUser.orderItemUnit.serialNumber !== serialOrEquipmentFromRouterParams))
      );
    }
    else if(serialOrEquipmentFromRouterParams.length > 0 && isNaN(+serialOrEquipmentFromRouterParams))
    {
      return (isLoaderOrderItemEquipmentAndUserLoaded 
        && (!isOrderItemUnitEquipmentAndUserEquipmentLoaded || (isOrderItemUnitEquipmentAndUserEquipmentLoaded && orderItemUnitEquipmentAndUser.equipment.name !== serialOrEquipmentFromRouterParams))
      );
    }
    else
    {
      return false;
    }
    // If the loader already has fetched the order data, we can go ahead and populate the client using the same methods as if coming from the start screen.
    // However, this useEffect will be called on re-renders and the loader data could be outdated.  
    // To overcome this for now, we will only load the object from loaderData if the object is not present, or present, but different equipment or serial in the route params.
    // return (isLoaderOrderItemEquipmentAndUserLoaded 
    //   && ((!isOrderItemUnitEquipmentAndUserOrderItemUnitLoaded || (isOrderItemUnitEquipmentAndUserOrderItemUnitLoaded && orderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitId !== loadedOrderItemEquipmentAndUser.orderItemUnit.orderItemUnitId))
    //     || (!isOrderItemUnitEquipmentAndUserEquipmentLoaded || (isOrderItemUnitEquipmentAndUserEquipmentLoaded && orderItemUnitEquipmentAndUser.equipment.equipmentId !== loadedOrderItemEquipmentAndUser.equipment.equipmentId)))
    // );
  },[loadedOrderItemEquipmentAndUser,orderItemUnitEquipmentAndUser,routerParams]);

  const setOrderItemUnitEquipmentAndUserHandler = (updatedOrderItemUnitEquipmentAndUserViewModel:OrderItemUnitEquipmentAndUserViewModel) => {
    // This method is just handling the text changes of the serial number and equipment select lookup.  A button or scan event will trigger any data loading
    setOrderItemUnitEquipmentAndUser(updatedOrderItemUnitEquipmentAndUserViewModel);
    if(updatedOrderItemUnitEquipmentAndUserViewModel && updatedOrderItemUnitEquipmentAndUserViewModel.orderItemUnit && updatedOrderItemUnitEquipmentAndUserViewModel.orderItemUnit.orderItemUnitId > 0) {
      console.log("Set in RunMain setOrderItemUnitEquipmentAndUserHandler for serial " + updatedOrderItemUnitEquipmentAndUserViewModel.orderItemUnit.serialNumber);
    }
    else {
      console.log("Set in RunMain setOrderItemUnitEquipmentAndUserHandler for serial NA");
    }
  }

  // const addMissingFirstWorkElementForOrderItemUnit = useCallback((currentOrderItemUnitEquipmentAndUser:OrderItemUnitEquipmentAndUserViewModel,
  //   fetchedBillOfProcess:BillOfProcessEntity):void => {
  //   setIsLoading(true);

  //   // We'll construct the OrderItemUnitWorkElementHistory entity by pulling the necessary properties from the existing state.
  //   const firstProcessInBop = fetchedBillOfProcess.billOfProcessProcesses.find(billOfProcessProcess => billOfProcessProcess.sequence === 1);
  //   const firstWorkElementInBopProcess = firstProcessInBop?.billOfProcessProcessWorkElements.find(billOfProcessWorkElement => billOfProcessWorkElement.sequence === 1);
  //   const firstEquipmentByBopSequence = equipmentList.find(equipment => equipment.process.processId === firstProcessInBop?.process.processId);
    
  //   // Assuming the properties are hydrated, we can then add the first work element history
  //   if(firstWorkElementInBopProcess !== undefined && firstEquipmentByBopSequence !== undefined)
  //   {
  //     const matchingOrderItemUnitWorkElementHistoryForFirstBopWorkElement = currentOrderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitWorkElementHistories && 
  //     currentOrderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitWorkElementHistories.find(orderItemWorkElementHistory => orderItemWorkElementHistory.billOfProcessProcessWorkElement.billOfProcessProcessWorkElementId === firstWorkElementInBopProcess?.billOfProcessProcessWorkElementId);
    
  //     if(matchingOrderItemUnitWorkElementHistoryForFirstBopWorkElement === undefined)
  //     {
  //       const orderItemUnitWorkElementHistory = {
  //         orderItemUnitWorkElementHistoryId:0,
  //         orderItemUnit:currentOrderItemUnitEquipmentAndUser.orderItemUnit,
  //         billOfProcessProcessWorkElement:firstWorkElementInBopProcess,
  //         equipment:firstEquipmentByBopSequence,
  //         user:loggedInUser,
  //         workElementStatus:{} as WorkElementStatusEntity,
  //         startDate: new Date(),
  //         startDateUtc: new Date(),
  //         lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : ''
  //       } as OrderItemUnitWorkElementHistoryEntity;

  //       // call the Add API method
  //       postAddOrderItemUnitWorkElementHistory(orderItemUnitWorkElementHistory).then(() => {
  //         // Now refresh the OrderItemUnitEquipmentAndUser state with the new data.
  //         fetchOrderItemUnitEquipmentAndUserBySerialNumber(orderItemUnitWorkElementHistory.orderItemUnit.serialNumber).then(refreshedOrderItemUnitEquipmentAndUser => {
  //           if(refreshedOrderItemUnitEquipmentAndUser !== null)
  //           {
  //             setOrderItemUnitEquipmentAndUser(refreshedOrderItemUnitEquipmentAndUser);
  //             if(refreshedOrderItemUnitEquipmentAndUser && refreshedOrderItemUnitEquipmentAndUser.orderItemUnit && refreshedOrderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitId > 0) {
  //               console.log("Set in RunMain addMissingFirstWorkElementForOrderItemUnit for serial " + refreshedOrderItemUnitEquipmentAndUser.orderItemUnit.serialNumber);
  //             }
  //             else {
  //               console.log("Set in RunMain addMissingFirstWorkElementForOrderItemUnit for serial NA");
  //             }
  //           }
  //           setIsLoading(false);
  //         }).catch((error) => {
  //           setComponentError(error as Error);
  //           setIsLoading(false);
  //         });
  //       }).catch((error) => {
  //         setComponentError(error as Error);
  //         setIsLoading(false);
  //       });
  //     }      
  //   }
  // },[equipmentList,loggedInUser,setComponentError,setOrderItemUnitEquipmentAndUser]);

  const setIsOrderItemUnitEquipmentAndUserLoadedHandler = useCallback((updatedOrderItemUnitEquipmentAndUserViewModel:OrderItemUnitEquipmentAndUserViewModel) => {
    setIsLoading(true);
    setIsOrderItemUnitEquipmentAndUserLoaded(updatedOrderItemUnitEquipmentAndUserViewModel);
    setIsLoading(false);
    
    //   const isOrderItemUnitLoadedResult = (updatedOrderItemUnitEquipmentAndUserViewModel.orderItemUnit && updatedOrderItemUnitEquipmentAndUserViewModel.orderItemUnit.orderItemUnitId > 0);
  //   const isEquipmentLoadedResult = (updatedOrderItemUnitEquipmentAndUserViewModel.equipment && updatedOrderItemUnitEquipmentAndUserViewModel.equipment.equipmentId > 0);
    
  //   // The loaded object boolean will be set to true if either the order item unit OR the equipment is present.
  //   // This just validates that the user searched either of these items and was returned a successful result.
  //   setIsOrderItemUnitEquipmentAndUserLoaded(isOrderItemUnitLoadedResult || isEquipmentLoadedResult);

  //   if(isEquipmentLoadedResult && updatedOrderItemUnitEquipmentAndUserViewModel.equipment.name !== loadedEquipmentName)
  //   {
  //     setLoadedEquipmentName(updatedOrderItemUnitEquipmentAndUserViewModel.equipment.name);
  //   }

  //   // Then, if the order item unit is present, we need to start pulling the work element content as well
  //   if(isOrderItemUnitLoadedResult)
  //   {
  //     setIsLoading(true);
    
  //     // Next, fetch the BOM and BOP of the Order Item Unit finished part ID.
  //     fetchBillOfProcessAndBillOfMaterialByPart(updatedOrderItemUnitEquipmentAndUserViewModel.orderItemUnit.part.partId)
  //     .then(fetchedBillOfMaterialAndBillOfProcess => {
  //       setLoadedUnitBillOfMaterial(fetchedBillOfMaterialAndBillOfProcess[0] as BillOfMaterialEntity);
  //       setLoadedUnitBillOfProcess(fetchedBillOfMaterialAndBillOfProcess[1] as BillOfProcessEntity);

  //       // Now that we have the BOM, BOP and order item unit history, we can attempt to load the screen.
  //       // However, in a manual run scenario, an order item unit could be scanned at an equipment for the first time and we need to add the first history record at that time.
  //       // This allows us to get accurate cycle times of processing, but also see the time a unit waits for its next equipment.
  //       if(updatedOrderItemUnitEquipmentAndUserViewModel.orderItemUnit.orderItemUnitWorkElementHistories === undefined || updatedOrderItemUnitEquipmentAndUserViewModel.orderItemUnit.orderItemUnitWorkElementHistories.length === 0)
  //       {
  //         addMissingFirstWorkElementForOrderItemUnit(updatedOrderItemUnitEquipmentAndUserViewModel, fetchedBillOfMaterialAndBillOfProcess[1] as BillOfProcessEntity);
  //       }
  //       setIsLoading(false);
  //     }).catch((error) => {
  //       setComponentError(error as Error);
  //       setIsLoading(false);
  //     });

  //     // At this point, work element history should be accurate, so we can now set the content.
  //     // The RunContent component receives everything as props, so the logic ends here and will take over in the RunContent component      
  //   }
  },[setIsOrderItemUnitEquipmentAndUserLoaded]);

  
  // async function fetchBillOfProcessAndBillOfMaterialByPart(partId?:number) {
  //   const [billOfMaterial, billOfProcess] = await Promise.all([
  //     fetchBillOfMaterialByPart(partId?.toString()),
  //     fetchBillOfProcessByPart(partId?.toString())
  //   ])
  //   return ([ billOfMaterial, billOfProcess ]);
  // }
    
  useEffect(() => {
    // If the loader already has fetched the order data, we can go ahead and populate the client using the same methods as if coming from the start screen.
    // However, this useEffect will be called on re-renders and the loader data could be outdated.  
    // To overcome this for now, we will only load the object from loaderData if the object is not present, or present, but different equipment or serial.
    if(isLoaderDataNeeded())
    {
      setOrderItemUnitEquipmentAndUser(loadedOrderItemEquipmentAndUser);
      setIsOrderItemUnitEquipmentAndUserLoadedHandler(loadedOrderItemEquipmentAndUser);
      console.log("Loader from router, equip = " + loadedOrderItemEquipmentAndUser.equipment.name);
    }
  },[loadedOrderItemEquipmentAndUser,orderItemUnitEquipmentAndUser,setIsOrderItemUnitEquipmentAndUserLoadedHandler,setOrderItemUnitEquipmentAndUser,isLoaderDataNeeded]);

  return (
    <>
      {isLoading && <LoadingModal />}
      <RunHeader
        orderItemUnitEquipmentAndUser={orderItemUnitEquipmentAndUser}
        isOrderItemUnitEquipmentAndUserLoaded={isOrderItemUnitEquipmentAndUserLoaded}/>
      <div className={classes.runMainErrorContainer}>
        {componentError !== undefined && componentError.message && componentError.message.length > 0 && <ErrorDisplay title={'Error'} message={componentError.message} />}
      </div>
      <div className={classes.runContentAndFooterGrid}>
        <RunContent 
          orderItemUnitEquipmentAndUser={orderItemUnitEquipmentAndUser}
          billOfMaterial={loadedUnitBillOfMaterial}
          billOfProcess={loadedUnitBillOfProcess}
          isOrderItemUnitEquipmentAndUserLoaded={isOrderItemUnitEquipmentAndUserLoaded}
          equipmentList={equipmentList}
          onSetOrderItemUnitEquipmentAndUserHandler={setOrderItemUnitEquipmentAndUserHandler}
          onSetIsOrderItemUnitEquipmentAndUserLoadedHandler={setIsOrderItemUnitEquipmentAndUserLoadedHandler} />
      <RunActions 
          isOrderItemUnitEquipmentAndUserLoaded={isOrderItemUnitEquipmentAndUserLoaded}
          orderItemUnitEquipmentAndUser={orderItemUnitEquipmentAndUser}
          isWorkElementInProgress={isWorkElementInProgress}
          onSetOrderItemUnitEquipmentAndUserHandler={setOrderItemUnitEquipmentAndUserHandler}
          onSetIsOrderItemUnitEquipmentAndUserLoadedHandler={setIsOrderItemUnitEquipmentAndUserLoadedHandler} />
      </div>
    </>
  );
}
  
export default RunMain;