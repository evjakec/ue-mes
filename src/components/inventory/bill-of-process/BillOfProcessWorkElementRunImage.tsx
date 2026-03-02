import { useEffect, useMemo, useState } from "react";
import { BillOfProcessProcessWorkElementAttributeEntity } from "../../../models/bill-of-process-process-work-element-attribute-entity";
import classes from './BillOfProcessWorkElementRunImage.module.css'
import { BillOfProcessProcessWorkElementEntity } from "../../../models/bill-of-process-process-work-element-entity";
import { WorkElementTypeAttributeEntity } from "../../../models/work-element-type-attribute-entity";

const BillOfProcessWorkElementRunImage: React.FC<{runMode:string,
    billOfProcessProcessWorkElement:BillOfProcessProcessWorkElementEntity,
    billOfProcessProcessWorkElementStatus?:string,
    billOfProcessProcessWorkElementAttributes:BillOfProcessProcessWorkElementAttributeEntity[] }> = (props) => {

    // Default work element is used to reset the header controls after an item is added or edited.
    const emptyWorkElementAttributeWithParentWorkElement = useMemo(() => ({
        billOfProcessProcessWorkElementAttributeId:0,
        billOfProcessWorkElement:props.billOfProcessProcessWorkElement,
        workElementTypeAttribute:{} as WorkElementTypeAttributeEntity,
        attributeValue:''
      } as BillOfProcessProcessWorkElementAttributeEntity),[props.billOfProcessProcessWorkElement]);
    
      const [workElementAttributeText, setWorkElementAttributeText] = useState(emptyWorkElementAttributeWithParentWorkElement);
      const [workElementAttributeImage, setWorkElementAttributeImage] = useState(emptyWorkElementAttributeWithParentWorkElement);
      
      const workElementTextAttribute = props.billOfProcessProcessWorkElementAttributes && props.billOfProcessProcessWorkElementAttributes.find(workElementAttribute => workElementAttribute.workElementTypeAttribute.name === 'Work Element Text') ? props.billOfProcessProcessWorkElementAttributes.find(workElementAttribute => workElementAttribute.workElementTypeAttribute.name === 'Work Element Text') : emptyWorkElementAttributeWithParentWorkElement;
      const workElementImageAttribute = props.billOfProcessProcessWorkElementAttributes && props.billOfProcessProcessWorkElementAttributes.find(workElementAttribute => workElementAttribute.workElementTypeAttribute.name === 'Work Element Text') ? props.billOfProcessProcessWorkElementAttributes.find(workElementAttribute => workElementAttribute.workElementTypeAttribute.name === 'Work Element Image') : emptyWorkElementAttributeWithParentWorkElement;
      
      useEffect(() => {
        setWorkElementAttributeText(workElementTextAttribute ? workElementTextAttribute : emptyWorkElementAttributeWithParentWorkElement);
        setWorkElementAttributeImage(workElementImageAttribute ? workElementImageAttribute : emptyWorkElementAttributeWithParentWorkElement);
      }, [workElementTextAttribute,workElementImageAttribute,emptyWorkElementAttributeWithParentWorkElement,props.billOfProcessProcessWorkElement.workElementType]);
      
    return (
    <div className={classes.workElementRunImageContainer}>
        <div className={classes.workElementRunText}>
            {workElementAttributeText.attributeValue}
        </div>
    <div className={`${props.runMode === 'Run' ? classes['workElementRunImageRun'] : classes['workElementRunImagePreview']}`}>
        {workElementAttributeImage && workElementAttributeImage.attributeValue.includes('.') && 
                <img alt={workElementAttributeImage.attributeValue} src={process.env.REACT_APP_IMAGE_PATH + '/' + workElementAttributeImage.attributeValue}></img>
            }
        </div>
    </div>
    );
}

export default BillOfProcessWorkElementRunImage;