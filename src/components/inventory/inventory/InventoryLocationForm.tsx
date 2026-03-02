import { useContext, useEffect, useMemo, useRef, useState } from "react";
import classes from './InventoryLocationForm.module.css'
import { BiAddToQueue, BiTrash } from "react-icons/bi";
import { Form, redirect, useLoaderData, useNavigate } from "react-router-dom";
import Modal from "../../../ui/components/Modal";
import ErrorDisplay from "../../../ui/components/ErrorDisplay";
import { UserContext } from "../../../store/user-context";
import { InventoryLocationEntity } from "../../../models/inventory-location-entity";
import { InventoryLocationTypeEntity } from "../../../models/inventory-location-type-entity";
import { InventoryLocationWithQuantityViewModel } from "../../../view-models/inventory-location-with-quantity-view-model";
import { postUpdateInventoryLocations } from "../../../ui/scripts/ApiFunctions";

const InventoryLocationForm: React.FC<{method:any}> = (props) => {
    // loader data
    const [loadedInventoryLocations, inventoryLocationTypes] = useLoaderData() as [InventoryLocationWithQuantityViewModel[], InventoryLocationTypeEntity[]];
    const navigate = useNavigate();
    let formRef = useRef<HTMLFormElement>(null);
    
    const modalDialogSubmitContent = <div className={classes.confirmationModal}><p>Clicking <b>OK</b> will update the inventory locations with the list on this screen.  Continue?</p></div>;
    const modalDialogCancelContent = <div className={classes.confirmationModal}><p>Clicking <b>OK</b> will lose any of the changes you have made on this screen.  If you want to save them, click Cancel below and then click <b>Submit Changes and Exit</b> on the form.  Continue?</p></div>;
    
    // Context
    const {loggedInUser} = useContext(UserContext);
  
    // States for form operation
    const [inventoryLocationsList, setInventoryLocationsList] = useState([] as InventoryLocationWithQuantityViewModel[]);
    const [isInventoryLocationsListChanged, setIsInventoryLocationsListChanged] = useState(false);
    const [isInventoryLocationsListValid, setIsInventoryLocationsListValid] = useState(true);
    const [inventoryLocationsListValidationErrors, setInventoryLocationsListValidationErrors] = useState([] as {errorMessage:string}[]);
    const [showSubmitFormModal, setShowSubmitFormModal] = useState(false);
    const [showCancelFormModal, setShowCancelFormModal] = useState(false);
    const [componentError, setComponentError] = useState({} as Error);
    
    // temporary state for name and selected inventory location type controls
    const [enteredInventoryLocationName, setEnteredInventoryLocationName] = useState('');
    const [selectedInventoryLocationType, setSelectedInventoryLocationType] = useState({} as InventoryLocationTypeEntity);

    const getInventoryLocationsListIsValid = ():boolean => {
        // An Inventory Locations List is valid when all locations have a name and type assigned.
        let currentValidationErrors =  [] as {errorMessage:string}[];
  
        const inventoryLocationsWithNoName = inventoryLocationsList.filter(inventoryLocationViewModel => inventoryLocationViewModel.inventoryLocation.name === undefined || inventoryLocationViewModel.inventoryLocation.name.length === 0);
        const inventoryLocationsWithNoType = inventoryLocationsList.filter(inventoryLocationViewModel => inventoryLocationViewModel.inventoryLocation.inventoryLocationType === undefined || inventoryLocationViewModel.inventoryLocation.inventoryLocationType.inventoryLocationTypeId < 1); // 0 = Unknown, which we need to prevent

        if(inventoryLocationsWithNoName && inventoryLocationsWithNoName.length > 0)
        {
          currentValidationErrors = [...currentValidationErrors, {errorMessage:'All inventory locations must have a name.'}];
        }

        if(inventoryLocationsWithNoType && inventoryLocationsWithNoType.length > 0)
        {
          currentValidationErrors = [...currentValidationErrors, {errorMessage:'All inventory locations must have a type and the type cannot be "Unknown."'}];
        }

        setIsInventoryLocationsListValid(currentValidationErrors.length === 0);
        setInventoryLocationsListValidationErrors(currentValidationErrors);
  
        return currentValidationErrors.length === 0;
      }
    
    // Default work element is used to reset the header controls after an item is added or edited.
    const emptyInventoryLocation = useMemo(() => ({
        inventoryLocation:{
          inventoryLocationId:0,
          lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : ''
        } as InventoryLocationEntity,
        inventoryItemQuantity:0
      } as InventoryLocationWithQuantityViewModel),[loggedInUser.loginName]);

    const selectedInventoryLocationTypeHandler = (selectedInventoryLocationTypeId:string) => {
        // In this handler, we will simply set the selectedInventoryLocationTypeObject that will be added to the list.
        // There will be a button next to the drop down for the user to add it to the Inventory Locations list. 
        const selectedInventoryLocationTypeObject = inventoryLocationTypes.find(inventoryLocationType => inventoryLocationType.inventoryLocationTypeId?.toString() === selectedInventoryLocationTypeId);
        if(selectedInventoryLocationTypeObject)
        {
            setSelectedInventoryLocationType(selectedInventoryLocationTypeObject);
        }
    }
    
    const inventoryLocationAddClickEventHandler = (buttonEvent:React.MouseEvent<HTMLButtonElement, MouseEvent>):void => {
        
        // Prevent form submit
        buttonEvent.preventDefault();
        
        // Only run the logic when an inventory location type has been selected and not the default "Select Part" text or "Unknown" type.
        // Also, ensure a name has been entered as well
        if(selectedInventoryLocationType 
            && selectedInventoryLocationType.inventoryLocationTypeId 
            && selectedInventoryLocationType.inventoryLocationTypeId > 0
            && enteredInventoryLocationName.length > 0)
        {
            // When the add button is clicked, the entered location name and type will be added to the list with a quantity of 0
            // By the time the button is clicked, the selectedInventoryLocationType will already be assigned from the select event handler.
            // We can go ahead and add it to the array
            const addedInventoryLocation = {...emptyInventoryLocation,
              inventoryLocation: {...emptyInventoryLocation.inventoryLocation,
                inventoryLocationId:((inventoryLocationsList.length+1)*-1), // to handle working with the list before save, IDs will be set to negative numbers.
                name:enteredInventoryLocationName,
                inventoryLocationType:selectedInventoryLocationType}};
            setInventoryLocationsList(prevArray => [...prevArray, addedInventoryLocation]);
            
            // Finally, set the selected location type and name back to empty to prepare for the next item.
            setEnteredInventoryLocationName('');
            setSelectedInventoryLocationType({} as InventoryLocationTypeEntity);
            setIsInventoryLocationsListChanged(true);
        }
    }

    const inventoryLocationDeleteClickEventHandler = (buttonEvent:React.MouseEvent<HTMLButtonElement, MouseEvent>):void => {
        buttonEvent.preventDefault();
        
        // Remove the location from the inventory locations list by filtering for all IDs not equal to current.
        const inventoryLocationsListFiltered = inventoryLocationsList.filter(inventoryLocationViewModel => inventoryLocationViewModel.inventoryLocation.inventoryLocationId && inventoryLocationViewModel.inventoryLocation.inventoryLocationId?.toString() !== buttonEvent.currentTarget.id);
        setInventoryLocationsList(inventoryLocationsListFiltered);
        setIsInventoryLocationsListChanged(true);
    }

    const inventoryLocationNameChangeHandler = (event:React.ChangeEvent<HTMLInputElement>) => {
      setInventoryLocationsList(inventoryLocationsList.map(inventoryLocationsListViewModel => {
            if (inventoryLocationsListViewModel.inventoryLocation.inventoryLocationId && inventoryLocationsListViewModel.inventoryLocation.inventoryLocationId.toString() === event.target.id) {
              return { ...inventoryLocationsListViewModel, inventoryLocation: {...inventoryLocationsListViewModel.inventoryLocation, name:event.target.value }};
            } else {
              return inventoryLocationsListViewModel;
            }
          }));
        
          setIsInventoryLocationsListChanged(true);
    }

    const inventoryLocationTypeChangeHandler = (event:React.ChangeEvent<HTMLSelectElement>) => {
      setInventoryLocationsList(inventoryLocationsList.map(inventoryLocationsListViewModel => {
            if (inventoryLocationsListViewModel.inventoryLocation.inventoryLocationId && inventoryLocationsListViewModel.inventoryLocation.inventoryLocationId.toString() === event.target.id) {
              var updatedInventoryLocationType = inventoryLocationTypes.find(inventoryLocationType => inventoryLocationType.inventoryLocationTypeId.toString() === event.target.value);
              if(updatedInventoryLocationType && updatedInventoryLocationType.inventoryLocationTypeId > 0)
              {
                return { ...inventoryLocationsListViewModel, inventoryLocation: {...inventoryLocationsListViewModel.inventoryLocation, inventoryLocationType:updatedInventoryLocationType }};
              }
              else
              {
                return inventoryLocationsListViewModel;  
              }
            } else {
              return inventoryLocationsListViewModel;
            }
          }));
        
          setIsInventoryLocationsListChanged(true);
    }
         
      const formSubmitHandler = ():void => {
        // Only post to the API if something in the list has changed.
        if(isInventoryLocationsListChanged)
        {
          const updatedInventoryLocations = inventoryLocationsList.map(inventoryLocationViewModel => {
            return inventoryLocationViewModel.inventoryLocation;
          });

          postUpdateInventoryLocations(updatedInventoryLocations).then(()=> {
                formRef.current?.dispatchEvent(
                  new Event("submit", { cancelable: true, bubbles: true })
              )
            })
            .catch((fetchError) => {setComponentError(fetchError)});
        }
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
  
      const modalSubmitOkHandler = () =>
      {
        setShowSubmitFormModal(false);
        formSubmitHandler();
      }
  
      const modalSubmitCancelHandler = () =>
      {
        setShowSubmitFormModal(false);
      }
      
      const submitChangesHandler = () =>
    {
      if(!isInventoryLocationsListChanged || (isInventoryLocationsListChanged && getInventoryLocationsListIsValid()))
      {
        // Only need to show the confirmation dialog if there have been changes.  Otherwise, just close the form.
        if(isInventoryLocationsListChanged)
        {
          setShowSubmitFormModal(true);
        }
        else
        {
          formSubmitHandler();
        }
      }
    }

    const cancelChangesHandler = () =>
    {
      // Only need to show the confirmation dialog if there have been changes.  Otherwise, just close the form.
      if(isInventoryLocationsListChanged)
      {
        setShowCancelFormModal(true);
      }
      else
      {
        navigate('..');
      }
    }
      
    
  useEffect(() => {
    if(loadedInventoryLocations && loadedInventoryLocations.length > 0)
    {
      setInventoryLocationsList(loadedInventoryLocations);
    }
    }, [loadedInventoryLocations]);
    return (
        <Form method={props.method} className={classes.form} ref={formRef}>
          {showSubmitFormModal && <Modal showFromClient={showSubmitFormModal} children={modalDialogSubmitContent} allowBackdropClose={false} onCancel={modalSubmitCancelHandler} onOk={modalSubmitOkHandler}></Modal>}
          {showCancelFormModal && <Modal showFromClient={showCancelFormModal} children={modalDialogCancelContent} allowBackdropClose={false} onCancel={modalCancelCancelHandler} onOk={modalCancelOkHandler}></Modal>}
          {componentError !== undefined && componentError.message && componentError.message.length > 0 && <ErrorDisplay title={'Error'} message={componentError.message} />}    
          <div className={classes.inventoryLocationFormContainer}>
            <div className={classes.inventoryLocationListContainer}>
              {!isInventoryLocationsListValid && 
                <>
                  <div className={classes.errorMessage}><b>The inventory locations list is invalid.  Please correct the errors below and try again:</b>
                    <ul>
                      {inventoryLocationsListValidationErrors.map((error:any) => <li key={error.errorMessage}>{error.errorMessage}</li>)}
                    </ul>
                  </div>
              </>}
              <div className={classes.inventoryLocationListHeader}>
                  <div></div>
                  <div>Name</div>
                  <div>Type</div>
                  <div>Current Quantity</div>
              </div>
              <div className={classes.inventoryLocationAddContainerOuter}>
                  <div className={classes.inventoryLocationContainer}>
                      {inventoryLocationsList.map((inventoryLocationViewModel) => 
                          <div key={inventoryLocationViewModel.inventoryLocation.inventoryLocationId} className={classes.inventoryLocationContainerItem}>
                                  <div className={classes.centeredDiv}>
                                      {inventoryLocationViewModel.inventoryItemQuantity === 0 && <button id={inventoryLocationViewModel.inventoryLocation.inventoryLocationId?.toString()} type='button' className={classes.addRemoveButton} onClick={inventoryLocationDeleteClickEventHandler}><BiTrash size={18}  />Delete</button>}
                                  </div>
                                  <div>
                                      <input key={inventoryLocationViewModel.inventoryLocation.inventoryLocationId} disabled={inventoryLocationViewModel.inventoryItemQuantity > 0} type="text" id={inventoryLocationViewModel.inventoryLocation.inventoryLocationId?.toString()} name="inventoryLocationName" value={inventoryLocationViewModel.inventoryLocation.name} onChange={inventoryLocationNameChangeHandler} /> 
                                  </div>
                                  <div>
                                    <select id={inventoryLocationViewModel.inventoryLocation.inventoryLocationId?.toString()} disabled={inventoryLocationViewModel.inventoryItemQuantity > 0} value={inventoryLocationViewModel.inventoryLocation && inventoryLocationViewModel.inventoryLocation.inventoryLocationType && inventoryLocationViewModel.inventoryLocation.inventoryLocationType.inventoryLocationTypeId > 0 ? inventoryLocationViewModel.inventoryLocation.inventoryLocationType.inventoryLocationTypeId : ''} onChange={inventoryLocationTypeChangeHandler}>
                                        <option> -- Select Type -- </option>
                                        {inventoryLocationTypes.map((inventoryLocationType) => 
                                        <option key={inventoryLocationType.inventoryLocationTypeId}
                                            value={inventoryLocationType.inventoryLocationTypeId}>{inventoryLocationType.name}                    
                                        </option>)}
                                    </select>
                                  </div>
                                  <div className={classes.centeredDiv}>
                                      {inventoryLocationViewModel.inventoryItemQuantity}
                                  </div>
                          </div>
                      )}
                  </div>
              </div>
            </div>
            <div className={classes.inventoryLocationAddContainer}>
                <div><b>Add Location:</b></div>
                <div className={classes.inventoryLocationAddContainerValue}>
                  <b>Name:</b>
                  <input type="text" id='newInventoryLocationName' name="newInventoryLocationName" value={enteredInventoryLocationName} onChange={e => setEnteredInventoryLocationName(e.target.value)} />
                </div>
                <div> 
                  <b>Type:</b>
                  <select id='newInventoryLocationType' name='newInventoryLocationType' value={selectedInventoryLocationType && selectedInventoryLocationType.inventoryLocationTypeId ? selectedInventoryLocationType.inventoryLocationTypeId : ''} onChange={e => selectedInventoryLocationTypeHandler(e.target.value)}>
                      <option> -- Select Type -- </option>
                      {inventoryLocationTypes.map((inventoryLocationType) => 
                      <option key={inventoryLocationType.inventoryLocationTypeId}
                          value={inventoryLocationType.inventoryLocationTypeId}>{inventoryLocationType.name}                    
                      </option>)}
                  </select>  
                  <button className={classes.addRemoveButton} onClick={inventoryLocationAddClickEventHandler}><BiAddToQueue size={18}  />Add</button>
                </div>
            </div>
            <div className={classes.actions}>
                <button type='button' className={classes.cancelButton} onClick={cancelChangesHandler}>Cancel</button>
                <button type='button' className={classes.submitButton} onClick={submitChangesHandler}>Submit Changes and Exit</button>
            </div>
          </div>
        </Form>
    );
}

export default InventoryLocationForm;

export async function action() {
  return redirect('/inventory/dashboard');
}