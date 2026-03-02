import { Form, redirect, useLoaderData, useNavigate } from 'react-router-dom';
import classes from './BillOfProcessWorkElementForm.module.css'
import { LoaderFunctionArguments } from '../../../routes/types/LoaderFunctionArguments'
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { BillOfProcessProcessEntity } from '../../../models/bill-of-process-process-entity';
import { BillOfProcessProcessWorkElementEntity } from '../../../models/bill-of-process-process-work-element-entity';
import { WorkElementTypeEntity } from '../../../models/work-element-type-entity';
import { BillOfProcessProcessWorkElementAttributeEntity } from '../../../models/bill-of-process-process-work-element-attribute-entity';
import BillOfProcessDetailProcessWorkElementList from './BillOfProcessDetailProcessWorkElementList';
import BillOfProcessWorkElementHeader from './BillOfProcessWorkElementHeader';
import { BiAddToQueue } from 'react-icons/bi';
import BillOfProcessWorkElementSetup from './BillOfProcessWorkElementSetup';
import BillOfProcessWorkElementPreview from './BillOfProcessWorkElementPreview';
import Modal from '../../../ui/components/Modal';
import { BillOfMaterialEntity } from '../../../models/bill-of-material-entity';
import { fetchBillOfMaterialByPart, postBillOfProcessWorkElementList } from '../../../ui/scripts/ApiFunctions';
import ErrorDisplay from '../../../ui/components/ErrorDisplay';
import { WorkElementSetupContext } from '../../../store/work-element-setup-context';
import { UserContext } from '../../../store/user-context';

