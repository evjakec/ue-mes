import { useContext, useEffect, useState } from "react";
import { BillOfProcessProcessWorkElementEntity } from "../../../models/bill-of-process-process-work-element-entity";
import classes from './BillOfProcessWorkElementHeader.module.css'
import { WorkElementTypeEntity } from "../../../models/work-element-type-entity";
import { BillOfProcessProcessEntity } from "../../../models/bill-of-process-process-entity";
import { WorkElementSetupContext } from "../../../store/work-element-setup-context";

const BillOfProcessWorkElementHeader: React.FC<{billOfProcessProcess:BillOfProcessProcessEntity,
    billOfProcessProcessWorkElement:BillOfProcessProcessWorkElementEntity,
    billOfProcessProcessWorkElementList:BillOfProcessProcessWorkElementEntity[],
    isBillOfProcessProcessWorkElementChanged:boolean,
    isBillOfProcessProcessWorkElementNew:boolean,
    isBillOfProcessProcessWorkElementValid:boolean,
    workElementValidationErrors:{errorMessage:string}[],
    onSetBillOfProcessWorkElement:(updatedBillOfProcessProcessWorkElement:BillOfProcessProcessWorkElementEntity)=>void,
    onSaveActiveWorkElement:(billOfProcessProcessWorkElement:BillOfProcessProcessWorkElementEntity)=>void}> = (props) => {
    
    // Context
    const {workElementTypes} = useContext(WorkElementSetupContext);
    
    const [isWorkElementHydrated, setIsWorkElementHydrated] = useState(false);
    
    const selectedWorkElementTypeHandler = (selectedWorkElementTypeValue:string) => {
        const selectedWorkElementType = workElementTypes.find(workElementType => workElementType.name === selectedWorkElementTypeValue);
        props.onSetBillOfProcessWorkElement({...props.billOfProcessProcessWorkElement, workElementType: selectedWorkElementType ? selectedWorkElementType : {} as WorkElementTypeEntity});
    }

    const workElementHeaderSaveHandler = (buttonEvent:React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
    {
      buttonEvent.preventDefault();
      if(isWorkElementHydrated)
      {
        // Logic to check all required fields and required attributes are hydrated before allowing a save.  Otherwise, show validation errors.
        // will try to call this as a props method so that it can be handled in the form and use the same validation method as props.setBillOfProcessWorkElementHandler
        props.onSaveActiveWorkElement(props.billOfProcessProcessWorkElement);
      }
    }

    const nameChangeHandler = (event:React.ChangeEvent<HTMLInputElement>) => {
        props.onSetBillOfProcessWorkElement({...props.billOfProcessProcessWorkElement, name: event.target.value});        
    }

    const isRequiredChangeHandler = (event:React.ChangeEvent<HTMLInputElement>) => {
        props.onSetBillOfProcessWorkElement({...props.billOfProcessProcessWorkElement, isRequired: event.target.checked});
    }
    
    useEffect(() => {
        setIsWorkElementHydrated(props.billOfProcessProcessWorkElement && props.billOfProcessProcessWorkElement.billOfProcessProcessWorkElementId !== undefined && props.billOfProcessProcessWorkElement.billOfProcessProcessWorkElementId !== 0)
      }, [props.billOfProcessProcessWorkElement, props.billOfProcessProcessWorkElementList]);
      
    return (
      <>
        <div className={classes.bopProcessProcessWorkElementHeaderLayout}>
          <div className={classes.bopProcessProcessIdLabel}>BOP Process ID:</div>
          <div className={classes.bopProcessProcessIdValue}><input type="number" id="billOfProcessProcessId" name="billOfProcessProcessId" readOnly={true} defaultValue={props.billOfProcessProcess ? props.billOfProcessProcess.billOfProcessProcessId : ''} /></div>
          <div className={classes.bopProcessProcessWorkElementIdLabel}>Work Element ID:</div>
          <div className={classes.bopProcessProcessWorkElementIdValue}><input type="text" id="billOfProcessProcessWorkElementId" name="billOfProcessProcessWorkElementId" readOnly={true} defaultValue={props.billOfProcessProcessWorkElement.billOfProcessProcessWorkElementId && props.billOfProcessProcessWorkElement.billOfProcessProcessWorkElementId > 0 ? props.billOfProcessProcessWorkElement.billOfProcessProcessWorkElementId : props.billOfProcessProcessWorkElement.billOfProcessProcessWorkElementId < 0 ? 'New_' + (props.billOfProcessProcessWorkElement.billOfProcessProcessWorkElementId*-1) : ''} /></div>
          <div className={classes.bopProcessProcessWorkElementDetail}>
              <div className={classes.bopProcessProcessWorkElementDetailLabel}>Work Element Type:</div>
              <select id='workElementType' name='workElementType' value={props.billOfProcessProcessWorkElement.workElementType && props.billOfProcessProcessWorkElement.workElementType.name ? props.billOfProcessProcessWorkElement.workElementType.name : ''} onChange={e => selectedWorkElementTypeHandler(e.target.value)}>
                      <option> -- Select Type -- </option>
                      {workElementTypes.map((workElementTypeItem) => 
                      <option key={workElementTypeItem.workElementTypeId}
                          value={workElementTypeItem.name}>{workElementTypeItem.name}                    
                      </option>)}
                  </select>
              <div className={classes.bopProcessProcessWorkElementDetailLabel}>Name:</div>
              <div className={classes.bopProcessProcessWorkElementDetailValue}><input type="text" id="name" name="name" maxLength={500} value={props.billOfProcessProcessWorkElement.name} onChange={nameChangeHandler} /></div>
              <div className={classes.bopProcessProcessWorkElementDetailLabel}>Required:</div>
              <div className={classes.bopProcessProcessWorkElementDetailValue}><input type="checkbox" id="isRequired" name="isRequired" checked={props.billOfProcessProcessWorkElement.isRequired} onChange={isRequiredChangeHandler}  /></div>
              <div className={classes.bopProcessProcessWorkElementDetailValue}><button className={`${classes['btnSave']} ${!isWorkElementHydrated  ? classes['btnSaveDisabled'] : ''}`} type="button" onClick={workElementHeaderSaveHandler} disabled={!isWorkElementHydrated}>Save</button></div>
          </div>
        </div>
      </>);
}

export default BillOfProcessWorkElementHeader;