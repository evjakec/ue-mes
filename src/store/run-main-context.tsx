import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from "react";
import { fetchBillOfMaterialByPart, fetchBillOfProcessByPart, fetchEquipmentData, fetchOrderItemUnitEquipmentAndUserByEquipment, fetchOrderItemUnitEquipmentAndUserBySerialNumber, postAddOrderItemUnitWorkElementHistory } from "../ui/scripts/ApiFunctions";
import { EquipmentEntity } from "../models/global/equipment-entity";
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { OrderItemUnitEquipmentAndUserViewModel } from "../view-models/order-item-unit-equipment-user-view-model";
import { useCookies } from "react-cookie";
import { BillOfMaterialEntity } from "../models/bill-of-material-entity";
import { BillOfProcessEntity } from "../models/bill-of-process-entity";
import { WorkElementStatusEntity } from "../models/work-element-status-entity";
import { UserContext } from "./user-context";
import { OrderItemUnitWorkElementHistoryEntity } from "../models/order-item-unit-work-element-history-entity";

interface IProviderProps {
    children?: ReactNode
}

export class RunMainContextConnection {
    hubConnection: HubConnection | null = null;
}

export const RunMainContext = createContext({
    equipmentList:[] as EquipmentEntity[],
    componentError:{} as Error,
    orderItemUnitEquipmentAndUser:{} as OrderItemUnitEquipmentAndUserViewModel,
    isOrderItemUnitEquipmentAndUserLoaded:false,
    loadedUnitBillOfMaterial:{} as BillOfMaterialEntity,
    loadedUnitBillOfProcess:{} as BillOfProcessEntity,
    loadedEquipmentName:'',
    setEquipmentList: (inputEquipmentList:EquipmentEntity[]) => {},
    setComponentError: (inputError:Error) => {},
    setOrderItemUnitEquipmentAndUser: (inputOrderItemUnitEquipmentAndUser:OrderItemUnitEquipmentAndUserViewModel) => {},
    setIsOrderItemUnitEquipmentAndUserLoaded: (inputOrderItemUnitEquipmentAndUserViewModel:OrderItemUnitEquipmentAndUserViewModel) => {},
    setLoadedEquipmentName: (inputLoadedEquipmentName:string) => {},
    sendOrderItemUnitMovedToNextEquipment: (inputEquipmentName:string) => {}
});

// Hub Connection
const runMainContextConnection = new RunMainContextConnection();
  