const BillOfProcessWorkElementForm:React.FC<{method:any}> = (props) => {
    
    const billOfProcessProcess = useLoaderData() as BillOfProcessProcessEntity;
    const navigate = useNavigate();

    let formRef = useRef<HTMLFormElement>(null);
    const modalDialogSubmitContent = <div className={classes.confirmationModal}><p>Clicking <b>OK</b> will replace all existing work elements with the list on this screen.  Continue?</p></div>;
    const modalDialogCancelContent = <div className={classes.confirmationModal}><p>Clicking <b>OK</b> will lose any of the changes you have made on this screen.  If you want to save them, click Cancel below and then click <b>Submit Changes and Exit</b> on the form.  Continue?</p></div>;
    
    // Context
    const {workElementTypeAttributes, componentError} = useContext(WorkElementSetupContext);
    const {loggedInUser} = useContext(UserContext);
  
    // Default work element is used to reset the header controls after an item is added or edited.
    const emptyWorkElementWithParentBillOfProcessProcess = {
      billOfProcessProcessWorkElementId:0,
      billOfProcessProcess:billOfProcessProcess,
      workElementType:{name:''} as WorkElementTypeEntity,
      name:'',
      isRequired:false,
      isActive:true,
      sequence:0,
      lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : '',
      billOfProcessProcessWorkElementAttributes:[]
    } as BillOfProcessProcessWorkElementEntity;
  
    // State
    const [billOfProcessProcessWorkElement, setBillOfProcessProcessWorkElement] = useState(emptyWorkElementWithParentBillOfProcessProcess);
    const [billOfProcessProcessWorkElementList, setBillOfProcessProcessWorkElementList] = useState([] as BillOfProcessProcessWorkElementEntity[]);
    const [isBillOfProcessProcessWorkElementChanged, setIsBillOfProcessProcessWorkElementChanged] = useState(false);
    const [isBillOfProcessProcessWorkElementListChanged, setIsBillOfProcessProcessWorkElementListChanged] = useState(false);
    const [isWorkElementNew, setIsWorkElementNew] = useState(false);
    const [isWorkElementValid, setIsWorkElementValid] = useState(true);
    const [workElementValidationErrors, setWorkElementValidationErrors] = useState([] as {errorMessage:string}[]);
    const [showSubmitFormModal, setShowSubmitFormModal] = useState(false);
    const [showCancelFormModal, setShowCancelFormModal] = useState(false);
    const [billOfMaterial,setBillOfMaterial] = useState({} as BillOfMaterialEntity);
    
    const getWorkElementIsValid = (workElementToValidate:BillOfProcessProcessWorkElementEntity):boolean => {
      // A work element is valid when all required fields are filled in.  This applies to the work element itself and then any associated attributes
      // First check the element itself
      let currentValidationErrors =  [] as {errorMessage:string}[];

      if(!workElementToValidate.name)
      {
        currentValidationErrors = [...currentValidationErrors, {errorMessage:'Name is required.'}];
      }

      if(!workElementToValidate.workElementType || !workElementToValidate.workElementType.name)
      {
        currentValidationErrors = [...currentValidationErrors, {errorMessage:'Work Element Type is required.'}];
      }

      // Next check the element attributes if a workElementType is selected
      if(workElementToValidate.workElementType && workElementToValidate.workElementType.name)
      {
        const typeAttributesToCheck = workElementTypeAttributes.filter(typeAttribute => typeAttribute.workElementType.name === workElementToValidate.workElementType.name);
        typeAttributesToCheck.forEach(typeAttribute => {
          
          // only run the check if the attribute is required
          if(typeAttribute.isRequiredAtSetup)
          {
            const currentAttribute = workElementToValidate.billOfProcessProcessWorkElementAttributes.find(workElementAttribute => workElementAttribute.workElementTypeAttribute.name === typeAttribute.name);
            if(!currentAttribute || (currentAttribute && !currentAttribute.attributeValue))
            {
              currentValidationErrors = [...currentValidationErrors, {errorMessage:typeAttribute.name + ' is a required Setup attribute.'}];
            }
          }
        })
    }
      setIsWorkElementValid(currentValidationErrors.length === 0);
      setWorkElementValidationErrors(currentValidationErrors);

      return currentValidationErrors.length === 0;
    }

    const workElementAddClickEventHandler = (buttonEvent:React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
    {
      buttonEvent.preventDefault();
        
      if(!isBillOfProcessProcessWorkElementChanged || (isBillOfProcessProcessWorkElementChanged && billOfProcessProcessWorkElement && billOfProcessProcessWorkElement.billOfProcessProcessWorkElementId === 0) || (isBillOfProcessProcessWorkElementChanged && billOfProcessProcessWorkElement && billOfProcessProcessWorkElement.billOfProcessProcessWorkElementId !== 0 && getWorkElementIsValid(billOfProcessProcessWorkElement)))
      {  
        const newWorkElement = {...emptyWorkElementWithParentBillOfProcessProcess, 
          billOfProcessProcessWorkElementId:((billOfProcessProcessWorkElementList.length+1)*-1),
          sequence:(billOfProcessProcessWorkElementList.length+1)
        };
        
        setBillOfProcessProcessWorkElement(newWorkElement);
        setIsWorkElementNew(true);
      }
    }

    const setBillOfProcessWorkElementHandler = (selectedBillOfProcessProcessWorkElement:BillOfProcessProcessWorkElementEntity) => {
      
      // if the current selected element is an existing element and has been changed, then run the validation.
      // if the current element is unchanged, or selecting an element for the first time, set the state and continue.
      if(isBillOfProcessProcessWorkElementChanged && billOfProcessProcessWorkElement && billOfProcessProcessWorkElement.billOfProcessProcessWorkElementId !== 0)
      {
        if(getWorkElementIsValid(billOfProcessProcessWorkElement))
        {
          setIsBillOfProcessProcessWorkElementChanged(false);
          setBillOfProcessProcessWorkElement(selectedBillOfProcessProcessWorkElement);
          setIsWorkElementNew(false);
        }
      }
      else
      {
        setBillOfProcessProcessWorkElement(selectedBillOfProcessProcessWorkElement);
        setIsWorkElementNew(false);
      }
    }

    const updateBillOfProcessProcessWorkElementList = (updatedBillOfProcessProcessWorkElement:BillOfProcessProcessWorkElementEntity) => {
      
      const existingWorkElement = billOfProcessProcessWorkElementList.find(workElement => workElement.billOfProcessProcessWorkElementId === updatedBillOfProcessProcessWorkElement.billOfProcessProcessWorkElementId);
      if(existingWorkElement && existingWorkElement.billOfProcessProcessWorkElementId !== 0)
      {
        // item already exists in the list, so replace it with the updated item
        // We also need to ensure the sequence is maintained with each change to the list, so it will be reset on all items using the array index 
        const updatedWorkElements = billOfProcessProcessWorkElementList.map((workElement,index) => {
          if(existingWorkElement && existingWorkElement.billOfProcessProcessWorkElementId === workElement.billOfProcessProcessWorkElementId)
          {
            const updatedBillOfProcessProcessWorkElementWithNewSequence = {...updatedBillOfProcessProcessWorkElement, sequence:(index+1)};
            setBillOfProcessProcessWorkElement(updatedBillOfProcessProcessWorkElementWithNewSequence);
            return updatedBillOfProcessProcessWorkElementWithNewSequence;
          }
          else
          {
            return {...workElement,sequence:(index+1)};
          }
        });

        setBillOfProcessProcessWorkElementList(updatedWorkElements);
        setIsBillOfProcessProcessWorkElementListChanged(true);
      }
      else if (isWorkElementNew)
      {
        // This is a new work element, so add it to the end.
        setBillOfProcessProcessWorkElementList(prevList => [...prevList,updatedBillOfProcessProcessWorkElement]);
        setBillOfProcessProcessWorkElement(updatedBillOfProcessProcessWorkElement);
        setIsBillOfProcessProcessWorkElementListChanged(true);
      }
    }

    const saveWorkElementHandler = (updatedBillOfProcessProcessWorkElement:BillOfProcessProcessWorkElementEntity) => {
      
      if(getWorkElementIsValid(updatedBillOfProcessProcessWorkElement))
      {
        updateBillOfProcessProcessWorkElementList(updatedBillOfProcessProcessWorkElement);
        
        // After saving, clear the current element to start fresh
        setBillOfProcessProcessWorkElement(emptyWorkElementWithParentBillOfProcessProcess);
        setIsBillOfProcessProcessWorkElementChanged(false);  // Reset the isBillOfProcessProcessWorkElementListChanged state back to false after a successful save.
      }
    }

    const updateWorkElementHandler = (updatedBillOfProcessProcessWorkElement:BillOfProcessProcessWorkElementEntity) => {
      
      setBillOfProcessProcessWorkElement({...updatedBillOfProcessProcessWorkElement,lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : ''});
      
      // Only update the list when the work element already exists.
      if(!isWorkElementNew)
      {
        updateBillOfProcessProcessWorkElementList(updatedBillOfProcessProcessWorkElement);
        setIsBillOfProcessProcessWorkElementChanged(true);
      }
    }

    // The delete handler simply removes the element from the list.  The actual delete command in the database will not take place unless the user submits the form.
    const deleteBillOfProcessWorkElementHandler = (updatedBillOfProcessProcessWorkElement:BillOfProcessProcessWorkElementEntity) => {
      
      // If an existing element is selected and changed, run validation before allowing the Delete command to finish
      if(!isBillOfProcessProcessWorkElementChanged || (isBillOfProcessProcessWorkElementChanged && billOfProcessProcessWorkElement && billOfProcessProcessWorkElement.billOfProcessProcessWorkElementId !== 0 && getWorkElementIsValid(billOfProcessProcessWorkElement)))
      {
        let workElementListWithWorkElementDeleted = billOfProcessProcessWorkElementList.filter(workElement => workElement.billOfProcessProcessWorkElementId !== updatedBillOfProcessProcessWorkElement.billOfProcessProcessWorkElementId)
      
        // with new list in hand, resequence the remaining items (if there are any left)
        workElementListWithWorkElementDeleted = workElementListWithWorkElementDeleted.map((workElement,index) => {
            return {...workElement,sequence:(index+1)};
          });

        setBillOfProcessProcessWorkElementList(workElementListWithWorkElementDeleted);
        setBillOfProcessProcessWorkElement(emptyWorkElementWithParentBillOfProcessProcess);
        setIsBillOfProcessProcessWorkElementListChanged(true);  // If an item is successfully removed, then the list is now altered.
        setIsBillOfProcessProcessWorkElementChanged(false);  // Reset the isBillOfProcessProcessWorkElementListChanged state back to false after a successful save.
      }
    }

    const updateBillOfProcessProcessWorkElementListSequence = (updatedBillOfProcessProcessWorkElementList:BillOfProcessProcessWorkElementEntity[],
        selectedBillOfProcessProcessWorkElement?:BillOfProcessProcessWorkElementEntity) => {
      setBillOfProcessProcessWorkElementList(updatedBillOfProcessProcessWorkElementList);
      if(selectedBillOfProcessProcessWorkElement && selectedBillOfProcessProcessWorkElement.billOfProcessProcessWorkElementId !== 0)
      {
        const selectedWorkElementWithNewSequence = updatedBillOfProcessProcessWorkElementList.find(workElement => workElement.billOfProcessProcessWorkElementId === selectedBillOfProcessProcessWorkElement.billOfProcessProcessWorkElementId);
        setBillOfProcessProcessWorkElement(selectedWorkElementWithNewSequence ? {...selectedWorkElementWithNewSequence,lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : ''} : emptyWorkElementWithParentBillOfProcessProcess);
      }
      setIsBillOfProcessProcessWorkElementListChanged(true);
    }

    const updateBillOfProcessProcessWorkElementAttributes = (updatedWorkElementAttributes:BillOfProcessProcessWorkElementAttributeEntity[]) => {
      
      const updatedWorkElementWithAttributes = {...billOfProcessProcessWorkElement
        ,billOfProcessProcessWorkElementAttributes:updatedWorkElementAttributes
        ,lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : ''
      };
      
      setBillOfProcessProcessWorkElement(updatedWorkElementWithAttributes);

      // If this is an existing work element, also need to reset the full list so it refreshes as well
      if(!isWorkElementNew)
      {
        updateBillOfProcessProcessWorkElementList(updatedWorkElementWithAttributes);
      }

      setIsBillOfProcessProcessWorkElementChanged(true);
      console.log('WE Form Changes Made. Work Element New = ' + isWorkElementNew);
    }
  
  const fetchBillOfMaterialForPart = useCallback( async () => {
    const returnedBillOfMaterial = await fetchBillOfMaterialByPart(billOfProcessProcess.billOfProcess.part.partId?.toString());
    setBillOfMaterial(returnedBillOfMaterial ? returnedBillOfMaterial : {} as BillOfMaterialEntity);
  },[billOfProcessProcess.billOfProcess.part.partId]);

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
      // formSubmitHandler();
      formRef.current?.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      )
    }

    const modalSubmitCancelHandler = () =>
    {
      setShowSubmitFormModal(false);
    }

    const submitChangesHandler = () =>
    {
      if(!isBillOfProcessProcessWorkElementChanged || (isBillOfProcessProcessWorkElementChanged && billOfProcessProcessWorkElement && billOfProcessProcessWorkElement.billOfProcessProcessWorkElementId !== 0 && getWorkElementIsValid(billOfProcessProcessWorkElement)))
      {
        // Reset the isChanged and isNew states, as the user could cancel the modal dialog
        setIsBillOfProcessProcessWorkElementChanged(false);
        setIsWorkElementNew(false);

        // Only need to show the confirmation dialog if there have been changes.  Otherwise, just close the form.
        if(isBillOfProcessProcessWorkElementListChanged)
        {
          setShowSubmitFormModal(true);
        }
      }
    }

    const cancelChangesHandler = () =>
    {
      // Only need to show the confirmation dialog if there have been changes.  Otherwise, just close the form.
      if(isBillOfProcessProcessWorkElementListChanged)
      {
        setShowCancelFormModal(true);
      }
      else
      {
        navigate('..');
      }
    }

    // Hydrate the list of attribute types to be used in the setup components
    useEffect(() => {
        fetchBillOfMaterialForPart();
      }, [fetchBillOfMaterialForPart]);
      
    useEffect(() => {
        setBillOfProcessProcessWorkElementList(billOfProcessProcess.billOfProcessProcessWorkElements.sort((workElementA, workElementB) => workElementA.sequence - workElementB.sequence));
    }, [billOfProcessProcess.billOfProcessProcessWorkElements]);
    
    return (
      <Form method={props.method} className={classes.form} ref={formRef}>
        <input name="billOfProcessProcessWorkElementListData" type="hidden" value={JSON.stringify(billOfProcessProcessWorkElementList)} />        
        {showSubmitFormModal && <Modal showFromClient={showSubmitFormModal} children={modalDialogSubmitContent} allowBackdropClose={false} onCancel={modalSubmitCancelHandler} onOk={modalSubmitOkHandler}></Modal>}
        {showCancelFormModal && <Modal showFromClient={showCancelFormModal} children={modalDialogCancelContent} allowBackdropClose={false} onCancel={modalCancelCancelHandler} onOk={modalCancelOkHandler}></Modal>}
        <div className={classes.formLayout}>
          <div className={classes.workElementFormHeader}>
            <BillOfProcessWorkElementHeader 
              key={billOfProcessProcessWorkElement.billOfProcessProcessWorkElementId} 
              billOfProcessProcess={billOfProcessProcess}
              billOfProcessProcessWorkElement={billOfProcessProcessWorkElement}
              billOfProcessProcessWorkElementList={billOfProcessProcessWorkElementList} 
              isBillOfProcessProcessWorkElementChanged={isBillOfProcessProcessWorkElementChanged}
              isBillOfProcessProcessWorkElementNew={isWorkElementNew}
              isBillOfProcessProcessWorkElementValid={isWorkElementValid}
              workElementValidationErrors={workElementValidationErrors}
              onSetBillOfProcessWorkElement={updateWorkElementHandler} 
              onSaveActiveWorkElement={saveWorkElementHandler}/>
          </div>
          <div className={classes.workElementFormContainer}>
            {componentError !== undefined && componentError.message && componentError.message.length > 0 && <ErrorDisplay title={'Error'} message={componentError.message} />}
            {!isWorkElementValid && 
              <>
                <div className={classes.errorMessage}><b>The active work element is invalid.  Please correct the errors below and try again:</b>
                  <ul>
                    {workElementValidationErrors.map((error:any) => <li key={error.errorMessage}>{error.errorMessage}</li>)}
                  </ul>
                </div>
              </>
            }
            <div className={classes.workElementContainerOuter}>
              <div className={classes.workElementContainerLeft}>
                <p><b>Work Element List</b></p>
                <div className={classes.bopDetailProcessWorkElementListContainerOuter}>
                    <button className={classes.actionButton} onClick={workElementAddClickEventHandler}><BiAddToQueue size={18}  />Add</button>
                    <BillOfProcessDetailProcessWorkElementList 
                      billOfProcessProcess={billOfProcessProcess} 
                      billOfProcessProcessWorkElementList={billOfProcessProcessWorkElementList} 
                      selectedBillOfProcessProcesWorkElement={billOfProcessProcessWorkElement} 
                      isSortable={true} 
                      onWorkElementClicked={setBillOfProcessWorkElementHandler}
                      onWorkElementDeleteClicked={deleteBillOfProcessWorkElementHandler}
                      onWorkElementListSequenceChanged={updateBillOfProcessProcessWorkElementListSequence} />
                </div>
              </div>
              <div className={classes.workElementContainerTopRight}>
                <p><b>Setup</b></p>
                <div className={classes.bopDetailProcessWorkElementSetupContainerOuter}>
                  <BillOfProcessWorkElementSetup 
                    billOfProcessProcessWorkElement={billOfProcessProcessWorkElement} 
                    billOfProcessProcessWorkElementList={billOfProcessProcessWorkElementList}
                    workElementTypeAttributes={workElementTypeAttributes}
                    billOfMaterial={billOfMaterial}
                    onSaveActiveWorkElementAttributes={updateBillOfProcessProcessWorkElementAttributes} />
                </div>
              </div>
              <div className={classes.workElementContainerBottomRight}>
                <p><b>Preview</b></p>
                <div className={classes.bopDetailProcessWorkElementPreviewContainerOuter}>
                  <BillOfProcessWorkElementPreview billOfProcessProcessWorkElement={billOfProcessProcessWorkElement}
                    billOfMaterial={billOfMaterial}
                    billOfProcessProcessWorkElementList={billOfProcessProcessWorkElementList} 
                    />
                </div>
              </div>
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

export default BillOfProcessWorkElementForm;

export async function action({request, params}:LoaderFunctionArguments) {

  const formData = await request.formData();
  const postData = Object.fromEntries(formData);
  const billOfProcessProcessWorkElementList = JSON.parse(postData.billOfProcessProcessWorkElementListData.toString()) as BillOfProcessProcessWorkElementEntity[];
  
  if(billOfProcessProcessWorkElementList && billOfProcessProcessWorkElementList.length > 0)
  {

    // The BOP and BOP Process IDs are still available from loading the form
    const billOfProcessId = params.billOfProcessId;
    const billOfProcessProcessId = params.billOfProcessProcessId;
  
    if(billOfProcessId !== undefined && billOfProcessId.length > 0 && billOfProcessProcessId !== undefined && billOfProcessProcessId.length > 0 )
    {
      await postBillOfProcessWorkElementList(billOfProcessProcessId, billOfProcessProcessWorkElementList);
      return redirect('/inventory/billOfProcess/' + billOfProcessId);
    }
    else
    {
      return redirect('/inventory/billOfProcess');
    }
  }

  return redirect('/inventory/billOfProcess');  
}