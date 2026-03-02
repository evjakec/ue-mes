import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import classes from './BillOfMaterialPartListForm.module.css'
import { BiAddToQueue, BiTrash } from "react-icons/bi";
import { BillOfMaterialEntity } from "../../../models/bill-of-material-entity";
import { PartEntity } from "../../../models/part-entity";
import { BillOfMaterialPartEntity } from "../../../models/bill-of-material-part-entity";
import { Form, redirect, useLoaderData, useNavigate } from "react-router-dom";
import { LoaderFunctionArguments } from "../../../routes/types/LoaderFunctionArguments";
import Modal from "../../../ui/components/Modal";
import { postBillOfMaterialPartList } from "../../../ui/scripts/ApiFunctions";
import ErrorDisplay from "../../../ui/components/ErrorDisplay";
import { UserContext } from "../../../store/user-context";

const BillOfMaterialPartListForm: React.FC<{method:any}> = (props) => {
    // loader data
    const [loadedPartsList, loadedBillOfMaterial] = useLoaderData() as [PartEntity[], BillOfMaterialEntity];
    const navigate = useNavigate();
    let formRef = useRef<HTMLFormElement>(null);
    
    const modalDialogSubmitContent = <div className={classes.confirmationModal}><p>Clicking <b>OK</b> will replace all existing BOM parts with the list on this screen.  Continue?</p></div>;
    const modalDialogCancelContent = <div className={classes.confirmationModal}><p>Clicking <b>OK</b> will lose any of the changes you have made on this screen.  If you want to save them, click Cancel below and then click <b>Submit Changes and Exit</b> on the form.  Continue?</p></div>;
    
    // will likely move these into context at some point.  For now, using state
    const [billOfMaterialPartsList, setBillOfMaterialPartsList] = useState([] as BillOfMaterialPartEntity[]);
    const [availablePartsList, setAvailablePartsList] = useState([] as PartEntity[]);

    // Context
    const {loggedInUser} = useContext(UserContext);
  
    // States for form operation
    const [isBomPartListChanged, setIsBomPartListChanged] = useState(false);
    const [isBomPartListValid, setIsBomPartListValid] = useState(true);
    const [bomPartListValidationErrors, setBomPartListValidationErrors] = useState([] as {errorMessage:string}[]);
    const [showSubmitFormModal, setShowSubmitFormModal] = useState(false);
    const [showCancelFormModal, setShowCancelFormModal] = useState(false);
    const [componentError, setComponentError] = useState({} as Error);
    
    // temporary state for selected part in the drop down list
    const [selectedPart, setSelectedPart] = useState({} as PartEntity);

    const getBomPartListIsValid = ():boolean => {
        // A BOM Part List is valid when all parts in the bom have a quantity > 0.
        let currentValidationErrors =  [] as {errorMessage:string}[];
  
        const partsWithZeroOrNoQuantity = billOfMaterialPartsList.filter(billOfMaterialPart => billOfMaterialPart.quantity <= 0);

        if(partsWithZeroOrNoQuantity && partsWithZeroOrNoQuantity.length !== 0)
        {
          currentValidationErrors = [...currentValidationErrors, {errorMessage:'All quantities in the BOM part list must be greater than 0.'}];
        }

        setIsBomPartListValid(currentValidationErrors.length === 0);
        setBomPartListValidationErrors(currentValidationErrors);
  
        return currentValidationErrors.length === 0;
      }

    const getBillOfMaterialPartList = useCallback(() => {
        const currentBillOfMaterialPartList = loadedBillOfMaterial.billOfMaterialParts.map(billOfMaterialPart => {
              return {...billOfMaterialPart, billOfMaterial:{billOfMaterialId:loadedBillOfMaterial.billOfMaterialId} as BillOfMaterialEntity};
          });
        
        // On first load of the bill of material part list, we need to filter the available parts to only include parts not already assigned to the BOM
        let availablePartData = loadedPartsList; // fetch these later
        availablePartData = availablePartData.filter(part => !loadedBillOfMaterial.billOfMaterialParts.some(billOfMaterialPart => billOfMaterialPart.part.partId === part.partId) && part.partId !== loadedBillOfMaterial.part.partId)
        setBillOfMaterialPartsList(currentBillOfMaterialPartList);
        setAvailablePartsList(availablePartData);
    },[loadedBillOfMaterial,loadedPartsList]);
    
    // Default work element is used to reset the header controls after an item is added or edited.
    const emptyBillOfMaterialPartWithParentBillOfMaterial = useMemo(() => ({
        billOfMaterialPartId:0,
        billOfMaterial:loadedBillOfMaterial,
        part: {} as PartEntity,
        quantity:0,
        lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : ''
      } as BillOfMaterialPartEntity),[loadedBillOfMaterial,loggedInUser.loginName]);

    const selectedPartHandler = (selectedPartId:string) => {
        // In this handler, we will simply set the selectedPartObject
        // There will be a button next to the drop down for the user to add it to the BOM part list. 
        const selectedPartObject = availablePartsList.find(part => part.partId?.toString() === selectedPartId);
        if(selectedPartObject)
        {
            setSelectedPart(selectedPartObject);
        }
    }
    
    const partAddClickEventHandler = (buttonEvent:React.MouseEvent<HTMLButtonElement, MouseEvent>):void => {
        
        // Prevent form submit
        buttonEvent.preventDefault();
        
        // Only run the logic when a part has been selected and not the default "Select Part" text
        if(selectedPart && selectedPart.partId && selectedPart.partId > 0)
        {
            // When the add button is clicked, the selected part will be added to the BOM part list, and removed from the available part list.
            // By the time the button is clicked, the selectedPart will already be assigned from the select event handler.
            // We can go ahead and add it to the array
            const addedBomPart = {...emptyBillOfMaterialPartWithParentBillOfMaterial,part:selectedPart};
            setBillOfMaterialPartsList(prevArray => [...prevArray, addedBomPart]);
            
            // Then, we'll remove it from the list of available parts, since it has been assigned
            setAvailablePartsList(prevArray => prevArray.filter(item => item.partId !== selectedPart.partId));

            // Finally, set the selected attribute back to empty to prepare for the next item.
            setSelectedPart({} as PartEntity);
            setIsBomPartListChanged(true);
        }
    }

    const partDeleteClickEventHandler = (buttonEvent:React.MouseEvent<HTMLButtonElement, MouseEvent>):void => {
        // When the delete button is clicked, the part deleted  will be added back to the list of available parts, and removed from the BOM part list.
        buttonEvent.preventDefault();
        
        // First, we need to get the part by ID from the BOM part list so that we can move it back into the available parts list
        const deletedBillOfMaterialPart = billOfMaterialPartsList.find(billOfMaterialPart => billOfMaterialPart.part.partId && billOfMaterialPart.part.partId.toString() === (buttonEvent.currentTarget.id));
        setAvailablePartsList(prevArray => [...prevArray, ...(deletedBillOfMaterialPart !== undefined ? [deletedBillOfMaterialPart.part] : [])]);

        // Then, we can remove it from the BOM part list
        const bomPartListFiltered = billOfMaterialPartsList.filter(billOfMaterialPart => billOfMaterialPart.part.partId && billOfMaterialPart.part.partId.toString() !== buttonEvent.currentTarget.id);
        setBillOfMaterialPartsList(bomPartListFiltered);
        setIsBomPartListChanged(true);
    }

    const bomPartQuantityChangeHandler = (event:React.ChangeEvent<HTMLInputElement>) => {
        setBillOfMaterialPartsList(billOfMaterialPartsList.map(billOfMaterialPart => {
            if (billOfMaterialPart.part.partId && billOfMaterialPart.part.partId.toString() === event.target.id) {
              return { ...billOfMaterialPart, quantity: +event.target.value };
            } else {
              return billOfMaterialPart;
            }
          }));
        
        setIsBomPartListChanged(true);
    }
         
      const formSubmitHandler = ():void => {
        // Only post to the API if something in the list has changed.
        if(isBomPartListChanged)
        {
            // validate stuff first
            postBillOfMaterialPartList(loadedBillOfMaterial.billOfMaterialId.toString(), billOfMaterialPartsList).then(()=> {
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
      if(!isBomPartListChanged || (isBomPartListChanged && getBomPartListIsValid()))
      {
        // Only need to show the confirmation dialog if there have been changes.  Otherwise, just close the form.
        if(isBomPartListChanged)
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
      if(isBomPartListChanged)
      {
        setShowCancelFormModal(true);
      }
      else
      {
        navigate('..');
      }
    }
    
    useEffect(() => {
        getBillOfMaterialPartList();
      }, [getBillOfMaterialPartList]);
      
    return (
        <Form method={props.method} className={classes.form} ref={formRef}>
           {showSubmitFormModal && <Modal showFromClient={showSubmitFormModal} children={modalDialogSubmitContent} allowBackdropClose={false} onCancel={modalSubmitCancelHandler} onOk={modalSubmitOkHandler}></Modal>}
           {showCancelFormModal && <Modal showFromClient={showCancelFormModal} children={modalDialogCancelContent} allowBackdropClose={false} onCancel={modalCancelCancelHandler} onOk={modalCancelOkHandler}></Modal>}
           {componentError !== undefined && componentError.message && componentError.message.length > 0 && <ErrorDisplay title={'Error'} message={componentError.message} />}    
          <div className={classes.formGridContainer}>
            <div className={classes.headerIdDiv}>
                <span><b>BOM ID</b> : {loadedBillOfMaterial.billOfMaterialId}</span>
            </div>
            <div className={classes.headerNameDiv}>
                <span><b>BOM Name</b> : {loadedBillOfMaterial.name}</span>
            </div> 
            <div className={classes.bomPartOuter}>
              {!isBomPartListValid && 
                <>
                  <div className={classes.errorMessage}><b>The BOM part list is invalid.  Please correct the errors below and try again:</b>
                    <ul>
                      {bomPartListValidationErrors.map((error:any) => <li key={error.errorMessage}>{error.errorMessage}</li>)}
                    </ul>
                  </div>
                </>
              }
                <div className={classes.bomPartContainerOuter}>
                  <div className={classes.bomPartContainer}>
                    {billOfMaterialPartsList.map((billOfMaterialPart) => 
                            <div key={billOfMaterialPart.part.partId} className={classes.bomPartContainerItem}>
                                <div className={classes.bomPartContainerItemLabel}>
                                    <button id={billOfMaterialPart.part.partId?.toString()} type='button' className={classes.addRemoveButton} onClick={partDeleteClickEventHandler}><BiTrash size={18}  />Delete</button>
                                </div>
                                <div className={classes.bomPartContainerItemValue}>
                                    <span><b>Quantity: <input key={billOfMaterialPart.part.partId} type="number" id={billOfMaterialPart.part.partId?.toString()} name="quantity" maxLength={10} required value={billOfMaterialPart.quantity} onChange={bomPartQuantityChangeHandler} /> {billOfMaterialPart.part.unitOfMeasure !== undefined && billOfMaterialPart.part.unitOfMeasure.name}</b></span> | {billOfMaterialPart.part.partNumber + ' (' + billOfMaterialPart.part.partRevision + ') - ' + billOfMaterialPart.part.description}
                                </div>
                            </div>
                    )}
                    </div>
                </div>
            </div>
            <div className={classes.bomPartAddContainer}>
                <div className={classes.bomPartAddContainerLabel}>Add Part:</div>
                <div className={classes.bomPartAddContainerValue}>
                <select id='part' name='part' value={selectedPart && selectedPart.partId ? selectedPart.partId : ''} onChange={e => selectedPartHandler(e.target.value)}>
                    <option> -- Select Part -- </option>
                    {availablePartsList.map((availablePart) => 
                    <option key={availablePart.partId}
                        value={availablePart.partId}>{availablePart.partNumber + ' (' + availablePart.partRevision + ') - ' + availablePart.description}                    
                    </option>)}
                </select>  
                <button className={classes.addRemoveButton} onClick={partAddClickEventHandler}><BiAddToQueue size={18}  />Add</button>
                </div>
            </div>
            <div className={classes.actionsLayout}>
                <button type='button' className={classes.cancelButton} onClick={cancelChangesHandler}>Cancel</button>
                <button type='button' className={classes.submitButton} onClick={submitChangesHandler}>Submit Changes and Exit</button>
            </div>
          </div>
        </Form>
    );
}

export default BillOfMaterialPartListForm;

export async function action({params}:LoaderFunctionArguments) {
  
  const billOfMaterialId = params.billOfMaterialId ? params.billOfMaterialId : '0';
  if(!isNaN(+billOfMaterialId) && +billOfMaterialId > 0)
  {
    return redirect('/inventory/billOfMaterial/' + billOfMaterialId);
  }

  // TODO: Handle bad responses here
  return redirect('/inventory/billOfMaterial');
}