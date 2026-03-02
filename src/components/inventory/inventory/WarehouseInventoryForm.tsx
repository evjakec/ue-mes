import {Form, redirect, useNavigate } from 'react-router-dom';

import classes from './WarehouseInventoryForm.module.css'
import { LoaderFunctionArguments } from '../../../routes/types/LoaderFunctionArguments'
import { useContext, useEffect, useRef, useState } from 'react';
import { InventoryLocationEntity } from '../../../models/inventory-location-entity';
import Modal from '../../../ui/components/Modal';
import { MoveInventoryItemViewModel } from '../../../view-models/move-inventory-item-view-model';
import { fetchInventoryLocationData, fetchReceivingAndWarehouseInventoryItems, postMoveInventories } from '../../../ui/scripts/ApiFunctions';
import ErrorDisplay from '../../../ui/components/ErrorDisplay';
import { UserContext } from '../../../store/user-context';

const aggregateLocationData = (moveInventoryList:MoveInventoryItemViewModel[]):{locationName:string, startingQuantity:number, endingQuantity:number}[] => {
  
    let inventoryDataMappedForTotalsTable = [] as {locationName:string, startingQuantity:number, endingQuantity:number}[];
    
    moveInventoryList.forEach(moveInventoryItem => {
        const sourceLocationNameIndex = inventoryDataMappedForTotalsTable.findIndex(inventoryDataMappedForTotalsItem => inventoryDataMappedForTotalsItem.locationName === moveInventoryItem.inventoryItem.inventoryLocation.name);
        if(sourceLocationNameIndex !== undefined && sourceLocationNameIndex >= 0)
        {
            inventoryDataMappedForTotalsTable[sourceLocationNameIndex].startingQuantity += moveInventoryItem.inventoryItem.quantity;
            inventoryDataMappedForTotalsTable[sourceLocationNameIndex].endingQuantity += (moveInventoryItem.inventoryItem.quantity-moveInventoryItem.quantityToMove);
        }
        else
        {
            inventoryDataMappedForTotalsTable.push({locationName:moveInventoryItem.inventoryItem.inventoryLocation.name, startingQuantity:moveInventoryItem.inventoryItem.quantity, endingQuantity:(moveInventoryItem.inventoryItem.quantity-moveInventoryItem.quantityToMove)});
        }

        if(moveInventoryItem.destinationLocation && moveInventoryItem.destinationLocation.inventoryLocationId > 0)
        {
            const destinationLocationNameIndex = inventoryDataMappedForTotalsTable.findIndex(inventoryDataMappedForTotalsItem => inventoryDataMappedForTotalsItem.locationName === moveInventoryItem.destinationLocation.name);
            if(destinationLocationNameIndex !== undefined && destinationLocationNameIndex >= 0)
            {
                inventoryDataMappedForTotalsTable[destinationLocationNameIndex].endingQuantity += moveInventoryItem.quantityToMove;
            }
            else
            {
                inventoryDataMappedForTotalsTable.push({locationName:moveInventoryItem.destinationLocation.name, startingQuantity:0, endingQuantity:moveInventoryItem.quantityToMove});
            }
        }
    });

    return inventoryDataMappedForTotalsTable;
  }

