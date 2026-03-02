import { useCallback, useEffect, useMemo, useState } from "react";
import { BillOfProcessProcessWorkElementAttributeEntity } from "../../../models/bill-of-process-process-work-element-attribute-entity";
import classes from './BillOfProcessWorkElementSetupDataCollection.module.css'
import { BillOfProcessProcessWorkElementEntity } from "../../../models/bill-of-process-process-work-element-entity";
import { WorkElementTypeAttributeEntity } from "../../../models/work-element-type-attribute-entity";
import { BiAddToQueue, BiTrash } from "react-icons/bi";

const BillOfProcessWorkElementSetupDataCollection: React.FC<{billOfProcessProcessWorkElement:BillOfProcessProcessWorkElementEntity,
    billOfProcessProcessWorkElementAttributes:BillOfProcessProcessWorkElementAttributeEntity[],
    workElementTypeAttributes:WorkElementTypeAttributeEntity[],
    onWorkElementAttributesUpdated:(updatedBillOfProcessProcessWorkElementAttributes:BillOfProcessProcessWorkElementAttributeEntity[])=>void }> = (props) => {
    
    // will likely move these into context at some point.  For now, using state
    const [textWorkElementAttribute, setTextWorkElementAttribute] = useState({} as WorkElementTypeAttributeEntity);
    const [dataCollectionWorkElementAttributes, setDataCollectionWorkElementAttributes] = useState([] as WorkElementTypeAttributeEntity[]);
    
    // temporary state for selected attribute in the drop down list
    const [selectedDataCollectionWorkElementAttribute, setSelectedDataCollectionWorkElementAttribute] = useState({} as WorkElementTypeAttributeEntity);

    const getWorkElementTypeAttributeData = useCallback(() => {
        const dataCollectionWorkElementAttributesFromProps = props.workElementTypeAttributes.filter(workElementAttributeType => workElementAttributeType.workElementType.name === 'Data Collection');
        const textWorkElementAttributeFromResData = dataCollectionWorkElementAttributesFromProps.find(workElementAttribute => workElementAttribute.name === "Work Element Text");
        
        // On first load of the work element type attributes, we need to filter out any that are already assigned to the work element
        let dataCollectionWorkElementAttributeFromResData = dataCollectionWorkElementAttributesFromProps.filter(workElementAttribute => workElementAttribute.name !== "Work Element Text");
        dataCollectionWorkElementAttributeFromResData = dataCollectionWorkElementAttributeFromResData.filter(workElementAttribute => !props.billOfProcessProcessWorkElementAttributes.some(propWorkElementAttribute => propWorkElementAttribute.workElementTypeAttribute.workElementTypeAttributeId === workElementAttribute.workElementTypeAttributeId))
        setTextWorkElementAttribute(textWorkElementAttributeFromResData ? textWorkElementAttributeFromResData : {} as WorkElementTypeAttributeEntity);
        setDataCollectionWorkElementAttributes(dataCollectionWorkElementAttributeFromResData ? dataCollectionWorkElementAttributeFromResData : [] as WorkElementTypeAttributeEntity[]);
    },[props.workElementTypeAttributes,props.billOfProcessProcessWorkElementAttributes]);
    
    // Default work element is used to reset the header controls after an item is added or edited.
    const emptyWorkElementAttributeWithParentWorkElement = useMemo(() => ({
        billOfProcessProcessWorkElementAttributeId:0,
        billOfProcessWorkElement:props.billOfProcessProcessWorkElement,
        workElementTypeAttribute:{} as WorkElementTypeAttributeEntity,
        attributeValue:''
      } as BillOfProcessProcessWorkElementAttributeEntity),[props.billOfProcessProcessWorkElement]);
    
    const emptyTextWorkElementAttributeWithParentWorkElement = useMemo(() => ({...emptyWorkElementAttributeWithParentWorkElement, workElementTypeAttribute:textWorkElementAttribute}),[emptyWorkElementAttributeWithParentWorkElement,textWorkElementAttribute]);
      
    const [workElementAttributeText, setWorkElementAttributeText] = useState(emptyTextWorkElementAttributeWithParentWorkElement);
    const [workElementAttributesDataCollection, setWorkElementAttributesDataCollection] = useState([] as BillOfProcessProcessWorkElementAttributeEntity[]);
      
    const workElementTextAttribute            = props.billOfProcessProcessWorkElementAttributes && props.billOfProcessProcessWorkElementAttributes.find(workElementAttribute => workElementAttribute.workElementTypeAttribute.name === 'Work Element Text') ? props.billOfProcessProcessWorkElementAttributes.find(workElementAttribute => workElementAttribute.workElementTypeAttribute.name === 'Work Element Text') : emptyTextWorkElementAttributeWithParentWorkElement;
    const workElementDataCollectionAttributes = useMemo(() => (props.billOfProcessProcessWorkElementAttributes && props.billOfProcessProcessWorkElementAttributes.filter(workElementAttribute => workElementAttribute.workElementTypeAttribute.name !== 'Work Element Text') ? props.billOfProcessProcessWorkElementAttributes.filter(workElementAttribute => workElementAttribute.workElementTypeAttribute.name !== 'Work Element Text') : []),[props.billOfProcessProcessWorkElementAttributes]);
      
    const workElementAttributeTextChangeHandler = (event:React.ChangeEvent<HTMLTextAreaElement>) => {
        setWorkElementAttributeText(prevAttribute => ({...prevAttribute, attributeValue:event.target.value}));
        const updatedWorkElementAttribute = {...workElementTextAttribute, attributeValue:event.target.value, workElementTypeAttribute:textWorkElementAttribute};
        props.onWorkElementAttributesUpdated([...workElementDataCollectionAttributes, updatedWorkElementAttribute] as BillOfProcessProcessWorkElementAttributeEntity[]);
        // props.onSetBillOfProcessWorkElement({...props.billOfProcessProcessWorkElement, name: event.target.value});
    } 

    const selectedWorkElementTypeAttributeHandler = (selectedWorkElementTypeAttributeValue:string) => {
        // In this handler, we will simply set the selectedDataCollectionWorkElementAttribute
        // There will be a button next to the drop down for the user to add it to the list of assigned attributes. 
        const selectedWorkElementTypeAttribute = dataCollectionWorkElementAttributes.find(workElementAttribute => workElementAttribute.name === selectedWorkElementTypeAttributeValue);
        if(selectedWorkElementTypeAttribute)
        {
            setSelectedDataCollectionWorkElementAttribute(selectedWorkElementTypeAttribute);
        }
    }
    
    const workElementAttributeAddClickEventHandler = (buttonEvent:React.MouseEvent<HTMLButtonElement, MouseEvent>):void => {
        
        // Prevent form submit
        buttonEvent.preventDefault();
        
        // Only run the logic when an attribute has been selected and not the default "Select Data Collection Attribute" text
        if(selectedDataCollectionWorkElementAttribute && selectedDataCollectionWorkElementAttribute.workElementTypeAttributeId > 0)
        {
            // When the add button is clicked, the selected attribute will be added to the list of assigned attributes, and removed from the list attributes that are not assigned.
            // By the time the button is called, the selectedDataCollectionWorkElementAttribute will already be assigned from the select event handler.
            // We can go ahead and add it to the array
            const addedWorkElementAttribute = {...emptyWorkElementAttributeWithParentWorkElement,workElementTypeAttribute:selectedDataCollectionWorkElementAttribute};
            setWorkElementAttributesDataCollection(prevArray => [...prevArray, addedWorkElementAttribute]);
            props.onWorkElementAttributesUpdated([...workElementDataCollectionAttributes, addedWorkElementAttribute, workElementTextAttribute] as BillOfProcessProcessWorkElementAttributeEntity[]);
        
            // Then, we'll remove it from the list of available attributes, since it has been assigned
            setDataCollectionWorkElementAttributes(prevArray => prevArray.filter(item => item.name !== selectedDataCollectionWorkElementAttribute.name));

            // Finally, set the selected attribute back to empty to prepare for the next item.
            setSelectedDataCollectionWorkElementAttribute({} as WorkElementTypeAttributeEntity);
        }
    }

    const workElementAttributeDeleteClickEventHandler = (buttonEvent:React.MouseEvent<HTMLButtonElement, MouseEvent>):void => {
        // When the delete button is clicked, the attributedeleted  will be added back to the list of available attributes, and removed from the list of assigned attributes.
        buttonEvent.preventDefault();
        
        // First, we need to get the attribute by ID from the list of assigned attributes so that we can move it back into the available attributes list
        const deletedAttribute = workElementAttributesDataCollection.find(workElementAttribute => workElementAttribute.workElementTypeAttribute.workElementTypeAttributeId.toString() === (buttonEvent.currentTarget.id));
        setDataCollectionWorkElementAttributes(prevArray => [...prevArray, ...(deletedAttribute !== undefined ? [deletedAttribute.workElementTypeAttribute] : [])]);

        const workElementsWithDeletedAttributeFiltered = workElementDataCollectionAttributes.filter(workElementDataCollectionAttribute => workElementDataCollectionAttribute.workElementTypeAttribute.workElementTypeAttributeId.toString() !== buttonEvent.currentTarget.id);
        if(workElementsWithDeletedAttributeFiltered.length > 0)
        {
            props.onWorkElementAttributesUpdated([...workElementsWithDeletedAttributeFiltered, workElementTextAttribute] as BillOfProcessProcessWorkElementAttributeEntity[]);
        }
        else
        {
            props.onWorkElementAttributesUpdated([workElementTextAttribute] as BillOfProcessProcessWorkElementAttributeEntity[]);
        }
    }
    // add DC attribute handler here

    useEffect(() => {
        setWorkElementAttributeText(workElementTextAttribute ? workElementTextAttribute : emptyTextWorkElementAttributeWithParentWorkElement);
        setWorkElementAttributesDataCollection(workElementDataCollectionAttributes ? workElementDataCollectionAttributes : [] as BillOfProcessProcessWorkElementAttributeEntity[]);
      }, [workElementTextAttribute,workElementDataCollectionAttributes,emptyTextWorkElementAttributeWithParentWorkElement,props.billOfProcessProcessWorkElement.workElementType]);

    useEffect(() => {
        getWorkElementTypeAttributeData();
      }, [getWorkElementTypeAttributeData]);
      
    return (
    <>
        <div className={classes.workElementSetupDataCollection}>
            <div className={classes.workElementSetupDataCollectionLabel}>Text:</div>
            <div className={classes.workElementSetupDataCollectionValue}>
                <textarea id="attributeValueText" name="attributeValueText" rows={2} maxLength={4000} value={workElementAttributeText.attributeValue} onChange={workElementAttributeTextChangeHandler} />
            </div>
        </div>
        {workElementAttributesDataCollection.map((dataCollectionWorkElementAttribute) => 
            <div key={dataCollectionWorkElementAttribute.workElementTypeAttribute.workElementTypeAttributeId} className={classes.workElementSetupDataCollectionAttribute}>
                <div className={classes.workElementSetupDataCollectionLabel}><button id={dataCollectionWorkElementAttribute.workElementTypeAttribute.workElementTypeAttributeId.toString()} type='button' className={classes.actionButton} onClick={workElementAttributeDeleteClickEventHandler}><BiTrash size={18}  />Delete</button></div>
                <div className={classes.workElementSetupDataCollectionValue}>{dataCollectionWorkElementAttribute.workElementTypeAttribute.name}{dataCollectionWorkElementAttribute.workElementTypeAttribute && dataCollectionWorkElementAttribute.workElementTypeAttribute.workElementTypeAttributeListItems && dataCollectionWorkElementAttribute.workElementTypeAttribute.workElementTypeAttributeListItems.length > 0 ? '(List)' :''} - {dataCollectionWorkElementAttribute.workElementTypeAttribute.isRequiredAtRun ? "(Required)" : "(Optional)"}</div>
            </div>)}
        <div className={classes.workElementSetupDataCollection}>
            <div className={classes.workElementSetupDataCollectionLabel}>Add Attribute:</div>
            <div className={classes.workElementSetupDataCollectionValue}>
            <select id='workElementTypeAttribute' name='workElementTypeAttribute' value={selectedDataCollectionWorkElementAttribute && selectedDataCollectionWorkElementAttribute.name ? selectedDataCollectionWorkElementAttribute.name : ''} onChange={e => selectedWorkElementTypeAttributeHandler(e.target.value)}>
                <option> -- Select Data Collection Attribute -- </option>
                {dataCollectionWorkElementAttributes.map((dataCollectionWorkElementAttribute) => 
                <option key={dataCollectionWorkElementAttribute.name}
                    value={dataCollectionWorkElementAttribute.name}>{dataCollectionWorkElementAttribute.name}                    
                </option>)}
            </select>
            <button className={classes.actionButton} onClick={workElementAttributeAddClickEventHandler}><BiAddToQueue size={18}  />Add</button>
            </div>
        </div>
    </>
    );
}

export default BillOfProcessWorkElementSetupDataCollection;