import { useCallback, useEffect, useMemo, useState } from "react";
import { BillOfProcessProcessWorkElementAttributeEntity } from "../../../models/bill-of-process-process-work-element-attribute-entity";
import classes from './BillOfProcessWorkElementSetupImage.module.css'
import { BillOfProcessProcessWorkElementEntity } from "../../../models/bill-of-process-process-work-element-entity";
import { WorkElementTypeAttributeEntity } from "../../../models/work-element-type-attribute-entity";
import { saveWorkElementImage } from "../../../ui/scripts/ApiFunctions";
import ErrorDisplay from "../../../ui/components/ErrorDisplay";

const BillOfProcessWorkElementSetupImage: React.FC<{billOfProcessProcessWorkElement:BillOfProcessProcessWorkElementEntity,
    billOfProcessProcessWorkElementAttributes:BillOfProcessProcessWorkElementAttributeEntity[],
    workElementTypeAttributes:WorkElementTypeAttributeEntity[],
    onWorkElementAttributesUpdated:(updatedBillOfProcessProcessWorkElementAttributes:BillOfProcessProcessWorkElementAttributeEntity[])=>void }> = (props) => {
    
    // will likely move these into context at some point.  For now, using state
    const [textWorkElementAttribute, setTextWorkElementAttribute] = useState({} as WorkElementTypeAttributeEntity);
    const [imageWorkElementAttribute, setImageWorkElementAttribute] = useState({} as WorkElementTypeAttributeEntity);
    const [componentError, setComponentError] = useState({} as Error);
  
    const getWorkElementTypeAttributeData = useCallback(() => {
        const imageWorkElementAttributesFromProps = props.workElementTypeAttributes.filter(workElementAttributeType => workElementAttributeType.workElementType.name === 'Image');
        const textWorkElementAttributeFromResData = imageWorkElementAttributesFromProps.find(workElementAttribute => workElementAttribute.name === "Work Element Text");
        const imageWorkElementAttributeFromResData = imageWorkElementAttributesFromProps.find(workElementAttribute => workElementAttribute.name === "Work Element Image");
        setTextWorkElementAttribute(textWorkElementAttributeFromResData ? textWorkElementAttributeFromResData : {} as WorkElementTypeAttributeEntity);
        setImageWorkElementAttribute(imageWorkElementAttributeFromResData ? imageWorkElementAttributeFromResData : {} as WorkElementTypeAttributeEntity);
    },[props.workElementTypeAttributes]);

    // Default work element is used to reset the header controls after an item is added or edited.
    const emptyWorkElementAttributeWithParentWorkElement = useMemo(() => ({
        billOfProcessProcessWorkElementAttributeId:0,
        billOfProcessWorkElement:props.billOfProcessProcessWorkElement,
        workElementTypeAttribute:{} as WorkElementTypeAttributeEntity,
        attributeValue:''
      } as BillOfProcessProcessWorkElementAttributeEntity),[props.billOfProcessProcessWorkElement]);
    
      const emptyTextWorkElementAttributeWithParentWorkElement = useMemo(() => ({...emptyWorkElementAttributeWithParentWorkElement, workElementTypeAttribute:textWorkElementAttribute}),[emptyWorkElementAttributeWithParentWorkElement,textWorkElementAttribute]);
      const emptyImageWorkElementAttributeWithParentWorkElement = useMemo(() => ({...emptyWorkElementAttributeWithParentWorkElement, workElementTypeAttribute:imageWorkElementAttribute}),[emptyWorkElementAttributeWithParentWorkElement,imageWorkElementAttribute]);
    
      const [workElementAttributeText, setWorkElementAttributeText] = useState(emptyTextWorkElementAttributeWithParentWorkElement);
      const [workElementAttributeImage, setWorkElementAttributeImage] = useState(emptyImageWorkElementAttributeWithParentWorkElement);
      
      const workElementTextAttribute = props.billOfProcessProcessWorkElementAttributes && props.billOfProcessProcessWorkElementAttributes.find(workElementAttribute => workElementAttribute.workElementTypeAttribute.name === 'Work Element Text') ? props.billOfProcessProcessWorkElementAttributes.find(workElementAttribute => workElementAttribute.workElementTypeAttribute.name === 'Work Element Text') : emptyTextWorkElementAttributeWithParentWorkElement;
      const workElementImageAttribute = props.billOfProcessProcessWorkElementAttributes && props.billOfProcessProcessWorkElementAttributes.find(workElementAttribute => workElementAttribute.workElementTypeAttribute.name === 'Work Element Image') ? props.billOfProcessProcessWorkElementAttributes.find(workElementAttribute => workElementAttribute.workElementTypeAttribute.name === 'Work Element Image') : emptyImageWorkElementAttributeWithParentWorkElement;
      
    const workElementAttributeTextChangeHandler = (event:React.ChangeEvent<HTMLTextAreaElement>) => {
        setWorkElementAttributeText(prevAttribute => ({...prevAttribute, attributeValue:event.target.value}));
        const updatedWorkElementAttribute = {...workElementTextAttribute, attributeValue:event.target.value, workElementTypeAttribute:textWorkElementAttribute};
        props.onWorkElementAttributesUpdated([updatedWorkElementAttribute, workElementImageAttribute] as BillOfProcessProcessWorkElementAttributeEntity[]);
        // props.onSetBillOfProcessWorkElement({...props.billOfProcessProcessWorkElement, name: event.target.value});
    } 

    const workElementAttributeImageChangeHandler = (event:React.ChangeEvent<HTMLInputElement>) => {
      const billOfProcessProcessId = props.billOfProcessProcessWorkElement.billOfProcessProcess.billOfProcessProcessId;
      const workElementId = props.billOfProcessProcessWorkElement.billOfProcessProcessWorkElementId;
      const uploadedFile = event.target.files && event.target.files.length > 0 ? event.target.files[0] : undefined;

      if(uploadedFile !== undefined)
      {
        const fileName = billOfProcessProcessId + "_" + workElementId + '.' + uploadedFile.name.split('.')[1];
        saveWorkElementImage(uploadedFile,billOfProcessProcessId,workElementId).then(()=> {
          setWorkElementAttributeImage(prevAttribute => ({...prevAttribute, attributeValue:fileName}));
          const updatedWorkElementAttribute = {...workElementImageAttribute, attributeValue:fileName, workElementTypeAttribute:imageWorkElementAttribute};
          props.onWorkElementAttributesUpdated([workElementTextAttribute, updatedWorkElementAttribute] as BillOfProcessProcessWorkElementAttributeEntity[]);
        })
        .catch((fetchError) => {setComponentError(fetchError)});
      }
    } 

    useEffect(() => {
        setWorkElementAttributeText(workElementTextAttribute ? workElementTextAttribute : emptyTextWorkElementAttributeWithParentWorkElement);
        setWorkElementAttributeImage(workElementImageAttribute ? workElementImageAttribute : emptyImageWorkElementAttributeWithParentWorkElement);
      }, [workElementTextAttribute,workElementImageAttribute,emptyTextWorkElementAttributeWithParentWorkElement,emptyImageWorkElementAttributeWithParentWorkElement,props.billOfProcessProcessWorkElement.workElementType]);

    useEffect(() => {
      getWorkElementTypeAttributeData();
      }, [getWorkElementTypeAttributeData]);
      
    return (
    <>
        <div className={classes.workElementSetupImage}>
            <div className={classes.workElementSetupImageLabel}>Text:</div>
            <div className={classes.workElementSetupImageValue}>
                <textarea id="attributeValueText" name="attributeValueText" rows={2} maxLength={4000} value={workElementAttributeText.attributeValue} onChange={workElementAttributeTextChangeHandler} />
            </div>
        </div>
        <div className={classes.workElementSetupImage}>
            <div className={classes.workElementSetupImageLabel}>Update Image:</div>
            <div className={classes.workElementSetupImageValue}>
                <input id="attributeValueImage" name="attributeValueImage" type="file" accept="image/*" defaultValue={workElementAttributeImage.attributeValue} onChange={workElementAttributeImageChangeHandler} />
            </div>
        </div>
        {componentError !== undefined && componentError.message && componentError.message.length > 0 && <ErrorDisplay title={'Error'} message={componentError.message} />}
    </>);
}

export default BillOfProcessWorkElementSetupImage;