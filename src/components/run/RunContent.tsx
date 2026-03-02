import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BillOfMaterialEntity } from '../../models/bill-of-material-entity';
import { BillOfProcessEntity } from '../../models/bill-of-process-entity';
import { EquipmentEntity } from '../../models/global/equipment-entity';
import { OrderItemUnitEquipmentAndUserViewModel } from '../../view-models/order-item-unit-equipment-user-view-model';
import classes from './RunContent.module.css'
import RunStart from './RunStart';
import { WorkElementAndOrderItemUnitHistoryViewModel } from '../../view-models/work-element-order-item-unit-history-view-model';
import { BillOfProcessProcessWorkElementEntity } from '../../models/bill-of-process-process-work-element-entity';
import BillOfProcessWorkElementRunText from '../inventory/bill-of-process/BillOfProcessWorkElementRunText';
import BillOfProcessWorkElementRunImage from '../inventory/bill-of-process/BillOfProcessWorkElementRunImage';
import BillOfProcessWorkElementRunDataCollection from '../inventory/bill-of-process/BillOfProcessWorkElementRunDataCollection';
import BillOfProcessWorkElementRunConsumption from '../inventory/bill-of-process/BillOfProcessWorkElementRunConsumption';
import { BillOfProcessProcessWorkElementAttributeEntity } from '../../models/bill-of-process-process-work-element-attribute-entity';
import Modal from '../../ui/components/Modal';
import RunValidationModal from './RunValidationModal';
import { getActiveWorkElementValidationMessagesAsync } from '../../ui/scripts/WorkElementValidation';
import { OrderItemUnitEntity } from '../../models/order-item-unit-entity';
import { DataCollectionWorkElementAndOrderItemUnitValueViewModel } from '../../view-models/data-collection-work-element-order-item-unit-view-model';
import { OrderItemUnitDataCollectionEntity } from '../../models/order-item-unit-data-collection-entity';
import { OrderItemUnitConsumptionEntity } from '../../models/order-item-unit-consumption-entity';
import { ConsumptionWorkElementAndOrderItemUnitValueViewModel } from '../../view-models/consumption-work-element-order-item-unit-view-model';
import RunContentComplete from './RunContentComplete';
import { bypassOrderItemUnitWorkElementHistory, completeOrderItemUnitWorkElementHistory, fetchOrderItemUnitEquipmentAndUserBySerialNumber, postConsumptionAttributeValues, postDataCollectionAttributeValues, resumeOrderItemUnitWorkElementHistory } from '../../ui/scripts/ApiFunctions';
import { BiPlayCircle } from 'react-icons/bi';
import { UserContext } from '../../store/user-context';
import { RunMainContext } from '../../store/run-main-context';
import LoadingModal from '../../ui/components/LoadingModal';

