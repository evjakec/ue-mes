import { useContext, useEffect, useState } from "react";
import { OrderItemUnitEquipmentAndUserViewModel } from "../../view-models/order-item-unit-equipment-user-view-model";
import classes from './RunActions.module.css'
import {  fetchPartAndOrderItemsViewModelToStartAtEquipment, pauseOrderItemUnitWorkElementHistory } from "../../ui/scripts/ApiFunctions";
import Modal from "../../ui/components/Modal";
import RunStartOrderItem from "./RunStartOrderItem";
import { UserContext } from "../../store/user-context";
import { RunMainContext } from "../../store/run-main-context";
import LoadingModal from "../../ui/components/LoadingModal";
import RunQuality from "./RunQuality";
import { useNavigate } from "react-router-dom";

const RunActions:React.FC<{orderItemUnitEquipmentAndUser:OrderItemUnitEquipmentAndUserViewModel,
  isOrderItemUnitEquipmentAndUserLoaded:boolean,
  isWorkElementInProgress:boolean,
  onSetOrderItemUnitEquipmentAndUserHandler:(updatedOrderItemUnitEquipmentAndUserViewModel:OrderItemUnitEquipmentAndUserViewModel)=>void,
  onSetIsOrderItemUnitEquipmentAndUserLoadedHandler:(updatedOrderItemUnitEquipmentAndUserViewModel:OrderItemUnitEquipmentAndUserViewModel)=>void}> = (props) => {

  const navigate = useNavigate();

  const modalDialogClearInProgressContent = <div className={classes.confirmationModal}><p>The current order item unit has NOT completed all work elements for this equipment.  Clicking <b>OK</b> will pause the in progress work element and close the screen.  Continue?</p></div>;

  // Context
  const {loggedInUser} = useContext(UserContext);
  const {setComponentError, setLoadedEquipmentName} = useContext(RunMainContext);

  // State variables
  const [showIsInProgressModal, setShowIsInProgressModal] = useState(false);
  const [showStartOrderItemModal, setShowStartOrderItemModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [isOrderItemUnitStartEquipment, setIsOrderItemUnitStartEquipment] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const clearOrderItemUnitEquipmentAndUserObjects = () => {
    const emptyOrderItemUnitEquipmentAndUserViewModel = {} as OrderItemUnitEquipmentAndUserViewModel;
      props.onSetOrderItemUnitEquipmentAndUserHandler(emptyOrderItemUnitEquipmentAndUserViewModel);
      props.onSetIsOrderItemUnitEquipmentAndUserLoadedHandler(emptyOrderItemUnitEquipmentAndUserViewModel);
      setLoadedEquipmentName('');
      setComponentError({} as Error); // clear any errors since we're starting fresh
      setIsLoading(false);
      navigate('/run'); // Navigate back to root run so that the page doesn't just reload with the original route link
  }
  const clearOrderItemUnitHandler = () =>
  {
    if(props.isWorkElementInProgress)
    {
      setShowIsInProgressModal(true);
    }
    else
    {
      clearOrderItemUnitEquipmentAndUserObjects();
    }    
  }

  const startOrderItemUnitHandler = () =>
  {
    setShowStartOrderItemModal(true);
  }

  const modalInProgressOkHandler = () =>
  {
    setShowIsInProgressModal(false);
    setIsLoading(true);

    const inProgressOrderItemUnitWorkElementHistory = props.orderItemUnitEquipmentAndUser.orderItemUnit
      && props.orderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitWorkElementHistories
      && props.orderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitWorkElementHistories.find(orderItemUnitWorkElementHistory => orderItemUnitWorkElementHistory.workElementStatus.name === "In Progress");
    
      if(inProgressOrderItemUnitWorkElementHistory && inProgressOrderItemUnitWorkElementHistory.orderItemUnitWorkElementHistoryId > 0)
      {
        const inProgressOrderItemUnitWorkElementHistoryToPause = {...inProgressOrderItemUnitWorkElementHistory, orderItemUnit:props.orderItemUnitEquipmentAndUser.orderItemUnit, user:loggedInUser };
        pauseOrderItemUnitWorkElementHistory(inProgressOrderItemUnitWorkElementHistoryToPause).then(() => {
          clearOrderItemUnitEquipmentAndUserObjects();
        }).catch((error) => {
          setComponentError(error);
          setIsLoading(false);
        });    
      }
      else
      {
        clearOrderItemUnitEquipmentAndUserObjects();
      }
  }

  const modalInProgressCancelHandler = () =>
  {
    setShowIsInProgressModal(false);
  }

  const modalOrderItemUnitStartedHandler = (serialNumber:string) =>
  {
    // If the order item unit start is successful, the modal will close and the run main context events will refresh the component accordingly
    setShowStartOrderItemModal(false);
  }  

  // Executed when an order item unit is scrapped or returned to production
  // Simply need to redirect to the serial number so that the content screen reloads with the latest data
  const modalOrderItemUnitScrappedHandler = (serialNumber:string) =>
  {
    setShowQualityModal(false);
  }

  const modalStartOrderItemCancelHandler = () =>
  {
    setShowStartOrderItemModal(false);
  }  

  const qualityHandler = () =>
  {
    setShowQualityModal(true);
  }  

  const qualityCancelHandler = () =>
  {
    setShowQualityModal(false);
  }

  useEffect(() => {
    if(props.isOrderItemUnitEquipmentAndUserLoaded && props.orderItemUnitEquipmentAndUser.equipment !== undefined)
    {
      fetchPartAndOrderItemsViewModelToStartAtEquipment(props.orderItemUnitEquipmentAndUser.equipment.name).then((orderItemsResult) => {
        setIsOrderItemUnitStartEquipment(orderItemsResult !== undefined && orderItemsResult.length > 0);
      }).catch((error) => {setComponentError(error)});
    }
  }, [props.isOrderItemUnitEquipmentAndUserLoaded,props.orderItemUnitEquipmentAndUser.equipment,setComponentError]);

  return (
      <>
      {showIsInProgressModal && <Modal showFromClient={true} children={modalDialogClearInProgressContent} allowBackdropClose={false} onCancel={modalInProgressCancelHandler} onOk={modalInProgressOkHandler}></Modal>}
      {isLoading && <LoadingModal />}
      {showStartOrderItemModal && 
        <Modal allowBackdropClose={false} onCancel={modalStartOrderItemCancelHandler}> 
          <RunStartOrderItem 
            isOrderItemUnitEquipmentAndUserLoaded={props.isOrderItemUnitEquipmentAndUserLoaded}
            orderItemUnitEquipmentAndUser={props.orderItemUnitEquipmentAndUser}
            onModalOrderItemUnitStarted={modalOrderItemUnitStartedHandler} />
        </Modal>}
        {showQualityModal && 
        <Modal allowBackdropClose={false}> 
          <RunQuality 
            isOrderItemUnitEquipmentAndUserLoaded={props.isOrderItemUnitEquipmentAndUserLoaded}
            orderItemUnitEquipmentAndUser={props.orderItemUnitEquipmentAndUser}
            onModalOrderItemUnitScrapped={modalOrderItemUnitScrappedHandler}
            onModalQualityCancel={qualityCancelHandler} />
        </Modal>}
      { props.isOrderItemUnitEquipmentAndUserLoaded &&
        <div className={classes.actionRowMain}>
          <div className={classes.actionRowContainerLeft}>
            <button type='button' disabled={!loggedInUser || !loggedInUser.userId || loggedInUser.userId < 0} className={classes.actionRowButton} onClick={clearOrderItemUnitHandler}>Clear Order Item</button>
            {isOrderItemUnitStartEquipment && <button type='button' disabled={!loggedInUser || !loggedInUser.userId || loggedInUser.userId < 0} className={classes.actionRowButton} onClick={startOrderItemUnitHandler}>Start Order Item</button>}
          </div>
          <div className={classes.actionRowContainerRight}>
            <button type='button' disabled={!loggedInUser || !loggedInUser.userId || loggedInUser.userId < 0} className={classes.actionRowButton} onClick={qualityHandler}>Quality</button>
          </div>
        </div>
      }
      </>
    );
}

export default RunActions;