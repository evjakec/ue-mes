import { Form, redirect, useLoaderData, useNavigate } from 'react-router-dom';

import classes from './PartForm.module.css'
import { LoaderFunctionArguments } from '../../../routes/types/LoaderFunctionArguments'
import { PartEntity } from '../../../models/part-entity';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { UnitOfMeasureEntity } from '../../../models/unit-of-measure-entity';
import { fetchPartTypeData, fetchUnitOfMeasureData, postPart } from '../../../ui/scripts/ApiFunctions';
import { UserContext } from '../../../store/user-context';
import ErrorDisplay from '../../../ui/components/ErrorDisplay';
import { ItemAttributeTypeEntity } from '../../../models/item-attribute-type-entity';
import { PartItemAttributeTypeEntity } from '../../../models/part-item-attribute-type-entity';
import { BiAddToQueue, BiTrash } from 'react-icons/bi';

const isPartObject = (loaderData:any): loaderData is PartEntity => {
  return loaderData !== undefined && (loaderData as PartEntity).partNumber !== undefined;
}

const PartForm:React.FC<{method:any}> = (props) => {
  
  // Constants
  const navigate = useNavigate();
  const emptyPartEntity = useMemo(() => ({
    partId:0,
    partNumber:'',
    partRevision:'',
    description:'',
    partType:'',
    isActive:true,
    unitOfMeasure:{} as UnitOfMeasureEntity} as PartEntity),[]);

  // Context
  const {loggedInUser} = useContext(UserContext);

  // State
  const [partTypeOptions, setPartTypeOptions] =  useState([] as {key:number, value:string}[]);
  const [unitOfMeasureOptions, setUnitOfMeasureOptions] = useState([] as UnitOfMeasureEntity[]);
  const [part, setPart] = useState(emptyPartEntity);
  const [partNumberPrefix, setPartNumberPrefix] = useState('PT--');
  const [partNumberSuffix, setPartNumberSuffix] = useState('');
  const [partItemAttributeTypesList, setPartItemAttributeTypesList] = useState([] as PartItemAttributeTypeEntity[]);
  const [availableItemAttributeTypeList, setAvailableItemAttributeTypeList] = useState([] as ItemAttributeTypeEntity[]);
  const [selectedItemAttributeType, setSelectedItemAttributeType] = useState({} as ItemAttributeTypeEntity);
  const [isEditing, setIsEditing] = useState(false);
  const [isFormValid, setIsFormValid] = useState(true);
  const [formValidationErrors, setFormValidationErrors] = useState([] as {errorMessage:string}[]);
  const [componentError, setComponentError] = useState({} as Error);
  
  // const loaderData = useLoaderData();
  const [loadedPart, loadedItemAttributeTypes] = useLoaderData() as [PartEntity, ItemAttributeTypeEntity[]];
  let formRef = useRef<HTMLFormElement>(null);
  
  const validateForm = ():boolean => {
      let errorMessages = [];
      
      // Form validation for parts will just be checking that all fields have a value.
      if(partNumberSuffix === undefined || partNumberSuffix.length !== 5)
      {
        errorMessages.push({errorMessage:"Part number format must be \"PTXXYYYYY\" where YYYYY is a 5 digit numeric value."});
      }
    
      if(part.partRevision === undefined || part.partRevision.length === 0)
      {
        errorMessages.push({errorMessage:"You must enter a part revision."});
      }
    
      if(part.description === undefined || part.description.length === 0)
      {
        errorMessages.push({errorMessage:"You must enter a part description."});
      }
    
      if(part.partType === undefined || part.partType.length === 0)
      {
        errorMessages.push({errorMessage:"You must select a part type."});
      }
    
      if(part.unitOfMeasure === undefined || part.unitOfMeasure.unitOfMeasureId === undefined || part.unitOfMeasure.unitOfMeasureId < 0)
      {
        errorMessages.push({errorMessage:"You must select a unit of measure."});
      }
    
      setIsFormValid(errorMessages.length === 0);
      setFormValidationErrors(errorMessages);

    return errorMessages.length === 0;
  }

  const getPartItemAttributeTypeList = useCallback(() => {
    // If we have an existing part, then we need to load the attribute lists according to what is already assigned to the part.
    if(loadedPart && loadedPart.partId && loadedPart.partId > 0)
    {
      const currentPartItemAttributeTypeList = loadedPart.partItemAttributeTypes.map(partItemAttributeType => {
            return {...partItemAttributeType, part:{partId:loadedPart.partId} as PartEntity};
        });
      
        // On first load of the part order item attribute type list, we need to filter the available attribute types to only ones not already assigned to the part
        let availableItemAttributeTypeData = loadedItemAttributeTypes; // fetch these later
        availableItemAttributeTypeData = availableItemAttributeTypeData.filter(itemAttributeType => !loadedPart.partItemAttributeTypes.some(somePartItemAttributeType => somePartItemAttributeType.itemAttributeType.itemAttributeTypeId === itemAttributeType.itemAttributeTypeId));
        setPartItemAttributeTypesList(currentPartItemAttributeTypeList);
        setAvailableItemAttributeTypeList(availableItemAttributeTypeData);
    }
    else
    {
      // When the part is new, we simply set the available list to all attributes, and the part attribute list to empty
      setPartItemAttributeTypesList([]);
      setAvailableItemAttributeTypeList(loadedItemAttributeTypes);
    }
  },[loadedPart,loadedItemAttributeTypes]);

  const partNumberSuffixChangeHandler = (event:React.ChangeEvent<HTMLInputElement>) => {
    
    const updatedPartWithPartNumber = {
      ...part, 
      partNumber: partNumberPrefix + event.target.value,
      lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : '' };
    setPart(updatedPartWithPartNumber);
    setPartNumberSuffix(event.target.value);
  }

  const partNumberSuffixPaddingHandler = (event:React.ChangeEvent<HTMLInputElement>) => {
    
    const updatedPartNumberSuffix = event.target.value.padStart(5,'0');
    const updatedPartWithPartNumber = {
      ...part, 
      partNumber: partNumberPrefix + updatedPartNumberSuffix,
      lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : '' };
    setPart(updatedPartWithPartNumber);
    setPartNumberSuffix(updatedPartNumberSuffix);
  }
  const partRevisionChangeHandler = (event:React.ChangeEvent<HTMLInputElement>) => {
    const updatedPartWithPartRevision = {
      ...part, 
      partRevision:event.target.value,
      lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : '' };
    setPart(updatedPartWithPartRevision);
  }

  const partDescriptionChangeHandler = (event:React.ChangeEvent<HTMLInputElement>) => {
    const updatedPartWithPartDescription = {
      ...part, 
      description:event.target.value,
      lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : '' };
    setPart(updatedPartWithPartDescription);
  }

  const selectedPartTypeHandler = (event:React.ChangeEvent<HTMLSelectElement>) => {
      const partTypeFromList = partTypeOptions.find(partType => partType.value.toLocaleLowerCase() === event.target.value);
      if(partTypeFromList !== undefined)
      {
          const updatedPartNumberPrefix = 'PT' + partTypeFromList.key.toString().padStart(2,'0');
          const updatedPartWithPartType = {...part, 
            partType:partTypeFromList.value,
            partNumber: updatedPartNumberPrefix + partNumberSuffix,
            lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : '' };
          setPart(updatedPartWithPartType);
          setPartNumberPrefix(updatedPartNumberPrefix);
      }
  }

  const selectedUnitOfMeasureHandler = (event:React.ChangeEvent<HTMLSelectElement>) => {
      const unitOfMeasureFromList = unitOfMeasureOptions.find(unitOfMeasure => unitOfMeasure.unitOfMeasureId === +event.target.value);
      if(unitOfMeasureFromList !== undefined)
      {
          const updatedPartWithUnitOfMeasure = {...part, 
            unitOfMeasure:unitOfMeasureFromList,
            lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : '' };
          setPart(updatedPartWithUnitOfMeasure);
      }
  }

  const partIsActiveChangeHandler = (event:React.ChangeEvent<HTMLInputElement>) => {
    const updatedPartWithIsActive = {
      ...part, 
      isActive:event.target.checked,
      lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : '' };
    setPart(updatedPartWithIsActive);
  }

  const itemAttributeTypeDeleteClickEventHandler = (buttonEvent:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {

        // Prevent form submit
        buttonEvent.preventDefault();

        // First, we need to get the attribute by ID from the part attribute list so that we can move it back into the available attributes list
        const deletedPartItemAttributeType = partItemAttributeTypesList.find(partItemAttributeType => partItemAttributeType.itemAttributeType.itemAttributeTypeId && partItemAttributeType.itemAttributeType.itemAttributeTypeId.toString() === (buttonEvent.currentTarget.id));
        setAvailableItemAttributeTypeList(prevArray => [...prevArray, ...(deletedPartItemAttributeType !== undefined ? [deletedPartItemAttributeType.itemAttributeType] : [])]);

        // Then, we can remove it from the BOM part list
        const partItemAttributeTypesListFiltered = partItemAttributeTypesList.filter(partItemAttributeType => partItemAttributeType.itemAttributeType.itemAttributeTypeId && partItemAttributeType.itemAttributeType.itemAttributeTypeId.toString() !== buttonEvent.currentTarget.id);
        setPartItemAttributeTypesList(partItemAttributeTypesListFiltered);
  }

  const itemAttributeTypeAddClickEventHandler = (buttonEvent:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    
        // Prevent form submit
        buttonEvent.preventDefault();

        // Only run the logic when an attribute has been selected and not the default "Select Attribute" text
        if(selectedItemAttributeType && selectedItemAttributeType.itemAttributeTypeId && selectedItemAttributeType.itemAttributeTypeId > 0)
        {
            // When the add button is clicked, the selected attribute will be added to the part attribute list, and removed from the available attribute list.
            // By the time the button is clicked, the selectedPart will already be assigned from the select event handler.
            // We can go ahead and add it to the array
            const addedPartItemAttributeType = {part:part, 
              itemAttributeType:selectedItemAttributeType, 
              isRequired:true,
              lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : '' } as PartItemAttributeTypeEntity;
            setPartItemAttributeTypesList(prevArray => [...prevArray, addedPartItemAttributeType]);
            
            // Then, we'll remove it from the list of available parts, since it has been assigned
            setAvailableItemAttributeTypeList(prevArray => prevArray.filter(item => item.itemAttributeTypeId !== selectedItemAttributeType.itemAttributeTypeId));

            // Finally, set the selected attribute back to empty to prepare for the next item.
            setSelectedItemAttributeType({} as ItemAttributeTypeEntity);
        }
  }

  const partItemAttributeTypeCheckedEventHandler = (event:React.ChangeEvent<HTMLInputElement>) => {
    setPartItemAttributeTypesList(partItemAttributeTypesList.map(partItemAttributeType => {
      if (partItemAttributeType.itemAttributeType.itemAttributeTypeId && partItemAttributeType.itemAttributeType.itemAttributeTypeId.toString() === event.target.id) {
        return { ...partItemAttributeType, 
          isRequired:event.target.checked,
          lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : ''  };
      } else {
        return partItemAttributeType;
      }
    }));
  }

  const selectedItemAttributeTypeHandler = (selectedItemAttributeTypeId:string) => {
    // In this handler, we will simply set the selectedItemAttributeType
    // There will be a button next to the drop down for the user to add it to the part order item attribute type list. 
    const selectedItemAttributeTypeObject = availableItemAttributeTypeList.find(itemAttributeType => itemAttributeType.itemAttributeTypeId?.toString() === selectedItemAttributeTypeId);
    if(selectedItemAttributeTypeObject)
    {
        setSelectedItemAttributeType(selectedItemAttributeTypeObject);
    }
}

  const submitButtonHandler = () =>
    {
        if(validateForm())
        {
            formSubmitHandler();
        }
    }

    const cancelChangesHandler = () =>
    {
      navigate('..');
    }

  const formSubmitHandler = ():void => {
      const partWithAttributes = {...part, partItemAttributeTypes:partItemAttributeTypesList};

      postPart(partWithAttributes).then(()=> {
      formRef.current?.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      )
    }).catch((fetchError) => {setComponentError(fetchError)});              
  }

  useEffect(() => {
    fetchPartTypeData().then((partTypesResult) => {
      setPartTypeOptions(partTypesResult);
    });
    fetchUnitOfMeasureData().then((unitOfMeasuresResult) => {
      setUnitOfMeasureOptions(unitOfMeasuresResult);
    });
  }, []);
    
  useEffect(() => {
    if(isPartObject(loadedPart))
    {
      // Hydrate the part object, but also the prefix and suffix of the part number
      setPart(loadedPart);
      setPartNumberPrefix('PT' + loadedPart.partNumber.substring(2,4))
      setPartNumberSuffix(loadedPart.partNumber.substring(4,9))
      setIsEditing(true);
    }
    else
    {
      setPart(emptyPartEntity);
      setIsEditing(false);
    }
    }, [loadedPart, emptyPartEntity]);
    
    useEffect(() => {
      getPartItemAttributeTypeList();
    }, [getPartItemAttributeTypeList]);
    
    return (
      <Form method={props.method} className={classes.form} ref={formRef}>
          {componentError !== undefined && componentError.message && componentError.message.length > 0 && <ErrorDisplay title={'Error'} message={componentError.message} />}    
        <div className={classes.partFormGridContainer}>
          {!isFormValid && 
            <>
              <div className={classes.errorMessage}><b>The form is invalid.  Please correct the errors below and try again:</b>
                <ul>
                  {formValidationErrors.map((error:any) => <li key={error.errorMessage}>{error.errorMessage}</li>)}
                </ul>
              </div>
            </>}
          {isEditing && (<label htmlFor="partId">Part ID</label>)}
          {isEditing && (<input type="number" id="partId" name="partId" readOnly={true} defaultValue={part ? part.partId : ''} />)}
          <label htmlFor="partType">Part Type</label>
          <select id='partType' name='partType' value={part.partType.toLocaleLowerCase()} onChange={selectedPartTypeHandler}>
              <option> -- Select Part Type -- </option>
              {partTypeOptions.map((partTypeItem) => 
              <option key={partTypeItem.key}
                  value={partTypeItem.value.toLocaleLowerCase()}>{partTypeItem.value}                    
              </option>)}
          </select>
          <label htmlFor="partNumber">Part Number</label>
          {/* <input type="text" id="partNumber" name="partNumber" maxLength={20} required readOnly={isEditing} value={part.partNumber} onChange={partNumberChangeHandler} /> */}
          <div className={classes.partNumberLabelAndInput}><label htmlFor="partNumberPrefix">{partNumberPrefix}</label><input type="text" id="partNumberSuffix" name="partNumberSuffix" maxLength={5} required readOnly={isEditing} value={partNumberSuffix} onChange={partNumberSuffixChangeHandler} onBlur={partNumberSuffixPaddingHandler} /></div>
          <label htmlFor="partRevision">Part Revision</label>
          <input type="text" id="partRevision" name="partRevision" maxLength={1} required readOnly={isEditing} value={part.partRevision} onChange={partRevisionChangeHandler} />
          <label htmlFor="description">Description</label>
          <input type="text" id="description" name="description" maxLength={1000} required  value={part.description} onChange={partDescriptionChangeHandler} />
          <label htmlFor="isActive">Active</label>
          <input type="checkbox" id="isActive" name="isActive" checked={part.isActive} onChange={partIsActiveChangeHandler} />
          <label htmlFor="unitOfMeasure">Unit of Measure</label>
          <select id='unitOfMeasure' name='unitOfMeasure' value={part && part.unitOfMeasure ? part.unitOfMeasure.unitOfMeasureId : ''} onChange={selectedUnitOfMeasureHandler}>
            <option> -- Select Unit Of Measure -- </option>
            {unitOfMeasureOptions.map((unitOfMeasureItem) => 
                <option key={unitOfMeasureItem.unitOfMeasureId}
                    value={unitOfMeasureItem.unitOfMeasureId}>{unitOfMeasureItem.name + ' (' + unitOfMeasureItem.shortName + ')'}
                </option>)
            }
          </select>
          <div className={classes.partItemAttributeTypeListContainer}>
            <div className={classes.partItemAttributeTypeListHeader}>
                <div></div>
                <div>Required</div>
                <div>Attribute</div>
            </div>
            <div className={classes.partItemAttributeTypeAddContainerOuter}>
                <div className={classes.partItemAttributeTypeContainer}>
                    {partItemAttributeTypesList.map((partItemAttributeType) => 
                        <div key={partItemAttributeType.itemAttributeType.itemAttributeTypeId} className={classes.partItemAttributeTypeContainerItem}>
                                <div>
                                    <button id={partItemAttributeType.itemAttributeType.itemAttributeTypeId?.toString()} type='button' className={classes.actionButton} onClick={itemAttributeTypeDeleteClickEventHandler}><BiTrash size={18}  />Delete</button>
                                </div>
                                <div className={classes.centeredDiv}>
                                    <input key={partItemAttributeType.itemAttributeType.itemAttributeTypeId} type="checkbox" id={partItemAttributeType.itemAttributeType.itemAttributeTypeId?.toString()} name="isRequired" checked={partItemAttributeType.isRequired} onChange={partItemAttributeTypeCheckedEventHandler} /> 
                                </div>
                                <div>
                                    {partItemAttributeType.itemAttributeType.name}
                                </div>
                        </div>
                    )}
                </div>
            </div>
          </div>
          <div className={classes.partItemAttributeTypeAddContainer}>
              <div className={classes.partItemAttributeTypeAddContainerLabel}><b>Add Attribute:</b></div>
              <select id='itemAttributeType' name='itemAttributeType' value={selectedItemAttributeType && selectedItemAttributeType.itemAttributeTypeId ? selectedItemAttributeType.itemAttributeTypeId : ''} onChange={e => selectedItemAttributeTypeHandler(e.target.value)}>
                  <option> -- Select Attribute -- </option>
                  {availableItemAttributeTypeList.map((availableItemAttributeType) => 
                  <option key={availableItemAttributeType.itemAttributeTypeId}
                      value={availableItemAttributeType.itemAttributeTypeId}>{availableItemAttributeType.name}                    
                  </option>)}
              </select>  
              <button className={classes.actionButton} onClick={itemAttributeTypeAddClickEventHandler}><BiAddToQueue size={18}  />Add</button>
          </div>
          <div className={classes.actions}>
                  <button type='button' className={classes.cancelButton} onClick={cancelChangesHandler}>Cancel</button>
                  <button type='button' className={classes.submitButton} onClick={submitButtonHandler}>Submit Changes and Exit</button>
          </div>
        </div>
      </Form>
  );
}

export default PartForm;

export async function action({request, params}:LoaderFunctionArguments) {

  return redirect('/inventory/part');
}
