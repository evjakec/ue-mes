import { Link, Form, redirect, useLoaderData } from 'react-router-dom';
import classes from './BillOfProcessForm.module.css'
import { LoaderFunctionArguments } from '../../../routes/types/LoaderFunctionArguments'
import { PartEntity } from '../../../models/part-entity';
import { BillOfProcessEntity } from '../../../models/bill-of-process-entity';
import { useContext, useEffect, useRef, useState } from 'react';
import {isValidDate} from '../../../ui/scripts/CommonFunctions'
import { postBillOfProcess } from '../../../ui/scripts/ApiFunctions';
import ErrorDisplay from '../../../ui/components/ErrorDisplay';
import { UserContext } from '../../../store/user-context';

const isPartObject = (loaderData:any): loaderData is PartEntity => {
    return (loaderData as PartEntity).partNumber !== undefined;
}

const isBillOfProcessObject = (loaderDataInput:any): loaderDataInput is BillOfProcessEntity => {
    return (loaderDataInput as BillOfProcessEntity).effectiveStartDate !== undefined;
}

const BillOfProcessForm:React.FC<{method:any}> = (props) => {
  // Context
  const {loggedInUser} = useContext(UserContext);
  
  const [billOfProcess, setBillOfProcess] = useState({description:'',lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : ''} as BillOfProcessEntity);  // empty description needed since the description input is controlled.  useEffect below will set it to the correct value
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
      if(isValidDate(effectiveStartDate) && isValidDate(effectivEndDate) && effectivEndDate < effectiveStartDate)
      {
        errorMessages.push({errorMessage:"The effective end date cannot be before the effective start date."});
      }
        
      setIsFormValid(errorMessages.length === 0);
      setFormValidationErrors(errorMessages);

      return errorMessages.length === 0;
    }

    const descriptionChangeHandler = (event:React.ChangeEvent<HTMLInputElement>) => {
      const updatedBillOfProcessWithDescription = {
        ...billOfProcess, 
        description:event.target.value,
        lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : ''
       };
      setBillOfProcess(updatedBillOfProcessWithDescription);
  }

  const submitButtonHandler = () =>
  {
      if(validateForm())
      {
          formSubmitHandler();
      }
  }

  const formSubmitHandler = ():void => {  
    postBillOfProcess(billOfProcess, new Date(enteredEffectiveStartDate), new Date(enteredEffectiveEndDate), isEditing).then(()=> {
        formRef.current?.dispatchEvent(
          new Event("submit", { cancelable: true, bubbles: true })
        )
      }).catch((fetchError) => {setComponentError(fetchError)});        
  }

    useEffect(() => {
      if(isBillOfProcessObject(loaderData))
        {
            const loadedBillOfProcess = loaderData as BillOfProcessEntity;
            setBillOfProcess(loadedBillOfProcess);
            setPart(loadedBillOfProcess.part);
            setEnteredEffectiveStartDate(loadedBillOfProcess.effectiveStartDate.toLocaleString());
            if(loadedBillOfProcess.effectiveEndDate)
            {
                setEnteredEffectiveEndDate(loadedBillOfProcess.effectiveEndDate.toLocaleString());
            }
            setIsEditing(true);
        }

        if(isPartObject(loaderData))
        {
            const part = loaderData as PartEntity;
            const newDefaultBillOfProcess = {
                name:'BOP'+part.partNumber.replace('PT','')+part.partRevision,
                description: part.description,
                part:part
            } as BillOfProcessEntity

            setPart(part);
            setBillOfProcess(newDefaultBillOfProcess);
            setIsEditing(false);
        }
    }, [loaderData]);
    
    return (
      <Form method={props.method} className={classes.form} ref={formRef}>
        <div className={classes.formLayout}>
            {componentError !== undefined && componentError.message && componentError.message.length > 0 && <ErrorDisplay title={'Error'} message={componentError.message} />}
            {isEditing && (<label htmlFor="billOfProcessId">ID</label>)}
            {isEditing && (<input type="number" id="billOfProcessId" name="billOfProcessId" readOnly={true} defaultValue={billOfProcess.billOfProcessId ? billOfProcess.billOfProcessId : ''} />)}
            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" maxLength={100} required readOnly={true} defaultValue={billOfProcess.name} />
            <label htmlFor="description">Description</label>
            <input type="text" id="description" name="description" maxLength={1000} required value={billOfProcess.description} onChange={descriptionChangeHandler} />
            <label htmlFor="partId">Part ID</label>
            <input type="text" id="partId" name="partId" maxLength={10} required readOnly={true} defaultValue={part ? part.partId : ''} />
            <label htmlFor="effectiveStartDate">Effective</label>
            <input id='effectiveStartDate' name='effectiveStartDate' type="datetime-local" className={classes.bopFormDate} value={enteredEffectiveStartDate} onChange={e => setEnteredEffectiveStartDate(e.target.value)}/>
            <span>  <b><br />to</b>  </span>
            <input id='effectiveEndDate' name='effectiveEndDate' type="datetime-local" className={classes.bopFormDate} value={enteredEffectiveEndDate} onChange={e => setEnteredEffectiveEndDate(e.target.value)}/>
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

export default BillOfProcessForm;

export async function action({params}:LoaderFunctionArguments) {
  const billOfProcessId = params.billOfProcessId ? params.billOfProcessId : '0';
  if(!isNaN(+billOfProcessId) && +billOfProcessId > 0)
  {
    return redirect('/inventory/billOfProcess/' + billOfProcessId);
  }

  return redirect('/inventory/billOfProcess');
}