const WarehouseInventoryForm:React.FC<{method:any,sourceLocation:string}> = (props) => {
    const navigate = useNavigate();
    
    // Context
    const {loggedInUser} = useContext(UserContext);
  
    let formRef = useRef<HTMLFormElement>(null);
    const modalDialogSubmitContent = <div className={classes.confirmationModal}><p>Clicking <b>OK</b> will save all updated inventory items and return to the main inventory screen.  Continue?</p></div>;
    const modalDialogCancelContent = <div className={classes.confirmationModal}><p>Clicking <b>OK</b> will lose any of the changes you have made on this screen.  If you want to save them, click Cancel below and then click <b>Submit Changes and Exit</b> on the form.  Continue?</p></div>;

    const [inventoryLocationList, setInventoryLocationList] =  useState([] as InventoryLocationEntity[]);
    const [moveInventoryItemViewModelList, setMoveInventoryItemViewModelList] = useState([] as MoveInventoryItemViewModel[]);
    const [moveInventoryItemTotalsList, setMoveInventoryItemTotalsList] = useState([] as {locationName:string, startingQuantity:number, endingQuantity:number}[]);

    const [moveInventoryItemValidationErrors, setMoveInventoryItemValidationErrors] = useState([] as {errorMessage:string}[]);
    const [isWarehouseInventoryFormValid, setIsWarehouseInventoryFormValid] = useState(true);
    const [showSubmitFormModal, setShowSubmitFormModal] = useState(false);
    const [showCancelFormModal, setShowCancelFormModal] = useState(false);
    const [componentError, setComponentError] = useState({} as Error);
    
    const getMoveInventoryFormIsValid = ():boolean => {
        // The form is valid when all required fields have been entered and the item quantity is > 0
        let currentValidationErrors =  [] as {errorMessage:string}[];
  
        if(moveInventoryItemViewModelList.findIndex(moveInventoryItem => moveInventoryItem.quantityToMove < 0) >= 0)
        {
          currentValidationErrors = [...currentValidationErrors, {errorMessage:'The quantity to move cannot be a negative number.'}];
        }

        if(moveInventoryItemViewModelList.findIndex(moveInventoryItem => moveInventoryItem.quantityToMove > moveInventoryItem.inventoryItem.quantity) >= 0)
        {
          currentValidationErrors = [...currentValidationErrors, {errorMessage:'The quantity to move cannot be greater than the available quantity.'}];
        }

        setIsWarehouseInventoryFormValid(currentValidationErrors.length === 0);
        setMoveInventoryItemValidationErrors(currentValidationErrors);
  
        return currentValidationErrors.length === 0;
      }

    const selectedLocationHandler = (event:React.ChangeEvent<HTMLSelectElement>) => {
        const inventoryLocationFromList = inventoryLocationList.find(inventoryLocation => inventoryLocation.inventoryLocationId === +event.target.value);
        
        setMoveInventoryItemViewModelList(moveInventoryItemViewModelList.map(moveInventoryItemViewModel => {
            if (moveInventoryItemViewModel.inventoryItem && moveInventoryItemViewModel.inventoryItem.inventoryItemId.toString() === event.target.id) {
                return {...moveInventoryItemViewModel,
                    inventoryItem: {...moveInventoryItemViewModel.inventoryItem, lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : ''}, 
                    destinationLocation:inventoryLocationFromList !== undefined ? inventoryLocationFromList : {} as InventoryLocationEntity,
                    quantityToMove:inventoryLocationFromList !== undefined ? moveInventoryItemViewModel.quantityToMove : 0,
                    moveAllQuantity:inventoryLocationFromList !== undefined ? moveInventoryItemViewModel.moveAllQuantity : false,
                    isChanged:inventoryLocationFromList !== undefined ? moveInventoryItemViewModel.quantityToMove > 0 : false
                };
            } else {
                return moveInventoryItemViewModel;
            }
        }));
    }

    const quantityChangeHandler = (event:React.ChangeEvent<HTMLInputElement>) => {
        setMoveInventoryItemViewModelList(moveInventoryItemViewModelList.map(moveInventoryItemViewModel => {
            if (moveInventoryItemViewModel.inventoryItem && moveInventoryItemViewModel.inventoryItem.inventoryItemId.toString() === event.target.id) {
                return {...moveInventoryItemViewModel, 
                    inventoryItem: {...moveInventoryItemViewModel.inventoryItem, lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : ''}, 
                    quantityToMove:+event.target.value,
                    isChanged:+event.target.value > 0
                };
            } else {
                return moveInventoryItemViewModel;
            }
        }));
    }

    const moveAllQuantityChangeHandler = (event:React.ChangeEvent<HTMLInputElement>) => {
        setMoveInventoryItemViewModelList(moveInventoryItemViewModelList.map(moveInventoryItemViewModel => {
            if (moveInventoryItemViewModel.inventoryItem && moveInventoryItemViewModel.inventoryItem.inventoryItemId.toString() === event.target.id) {
                return {...moveInventoryItemViewModel, 
                    inventoryItem: {...moveInventoryItemViewModel.inventoryItem, lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : ''}, 
                    moveAllQuantity:event.target.checked, 
                    quantityToMove:event.target.checked ? moveInventoryItemViewModel.inventoryItem.quantity : 0,
                    isChanged:event.target.checked 
                };
            } else {
                return moveInventoryItemViewModel;
            }
        }));
    }

    const modalCancelCancelHandler = () =>
      {
        setShowCancelFormModal(false);
      }
  
      const modalCancelOkHandler = () =>
      {
        // close the dialog and navigate back to the Bill of Process screen
        setShowCancelFormModal(false);
        navigate('..'); 
      }
  
      const modalSubmitOkHandler = (event:React.MouseEvent<HTMLButtonElement>) =>
    {
        setShowSubmitFormModal(false);
        
        formRef.current?.dispatchEvent(
            new Event("submit", { cancelable: true, bubbles: true })
        )
    }
  
    const modalSubmitCancelHandler = () =>
    {
        setShowSubmitFormModal(false);
    }
    
    const submitChangesHandler = (event:React.MouseEvent<HTMLButtonElement>) =>
    {
        // Only show the submit dialog when there are no validation errors.
        if(getMoveInventoryFormIsValid())
        {
            setShowSubmitFormModal(true);
        }
    }

    const cancelChangesHandler = () =>
    {
        if(moveInventoryItemViewModelList.find(moveInventoryItem => moveInventoryItem.isChanged))
        {
            setShowCancelFormModal(true);
        }
        else
        {
            navigate('..');
        }
    }
    
    useEffect(() => {
        fetchInventoryLocationData(props.sourceLocation).then((inventoryLocationResult) => {
            setInventoryLocationList(inventoryLocationResult);
        }).catch((fetchError) => {setComponentError(fetchError)});
        fetchReceivingAndWarehouseInventoryItems().then((moveInventoryItemsResult) => {
            setMoveInventoryItemViewModelList(moveInventoryItemsResult);
        }).catch((fetchError) => {setComponentError(fetchError)});
      }, [props.sourceLocation]);
    
     useEffect(() => {
        setMoveInventoryItemTotalsList(aggregateLocationData(moveInventoryItemViewModelList));
      }, [moveInventoryItemViewModelList]);
    
    return (
      <Form method={props.method} className={classes.form} ref={formRef}>
        <input name="moveInventoryData" type="hidden" value={JSON.stringify(moveInventoryItemViewModelList)} />
        {showSubmitFormModal && <Modal showFromClient={showSubmitFormModal} children={modalDialogSubmitContent} allowBackdropClose={false} onCancel={modalSubmitCancelHandler} onOk={modalSubmitOkHandler}></Modal>}
        {showCancelFormModal && <Modal showFromClient={showCancelFormModal} children={modalDialogCancelContent} allowBackdropClose={false} onCancel={modalCancelCancelHandler} onOk={modalCancelOkHandler}></Modal>}
        {componentError !== undefined && componentError.message && componentError.message.length > 0 && <ErrorDisplay title={'Error'} message={componentError.message} />}
        <div className={classes.locationTotalsContainer}>
            <div className={classes.moveInventoryListTotalsContainerHeader}>
                <div className={classes.moveInventoryItemTotalLocation}><b>Location:</b></div>
                <div className={classes.moveInventoryItemTotalStartQuantity}><b>Start Qty:</b></div>
                <div className={classes.moveInventoryItemTotalEndQuantity}><b>End Qty:</b></div>
                <hr/>
            </div>
            <div className={classes.moveInventoryListTotalsContainer}>
                {moveInventoryItemTotalsList.map(moveInventoryTotalItem => {
                    
                    const quantityDiff = (moveInventoryTotalItem.endingQuantity-moveInventoryTotalItem.startingQuantity) > 0 ? '+' + (moveInventoryTotalItem.endingQuantity-moveInventoryTotalItem.startingQuantity)
                    : (moveInventoryTotalItem.endingQuantity-moveInventoryTotalItem.startingQuantity) < 0 ? (moveInventoryTotalItem.endingQuantity-moveInventoryTotalItem.startingQuantity)
                    : '--';

                    return (
                        <div key={moveInventoryTotalItem.locationName}>
                            <div className={classes.moveInventoryItemTotalLocation}>{moveInventoryTotalItem.locationName}</div>
                            <div className={classes.moveInventoryItemTotalStartQuantity}><b>{moveInventoryTotalItem.startingQuantity}</b></div>
                            <div className={classes.moveInventoryItemTotalEndQuantity}><b>{moveInventoryTotalItem.endingQuantity} (<span className={`${classes[quantityDiff.toString().startsWith('+') ? 'moveInventoryDiffPositive' : quantityDiff.toString().startsWith('--') ? '' : 'moveInventoryDiffNegative']}`}>{quantityDiff}</span>) </b></div>                            
                            <hr/>
                        </div>
                    );}
                )}
            </div>
        </div>
        {!isWarehouseInventoryFormValid && 
              <div className={classes.errorMessageContainer}>
                <div className={classes.errorMessage}><b>The form is invalid.  Please correct the errors below and try again:</b>
                  <ul>
                    {moveInventoryItemValidationErrors.map((error:any) => <li key={error.errorMessage}>{error.errorMessage}</li>)}
                  </ul>
                </div>
            </div>}
        <div className={classes.inventoryItemsContainer}>
            <div className={classes.moveInventoryListContainerHeader}>
                <div className={classes.moveInventoryItemSerialNumber}><b>Lot\Serial #:</b></div>
                <div className={classes.moveInventoryItemPartNumber}><b>Part:</b></div>
                <div className={classes.moveInventoryItemAttributesHeader}><b>Attributes:</b></div>
                <div className={classes.moveInventoryItemLocation}><b>Location:</b></div>
                <div className={classes.moveInventoryItemQuantity}><b>Qty:</b></div>
                <div className={classes.moveInventoryItemNewLocation}><b>New Location:</b></div>
                <div className={classes.moveInventoryItemQuantityToMove}><b>Move Qty:</b></div>
                <hr/>
            </div>
            <div className={classes.moveInventoryListContainer}>
                {moveInventoryItemViewModelList.map(moveInventoryItem => {
                    return (
                        <div key={moveInventoryItem.inventoryItem.inventoryItemId}>
                            <div className={classes.moveInventoryItemSerialNumber}>{moveInventoryItem.inventoryItem.serialNumber}</div>
                            <div className={classes.moveInventoryItemPartNumber}>{moveInventoryItem.inventoryItem.part.partNumber}({moveInventoryItem.inventoryItem.part.partRevision})</div>
                            <div className={classes.moveInventoryItemAttributes}>{moveInventoryItem.inventoryItem.inventoryItemAttributes.map(inventoryItemAttribute => {
                                return <span key={inventoryItemAttribute.inventoryItemAttributeId}><b>{inventoryItemAttribute.itemAttributeType.name}: </b>{inventoryItemAttribute.attributeValue} <br/></span>;
                            })
                            }</div>
                            <div className={classes.moveInventoryItemLocation}>{moveInventoryItem.inventoryItem.inventoryLocation.name}</div>
                            <div className={classes.moveInventoryItemQuantity}>{moveInventoryItem.inventoryItem.quantity}</div>
                            <div className={classes.moveInventoryItemNewLocation}> 
                                <select id={moveInventoryItem.inventoryItem.inventoryItemId.toString()} name='location' value={moveInventoryItem.destinationLocation.inventoryLocationId} onChange={selectedLocationHandler}>
                                    <option> -- Select Location -- </option>
                                    {inventoryLocationList.map((inventoryLocation) =>
                                        inventoryLocation.name !== moveInventoryItem.inventoryItem.inventoryLocation.name &&
                                            <option key={inventoryLocation.inventoryLocationId}
                                                value={inventoryLocation.inventoryLocationId}>{inventoryLocation.name}                    
                                            </option>
                                    )}
                                </select>
                            </div>
                            <div className={classes.moveInventoryItemQuantityToMove}>
                                <input type="number" id={moveInventoryItem.inventoryItem.inventoryItemId.toString()} name="quantityToMove" maxLength={10} required readOnly={moveInventoryItem.moveAllQuantity || moveInventoryItem.destinationLocation.inventoryLocationId === undefined || moveInventoryItem.destinationLocation.inventoryLocationId <= 0} value={moveInventoryItem.quantityToMove} onChange={quantityChangeHandler} />
                                <b>Move all:</b><input type="checkbox" id={moveInventoryItem.inventoryItem.inventoryItemId.toString()} name="moveAllQuantity" disabled={moveInventoryItem.destinationLocation.inventoryLocationId === undefined || moveInventoryItem.destinationLocation.inventoryLocationId <= 0} checked={moveInventoryItem.moveAllQuantity} onChange={moveAllQuantityChangeHandler}  />
                            </div>
                            <hr/>
                        </div>
                        
                    );}
                )}
            </div>
        </div>
        <div className={classes.actionsLayout}>
            <p className={classes.actions}>
                <button type='button' className={classes.cancelButton} onClick={cancelChangesHandler}>Cancel</button>
                <button type='button' className={classes.submitButton} onClick={submitChangesHandler}>Submit Changes and Exit</button>
            </p>
        </div>
      </Form>
  );
}

export default WarehouseInventoryForm;

export async function action({request, params}:LoaderFunctionArguments) {

  const formData = await request.formData();
  const postData = Object.fromEntries(formData);
  const moveInventoryList = JSON.parse(postData.moveInventoryData.toString()) as MoveInventoryItemViewModel[];
  const filteredMoveInventoryList = moveInventoryList.filter(moveInventoryItem => moveInventoryItem.isChanged === true);
  if(filteredMoveInventoryList && filteredMoveInventoryList.length > 0)
  {
    await postMoveInventories(filteredMoveInventoryList);
  }  

  return redirect('/inventory/dashboard');
}
