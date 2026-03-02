import { useCallback, useEffect, useMemo, useState } from "react";
import { BillOfProcessProcessWorkElementAttributeEntity } from "../../../models/bill-of-process-process-work-element-attribute-entity";
import classes from './BillOfProcessWorkElementSetupText.module.css'
import { BillOfProcessProcessWorkElementEntity } from "../../../models/bill-of-process-process-work-element-entity";
import { WorkElementTypeAttributeEntity } from "../../../models/work-element-type-attribute-entity";

const BillOfProcessWorkElementSetupText: React.FC<{billOfProcessProcessWorkElement:BillOfProcessProcessWorkElementEntity,
    billOfProcessProcessWorkElementAttributes:BillOfProcessProcessWorkElementAttributeEntity[],
    workElementTypeAttributes:WorkElementTypeAttributeEntity[],
    onWorkElementAttributesUpdated:(updatedBillOfProcessProcessWorkElementAttributes:BillOfProcessProcessWorkElementAttributeEntity[])=>void }> = (props) => {
    
    // will likely move these into context at some point.  For now, using state
    const [textWorkElementAttribute, setTextWorkElementAttribute] = useState({} as WorkElementTypeAttributeEntity);

    const getWorkElementTypeAttributeData = useCallback(() => {
      const textWorkElementAttributeFromResData = props.workElementTypeAttributes.find(workElementAttributeType => workElementAttributeType.workElementType.name === 'Text');
      setTextWorkElementAttribute(textWorkElementAttributeFromResData ? textWorkElementAttributeFromResData : {} as WorkElementTypeAttributeEntity);
    },[props.workElementTypeAttributes])
    
    // Default work element is used to reset the header controls after an item is added or edited.
    const emptyWorkElementAttributeWithParentWorkElement = useMemo(() => ({
        billOfProcessProcessWorkElementAttributeId:0,
        billOfProcessWorkElement:props.billOfProcessProcessWorkElement,
        workElementTypeAttribute:textWorkElementAttribute,
        attributeValue:''
      } as BillOfProcessProcessWorkElementAttributeEntity),[props.billOfProcessProcessWorkElement,textWorkElementAttribute]);
    
      const [workElementAttribute, setWorkElementAttribute] = useState(emptyWorkElementAttributeWithParentWorkElement);
      
      const workElementTextAttribute = props.billOfProcessProcessWorkElementAttributes && props.billOfProcessProcessWorkElementAttributes.find(workElementAttribute => workElementAttribute.workElementTypeAttribute.name === 'Work Element Text') ? props.billOfProcessProcessWorkElementAttributes.find(workElementAttribute => workElementAttribute.workElementTypeAttribute.name === 'Work Element Text') : emptyWorkElementAttributeWithParentWorkElement;
      
      const workElementAttributeTextChangeHandler = (event:React.ChangeEvent<HTMLTextAreaElement>) => {
        setWorkElementAttribute(prevAttribute => ({...prevAttribute, attributeValue:event.target.value}));
        const updatedWorkElementAttribute = {...workElementTextAttribute, attributeValue:event.target.value, workElementTextAttribute:textWorkElementAttribute};
        props.onWorkElementAttributesUpdated([updatedWorkElementAttribute] as BillOfProcessProcessWorkElementAttributeEntity[]);
        // props.onSetBillOfProcessWorkElement({...props.billOfProcessProcessWorkElement, name: event.target.value});
    } 

    useEffect(() => {
        setWorkElementAttribute(workElementTextAttribute ? workElementTextAttribute : emptyWorkElementAttributeWithParentWorkElement);
      }, [workElementTextAttribute,emptyWorkElementAttributeWithParentWorkElement,props.billOfProcessProcessWorkElement.workElementType]);

    useEffect(() => {
      getWorkElementTypeAttributeData();
      }, [getWorkElementTypeAttributeData]);
      
    return (
    <div className={classes.workElementSetupText}>
        <div className={classes.workElementSetupTextLabel}>Text:</div>
        <div className={classes.workElementSetupTextValue}>
            <textarea id="attributeValue" name="attributeValue" rows={2} maxLength={4000} value={workElementAttribute.attributeValue} onChange={workElementAttributeTextChangeHandler} />
        </div>
    </div>);
}

export default BillOfProcessWorkElementSetupText;