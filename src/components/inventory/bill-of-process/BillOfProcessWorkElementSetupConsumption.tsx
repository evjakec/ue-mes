import { useCallback, useEffect, useMemo, useState } from "react";
import { BillOfProcessProcessWorkElementAttributeEntity } from "../../../models/bill-of-process-process-work-element-attribute-entity";
import classes from './BillOfProcessWorkElementSetupConsumption.module.css'
import { BillOfProcessProcessWorkElementEntity } from "../../../models/bill-of-process-process-work-element-entity";
import { WorkElementTypeAttributeEntity } from "../../../models/work-element-type-attribute-entity";
import { BiAddToQueue, BiTrash } from "react-icons/bi";
import { BillOfMaterialEntity } from "../../../models/bill-of-material-entity";
import { BillOfMaterialPartEntity } from "../../../models/bill-of-material-part-entity";

const BillOfProcessWorkElementSetupConsumption: React.FC<{billOfProcessProcessWorkElement:BillOfProcessProcessWorkElementEntity,
    billOfProcessProcessWorkElementAttributes:BillOfProcessProcessWorkElementAttributeEntity[],
    workElementTypeAttributes:WorkElementTypeAttributeEntity[],
    billOfMaterial:BillOfMaterialEntity,
    onWorkElementAttributesUpdated:(updatedBillOfProcessProcessWorkElementAttributes:BillOfProcessProcessWorkElementAttributeEntity[])=>void }> = (props) => {
    
        // will likely move these into context at some point.  For now, using state
        const [textWorkElementAttribute, setTextWorkElementAttribute] = useState({} as WorkElementTypeAttributeEntity);
        const [availableConsumedPartWorkElementAttributes, setAvailableConsumedPartWorkElementAttributes] = useState([] as BillOfProcessProcessWorkElementAttributeEntity[]);
        
        // temporary state for selected attribute in the drop down list
        const [selectedConsumedPartWorkElementAttribute, setSelectedConsumedPartWorkElementAttribute] = useState({} as BillOfProcessProcessWorkElementAttributeEntity);
    
        // Default work element is used to reset the header controls after an item is added or edited.
        const emptyWorkElementAttributeWithParentWorkElement = useMemo(() => ({
            billOfProcessProcessWorkElementAttributeId:0,
            billOfProcessWorkElement:props.billOfProcessProcessWorkElement,
            workElementTypeAttribute:{} as WorkElementTypeAttributeEntity,
            attributeValue:''
          } as BillOfProcessProcessWorkElementAttributeEntity),[props.billOfProcessProcessWorkElement]);
        
        const getWorkElementTypeAttributeData = useCallback(() => {
            const consumedPartWorkElementTypeAttributesFromProps = props.workElementTypeAttributes.filter(workElementTypeAttribute => workElementTypeAttribute.workElementType.name === "Consumption");
            
            // Set the text element
            const textWorkElementTypeAttributeFromResData = consumedPartWorkElementTypeAttributesFromProps.find(workElementTypeAttribute => workElementTypeAttribute.name === "Work Element Text");
            setTextWorkElementAttribute(textWorkElementTypeAttributeFromResData ? textWorkElementTypeAttributeFromResData : {} as WorkElementTypeAttributeEntity);
            
            // For consumed parts, there is only one work element type attribute.  It can be added to the BOP work element many times where the attribute value will be a unique Part Id
            // What we will do here is load the availableConsumedPartWorkElementAttributes array with all parts that have not already been added to the work element
            const consumedPartWorkElementTypeAttributeFromResData = consumedPartWorkElementTypeAttributesFromProps.find(workElementTypeAttribute => workElementTypeAttribute.name === "Consumed Part ID");
            
            const assignedConsumedPartWorkElementAttributes = props.billOfProcessProcessWorkElementAttributes.filter(billOfProcessProcessWorkElementAttribute => billOfProcessProcessWorkElementAttribute.workElementTypeAttribute.workElementTypeAttributeId === consumedPartWorkElementTypeAttributeFromResData?.workElementTypeAttributeId)
            const availableBillOfMaterialPartsFromResData = props.billOfMaterial.billOfMaterialParts.filter(billOfMaterialPart => !assignedConsumedPartWorkElementAttributes.some(workElementAttribute => workElementAttribute.attributeValue === billOfMaterialPart.part.partId?.toString()));
            const consumedPartWorkElementTypeAttribute = props.workElementTypeAttributes.find(workElementTypeAttribute => workElementTypeAttribute.name === 'Consumed Part ID');

            setAvailableConsumedPartWorkElementAttributes(availableBillOfMaterialPartsFromResData.map(billOfMaterialPart => {
                  return { ...emptyWorkElementAttributeWithParentWorkElement, workElementTypeAttribute:consumedPartWorkElementTypeAttribute, attributeValue: billOfMaterialPart.part.partId?.toString()} as BillOfProcessProcessWorkElementAttributeEntity;
              }));
        },[props.workElementTypeAttributes,emptyWorkElementAttributeWithParentWorkElement,props.billOfMaterial.billOfMaterialParts,props.billOfProcessProcessWorkElementAttributes]);
        
        const emptyTextWorkElementAttributeWithParentWorkElement = useMemo(() => ({...emptyWorkElementAttributeWithParentWorkElement, workElementTypeAttribute:textWorkElementAttribute}),[emptyWorkElementAttributeWithParentWorkElement,textWorkElementAttribute]);
          
        const [workElementAttributeText, setWorkElementAttributeText] = useState(emptyTextWorkElementAttributeWithParentWorkElement);
        const [workElementAttributesConsumedPart, setWorkElementAttributesConsumedPart] = useState([] as BillOfProcessProcessWorkElementAttributeEntity[]);
          
        const workElementTextAttribute            = props.billOfProcessProcessWorkElementAttributes && props.billOfProcessProcessWorkElementAttributes.find(workElementAttribute => workElementAttribute.workElementTypeAttribute.name === 'Work Element Text') ? props.billOfProcessProcessWorkElementAttributes.find(workElementAttribute => workElementAttribute.workElementTypeAttribute.name === 'Work Element Text') : emptyTextWorkElementAttributeWithParentWorkElement;
        const workElementConsumedPartAttributes = useMemo(() => (props.billOfProcessProcessWorkElementAttributes && props.billOfProcessProcessWorkElementAttributes.filter(workElementAttribute => workElementAttribute.workElementTypeAttribute.name === 'Consumed Part ID') ? props.billOfProcessProcessWorkElementAttributes.filter(workElementAttribute => workElementAttribute.workElementTypeAttribute.name === 'Consumed Part ID') : []),[props.billOfProcessProcessWorkElementAttributes]);
          
        const workElementAttributeTextChangeHandler = (event:React.ChangeEvent<HTMLTextAreaElement>) => {
            setWorkElementAttributeText(prevAttribute => ({...prevAttribute, attributeValue:event.target.value}));
            const updatedWorkElementAttribute = {...workElementTextAttribute, attributeValue:event.target.value, workElementTypeAttribute:textWorkElementAttribute};
            props.onWorkElementAttributesUpdated([...workElementConsumedPartAttributes, updatedWorkElementAttribute] as BillOfProcessProcessWorkElementAttributeEntity[]);
            // props.onSetBillOfProcessWorkElement({...props.billOfProcessProcessWorkElement, name: event.target.value});
        } 
    
        const selectedWorkElementTypeAttributeHandler = (selectedWorkElementTypeAttributeValue:string) => {
            // In this handler, we will simply set the selectedConsumedPartWorkElementAttribute
            // There will be a button next to the drop down for the user to add it to the list of assigned attributes. 
            const selectedWorkElementTypeAttribute = availableConsumedPartWorkElementAttributes.find(workElementAttribute => workElementAttribute.attributeValue === selectedWorkElementTypeAttributeValue);
            if(selectedWorkElementTypeAttribute)
            {
                setSelectedConsumedPartWorkElementAttribute(selectedWorkElementTypeAttribute);
            }
        }
        
        const workElementAttributeAddClickEventHandler = (buttonEvent:React.MouseEvent<HTMLButtonElement, MouseEvent>):void => {
            
            // Prevent form submit
            buttonEvent.preventDefault();
            
            // Only run the logic when an attribute has been selected and not the default "Select Data Collection Attribute" text
            if(selectedConsumedPartWorkElementAttribute && selectedConsumedPartWorkElementAttribute.attributeValue !== "")
            {
                // When the add button is clicked, the selected attribute will be added to the list of assigned attributes, and removed from the list attributes that are not assigned.
                // By the time the button is called, the selectedConsumedPartWorkElementAttribute will already be assigned from the select event handler.
                // We can go ahead and add it to the array
                setWorkElementAttributesConsumedPart(prevArray => [...prevArray, selectedConsumedPartWorkElementAttribute]);
                props.onWorkElementAttributesUpdated([...workElementConsumedPartAttributes, selectedConsumedPartWorkElementAttribute, workElementTextAttribute] as BillOfProcessProcessWorkElementAttributeEntity[]);
            
                // Then, we'll remove it from the list of available attributes, since it has been assigned
                setAvailableConsumedPartWorkElementAttributes(prevArray => prevArray.filter(item => item.attributeValue !== selectedConsumedPartWorkElementAttribute.attributeValue));
    
                // Finally, set the selected attribute back to empty to prepare for the next item.
                setSelectedConsumedPartWorkElementAttribute({} as BillOfProcessProcessWorkElementAttributeEntity);
            }
        }
    
        const workElementAttributeDeleteClickEventHandler = (buttonEvent:React.MouseEvent<HTMLButtonElement, MouseEvent>):void => {
            // When the delete button is clicked, the attributedeleted  will be added back to the list of available attributes, and removed from the list of assigned attributes.
            buttonEvent.preventDefault();
            
            // First, we need to get the attribute by ID from the list of assigned attributes so that we can move it back into the available attributes list
            const deletedAttribute = workElementConsumedPartAttributes.find(workElementAttribute => workElementAttribute.attributeValue === (buttonEvent.currentTarget.id));
            setAvailableConsumedPartWorkElementAttributes(prevArray => [...prevArray, ...(deletedAttribute !== undefined ? [deletedAttribute] : [])]);
    
            const workElementsWithDeletedAttributeFiltered = workElementConsumedPartAttributes.filter(workElementConsumedPartAttribute => workElementConsumedPartAttribute.attributeValue !== buttonEvent.currentTarget.id);
            if(workElementsWithDeletedAttributeFiltered.length > 0)
            {
                props.onWorkElementAttributesUpdated([...workElementsWithDeletedAttributeFiltered, workElementTextAttribute] as BillOfProcessProcessWorkElementAttributeEntity[]);
            }
            else
            {
                props.onWorkElementAttributesUpdated([workElementTextAttribute] as BillOfProcessProcessWorkElementAttributeEntity[]);
            }
        }
        
        const lookupPartById = (partIdAttributeValue:string) => {
            const billOfMaterialPart = props.billOfMaterial.billOfMaterialParts.find(bomPart => bomPart.part.partId?.toString() === partIdAttributeValue );
            if(billOfMaterialPart && billOfMaterialPart.part.partId && billOfMaterialPart.part.partId > 0)
            {
                return billOfMaterialPart;
            }

            return {} as BillOfMaterialPartEntity;
        }
        
        useEffect(() => {
            setWorkElementAttributeText(workElementTextAttribute ? workElementTextAttribute : emptyTextWorkElementAttributeWithParentWorkElement);
            setWorkElementAttributesConsumedPart(workElementConsumedPartAttributes ? workElementConsumedPartAttributes : [] as BillOfProcessProcessWorkElementAttributeEntity[]);
          }, [workElementTextAttribute,workElementConsumedPartAttributes,emptyTextWorkElementAttributeWithParentWorkElement,props.billOfProcessProcessWorkElement.workElementType]);
    
        useEffect(() => {
            getWorkElementTypeAttributeData();
          }, [getWorkElementTypeAttributeData]);
          
        return (
        <>
            <div className={classes.workElementSetupConsumption}>
                <div className={classes.workElementSetupConsumptionLabel}>Text:</div>
                <div className={classes.workElementSetupConsumptionTextValue}>
                    <textarea id="attributeValueText" name="attributeValueText" rows={2} maxLength={4000} value={workElementAttributeText.attributeValue} onChange={workElementAttributeTextChangeHandler} />
                </div>
            </div>
            {workElementAttributesConsumedPart.map((consumedPartWorkElementAttribute) => 
                <div key={consumedPartWorkElementAttribute.attributeValue} className={classes.workElementSetupConsumptionAttribute}>
                    <div className={classes.workElementSetupConsumptionLabel}><button id={consumedPartWorkElementAttribute.attributeValue} type='button' className={classes.actionButton} onClick={workElementAttributeDeleteClickEventHandler}><BiTrash size={18}  />Delete</button></div>
                    <div className={classes.workElementSetupConsumptionValue}>{lookupPartById(consumedPartWorkElementAttribute.attributeValue).part.partNumber + " (" + lookupPartById(consumedPartWorkElementAttribute.attributeValue).part.partRevision + ") - " + lookupPartById(consumedPartWorkElementAttribute.attributeValue).part.description }</div>
            </div>)}
            <div className={classes.workElementSetupConsumption}>
                <div className={classes.workElementSetupConsumptionLabel}>Add Part:</div>
                    <select id='workElementTypeAttribute' name='workElementTypeAttribute' value={selectedConsumedPartWorkElementAttribute && selectedConsumedPartWorkElementAttribute.attributeValue ? selectedConsumedPartWorkElementAttribute.attributeValue : ''} onChange={e => selectedWorkElementTypeAttributeHandler(e.target.value)}>
                        <option> -- Select Part -- </option>
                        {availableConsumedPartWorkElementAttributes.map((availableConsumedPartWorkElementAttribute) => 
                        <option key={availableConsumedPartWorkElementAttribute.attributeValue}
                            value={availableConsumedPartWorkElementAttribute.attributeValue}>{lookupPartById(availableConsumedPartWorkElementAttribute.attributeValue).part.partNumber + " (" + lookupPartById(availableConsumedPartWorkElementAttribute.attributeValue).part.partRevision + ") - " + lookupPartById(availableConsumedPartWorkElementAttribute.attributeValue).part.description }                  
                        </option>)}
                    </select>
                    <button className={classes.actionButton} onClick={workElementAttributeAddClickEventHandler}><BiAddToQueue size={18}  />Add</button>
            </div>
            <div className={classes.workElementSetupConsumptionNote}><b>Note: </b>Only parts assigned to the BOM of part <b>{props.billOfMaterial.part.partNumber + "(" + props.billOfMaterial.part.partRevision + ")"}</b> are available.  If a part you need is missing, it will need added to the BOM first.</div>
        </>
        );
    }

export default BillOfProcessWorkElementSetupConsumption;