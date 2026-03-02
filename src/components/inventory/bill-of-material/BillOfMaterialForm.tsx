import { Link, Form, redirect, useLoaderData } from 'react-router-dom';

import classes from './BillOfMaterialForm.module.css'
import { LoaderFunctionArguments } from '../../../routes/types/LoaderFunctionArguments'
import { PartEntity } from '../../../models/part-entity';
import { useContext, useEffect, useRef, useState } from 'react';
import { BillOfMaterialEntity } from '../../../models/bill-of-material-entity';
import { isValidDate } from '../../../ui/scripts/CommonFunctions';
import { postBillOfMaterial } from '../../../ui/scripts/ApiFunctions';
import ErrorDisplay from '../../../ui/components/ErrorDisplay';
import { UserContext } from '../../../store/user-context';

const isPartObject = (loaderData:any): loaderData is PartEntity => {
    return (loaderData as PartEntity).partNumber !== undefined;
}

const isBillOfMateralObject = (loaderDataInput:any): loaderDataInput is BillOfMaterialEntity => {
    return (loaderDataInput as BillOfMaterialEntity).effectiveStartDate !== undefined;
}

const BillOfMateralForm:React.FC<{method:any}> = (props) => {
    
    // Context
    const {loggedInUser} = useContext(UserContext);
  
    const [billOfMaterial, setBillOfMaterial] = useState({description:'',lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : ''} as BillOfMaterialEntity);  // empty description needed since the description input is controlled.  useEffect below will set it to the correct value
    const [part, setPart] = useState({} as PartEntity);
    const [isFormValid, setIsFormValid] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formValidationErrors, setFormValidationErrors] = useState([] as {errorMessage:string}[]);
    const [enteredEffectiveStartDate, setEnteredEffectiveStartDate] = useState('');
    const [enteredEffectiveEndDate, setEnteredEffectiveEndDate] = useState('');
    const [componentError, setComponentError] = useState({} as Error);
    
    const loaderData = useLoaderData();
    let formRef = useRef<HTMLFormElement>(null);

    const validateForm = ():boolean => {
        let errorMessages = [];
        
        const effectiveStartDate = new Date(enteredEffectiveStartDate);
        const effectivEndDate = new Date(enteredEffectiveEndDate);

        // First check for a valid start date.
        if(!isValidDate(effectiveStartDate))
        {
          errorMessages.push({errorMessage:"The effective start date is a required field."});
        }
      
        // if start date is valid, also verify that the end date is either not entered (assumes no end date) or is not before the start date
        if(isValidDate(effectivEndDate) && isValidDate(effectiveStartDate) && effectivEndDate < effectiveStartDate)
        {
          errorMessages.push({errorMessage:"The effective end date cannot be before the effective start date."});
        }
        
        setIsFormValid(errorMessages.length === 0);
        setFormValidationErrors(errorMessages);

      return errorMessages.length === 0;
    }
    
    const descriptionChangeHandler = (event:React.ChangeEvent<HTMLInputElement>) => {
        const updatedBillOfMaterialWithDescription = {
          ...billOfMaterial, 
          description:event.target.value,
          lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : '' };
        setBillOfMaterial(updatedBillOfMaterialWithDescription);
    }

    const submitButtonHandler = () =>
    {
        if(validateForm())
        {
            formSubmitHandler();
        }
    }

    const formSubmitHandler = ():void => {  
      postBillOfMaterial(billOfMaterial, new Date(enteredEffectiveStartDate), new Date(enteredEffectiveEndDate), isEditing).then(()=> {
          formRef.current?.dispatchEvent(
            new Event("submit", { cancelable: true, bubbles: true })
          )
        }).catch((fetchError) => {setComponentError(fetchError)});        
    }

    useEffect(() => {
        if(isBillOfMateralObject(loaderData))
        {
            const loadedBillOfMaterial = loaderData as BillOfMaterialEntity;
            setBillOfMaterial(loadedBillOfMaterial);
            setPart(loadedBillOfMaterial.part);
            setEnteredEffectiveStartDate(loadedBillOfMaterial.effectiveStartDate.toLocaleString());
            if(loadedBillOfMaterial.effectiveEndDate)
            {
                setEnteredEffectiveEndDate(loadedBillOfMaterial.effectiveEndDate.toLocaleString());
            }
            setIsEditing(true);
        }

        if(isPartObject(loaderData))
        {
            const part = loaderData as PartEntity;
            const newDefaultBillOfMaterial = {
                name:'BOM'+part.partNumber.replace('PT','')+part.partRevision,
                description: part.description,
                part:part
            } as BillOfMaterialEntity

            setPart(part);
            setBillOfMaterial(newDefaultBillOfMaterial);
            setIsEditing(false);
        }
    }, [loaderData]);
    
    return (
      <Form method={props.method} className={classes.form} ref={formRef}>
        <div className={classes.formLayout}>
            {componentError !== undefined && componentError.message && componentError.message.length > 0 && <ErrorDisplay title={'Error'} message={componentError.message} />}    
            {isEditing && (<label htmlFor="billOfMaterialId">ID</label>)}
            {isEditing && (<input type="number" id="billOfMaterialId" name="billOfMaterialId" readOnly={true} defaultValue={billOfMaterial.billOfMaterialId ? billOfMaterial.billOfMaterialId : ''} />)}
            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" maxLength={100} required readOnly={true} defaultValue={billOfMaterial.name} />
            <label htmlFor="description">Description</label>
            {/* <input type="text" id="description" name="description" maxLength={1000} required defaultValue={billOfMaterial.description} /> */}
            <input type="text" id="description" name="description" maxLength={1000} required value={billOfMaterial.description} onChange={descriptionChangeHandler} />
            <label htmlFor="partId">Part ID</label>
            <input type="text" id="partId" name="partId" maxLength={10} required readOnly={true} defaultValue={part ? part.partId : ''} />
            <label htmlFor="effectiveStartDate">Effective</label>
            <input id='effectiveStartDate' name='effectiveStartDate' type="datetime-local" className={classes.bomFormDate} value={enteredEffectiveStartDate} onChange={e => setEnteredEffectiveStartDate(e.target.value)}/>
            <span>  <b><br />to</b>  </span>
            <input id='effectiveEndDate' name='effectiveEndDate' type="datetime-local" className={classes.bomFormDate} value={enteredEffectiveEndDate} onChange={e => setEnteredEffectiveEndDate(e.target.value)}/>
            <p className={classes.actions}>
                <Link to=".." type="button" state={{part: part}}>
                    Cancel
                </Link>
                <button type='button' className={classes.button} onClick={submitButtonHandler}>Submit</button>
            </p>
            {!isFormValid && 
              <>
                <div className={classes.errorMessage}><b>The form is invalid.  Please correct the errors below and try again:</b>
                  <ul>
                    {formValidationErrors.map((error:any) => <li key={error.errorMessage}>{error.errorMessage}</li>)}
                  </ul>
                </div>
              </>}
        </div>
      </Form>
  );
}

export default BillOfMateralForm;

export async function action({params}:LoaderFunctionArguments) {
  const billOfMaterialId = params.billOfMaterialId ? params.billOfMaterialId : '0';
  if(!isNaN(+billOfMaterialId) && +billOfMaterialId > 0)
  {
    return redirect('/inventory/billOfMaterial/' + billOfMaterialId);
  }

  // TODO: Handle bad responses here
  return redirect('/inventory/billOfMaterial');
}