import {Form, redirect, useLocation } from 'react-router-dom';
import classes from './SupplierForm.module.css'
import { LoaderFunctionArguments } from '../../../routes/types/LoaderFunctionArguments'
import { useContext, useRef, useState } from 'react';
import Modal from '../../../ui/components/Modal';
import { postAddSupplier } from '../../../ui/scripts/ApiFunctions';
import ErrorDisplay from '../../../ui/components/ErrorDisplay';
import { SupplierEntity } from '../../../models/supplier-entity';
import LoadingModal from '../../../ui/components/LoadingModal';
import { UserContext } from '../../../store/user-context';

const SupplierForm:React.FC<{method:any,
    onSupplierAddCompleteHandler?:(supplierName:string)=>void,
    onSupplierAddCancelHandler?:()=>void}> = (props) => {

    const routeLocation = useLocation();

    // Context
    const {loggedInUser} = useContext(UserContext);
  
    let formRef = useRef<HTMLFormElement>(null);
    const modalDialogSubmitContent = <div className={classes.confirmationModal}><p>Clicking <b>OK</b> will save this new supplier and return to the previous screen.  Continue?</p></div>;
        
    const [supplierEntry, setSupplierEntry] = useState(
        {
            supplierId:0,
            name:'',
            address:'',
            city:'',
            stateOrProvince:'',
            postalCode:'',
            country:'',
            phoneNumber:'',
            emailAddress:'',
            contactName:'',
            isActive:true,
            lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : ''
        } as SupplierEntity);

    const [supplierValidationErrors, setSupplierValidationErrors] = useState([] as {errorMessage:string}[]);
    const [isSupplierFormValid, setIsSupplierFormValid] = useState(true);
    const [showSubmitFormModal, setShowSubmitFormModal] = useState(false);
    const [isFromMainRoute] = useState(!routeLocation.pathname.includes('receive-new-inventory')); // if coming from the receive inventory modal, we need to call a props method in the parent modal.
    const [componentError, setComponentError] = useState({} as Error);
    const [isLoading, setIsLoading] = useState(false);
  
    const getSupplierFormIsValid = ():boolean => {
        // The form is valid when all required fields have been entered and the item quantity is > 0
        let currentValidationErrors =  [] as {errorMessage:string}[];
  
        if(!supplierEntry.name || supplierEntry.name.length === 0)
        {
          currentValidationErrors = [...currentValidationErrors, {errorMessage:'You must provide a name for the supplier.'}];
        }

        if(!supplierEntry.emailAddress || supplierEntry.emailAddress.length === 0)
        {
          currentValidationErrors = [...currentValidationErrors, {errorMessage:'You must provide an email address for the supplier.'}];
        }

        // simple email validation for now, will enhance later
        if(supplierEntry.emailAddress && supplierEntry.emailAddress.length > 0 && (!supplierEntry.emailAddress.includes('@') || !supplierEntry.emailAddress.includes('.') ) )
        {
          currentValidationErrors = [...currentValidationErrors, {errorMessage:'The email address is not in a valid email format.'}];
        }

        setIsSupplierFormValid(currentValidationErrors.length === 0);
        setSupplierValidationErrors(currentValidationErrors);
  
        return currentValidationErrors.length === 0;
      }

    const nameChangeHandler = (event:React.ChangeEvent<HTMLInputElement>) => {
        const updatedSupplier = {...supplierEntry, name:event.currentTarget.value};
        setSupplierEntry(updatedSupplier);
    }

    const addressChangeHandler = (event:React.ChangeEvent<HTMLTextAreaElement>) => {
        const updatedSupplier = {...supplierEntry, address:event.currentTarget.value};
        setSupplierEntry(updatedSupplier);
    }

    const cityChangeHandler = (event:React.ChangeEvent<HTMLInputElement>) => {
        const updatedSupplier = {...supplierEntry, city:event.currentTarget.value};
        setSupplierEntry(updatedSupplier);
    }

    const stateOrProvinceChangeHandler = (event:React.ChangeEvent<HTMLInputElement>) => {
        const updatedSupplier = {...supplierEntry, stateOrProvince:event.currentTarget.value};
        setSupplierEntry(updatedSupplier);
    }

    const countryChangeHandler = (event:React.ChangeEvent<HTMLInputElement>) => {
        const updatedSupplier = {...supplierEntry, country:event.currentTarget.value};
        setSupplierEntry(updatedSupplier);
    }

    const postalCodeChangeHandler = (event:React.ChangeEvent<HTMLInputElement>) => {
        const updatedSupplier = {...supplierEntry, postalCode:event.currentTarget.value};
        setSupplierEntry(updatedSupplier);
    }

    const phoneNumberChangeHandler = (event:React.ChangeEvent<HTMLInputElement>) => {
        const updatedSupplier = {...supplierEntry, phoneNumber:event.currentTarget.value};
        setSupplierEntry(updatedSupplier);
    }

    const emailChangeHandler = (event:React.ChangeEvent<HTMLInputElement>) => {
        const updatedSupplier = {...supplierEntry, emailAddress:event.currentTarget.value};
        setSupplierEntry(updatedSupplier);
    }

    const contactNameChangeHandler = (event:React.ChangeEvent<HTMLInputElement>) => {
        const updatedSupplier = {...supplierEntry, contactName:event.currentTarget.value};
        setSupplierEntry(updatedSupplier);
    }

    const isActiveChangeHandler = (event:React.ChangeEvent<HTMLInputElement>) => {
        const updatedSupplier = {...supplierEntry, isActive:event.currentTarget.checked};
        setSupplierEntry(updatedSupplier);
    }
    
    const formSubmitHandler = ():void => {
        
        postAddSupplier(supplierEntry).then(()=> {
            formRef.current?.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true })
            );
        }).catch((fetchError) => {setComponentError(fetchError)});        
    }

    const modalSubmitHandler = ():void => {        
        setIsLoading(true);
        postAddSupplier(supplierEntry).then(()=> {
            setIsLoading(false);
            props.onSupplierAddCompleteHandler && props.onSupplierAddCompleteHandler(supplierEntry.name);
        }).catch((fetchError) => {
            setComponentError(fetchError);
            setIsLoading(false);
        });        
    }

    const modalSubmitOkHandler = () =>
    {
        setShowSubmitFormModal(false);

        if(isFromMainRoute) {
            formSubmitHandler();
        }
        else {
            modalSubmitHandler();
        }
    }
  
    const modalSubmitCancelHandler = () =>
    {
        setShowSubmitFormModal(false);
    }
    
    const submitChangesHandler = () =>
    {
        // Only show the submit dialog when there are no validation errors.
        if(getSupplierFormIsValid())
        {
            setShowSubmitFormModal(true);
        }
    }

    const cancelChangesHandler = () =>
    {
        props.onSupplierAddCancelHandler && props.onSupplierAddCancelHandler();
    }
        
    return (
      <Form method={props.method} className={classes.form} ref={formRef}>
        {showSubmitFormModal && <Modal showFromClient={showSubmitFormModal} children={modalDialogSubmitContent} allowBackdropClose={false} onCancel={modalSubmitCancelHandler} onOk={modalSubmitOkHandler}></Modal>}
        {isLoading && <LoadingModal />}
        {componentError !== undefined && componentError.message && componentError.message.length > 0 && <ErrorDisplay title={'Error'} message={componentError.message} />}
        <div className={classes.supplierGridContainer}>
            {!isSupplierFormValid && 
                <div className={classes.errorMessage}><b>The form is invalid.  Please correct the errors below and try again:</b>
                    <ul>
                        {supplierValidationErrors.map((error:any) => <li key={error.errorMessage}>{error.errorMessage}</li>)}
                    </ul>
                </div>
            }
            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" value={supplierEntry.name} onChange={nameChangeHandler} />
            <label htmlFor="email">Email</label>
            <input type="text" id="email" name="email" value={supplierEntry.emailAddress} onChange={emailChangeHandler} />
            <label htmlFor="address">Address</label>
            <textarea id="address" name="address" rows={2} maxLength={600} value={supplierEntry.address} onChange={addressChangeHandler} />
            <label htmlFor="city">City</label>
            <input type="text" id="city" name="city" value={supplierEntry.city} onChange={cityChangeHandler} />
            <label htmlFor="stateOrProvince">State or Province</label>
            <input type="text" id="stateOrProvince" name="stateOrProvince" value={supplierEntry.stateOrProvince} onChange={stateOrProvinceChangeHandler} />
            <label htmlFor="postalCode">Postal Code</label>
            <input type="text" id="postalCode" name="postalCode" value={supplierEntry.postalCode} onChange={postalCodeChangeHandler} />
            <label htmlFor="country">Country</label>
            <input type="text" id="country" name="country" value={supplierEntry.country} onChange={countryChangeHandler} />
            <label htmlFor="phoneNumber">Phone Number</label>
            <input type="text" id="phoneNumber" name="phoneNumber" value={supplierEntry.phoneNumber} onChange={phoneNumberChangeHandler} />
            <label htmlFor="contactName">Contact Name</label>
            <input type="text" id="contactName" name="contactName" value={supplierEntry.contactName} onChange={contactNameChangeHandler} />
            <label htmlFor="isActive">Active</label>
            <input type="checkbox" id="isActive" name="isActive" checked={supplierEntry.isActive} onChange={isActiveChangeHandler}  />
            <div className={classes.actions}>
                <button type='button' className={classes.cancelButton} onClick={cancelChangesHandler}>Cancel</button>
                <button type='button' className={classes.submitButton} onClick={submitChangesHandler}>Add Supplier</button>
            </div>
        </div>
      </Form>
  );
}

export default SupplierForm;

export async function action({request, params}:LoaderFunctionArguments) {
  return redirect('..');
}
