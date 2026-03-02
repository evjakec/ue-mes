import { useEffect, useMemo, useState } from "react";
import { BillOfProcessProcessWorkElementAttributeEntity } from "../../../models/bill-of-process-process-work-element-attribute-entity";
import classes from './BillOfProcessWorkElementRunText.module.css'
import { BillOfProcessProcessWorkElementEntity } from "../../../models/bill-of-process-process-work-element-entity";
import { WorkElementTypeAttributeEntity } from "../../../models/work-element-type-attribute-entity";

const BillOfProcessWorkElementRunText: React.FC<{runMode:string,
    billOfProcessProcessWorkElement:BillOfProcessProcessWorkElementEntity,
    billOfProcessProcessWorkElementStatus?:string,
    billOfProcessProcessWorkElementAttributes:BillOfProcessProcessWorkElementAttributeEntity[],
    onSetActiveWorkElementValidationMessages?:(validationMessages:{validationMessage:string}[])=>void }> = (props) => {

    // Default work element is used to reset the header controls after an item is added or edited.
    const emptyWorkElementAttributeWithParentWorkElement = useMemo(() => ({
        billOfProcessProcessWorkElementAttributeId:0,
        billOfProcessWorkElement:props.billOfProcessProcessWorkElement,
        workElementTypeAttribute:{} as WorkElementTypeAttributeEntity,
        attributeValue:''
      } as BillOfProcessProcessWorkElementAttributeEntity),[props.billOfProcessProcessWorkElement]);
    
      const [workElementAttribute, setWorkElementAttribute] = useState(emptyWorkElementAttributeWithParentWorkElement);
      
      const workElementTextAttribute = props.billOfProcessProcessWorkElementAttributes && props.billOfProcessProcessWorkElementAttributes.find(workElementAttribute => workElementAttribute.workElementTypeAttribute.name === 'Work Element Text') ? props.billOfProcessProcessWorkElementAttributes.find(workElementAttribute => workElementAttribute.workElementTypeAttribute.name === 'Work Element Text') : emptyWorkElementAttributeWithParentWorkElement;
      
      useEffect(() => {
        setWorkElementAttribute(workElementTextAttribute ? workElementTextAttribute : emptyWorkElementAttributeWithParentWorkElement);
      }, [workElementTextAttribute,emptyWorkElementAttributeWithParentWorkElement,props.billOfProcessProcessWorkElement.workElementType]);
      
    return (
    <div className={classes.workElementRunText}>
        {workElementAttribute.attributeValue}
    </div>);
}

export default BillOfProcessWorkElementRunText;