const RunMainContextProvider:React.FC<IProviderProps> = ({children}) => 
{    
    // Cookies
    const userTokenCookie = useCookies(['userToken']).toString();

    // Context
    const {loggedInUser} = useContext(UserContext);

    // State
    const [equipmentListState, setEquipmentListState] = useState([] as EquipmentEntity[]);
    const [componentErrorState, setComponentErrorState] = useState({} as Error);
    const [orderItemUnitEquipmentAndUserState, setOrderItemUnitEquipmentAndUserState] = useState({} as OrderItemUnitEquipmentAndUserViewModel);
    const [loadedEquipmentNameState, setLoadedEquipmentNameState] = useState('');
    const [isOrderItemUnitEquipmentAndUserLoadedState, setIsOrderItemUnitEquipmentAndUserLoadedState] = useState(false);
    const [loadedUnitBillOfMaterialState, setLoadedUnitBillOfMaterialState] = useState({} as BillOfMaterialEntity);
    const [loadedUnitBillOfProcessState, setLoadedUnitBillOfProcessState] = useState({} as BillOfProcessEntity);

    function setEquipmentList(inputEquipmentList:EquipmentEntity[]) {
        setEquipmentListState(inputEquipmentList);
    }

    function setComponentError(inputError:Error) {
        setComponentErrorState(inputError);
    }

    function setOrderItemUnitEquipmentAndUser(inputOrderItemUnitEquipmentAndUser:OrderItemUnitEquipmentAndUserViewModel) {
        setOrderItemUnitEquipmentAndUserState(inputOrderItemUnitEquipmentAndUser);
    }

    function setLoadedEquipmentName(inputLoadedEquipmentName:string) {
        setLoadedEquipmentNameState(inputLoadedEquipmentName);

        if(inputLoadedEquipmentName.length === 0)
        {
            clearOrderItemUnitEquipmentAndUser();
        }
    }

    const addMissingFirstWorkElementForOrderItemUnit = useCallback((currentOrderItemUnitEquipmentAndUser:OrderItemUnitEquipmentAndUserViewModel,
        fetchedBillOfProcess:BillOfProcessEntity):void => {
        // setIsLoading(true);
    
        // We'll construct the OrderItemUnitWorkElementHistory entity by pulling the necessary properties from the existing state.
        const firstProcessInBop = fetchedBillOfProcess.billOfProcessProcesses.find(billOfProcessProcess => billOfProcessProcess.sequence === 1);
        const firstWorkElementInBopProcess = firstProcessInBop?.billOfProcessProcessWorkElements.find(billOfProcessWorkElement => billOfProcessWorkElement.sequence === 1);
        const firstEquipmentByBopSequence = equipmentListState.find(equipment => equipment.process.processId === firstProcessInBop?.process.processId);
        
        // Assuming the properties are hydrated, we can then add the first work element history
        if(firstWorkElementInBopProcess !== undefined && firstEquipmentByBopSequence !== undefined)
        {
          const matchingOrderItemUnitWorkElementHistoryForFirstBopWorkElement = currentOrderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitWorkElementHistories && 
          currentOrderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitWorkElementHistories.find(orderItemWorkElementHistory => orderItemWorkElementHistory.billOfProcessProcessWorkElement.billOfProcessProcessWorkElementId === firstWorkElementInBopProcess?.billOfProcessProcessWorkElementId);
        
          if(matchingOrderItemUnitWorkElementHistoryForFirstBopWorkElement === undefined)
          {
            const orderItemUnitWorkElementHistory = {
              orderItemUnitWorkElementHistoryId:0,
              orderItemUnit:currentOrderItemUnitEquipmentAndUser.orderItemUnit,
              billOfProcessProcessWorkElement:firstWorkElementInBopProcess,
              equipment:firstEquipmentByBopSequence,
              user:loggedInUser,
              workElementStatus:{} as WorkElementStatusEntity,
              startDate: new Date(),
              startDateUtc: new Date(),
              lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : ''
            } as OrderItemUnitWorkElementHistoryEntity;
    
            // call the Add API method
            postAddOrderItemUnitWorkElementHistory(orderItemUnitWorkElementHistory).then(() => {
              // Now refresh the OrderItemUnitEquipmentAndUser state with the new data.
              fetchOrderItemUnitEquipmentAndUserBySerialNumber(orderItemUnitWorkElementHistory.orderItemUnit.serialNumber).then(refreshedOrderItemUnitEquipmentAndUser => {
                if(refreshedOrderItemUnitEquipmentAndUser !== null)
                {
                  setOrderItemUnitEquipmentAndUserState(refreshedOrderItemUnitEquipmentAndUser);
                  if(refreshedOrderItemUnitEquipmentAndUser && refreshedOrderItemUnitEquipmentAndUser.orderItemUnit && refreshedOrderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitId > 0) {
                    console.log("Set in RunMain addMissingFirstWorkElementForOrderItemUnit for serial " + refreshedOrderItemUnitEquipmentAndUser.orderItemUnit.serialNumber);
                  }
                  else {
                    console.log("Set in RunMain addMissingFirstWorkElementForOrderItemUnit for serial NA");
                  }
                }
                // setIsLoading(false);
              }).catch((error) => {
                setComponentErrorState(error as Error);
                // setIsLoading(false);
              });
            }).catch((error) => {
                setComponentErrorState(error as Error);
            //   setIsLoading(false);
            });
          }      
        }
      },[equipmentListState,loggedInUser,setComponentErrorState,setOrderItemUnitEquipmentAndUserState]);

      const setIsOrderItemUnitEquipmentAndUserLoaded = useCallback((updatedOrderItemUnitEquipmentAndUserViewModel:OrderItemUnitEquipmentAndUserViewModel) => {
        const isOrderItemUnitLoadedResult = (updatedOrderItemUnitEquipmentAndUserViewModel.orderItemUnit && updatedOrderItemUnitEquipmentAndUserViewModel.orderItemUnit.orderItemUnitId > 0);
        const isEquipmentLoadedResult = (updatedOrderItemUnitEquipmentAndUserViewModel.equipment && updatedOrderItemUnitEquipmentAndUserViewModel.equipment.equipmentId > 0);
        
        // The loaded object boolean will be set to true if either the order item unit OR the equipment is present.
        // This just validates that the user searched either of these items and was returned a successful result.
        setIsOrderItemUnitEquipmentAndUserLoadedState(isOrderItemUnitLoadedResult || isEquipmentLoadedResult);
    
        if(isEquipmentLoadedResult && updatedOrderItemUnitEquipmentAndUserViewModel.equipment.name !== loadedEquipmentNameState)
        {
          setLoadedEquipmentNameState(updatedOrderItemUnitEquipmentAndUserViewModel.equipment.name);
        }
    
        // Then, if the order item unit is present, we need to start pulling the work element content as well
        if(isOrderItemUnitLoadedResult)
        {
        //   setIsLoading(true);
        
          // Next, fetch the BOM and BOP of the Order Item Unit finished part ID.
          fetchBillOfProcessAndBillOfMaterialByPart(updatedOrderItemUnitEquipmentAndUserViewModel.orderItemUnit.part.partId)
          .then(fetchedBillOfMaterialAndBillOfProcess => {
            setLoadedUnitBillOfMaterialState(fetchedBillOfMaterialAndBillOfProcess[0] as BillOfMaterialEntity);
            setLoadedUnitBillOfProcessState(fetchedBillOfMaterialAndBillOfProcess[1] as BillOfProcessEntity);
    
            // Now that we have the BOM, BOP and order item unit history, we can attempt to load the screen.
            // However, in a manual run scenario, an order item unit could be scanned at an equipment for the first time and we need to add the first history record at that time.
            // This allows us to get accurate cycle times of processing, but also see the time a unit waits for its next equipment.
            if(updatedOrderItemUnitEquipmentAndUserViewModel.orderItemUnit.orderItemUnitWorkElementHistories === undefined || updatedOrderItemUnitEquipmentAndUserViewModel.orderItemUnit.orderItemUnitWorkElementHistories.length === 0)
            {
              addMissingFirstWorkElementForOrderItemUnit(updatedOrderItemUnitEquipmentAndUserViewModel, fetchedBillOfMaterialAndBillOfProcess[1] as BillOfProcessEntity);
            }
            // setIsLoading(false);
          }).catch((error) => {
            setComponentErrorState(error as Error);
            // setIsLoading(false);
          });
    
          // At this point, work element history should be accurate, so we can now set the content.
          // The RunContent component receives everything as props, so the logic ends here and will take over in the RunContent component      
        }
      },[addMissingFirstWorkElementForOrderItemUnit,setComponentErrorState,loadedEquipmentNameState,setLoadedEquipmentNameState]);

      async function fetchBillOfProcessAndBillOfMaterialByPart(partId?:number) {
        const [billOfMaterial, billOfProcess] = await Promise.all([
          fetchBillOfMaterialByPart(partId?.toString()),
          fetchBillOfProcessByPart(partId?.toString())
        ])
        return ([ billOfMaterial, billOfProcess ]);
      }
      
    const refreshBySerialNumber = useCallback((serialNumber:string) => {
      fetchOrderItemUnitEquipmentAndUserBySerialNumber(serialNumber).then(orderItemUnitEquipmentAndUserViewModelResult => {
          if(orderItemUnitEquipmentAndUserViewModelResult !== null)
          {
              setOrderItemUnitEquipmentAndUserState(orderItemUnitEquipmentAndUserViewModelResult);
              setIsOrderItemUnitEquipmentAndUserLoaded(orderItemUnitEquipmentAndUserViewModelResult);
              console.log('Hub refresh finished successfully for serial:' + serialNumber);
          }
      });
    },[setIsOrderItemUnitEquipmentAndUserLoaded]);

    const refreshByEquipmentName = useCallback((equipmentName:string) => {
      fetchOrderItemUnitEquipmentAndUserByEquipment(equipmentName).then(orderItemUnitEquipmentAndUserViewModelResult => {
          if(orderItemUnitEquipmentAndUserViewModelResult !== null)
          {
              setOrderItemUnitEquipmentAndUserState(orderItemUnitEquipmentAndUserViewModelResult);
              setIsOrderItemUnitEquipmentAndUserLoaded(orderItemUnitEquipmentAndUserViewModelResult);
              console.log('Hub refresh finished successfully for equipment:' + equipmentName);
          }
      });
    },[setIsOrderItemUnitEquipmentAndUserLoaded]);

    const createHubConnection = useCallback((equipmentName: string) => {
        if (equipmentName && equipmentName.length > 0) {

            runMainContextConnection.hubConnection = new HubConnectionBuilder()
                .withUrl(process.env.REACT_APP_API_BASE_URL + '/hubs/orderItemUnit/?equipmentName=' + equipmentName, {
                    accessTokenFactory: () => userTokenCookie
                })
                .withAutomaticReconnect()
                .configureLogging(LogLevel.Information)
                .build();

            runMainContextConnection.hubConnection.start().catch(error => console.log('Error establishing connection: ', error));

            runMainContextConnection.hubConnection.on('ReceiveCompletedOrderItemUnitWorkElement', (serialNumber: string) => {
                console.log('ReceiveCompletedOrderItemUnitWorkElement called for serial:' + serialNumber);
                refreshBySerialNumber(serialNumber);
            });

            runMainContextConnection.hubConnection.on('ReceiveBypassedOrderItemUnitWorkElement', (serialNumber: string) => {
                console.log('ReceiveBypassedOrderItemUnitWorkElement called for serial:' + serialNumber);
                refreshBySerialNumber(serialNumber);
            });

            runMainContextConnection.hubConnection.on('ReceivePausedOrderItemUnitWorkElement', (serialNumber: string) => {
                console.log('ReceivePausedOrderItemUnitWorkElement called for serial:' + serialNumber);
                fetchOrderItemUnitEquipmentAndUserBySerialNumber(serialNumber).then(orderItemUnitEquipmentAndUserViewModelResult => {
                    if(orderItemUnitEquipmentAndUserViewModelResult !== null && loadedEquipmentNameState && loadedEquipmentNameState === orderItemUnitEquipmentAndUserViewModelResult.equipment.name)
                    {
                        if(!window.location.pathname.endsWith('/run'))
                        {
                            setOrderItemUnitEquipmentAndUserState(orderItemUnitEquipmentAndUserViewModelResult);
                            console.log('ReceivePausedOrderItemUnitWorkElement finished successfully for serial:' + serialNumber);
                        }
                    }                    
                });
            });

            runMainContextConnection.hubConnection.on('ReceiveResumedOrderItemUnitWorkElement', (serialNumber: string) => {
                console.log('ReceiveResumedOrderItemUnitWorkElement called for serial:' + serialNumber);
                refreshBySerialNumber(serialNumber);
            });

            runMainContextConnection.hubConnection.on('ReceiveOrderItemUnitStarted', (serialNumber: string) => {
                console.log('ReceiveOrderItemUnitStarted called for serial:' + serialNumber);
                refreshBySerialNumber(serialNumber);
            });

            runMainContextConnection.hubConnection.on('ReceiveOrderItemUnitScrapped', (serialNumber: string) => {
                console.log('ReceiveOrderItemUnitScrapped called for serial:' + serialNumber);
                refreshBySerialNumber(serialNumber);
            });

            runMainContextConnection.hubConnection.on('ReceiveOrderItemUnitReturnedToProduction', (serialNumber: string) => {
                console.log('ReceiveOrderItemUnitReturnedToProduction called for serial:' + serialNumber);
                refreshBySerialNumber(serialNumber);
            });

            runMainContextConnection.hubConnection.on('ReceiveOrderItemUnitMovedToNextEquipment', (equipmentName: string) => {
                console.log('ReceiveOrderItemUnitMovedToNextEquipment called for equipment:' + equipmentName);
                refreshByEquipmentName(equipmentName);
            });

            runMainContextConnection.hubConnection.on('LoadRunScreen', (equipmentName: string) => {
                // Using this for debugging now.  will be removed.
                console.log('LoadRunScreen called for equipment:' + equipmentName);
            });
        }
    },[userTokenCookie,loadedEquipmentNameState,refreshBySerialNumber,refreshByEquipmentName]);

    const sendOrderItemUnitMovedToNextEquipment = (equipmentName:string) => {
      runMainContextConnection.hubConnection?.send('SendOrderItemUnitMovedToNextEquipment',equipmentName);
    }
    
    const stopHubConnection = () => {
        runMainContextConnection.hubConnection?.stop().catch(error => console.log('Error stopping connection: ', error));
    }

    const clearOrderItemUnitEquipmentAndUser = () => {
        setOrderItemUnitEquipmentAndUserState({} as OrderItemUnitEquipmentAndUserViewModel);
        stopHubConnection();
    }

    const runMainValue = {
        equipmentList:equipmentListState,
        componentError:componentErrorState,
        orderItemUnitEquipmentAndUser:orderItemUnitEquipmentAndUserState,
        isOrderItemUnitEquipmentAndUserLoaded:isOrderItemUnitEquipmentAndUserLoadedState,
        loadedUnitBillOfMaterial:loadedUnitBillOfMaterialState,
        loadedUnitBillOfProcess:loadedUnitBillOfProcessState,
        loadedEquipmentName:loadedEquipmentNameState,
        setEquipmentList:setEquipmentList,
        setComponentError:setComponentError,
        setOrderItemUnitEquipmentAndUser:setOrderItemUnitEquipmentAndUser,
        setIsOrderItemUnitEquipmentAndUserLoaded:setIsOrderItemUnitEquipmentAndUserLoaded,
        setLoadedEquipmentName:setLoadedEquipmentName,
        sendOrderItemUnitMovedToNextEquipment:sendOrderItemUnitMovedToNextEquipment
    };

    useEffect(() => {
        fetchEquipmentData().then((equipmentListResult => {
            setEquipmentList(equipmentListResult);
          }))
          .catch((error) => {setComponentErrorState(error as Error);});
    }, []);

    useEffect(() => {
        if (loadedEquipmentNameState && loadedEquipmentNameState.length > 0 ) {
            createHubConnection(loadedEquipmentNameState);
        }
        return(() => {stopHubConnection();})
  }, [loadedEquipmentNameState, createHubConnection]);

    return (
        <RunMainContext.Provider value={runMainValue}>{children}</RunMainContext.Provider>
    )
}

export default RunMainContextProvider;