const RunContent:React.FC<{orderItemUnitEquipmentAndUser:OrderItemUnitEquipmentAndUserViewModel, 
  isOrderItemUnitEquipmentAndUserLoaded:boolean,
  billOfMaterial:BillOfMaterialEntity,
  billOfProcess:BillOfProcessEntity,
  equipmentList:EquipmentEntity[],
  onSetOrderItemUnitEquipmentAndUserHandler:(updatedOrderItemUnitEquipmentAndUserViewModel:OrderItemUnitEquipmentAndUserViewModel)=>void,
  onSetIsOrderItemUnitEquipmentAndUserLoadedHandler:(updatedOrderItemUnitEquipmentAndUserViewModel:OrderItemUnitEquipmentAndUserViewModel)=>void}> = (props) => {
    
  // Context
  const {loggedInUser} = useContext(UserContext);
  const {setComponentError} = useContext(RunMainContext);

  // Constants
  const isOrderItemUnitScrapped = props.orderItemUnitEquipmentAndUser.orderItemUnit && props.orderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitScrap && props.orderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitScrap.orderItemUnitScrapId > 0;

  // Each work element has its own component and state will be managed there.
  // We will set the active work element in state here so we can pass it down to its respective component
  // When a work element is completed, API calls will be engaged to essentially refresh the screen with new data.  
  const [workElementAndOrderItemUnitHistoryViewModel, setWorkElementAndOrderItemUnitHistoryViewModel] = useState([] as WorkElementAndOrderItemUnitHistoryViewModel[]);
  const [dataCollectionWorkElementAndOrderItemUnitValueViewModel, setDataCollectionWorkElementAndOrderItemUnitValueViewModel] = useState([] as DataCollectionWorkElementAndOrderItemUnitValueViewModel[]);
  const [consumptionWorkElementAndOrderItemUnitValueViewModel, setConsumptionWorkElementAndOrderItemUnitValueViewModel] = useState([] as ConsumptionWorkElementAndOrderItemUnitValueViewModel[]);
  const [activeWorkElement, setActiveWorkElement] = useState({} as BillOfProcessProcessWorkElementEntity);
  const [activeWorkElementErrorMessages, setActiveWorkElementErrorMessages] = useState([] as string[]);
  const [activeWorkElementWarningMessages, setActiveWorkElementWarningMessages] = useState([] as string[]);
  const [activeWorkElementStatus, setActiveWorkElementStatus] = useState('');
  const [showCompleteWorkElementModal, setShowCompleteWorkElementModal] = useState(false);
  const [showBypassWorkElementModal, setShowBypassWorkElementModal] = useState(false);
  const [allWorkElementsComplete, setAllWorkElementsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Empty order item unit data collection with related entities populated by props.
  // This will be used in the mapping to ensure any new objects contain the correct property values
  const emptyOrderItemUnitDataCollection = useMemo(() => ({
    orderItemUnitDataCollectionId:0,
    orderItemUnit:props.orderItemUnitEquipmentAndUser.orderItemUnit,
    equipment:props.orderItemUnitEquipmentAndUser.equipment,
    user:loggedInUser,
    collectedValue:'',
    lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : ''
  } as OrderItemUnitDataCollectionEntity),[props.orderItemUnitEquipmentAndUser.orderItemUnit,props.orderItemUnitEquipmentAndUser.equipment,loggedInUser]);

  // Empty order item unit data collection with related entities populated by props.
  // This will be used in the mapping to ensure any new objects contain the correct property values
  const emptyOrderItemUnitConsumption = useMemo(() => ({
    orderItemUnitConsumptionId:0,
    orderItemUnit:props.orderItemUnitEquipmentAndUser.orderItemUnit,
    equipment:props.orderItemUnitEquipmentAndUser.equipment,
    user:loggedInUser,
    consumedSerialNumber:'',
    lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : ''
  } as OrderItemUnitConsumptionEntity),[props.orderItemUnitEquipmentAndUser.orderItemUnit,props.orderItemUnitEquipmentAndUser.equipment,loggedInUser]);

  const mapDataCollectionWorkElementsToMatchingOrderItemUnitValues = useCallback((activeOrderItemUnit:OrderItemUnitEntity, activeWorkElementAttributes:BillOfProcessProcessWorkElementAttributeEntity[]) => {
    
    // If the order item unit is loaded, we can run the logic.
    if(activeOrderItemUnit !== undefined)
    {
      if(activeWorkElementAttributes !== undefined && activeWorkElementAttributes.length > 0)
      {
        // We can skip the text element as we do not need to validate it or save its result (which there is none anyway)
        const filteredDataCollectionAttributes = activeWorkElementAttributes.filter(workElement => workElement.workElementTypeAttribute.name !== "Work Element Text");
        const mappedWorkElementAttributessAndDataCollectionValues = filteredDataCollectionAttributes.map(workElementAttribute => {
          
        // Hydrate the Order Item Unit Data Collection from either an existing record, or use the empty template from above.
        const existingDataCollectionAttribute = activeOrderItemUnit.orderItemUnitDataCollections.find(orderItemUnitDataCollection => orderItemUnitDataCollection.billOfProcessProcessWorkElementAttribute.billOfProcessProcessWorkElementAttributeId === workElementAttribute.billOfProcessProcessWorkElementAttributeId);
        const updatedOrderItemUnitDataCollection = existingDataCollectionAttribute ? {...existingDataCollectionAttribute, orderItemUnit:activeOrderItemUnit} : {...emptyOrderItemUnitDataCollection, billOfProcessProcessWorkElementAttribute:workElementAttribute};
        
        const mappedWorkElementAttributessAndDataCollection = {
          dataCollectionWorkElementAttribute:workElementAttribute,
          orderItemUnitDataCollection:updatedOrderItemUnitDataCollection
        } as DataCollectionWorkElementAndOrderItemUnitValueViewModel;

          return mappedWorkElementAttributessAndDataCollection;
        });

        setDataCollectionWorkElementAndOrderItemUnitValueViewModel(mappedWorkElementAttributessAndDataCollectionValues);
      }
    }
  },[emptyOrderItemUnitDataCollection]);

  const mapConsumptionWorkElementsToMatchingOrderItemUnitValues = useCallback((activeOrderItemUnit:OrderItemUnitEntity, activeWorkElementAttributes:BillOfProcessProcessWorkElementAttributeEntity[]) => {
    
    // If the order item unit is loaded, we can run the logic.
    if(activeOrderItemUnit !== undefined)
    {
      if(activeWorkElementAttributes !== undefined && activeWorkElementAttributes.length > 0)
      {
        // We can skip the text element as we do not need to validate it or save its result (which there is none anyway)
        const filteredConsumptionAttributes = activeWorkElementAttributes.filter(workElement => workElement.workElementTypeAttribute.name !== "Work Element Text");
        const mappedWorkElementAttributessAndConsumptionValues = filteredConsumptionAttributes.map(workElementAttribute => {
          
        // Hydrate the Order Item Unit Consumption from either an existing record, or use the empty template from above.
        const existingConsumptionAttribute = activeOrderItemUnit.orderItemUnitConsumptions.find(orderItemUnitConsumption => orderItemUnitConsumption.billOfProcessProcessWorkElementAttribute.billOfProcessProcessWorkElementAttributeId === workElementAttribute.billOfProcessProcessWorkElementAttributeId);
        const updatedOrderItemUnitConsumption = existingConsumptionAttribute ? {...existingConsumptionAttribute, orderItemUnit:activeOrderItemUnit} : {...emptyOrderItemUnitConsumption, billOfProcessProcessWorkElementAttribute:workElementAttribute};
        
        const mappedWorkElementAttributessAndConsumption = {
          consumptionWorkElementAttribute:workElementAttribute,
          orderItemUnitConsumption:updatedOrderItemUnitConsumption
        } as ConsumptionWorkElementAndOrderItemUnitValueViewModel;

          return mappedWorkElementAttributessAndConsumption;
        });

        setConsumptionWorkElementAndOrderItemUnitValueViewModel(mappedWorkElementAttributessAndConsumptionValues);
      }
    }
  },[emptyOrderItemUnitConsumption]);

  const mapWorkElementsToMatchingHistory = useCallback(() => {
    const activeOrderItemUnitEquipmentAndUser = props.orderItemUnitEquipmentAndUser;
    const activeBillOfProcessProcess = props.billOfProcess.billOfProcessProcesses && activeOrderItemUnitEquipmentAndUser.equipment && activeOrderItemUnitEquipmentAndUser.equipment.process && props.billOfProcess.billOfProcessProcesses.find(billOfProcessProcess => activeOrderItemUnitEquipmentAndUser.equipment.process !== undefined && billOfProcessProcess.process.processId === activeOrderItemUnitEquipmentAndUser.equipment.process.processId);

    // If the order item unit and BOP are loaded, we can run the logic.
    if(activeOrderItemUnitEquipmentAndUser !== undefined && activeBillOfProcessProcess !== undefined && activeOrderItemUnitEquipmentAndUser.orderItemUnit && activeOrderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitId > 0)
    {
      const workElementsForCurrentEquipment = activeBillOfProcessProcess.billOfProcessProcessWorkElements;
    
      if(workElementsForCurrentEquipment !== undefined && workElementsForCurrentEquipment.length > 0)
      {
        const mappedWorkElementsAndHistory = workElementsForCurrentEquipment.map(equipmentWorkElement => {
          //const workElementOrderItemUnitHistory = activeOrderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitWorkElementHistories && activeOrderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitWorkElementHistories.length > 0 ? activeOrderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitWorkElementHistories.find(orderItemUnitWorkElementHistory => orderItemUnitWorkElementHistory.billOfProcessProcessWorkElement.billOfProcessProcessWorkElementId === equipmentWorkElement.billOfProcessProcessWorkElementId) : {};
          const workElementOrderItemUnitHistory = activeOrderItemUnitEquipmentAndUser.orderItemUnit 
            && activeOrderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitWorkElementHistories 
            && activeOrderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitWorkElementHistories.length > 0 ? 
              activeOrderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitWorkElementHistories.sort((orderItemHistoryA, orderItemHistoryB) => new Date(orderItemHistoryB.startDateUtc).getTime() - new Date(orderItemHistoryA.startDateUtc).getTime())
                .find(orderItemUnitWorkElementHistory => orderItemUnitWorkElementHistory.billOfProcessProcessWorkElement.billOfProcessProcessWorkElementId === equipmentWorkElement.billOfProcessProcessWorkElementId) : {} as BillOfProcessProcessWorkElementEntity;
          const mappedWorkElementAndHistory = {
            workElement:{...equipmentWorkElement, billOfProcessProcess:activeBillOfProcessProcess},
            orderItemUnitWorkElementHistory: {...workElementOrderItemUnitHistory, orderItemUnit:activeOrderItemUnitEquipmentAndUser.orderItemUnit, billOfProcessProcessWorkElement:{...equipmentWorkElement, billOfProcessProcess:activeBillOfProcessProcess}}
          } as WorkElementAndOrderItemUnitHistoryViewModel;

          if(mappedWorkElementAndHistory && mappedWorkElementAndHistory.orderItemUnitWorkElementHistory && mappedWorkElementAndHistory.orderItemUnitWorkElementHistory.workElementStatus && (mappedWorkElementAndHistory.orderItemUnitWorkElementHistory.workElementStatus.name === "In Progress" || mappedWorkElementAndHistory.orderItemUnitWorkElementHistory.workElementStatus.name === "Paused"))
          {
            setActiveWorkElement(mappedWorkElementAndHistory.workElement);
            setActiveWorkElementStatus(mappedWorkElementAndHistory.orderItemUnitWorkElementHistory.workElementStatus.name);

            // Once the active work element is set, we should then map any attributes to their respective values.  This only applies to some work element types, thus the switch
            switch(mappedWorkElementAndHistory.workElement.workElementType.name) {
              case "Data Collection":
                mapDataCollectionWorkElementsToMatchingOrderItemUnitValues(activeOrderItemUnitEquipmentAndUser.orderItemUnit, mappedWorkElementAndHistory.workElement.billOfProcessProcessWorkElementAttributes);
                break;
              case "Consumption":
                mapConsumptionWorkElementsToMatchingOrderItemUnitValues(activeOrderItemUnitEquipmentAndUser.orderItemUnit, mappedWorkElementAndHistory.workElement.billOfProcessProcessWorkElementAttributes);
                break;
              default:
                break;    
            }
          }

          return mappedWorkElementAndHistory;
        });

        setWorkElementAndOrderItemUnitHistoryViewModel(mappedWorkElementsAndHistory);
        
        // Check to see if the assembly is complete at this equipment.
        const incompleteWorkElements = mappedWorkElementsAndHistory.filter(mappedWorkElementsAndHistoryItem => mappedWorkElementsAndHistoryItem.orderItemUnitWorkElementHistory === undefined 
          || mappedWorkElementsAndHistoryItem.orderItemUnitWorkElementHistory.workElementStatus === undefined 
          || mappedWorkElementsAndHistoryItem.orderItemUnitWorkElementHistory.workElementStatus.name === 'In Progress' 
          || mappedWorkElementsAndHistoryItem.orderItemUnitWorkElementHistory.workElementStatus.name === 'Paused' 
          || mappedWorkElementsAndHistoryItem.orderItemUnitWorkElementHistory.workElementStatus.name === 'Unknown');
        setAllWorkElementsComplete(incompleteWorkElements === undefined || incompleteWorkElements.length === 0);
      }
      else
      {
        // If there are no work elements for the selected equipment and BOP, we can simply load an empty screen.  
        // Ultimately, each equipment will have something, but if something goes missing, we need to make sure we don't present data that is incorrect.
        // Therefore, we need to clear the WorkElementAndOrderItemUnitHistoryViewModel
        setActiveWorkElement({} as BillOfProcessProcessWorkElementEntity);
        setActiveWorkElementStatus('');
        setWorkElementAndOrderItemUnitHistoryViewModel([] as WorkElementAndOrderItemUnitHistoryViewModel[]);
        setAllWorkElementsComplete(false);
      }
    }
    else
    {
      // If there is no BOP assigned to this equipment at all, we can simply load an empty screen
      // Ultimately, each equipment will have something, but if something goes missing, we need to make sure we don't present data that is incorrect.
      // Therefore, we need to clear the WorkElementAndOrderItemUnitHistoryViewModel
      setActiveWorkElement({} as BillOfProcessProcessWorkElementEntity);
      setActiveWorkElementStatus('');
      setWorkElementAndOrderItemUnitHistoryViewModel([] as WorkElementAndOrderItemUnitHistoryViewModel[]);
      setAllWorkElementsComplete(false);
    }
  },[props.billOfProcess.billOfProcessProcesses, props.orderItemUnitEquipmentAndUser,mapDataCollectionWorkElementsToMatchingOrderItemUnitValues,mapConsumptionWorkElementsToMatchingOrderItemUnitValues]);

  const updateDataCollectionAttributesHandler = (updatedDataCollectionAttributeViewModels:DataCollectionWorkElementAndOrderItemUnitValueViewModel[]) => {
    setDataCollectionWorkElementAndOrderItemUnitValueViewModel(updatedDataCollectionAttributeViewModels);
  }

  const updateConsumptionAttributesHandler = (updatedConsumptionAttributeViewModels:ConsumptionWorkElementAndOrderItemUnitValueViewModel[]) => {
    setConsumptionWorkElementAndOrderItemUnitValueViewModel(updatedConsumptionAttributeViewModels);
  }

  // Elevated from RunContentComplete
  const setIsOrderItemUnitEquipmentAndUserLoadedHandler = (updatedOrderItemUnitEquipmentAndUserViewModel:OrderItemUnitEquipmentAndUserViewModel) => {
    props.onSetIsOrderItemUnitEquipmentAndUserLoadedHandler(updatedOrderItemUnitEquipmentAndUserViewModel);
  }

  // Elevated from RunContentComplete
  const setOrderItemUnitEquipmentAndUserHandler = (updatedOrderItemUnitEquipmentAndUserViewModel:OrderItemUnitEquipmentAndUserViewModel) => {
    props.onSetOrderItemUnitEquipmentAndUserHandler(updatedOrderItemUnitEquipmentAndUserViewModel);
  }
  
  const completeWorkElementHandler = () =>
  {
    setIsLoading(true);

    getActiveWorkElementValidationMessagesAsync(activeWorkElement, dataCollectionWorkElementAndOrderItemUnitValueViewModel, consumptionWorkElementAndOrderItemUnitValueViewModel).then(validationMessages =>
    {
      setActiveWorkElementErrorMessages(validationMessages.errorMessages);
      setActiveWorkElementWarningMessages(validationMessages.warningMessages);

      // Show the errors and warnings modal first if there are any validation messages
      if(validationMessages.errorMessages.length > 0 || validationMessages.warningMessages.length > 0)
      {
        setShowCompleteWorkElementModal(true);
        setIsLoading(false);
      }
      else
      {
        completeWorkElement();
      }
    }).catch((error) => {
      setComponentError(error);
      setIsLoading(false);
    });
  }

  const bypassWorkElementHandler = () =>
  {
    setShowBypassWorkElementModal(true);
  }

  const modalCompleteOkHandler = () =>
  {
    setShowCompleteWorkElementModal(false);
    
    // Only call the complete logic if the errors have been cleared.  
    if(activeWorkElementErrorMessages.length === 0)
    {
      setIsLoading(true);
      completeWorkElement();
    }
  }

  const modalCompleteCancelHandler = () =>
  {
    setShowCompleteWorkElementModal(false);
  }    

  const modalBypassOkHandler = () =>
  {
    setShowBypassWorkElementModal(false);
    // Bypass can be called even if there are still validation errors
    setIsLoading(true);
    bypassWorkElement();
  }

  const modalBypassCancelHandler = () =>
  {
    setShowBypassWorkElementModal(false);
  }  

  const completeWorkElement = () => {
    const activeOrderItemUnitWorkElementHistory = workElementAndOrderItemUnitHistoryViewModel.find(findWorkElementAndOrderItemUnitHistoryViewModel => findWorkElementAndOrderItemUnitHistoryViewModel.workElement.billOfProcessProcessWorkElementId === activeWorkElement.billOfProcessProcessWorkElementId);
    if(activeOrderItemUnitWorkElementHistory !== undefined && activeOrderItemUnitWorkElementHistory.orderItemUnitWorkElementHistory !== undefined)
    {
      const activeOrderItemUnitWorkElementHistoryWithCurrentUser = {
        ...activeOrderItemUnitWorkElementHistory,
        user:loggedInUser,
        lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : ''};

      switch(activeWorkElement.workElementType.name) {
        case "Data Collection":
        {
          const orderItemDataCollections = dataCollectionWorkElementAndOrderItemUnitValueViewModel.map(dataCollectionValueForWorkElement => {return dataCollectionValueForWorkElement.orderItemUnitDataCollection});

          postDataCollectionAttributeValues(orderItemDataCollections).then(() => {
            completeOrderItemAndRefresh(activeOrderItemUnitWorkElementHistoryWithCurrentUser);
            setIsLoading(false);
          }).catch((error) => {
            setComponentError(error);
            setIsLoading(false);
          });
        }
          break;
        case "Consumption":
        {
          const orderItemConsumptions = consumptionWorkElementAndOrderItemUnitValueViewModel.map(consumptionValueForWorkElement => {return consumptionValueForWorkElement.orderItemUnitConsumption});

          postConsumptionAttributeValues(orderItemConsumptions).then(() => {
            completeOrderItemAndRefresh(activeOrderItemUnitWorkElementHistoryWithCurrentUser);
            setIsLoading(false);
          }).catch((error) => {
            setComponentError(error);
            setIsLoading(false);
          });
        }
          break;
        default:
          completeOrderItemAndRefresh(activeOrderItemUnitWorkElementHistoryWithCurrentUser);
          break;
      }
            
    }
  }

  const bypassWorkElement = () => {
    const activeOrderItemUnitWorkElementHistory = workElementAndOrderItemUnitHistoryViewModel.find(findWorkElementAndOrderItemUnitHistoryViewModel => findWorkElementAndOrderItemUnitHistoryViewModel.workElement.billOfProcessProcessWorkElementId === activeWorkElement.billOfProcessProcessWorkElementId);
    if(activeOrderItemUnitWorkElementHistory !== undefined && activeOrderItemUnitWorkElementHistory.orderItemUnitWorkElementHistory !== undefined)
    {
      const activeOrderItemUnitWorkElementHistoryWithCurrentUser = {
        ...activeOrderItemUnitWorkElementHistory,
        user:loggedInUser,
        lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : ''};

      bypassOrderItemAndRefresh(activeOrderItemUnitWorkElementHistoryWithCurrentUser);
    }
  }

  const setActiveWorkElementValidationMessagesHandler = (validationMessages:{errorMessages:string[], warningMessages:string[]}) => {
    setActiveWorkElementErrorMessages(validationMessages.errorMessages);
    setActiveWorkElementWarningMessages(validationMessages.warningMessages);
  }

  const completeOrderItemAndRefresh = (activeOrderItemUnitWorkElementHistory:WorkElementAndOrderItemUnitHistoryViewModel) => {
    completeOrderItemUnitWorkElementHistory(activeOrderItemUnitWorkElementHistory.orderItemUnitWorkElementHistory).then(() => {
        
      // After the work element is complete, we then reload from the API to populate the screen with the latest data
      fetchOrderItemUnitEquipmentAndUserBySerialNumber(props.orderItemUnitEquipmentAndUser.orderItemUnit.serialNumber).then(fetchedOrderItemUnitEquipmentAndUser => {
        if(fetchedOrderItemUnitEquipmentAndUser != null)
        {
            props.onSetOrderItemUnitEquipmentAndUserHandler(fetchedOrderItemUnitEquipmentAndUser);  
            props.onSetIsOrderItemUnitEquipmentAndUserLoadedHandler(fetchedOrderItemUnitEquipmentAndUser);
        }
        setIsLoading(false);
      }).catch((error) => {
        setComponentError(error);
        setIsLoading(false);
      });
    }).catch((error) => {
      setComponentError(error);
      setIsLoading(false);
    });
  }  

  const bypassOrderItemAndRefresh = (activeOrderItemUnitWorkElementHistory:WorkElementAndOrderItemUnitHistoryViewModel) => {
    bypassOrderItemUnitWorkElementHistory(activeOrderItemUnitWorkElementHistory.orderItemUnitWorkElementHistory).then(() => {
        
      // After the work element is bypassed, we then reload from the API to populate the screen with the latest data
      fetchOrderItemUnitEquipmentAndUserBySerialNumber(props.orderItemUnitEquipmentAndUser.orderItemUnit.serialNumber).then(fetchedOrderItemUnitEquipmentAndUser => {
        if(fetchedOrderItemUnitEquipmentAndUser != null)
        {
            props.onSetOrderItemUnitEquipmentAndUserHandler(fetchedOrderItemUnitEquipmentAndUser);  
            props.onSetIsOrderItemUnitEquipmentAndUserLoadedHandler(fetchedOrderItemUnitEquipmentAndUser);
        }
        setIsLoading(false);
      }).catch((error) => {
        setComponentError(error);
        setIsLoading(false);
      });
    }).catch((error) => {
      setComponentError(error);
      setIsLoading(false);
    });
  }  

  const resumeOrderItemAndRefresh = (buttonEvent:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {    
    const activeOrderItemUnitWorkElementHistory = workElementAndOrderItemUnitHistoryViewModel.find(findWorkElementAndOrderItemUnitHistoryViewModel => findWorkElementAndOrderItemUnitHistoryViewModel.workElement.billOfProcessProcessWorkElementId === +buttonEvent.currentTarget.id);
    if(activeOrderItemUnitWorkElementHistory !== undefined && activeOrderItemUnitWorkElementHistory.orderItemUnitWorkElementHistory !== undefined)
    {
      resumeOrderItemUnitWorkElementHistory(activeOrderItemUnitWorkElementHistory.orderItemUnitWorkElementHistory).then(() => {
        
        // After the latest work element is resumed, we then reload from the API to populate the screen with the latest data
        fetchOrderItemUnitEquipmentAndUserBySerialNumber(activeOrderItemUnitWorkElementHistory.orderItemUnitWorkElementHistory.orderItemUnit.serialNumber).then(fetchedOrderItemUnitEquipmentAndUser => {
          if(fetchedOrderItemUnitEquipmentAndUser != null)
          {
            props.onSetOrderItemUnitEquipmentAndUserHandler(fetchedOrderItemUnitEquipmentAndUser);  
            props.onSetIsOrderItemUnitEquipmentAndUserLoadedHandler(fetchedOrderItemUnitEquipmentAndUser);
          }
          setIsLoading(false);
        }).catch((error) => {
          setComponentError(error);
          setIsLoading(false);
        });
      }).catch((error) => {
        setComponentError(error);
        setIsLoading(false);
      });
    }
  }

  useEffect(() => {
    if(props.isOrderItemUnitEquipmentAndUserLoaded)
    {
      mapWorkElementsToMatchingHistory();
    }
  }, [props.isOrderItemUnitEquipmentAndUserLoaded,mapWorkElementsToMatchingHistory]);

    return (
        <div className={classes.mainContentContainer}>
          {showCompleteWorkElementModal && <Modal showFromClient={showCompleteWorkElementModal} children={<RunValidationModal workElementButtonAction='Complete' validationMessages={{errorMessages:activeWorkElementErrorMessages,warningMessages:activeWorkElementWarningMessages}} />} allowBackdropClose={false} onCancel={modalCompleteCancelHandler} onOk={modalCompleteOkHandler}></Modal>}
          {showBypassWorkElementModal && <Modal showFromClient={showBypassWorkElementModal} children={<RunValidationModal workElementButtonAction='Bypass' validationMessages={{errorMessages:activeWorkElementErrorMessages,warningMessages:activeWorkElementWarningMessages}} />} allowBackdropClose={false} onCancel={modalBypassCancelHandler} onOk={modalBypassOkHandler}></Modal>}
          {isLoading && <LoadingModal />}
          {props.isOrderItemUnitEquipmentAndUserLoaded &&
            <div className={classes.workElementsAndMessagesContainer}>
              {isOrderItemUnitScrapped &&
                <div className={classes.orderItemUnitScrapBanner}>Serial number {props.orderItemUnitEquipmentAndUser.orderItemUnit.serialNumber} is scrapped.  You cannot work on this unit further until it has been returned to Production.</div>
              }
              <div className={classes.workElementsContainer}>
                <div className={classes.workElementList}>
                  {workElementAndOrderItemUnitHistoryViewModel.map(viewModelworkElement => {
                      return (<div key={viewModelworkElement.workElement.billOfProcessProcessWorkElementId} 
                          className={`${classes['divWorkElementRun']} ${viewModelworkElement.orderItemUnitWorkElementHistory && viewModelworkElement.orderItemUnitWorkElementHistory.workElementStatus ? classes[viewModelworkElement.orderItemUnitWorkElementHistory.workElementStatus.name.replace(/\s/g, "")] : 'Unknown'}`}>
                          {viewModelworkElement.workElement.name} 
                          {viewModelworkElement.orderItemUnitWorkElementHistory 
                            && viewModelworkElement.orderItemUnitWorkElementHistory.workElementStatus
                            && viewModelworkElement.orderItemUnitWorkElementHistory.workElementStatus.name === "Paused"
                            && !isOrderItemUnitScrapped
                            && <>
                                {loggedInUser && loggedInUser.userId && loggedInUser.userId > 0  && <button id={viewModelworkElement.workElement.billOfProcessProcessWorkElementId.toString()} type='button' className={classes.resumeButton} onClick={resumeOrderItemAndRefresh}><BiPlayCircle size={18}  />Resume</button>}
                              </>}
                      </div>);
                      }
                  )}
                </div>
                <div className={classes.workElementContent}>
                  <div className={classes.workElementContentDetails}>
                  {activeWorkElement && activeWorkElement.billOfProcessProcessWorkElementId > 0 && 
                    <>
                    {activeWorkElement.workElementType.name === 'Text' && !allWorkElementsComplete &&
                      <div>
                          <BillOfProcessWorkElementRunText
                              runMode="Run"
                              billOfProcessProcessWorkElement={activeWorkElement}
                              billOfProcessProcessWorkElementStatus={activeWorkElementStatus}
                              billOfProcessProcessWorkElementAttributes={activeWorkElement.billOfProcessProcessWorkElementAttributes}
                              />
                      </div>
                    }
                    {activeWorkElement.workElementType.name === 'Image' && !allWorkElementsComplete &&
                      <div>
                          <BillOfProcessWorkElementRunImage
                              runMode="Run"
                              billOfProcessProcessWorkElement={activeWorkElement}
                              billOfProcessProcessWorkElementStatus={activeWorkElementStatus}
                              billOfProcessProcessWorkElementAttributes={activeWorkElement.billOfProcessProcessWorkElementAttributes}
                              />
                      </div>
                    }
                    {activeWorkElement.workElementType.name === 'Data Collection' && !allWorkElementsComplete && 
                      <div>
                          <BillOfProcessWorkElementRunDataCollection
                              runMode="Run"
                              isOrderItemUnitScrapped={isOrderItemUnitScrapped}
                              billOfProcessProcessWorkElement={activeWorkElement}
                              billOfProcessProcessWorkElementStatus={activeWorkElementStatus}
                              billOfProcessProcessWorkElementAttributes={activeWorkElement.billOfProcessProcessWorkElementAttributes}
                              dataCollectionWorkElementAndOrderItemUnitValueViewModel={dataCollectionWorkElementAndOrderItemUnitValueViewModel}
                              onUpdateDataCollectionAttributes={updateDataCollectionAttributesHandler}
                              onSetActiveWorkElementValidationMessages={setActiveWorkElementValidationMessagesHandler}
                              />
                      </div>
                    }
                    {activeWorkElement.workElementType.name === 'Consumption' && !allWorkElementsComplete &&
                      <div>
                          <BillOfProcessWorkElementRunConsumption
                              runMode="Run"
                              isOrderItemUnitScrapped={isOrderItemUnitScrapped}
                              billOfProcessProcessWorkElement={activeWorkElement}
                              billOfProcessProcessWorkElementStatus={activeWorkElementStatus}
                              billOfMaterial={props.billOfMaterial as BillOfMaterialEntity}
                              billOfProcessProcessWorkElementAttributes={activeWorkElement.billOfProcessProcessWorkElementAttributes}
                              consumptionWorkElementAndOrderItemUnitValueViewModel={consumptionWorkElementAndOrderItemUnitValueViewModel}
                              onUpdateConsumptionAttributes={updateConsumptionAttributesHandler}
                              onSetActiveWorkElementValidationMessages={setActiveWorkElementValidationMessagesHandler}
                              />
                      </div>
                    }
                    </>
                    }
                    {allWorkElementsComplete && props.orderItemUnitEquipmentAndUser && props.orderItemUnitEquipmentAndUser.orderItemUnit && props.orderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitId > 0 &&
                    <RunContentComplete 
                      orderItemUnitEquipmentAndUser={props.orderItemUnitEquipmentAndUser}
                      billOfProcess={props.billOfProcess}
                      equipmentList={props.equipmentList}
                      onSetIsOrderItemUnitEquipmentAndUserLoadedHandler={setIsOrderItemUnitEquipmentAndUserLoadedHandler}
                      onSetOrderItemUnitEquipmentAndUserHandler={setOrderItemUnitEquipmentAndUserHandler}/>
                    }
                  </div>
                  {!allWorkElementsComplete && activeWorkElement && activeWorkElement.billOfProcessProcessWorkElementId > 0 &&
                  <div className={classes.workElementActions}>
                    {loggedInUser && 
                      loggedInUser.userId && 
                      loggedInUser.userId > 0 
                      && activeWorkElementStatus !== 'Paused' 
                      && !isOrderItemUnitScrapped &&
                    <>
                      <button type='button' className={classes.submitButton} onClick={completeWorkElementHandler}>Complete</button>
                      <button type='button' className={classes.submitButton} onClick={bypassWorkElementHandler}>Bypass</button>
                    </>}
                  </div>
                  }
                </div>
              </div>
            </div>
          }
          {!props.isOrderItemUnitEquipmentAndUserLoaded &&
            <RunStart orderItemUnitEquipmentAndUser={props.orderItemUnitEquipmentAndUser} 
              isOrderItemUnitEquipmentAndUserLoaded={props.isOrderItemUnitEquipmentAndUserLoaded}
              equipmentList={props.equipmentList}
              onSetOrderItemUnitEquipmentAndUserHandler={props.onSetOrderItemUnitEquipmentAndUserHandler}
              onSetIsOrderItemUnitEquipmentAndUserLoadedHandler={props.onSetIsOrderItemUnitEquipmentAndUserLoadedHandler} />
          }
        </div>
    );
}

export default RunContent;