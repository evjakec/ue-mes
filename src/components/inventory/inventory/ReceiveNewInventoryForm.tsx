import {Form, redirect, useNavigate } from 'react-router-dom';

import classes from './ReceiveNewInventoryForm.module.css'
import { LoaderFunctionArguments } from '../../../routes/types/LoaderFunctionArguments'
import { useContext, useEffect, useRef, useState } from 'react';
import { InventoryLocationEntity } from '../../../models/inventory-location-entity';
import { PartEntity } from '../../../models/part-entity';
import Modal from '../../../ui/components/Modal';
import { InventoryItemTypeEntity } from '../../../models/inventory-item-type-entity';
import { InventoryItemEntity } from '../../../models/inventory-item-entity';
import { MoveInventoryItemViewModel } from '../../../view-models/move-inventory-item-view-model';
import { fetchActiveSuppliers, fetchInventoryItemTypes, fetchInventoryLocationData, fetchRawMaterialPartList, postMoveInventory } from '../../../ui/scripts/ApiFunctions';
import ErrorDisplay from '../../../ui/components/ErrorDisplay';
import { SupplierEntity } from '../../../models/supplier-entity';
import { BiAddToQueue } from 'react-icons/bi';
import SupplierForm from '../supplier/SupplierForm';
import LoadingModal from '../../../ui/components/LoadingModal';
import { UserContext } from '../../../store/user-context';
import { InventoryItemAttributeEntity } from '../../../models/inventory-item-attribute';

const ReceiveNewInventoryForm:React.FC<{method:any,sourceLocation:string}> = (props) => {
    const navigate = useNavigate();
    let formRef = useRef<HTMLFormElement>(null);
    const modalDialogSubmitContent = <div className={classes.confirmationModal}><p>Clicking <b>OK</b> will save this inventory item and return to the main inventory screen.  Continue?</p></div>;
    
    // Context
    const {loggedInUser} = useContext(UserContext);
  
    // State
    const [inventoryLocationList, setInventoryLocationList] =  useState([] as InventoryLocationEntity[]);
    const [partList, setPartList] = useState([] as PartEntity[]);
    const [inventoryItemTypeList, setInventoryItemTypeList] = useState([] as InventoryItemTypeEntity[]);
    const [supplierList, setSupplierList] = useState([] as SupplierEntity[]);
    const [componentError, setComponentError] = useState({} as Error);
    const [isLoading, setIsLoading] = useState(false);
      
    // const [destinationLocation, setDestinationLocation] = useState({inventoryLocationId:0} as InventoryLocationEntity);
    const [moveInventoryItem, setMoveInventoryItem] = useState(
        {
            inventoryItem: {
                inventoryLocation:{inventoryLocationId:0} as InventoryLocationEntity,
                inventoryItemType:{inventoryItemTypeId:0} as InventoryItemTypeEntity,
                part:{partId:0} as PartEntity,
                supplier:{supplierId:0} as SupplierEntity,
                quantity:0,
                serialNumber:'',
                lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : '',
                inventoryItemAttributes:[] as InventoryItemAttributeEntity[]
            } as InventoryItemEntity,
            destinationLocation:{} as InventoryLocationEntity,
            quantityToMove:0,
            moveAllQuantity:false,
            isChanged:false
        } as MoveInventoryItemViewModel);

    const [inventoryItemValidationErrors, setInventoryItemValidationErrors] = useState([] as {errorMessage:string}[]);
    const [isMoveInventoryFormValid, setIsMoveInventoryFormValid] = useState(true);
    const [showSubmitFormModal, setShowSubmitFormModal] = useState(false);
    const [showNewSupplierModal, setShowNewSupplierModal] = useState(false);
    
    const getMoveInventoryFormIsValid = ():boolean => {
        // The form is valid when all required fields have been entered and the item quantity is > 0
        let currentValidationErrors =  [] as {errorMessage:string}[];
  
        if(moveInventoryItem.quantityToMove <= 0)
        {
          currentValidationErrors = [...currentValidationErrors, {errorMessage:'The quantity to receive must be greater than 0.'}];
        }

        if(moveInventoryItem.destinationLocation.inventoryLocationId === undefined || moveInventoryItem.destinationLocation.inventoryLocationId <= 0)
        {
            currentValidationErrors = [...currentValidationErrors, {errorMessage:'You must select a location from the New Location list.'}];
        }

        if(moveInventoryItem.inventoryItem.part.partId === undefined || moveInventoryItem.inventoryItem.part.partId <= 0)
        {
            currentValidationErrors = [...currentValidationErrors, {errorMessage:'You must select a part from the Part list.'}];
        }

        if(moveInventoryItem.inventoryItem.supplier.supplierId === undefined || moveInventoryItem.inventoryItem.supplier.supplierId <= 0)
        {
            currentValidationErrors = [...currentValidationErrors, {errorMessage:'You must select a supplier from the Supplier list.  If not in the list, add it using the "Add New" button below.'}];
        }

        if(moveInventoryItem.inventoryItem.inventoryItemType === undefined || moveInventoryItem.inventoryItem.inventoryItemType.inventoryItemTypeId === undefined || moveInventoryItem.inventoryItem.inventoryItemType.inventoryItemTypeId <= 0)
        {
            currentValidationErrors = [...currentValidationErrors, {errorMessage:'You must select a type from the Item Type list.'}];
        }
        else
        {
            if(moveInventoryItem.inventoryItem.serialNumber === undefined || moveInventoryItem.inventoryItem.serialNumber.length === 0)
            {
                currentValidationErrors = [...currentValidationErrors, {errorMessage:'You must enter a ' + moveInventoryItem.inventoryItem.inventoryItemType.name + ' number.'}];
            }
        }

        setIsMoveInventoryFormValid(currentValidationErrors.length === 0);
        setInventoryItemValidationErrors(currentValidationErrors);
  
        return currentValidationErrors.length === 0;
      }

    const selectedLocationHandler = (event:React.ChangeEvent<HTMLSelectElement>) => {
        const inventoryLocationFromList = inventoryLocationList.find(inventoryLocation => inventoryLocation.inventoryLocationId === +event.target.value);
        if(inventoryLocationFromList !== undefined)
        {
            const updatedMoveInventoryItem = {...moveInventoryItem, destinationLocation:inventoryLocationFromList};
            setMoveInventoryItem(updatedMoveInventoryItem);
        }
    }

    const selectedPartHandler = (event:React.ChangeEvent<HTMLSelectElement>) => {
        const partFromList = partList.find(part => part.partId === +event.target.value);
        if(partFromList !== undefined)
        {
            // With the part changing, we need to refresh the inventory item attributes.
            // If they change the part after having already entered attribute values, they will be lost, but that is fine.  
            let newInventoryItem = {...moveInventoryItem.inventoryItem, part:partFromList};
            const invetoryItemAttributes = partFromList.partItemAttributeTypes.map(partItemAttributeType => {
                return {
                    inventoryItemAttributeId:0,
                    inventoryItem:newInventoryItem,
                    itemAttributeType:partItemAttributeType.itemAttributeType,
                    attributeValue:'',
                    lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : '',
                } as InventoryItemAttributeEntity;
            });
            newInventoryItem = {...newInventoryItem, inventoryItemAttributes:invetoryItemAttributes};
            const updatedMoveInventoryItem = {...moveInventoryItem, inventoryItem: newInventoryItem};
            setMoveInventoryItem(updatedMoveInventoryItem);
        }
    }
    
    const selectedSupplierHandler = (event:React.ChangeEvent<HTMLSelectElement>) => {
        const supplierFromList = supplierList.find(supplier => supplier.supplierId === +event.target.value);
        if(supplierFromList !== undefined)
        {
            const updatedMoveInventoryItem = {...moveInventoryItem, inventoryItem: {...moveInventoryItem.inventoryItem, supplier:supplierFromList}};
            setMoveInventoryItem(updatedMoveInventoryItem);
        }
    }

    const selectedItemTypeHandler = (event:React.ChangeEvent<HTMLSelectElement>) => {
        // Inventory can be of Lot or Serial type.  In essence, a lot can have many items, while a serial should only be 1 item.
        // We need to store the whole object in state, instead of just the ID so that we can use it for rendering below, and locking quantity to 1 when serial is selected.
        const inventoryItemTypeFromList = inventoryItemTypeList.find(itemType => itemType.inventoryItemTypeId === +event.target.value);
        if(inventoryItemTypeFromList !== undefined)
        {
            const updatedMoveInventoryItem = {...moveInventoryItem, inventoryItem: {...moveInventoryItem.inventoryItem, inventoryItemType: inventoryItemTypeFromList}, quantityToMove:inventoryItemTypeFromList.name === "Serial" ? 1 : 0};
            setMoveInventoryItem(updatedMoveInventoryItem);
        }
    }

    const serialNumberChangeHandler = (event:React.ChangeEvent<HTMLInputElement>) => {
        const updatedMoveInventoryItem = {...moveInventoryItem, inventoryItem: {...moveInventoryItem.inventoryItem, serialNumber: event.target.value}};
        setMoveInventoryItem(updatedMoveInventoryItem);
    }

    const quantityChangeHandler = (event:React.ChangeEvent<HTMLInputElement>) => {
        const updatedMoveInventoryItem = {...moveInventoryItem, quantityToMove: +event.target.value};
        setMoveInventoryItem(updatedMoveInventoryItem);
    }

    const inventoryItemAttributeChangeHandler  = (event:React.ChangeEvent<HTMLInputElement>) => {
        const updatedInventoryItemAttributes = moveInventoryItem.inventoryItem.inventoryItemAttributes.map(inventoryItemAttribute => {
            if(inventoryItemAttribute.itemAttributeType.itemAttributeTypeId?.toString() === event.currentTarget.id)
            {
                return {...inventoryItemAttribute, attributeValue:event.currentTarget.value};
            }
            else
            {
                return inventoryItemAttribute;
          }
        });
        const updatedMoveInventoryItem = {...moveInventoryItem, inventoryItem: {...moveInventoryItem.inventoryItem, inventoryItemAttributes: updatedInventoryItemAttributes}};
        setMoveInventoryItem(updatedMoveInventoryItem);
    };

    const supplierAddClickEventHandler = (buttonEvent:React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
    {
      buttonEvent.preventDefault();
      setShowNewSupplierModal(true);      
    }

    const supplierAddCompleteHandler = (newlyAddedSupplierName:string) => {
        // If the post of a new supplier is successful, this method will be called with props.
        // We need to refresh the supplier list to include the new value, then also assign the selected value to what they entered.
        setShowNewSupplierModal(false);
        setIsLoading(true);
        fetchActiveSuppliers().then((suppliersResult) => {
            setSupplierList(suppliersResult);
            const supplierFromList = suppliersResult.find(supplier => supplier.name === newlyAddedSupplierName);
            if(supplierFromList !== undefined)
            {
                const updatedMoveInventoryItem = {...moveInventoryItem, inventoryItem: {...moveInventoryItem.inventoryItem, supplier:supplierFromList}};
                setMoveInventoryItem(updatedMoveInventoryItem);
            }
            setIsLoading(false);
        }).catch((fetchError) => {
            setComponentError(fetchError);
            setIsLoading(false);   
        });
    }

    const supplierAddCancelHandler = () => {
        // user clicked cancel in the new supplier form, so just close the modal.
        setShowNewSupplierModal(false);
    }
    
    const formSubmitHandler = ():void => {
        setIsLoading(true);
        
        postMoveInventory(moveInventoryItem).then(()=> {
            setIsLoading(false);   
            formRef.current?.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true })
            );
        }).catch((fetchError) => {
            setComponentError(fetchError);
            setIsLoading(false);   
        });        
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
        // Only show the submit dialog when there are no validation errors.
        if(getMoveInventoryFormIsValid())
        {
            setShowSubmitFormModal(true);
        }
    }

    const cancelChangesHandler = () =>
    {
        navigate('..');
    }
    
    useEffect(() => {
        fetchInventoryLocationData(props.sourceLocation).then((inventoryLocationResult) => {
            setInventoryLocationList(inventoryLocationResult);
        }).catch((fetchError) => {setComponentError(fetchError)});
        fetchRawMaterialPartList().then((partListResult) => {
            setPartList(partListResult);
        }).catch((fetchError) => {setComponentError(fetchError)});
        fetchInventoryItemTypes().then((inventoryItemTypesResult) => {
            setInventoryItemTypeList(inventoryItemTypesResult);
        }).catch((fetchError) => {setComponentError(fetchError)});
        fetchActiveSuppliers().then((suppliersResult) => {
            setSupplierList(suppliersResult);
        }).catch((fetchError) => {setComponentError(fetchError)});
      }, [props.sourceLocation]);      
    
    return (
      <>
      {showNewSupplierModal && <Modal showFromClient={showNewSupplierModal} children={<SupplierForm method='POST' onSupplierAddCompleteHandler={supplierAddCompleteHandler} onSupplierAddCancelHandler={supplierAddCancelHandler} />} allowBackdropClose={false}></Modal>}
      <Form method={props.method} className={classes.form} ref={formRef}>
        {isLoading && <LoadingModal />}
        {showSubmitFormModal && <Modal showFromClient={showSubmitFormModal} children={modalDialogSubmitContent} allowBackdropClose={false} onCancel={modalSubmitCancelHandler} onOk={modalSubmitOkHandler}></Modal>}        
        {componentError !== undefined && componentError.message && componentError.message.length > 0 && <ErrorDisplay title={'Error'} message={componentError.message} />}
        <div className={classes.receiveInventoryGridContainer}>
            {!isMoveInventoryFormValid && 
              <>
                <div className={classes.errorMessage}><b>The form is invalid.  Please correct the errors below and try again:</b>
                  <ul>
                    {inventoryItemValidationErrors.map((error:any) => <li key={error.errorMessage}>{error.errorMessage}</li>)}
                  </ul>
                </div>
            </>}        
            <label htmlFor="currentLocation">Current Location</label>
            <input type="text" id="currentLocation" name="currentLocation" readOnly={true} defaultValue={props.sourceLocation} />
            <label htmlFor="location">New Location</label>
            <select id='location' name='location' value={moveInventoryItem.destinationLocation.inventoryLocationId} onChange={selectedLocationHandler}>
                <option> -- Select Location -- </option>
                {inventoryLocationList.map((inventoryLocation) => 
                <option key={inventoryLocation.inventoryLocationId}
                    value={inventoryLocation.inventoryLocationId}>{inventoryLocation.name}                    
                </option>)}
            </select>
            <label htmlFor="part">Part</label>
            <select id='part' name='part' value={moveInventoryItem.inventoryItem.part.partId} onChange={selectedPartHandler}>
                <option key={0} value={0}> -- Select Part -- </option>
                {partList.map((part) => 
                <option key={part.partId}
                    value={part.partId}>{part.partNumber + ' (' + part.partRevision + ') - ' + part.description}                    
                </option>)}
            </select>
            <label htmlFor="supplier">Supplier</label>
            <div className={classes.supplerContainer}>
                <select id='supplier' name='supplier' value={moveInventoryItem.inventoryItem.supplier.supplierId} onChange={selectedSupplierHandler}>
                    <option key={0} value={0}> -- Select Supplier -- </option>
                    {supplierList.map((supplier) => 
                    <option key={supplier.supplierId}
                        value={supplier.supplierId}>{supplier.name}
                    </option>)}
                </select>
                <button className={classes.actionButton} onClick={supplierAddClickEventHandler}><BiAddToQueue size={18}  />Add</button>
            </div>
            <label htmlFor="itemType">Item Type</label>
            <select id='itemType' name='itemType' value={moveInventoryItem.inventoryItem.inventoryItemType.inventoryItemTypeId} onChange={selectedItemTypeHandler}>
                <option key={0} value={0}> -- Select Item Type -- </option>
                {inventoryItemTypeList.map((inventoryItemType) => 
                <option key={inventoryItemType.inventoryItemTypeId}
                    value={inventoryItemType.inventoryItemTypeId}>{inventoryItemType.name}
                </option>)}
            </select>
            {moveInventoryItem.inventoryItem.inventoryItemType !== undefined && moveInventoryItem.inventoryItem.inventoryItemType.inventoryItemTypeId > 0 && <label htmlFor="serialNumber">{moveInventoryItem.inventoryItem.inventoryItemType.name} #</label>}
            {moveInventoryItem.inventoryItem.inventoryItemType !== undefined && moveInventoryItem.inventoryItem.inventoryItemType.inventoryItemTypeId > 0 && <input type="text" id="serialNumber" name="serialNumber" maxLength={100} required value={moveInventoryItem.inventoryItem.serialNumber} onChange={serialNumberChangeHandler} />}
            <label htmlFor="quantity">Quantity to Receive</label>
            <div className={classes.quantityContainer}>
                <input type="number" id="quantity" name="quantity" maxLength={10} required readOnly={moveInventoryItem.inventoryItem.inventoryItemType.name === "Serial"} value={moveInventoryItem.quantityToMove} onChange={quantityChangeHandler} />
                {moveInventoryItem.inventoryItem.part !== undefined && moveInventoryItem.inventoryItem.part.partId !== undefined && moveInventoryItem.inventoryItem.part.partId > 0 && <span><b> {moveInventoryItem.inventoryItem.part.unitOfMeasure.name + '(' + moveInventoryItem.inventoryItem.part.unitOfMeasure.shortName + ')'}</b></span>}
            </div>
            <div className={classes.itemAttributeTypeListContainer}>
                <div className={classes.itemAttributeTypeListHeader}>
                    <div>Attribute</div>
                    <div>Value</div>
                </div>
                <div className={classes.itemAttributeTypeAddContainerOuter}>
                    {moveInventoryItem.inventoryItem 
                        && moveInventoryItem.inventoryItem.part
                        && moveInventoryItem.inventoryItem.part.partId !== undefined
                        && moveInventoryItem.inventoryItem.part.partId > 0 &&
                    <div className={classes.itemAttributeTypeContainer}>
                        {moveInventoryItem.inventoryItem.inventoryItemAttributes.map((inventoryItemAttribute) => {
                            const matchingPartItemTypeAttribute = moveInventoryItem.inventoryItem.part && moveInventoryItem.inventoryItem.part.partItemAttributeTypes && moveInventoryItem.inventoryItem.part.partItemAttributeTypes.find(partItemTypeAttribute => partItemTypeAttribute.itemAttributeType.itemAttributeTypeId === inventoryItemAttribute.itemAttributeType.itemAttributeTypeId);
                            return (
                                <div key={inventoryItemAttribute.itemAttributeType.itemAttributeTypeId} className={classes.itemAttributeTypeContainerItem}>
                                    <div>
                                        <b>{inventoryItemAttribute.itemAttributeType.name}</b>
                                    </div>
                                    <div>
                                        <input type="text" id={inventoryItemAttribute.itemAttributeType.itemAttributeTypeId.toString()} key={inventoryItemAttribute.itemAttributeType.itemAttributeTypeId} name="itemAttributeTypeValue" maxLength={1000} required={matchingPartItemTypeAttribute ? matchingPartItemTypeAttribute.isRequired : false}  value={inventoryItemAttribute.attributeValue} onChange={inventoryItemAttributeChangeHandler} />
                                    </div>
                                </div>);
                            })}
                    </div>}
                </div>
            </div>
            <div className={classes.actions}>
                    <button type='button' className={classes.cancelButton} onClick={cancelChangesHandler}>Cancel</button>
                    <button type='button' className={classes.submitButton} onClick={submitChangesHandler}>Submit Changes and Exit</button>
            </div>
        </div>
      </Form>
      </>
  );
}

export default ReceiveNewInventoryForm;

export async function action({request, params}:LoaderFunctionArguments) {
  return redirect('/inventory/dashboard');
}
