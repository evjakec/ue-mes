import { useEffect, useMemo, useState } from "react";
import { BillOfProcessProcessWorkElementAttributeEntity } from "../../../models/bill-of-process-process-work-element-attribute-entity";
import classes from './BillOfProcessWorkElementRunConsumption.module.css'
import { BillOfProcessProcessWorkElementEntity } from "../../../models/bill-of-process-process-work-element-entity";
import { WorkElementTypeAttributeEntity } from "../../../models/work-element-type-attribute-entity";
import { BillOfMaterialEntity } from "../../../models/bill-of-material-entity";
import { BillOfMaterialPartEntity } from "../../../models/bill-of-material-part-entity";
import { BiSolidCheckCircle } from "react-icons/bi";
import { ConsumptionWorkElementAndOrderItemUnitValueViewModel } from "../../../view-models/consumption-work-element-order-item-unit-view-model";

const BillOfProcessWorkElementRunConsumption: React.FC<{runMode:string,
    isOrderItemUnitScrapped:boolean,                            
    billOfProcessProcessWorkElement:BillOfProcessProcessWorkElementEntity,
    billOfProcessProcessWorkElementStatus?:string,
    billOfMaterial:BillOfMaterialEntity,
    billOfProcessProcessWorkElementAttributes:BillOfProcessProcessWorkElementAttributeEntity[] 
    consumptionWorkElementAndOrderItemUnitValueViewModel?:ConsumptionWorkElementAndOrderItemUnitValueViewModel[],
    onUpdateConsumptionAttributes?:(updatedConsumptionAttributeViewModels:ConsumptionWorkElementAndOrderItemUnitValueViewModel[])=>void,
    onSetActiveWorkElementValidationMessages?:(validationMessages:{errorMessages:string[], warningMessages:string[]})=>void }> = (props) => {

    // Default work element is used to reset the header controls after an item is added or edited.
    const emptyWorkElementAttributeWithParentWorkElement = useMemo(() => ({
        billOfProcessProcessWorkElementAttributeId:0,
        billOfProcessWorkElement:props.billOfProcessProcessWorkElement,
        workElementTypeAttribute:{} as WorkElementTypeAttributeEntity,
        attributeValue:''
      } as BillOfProcessProcessWorkElementAttributeEntity),[props.billOfProcessProcessWorkElement]);
    
      const [workElementAttributeText, setWorkElementAttributeText] = useState(emptyWorkElementAttributeWithParentWorkElement);
      const [workElementAttributesConsumption, setWorkElementAttributesConsumption] = useState([] as BillOfProcessProcessWorkElementAttributeEntity[]);
      const [workElementAttributeConsumptionViewModels, setWorkElementAttributeConsumptionViewModels] = useState([] as ConsumptionWorkElementAndOrderItemUnitValueViewModel[]);

      const workElementTextAttribute = props.billOfProcessProcessWorkElementAttributes && props.billOfProcessProcessWorkElementAttributes.find(workElementAttribute => workElementAttribute.workElementTypeAttribute.name === 'Work Element Text') ? props.billOfProcessProcessWorkElementAttributes.find(workElementAttribute => workElementAttribute.workElementTypeAttribute.name === 'Work Element Text') : emptyWorkElementAttributeWithParentWorkElement;
      const workElementConsumptionAttributes = useMemo(() => (props.billOfProcessProcessWorkElementAttributes && props.billOfProcessProcessWorkElementAttributes.filter(workElementAttribute => workElementAttribute.workElementTypeAttribute.name === 'Consumed Part ID') ? props.billOfProcessProcessWorkElementAttributes.filter(workElementAttribute => workElementAttribute.workElementTypeAttribute.name === 'Consumed Part ID') : []),[props.billOfProcessProcessWorkElementAttributes]);
      const workElementConsumptionAttributeViewModels = useMemo(() => (props.consumptionWorkElementAndOrderItemUnitValueViewModel && props.consumptionWorkElementAndOrderItemUnitValueViewModel.filter(workElementAttributeViewModel => workElementAttributeViewModel.consumptionWorkElementAttribute.workElementTypeAttribute.name !== 'Work Element Text') ? props.consumptionWorkElementAndOrderItemUnitValueViewModel.filter(workElementAttributeViewModel => workElementAttributeViewModel.consumptionWorkElementAttribute.workElementTypeAttribute.name !== 'Work Element Text') : []),[props.consumptionWorkElementAndOrderItemUnitValueViewModel]);
      
      const lookupPartById = (partIdAttributeValue:string) => {
        const billOfMaterialPart = props.billOfMaterial.billOfMaterialParts.find(bomPart => bomPart.part.partId?.toString() === partIdAttributeValue );
        if(billOfMaterialPart && billOfMaterialPart.part.partId && billOfMaterialPart.part.partId > 0)
        {
            return billOfMaterialPart;
        }

        return {} as BillOfMaterialPartEntity;
      }
    
      const consumptionAttributeSerialNumberChangeHandler = (event:React.ChangeEvent<HTMLInputElement>) => {
        // the handler for attribute changes will be used to update the active work element attributes, but also the validation.
        // Consumption attributes can be required or not. 
        // If an attribute is required, and is missing attribute (length === 0), it should be reported as an error message.
        // If not required, but still missing, report it as a warning message
        // RunContent will assess these errors and warnings when the "Complete" button is clicked.
        const updatedConsumptionAttributeViewModels = workElementAttributeConsumptionViewModels.map(consumptionAttributeViewModel => {
          if(consumptionAttributeViewModel.consumptionWorkElementAttribute.billOfProcessProcessWorkElementAttributeId.toString() === event.currentTarget.id)
          {
            const updatedOrderItemUnitConsumption = {...consumptionAttributeViewModel.orderItemUnitConsumption, consumedSerialNumber:event.currentTarget.value};
            return {...consumptionAttributeViewModel, orderItemUnitConsumption:updatedOrderItemUnitConsumption};
          }

          return consumptionAttributeViewModel;
        });

        props.onUpdateConsumptionAttributes && props.onUpdateConsumptionAttributes([...updatedConsumptionAttributeViewModels]);
      }

    useEffect(() => {
        setWorkElementAttributeText(workElementTextAttribute ? workElementTextAttribute : emptyWorkElementAttributeWithParentWorkElement);
        setWorkElementAttributesConsumption(workElementConsumptionAttributes ? workElementConsumptionAttributes : [] as BillOfProcessProcessWorkElementAttributeEntity[]);
        setWorkElementAttributeConsumptionViewModels(workElementConsumptionAttributeViewModels ? workElementConsumptionAttributeViewModels : [] as ConsumptionWorkElementAndOrderItemUnitValueViewModel[]);
      }, [workElementTextAttribute,emptyWorkElementAttributeWithParentWorkElement,workElementConsumptionAttributes,workElementConsumptionAttributeViewModels]);
      
    return (
      <>
      <div className={classes.workElementRunConsumption}>
          {workElementAttributeText.attributeValue}
      </div>
      <div className={classes.workElementRunConsumption}>
      {props.runMode === "Preview" &&
       workElementAttributesConsumption.map((consumptionWorkElementAttribute,index) => 
          <div key={consumptionWorkElementAttribute.billOfProcessProcessWorkElementAttributeId} className={classes.workElementRunConsumptionAttribute}>
            <BiSolidCheckCircle className={index === 0 ? classes.workElementRunConsumptionSerialCaptured : classes.workElementRunConsumptionSerialNotCaptured} />
            <div className={classes.workElementRunConsumptionLabel}>Serial:</div>
            <input key={consumptionWorkElementAttribute.billOfProcessProcessWorkElementAttributeId} type="text" id={consumptionWorkElementAttribute.billOfProcessProcessWorkElementAttributeId.toString()} name="consumedPartSerial" maxLength={20} readOnly={true} defaultValue={index === 0 ? "23012010500001" : ""} />
            <div className={classes.workElementRunConsumptionValue}>{lookupPartById(consumptionWorkElementAttribute.attributeValue).part.partNumber + " (" + lookupPartById(consumptionWorkElementAttribute.attributeValue).part.partRevision + ") - " + lookupPartById(consumptionWorkElementAttribute.attributeValue).part.description }</div>
          </div>
        )}
        {props.runMode === "Run" &&
         workElementConsumptionAttributeViewModels !== undefined && workElementConsumptionAttributeViewModels.map((consumptionWorkElementAttributeViewModel) => 
         <div key={consumptionWorkElementAttributeViewModel.consumptionWorkElementAttribute.billOfProcessProcessWorkElementAttributeId} className={classes.workElementRunConsumptionAttribute}>
            <div className={classes.workElementRunConsumptionLabel}>
              <BiSolidCheckCircle className={consumptionWorkElementAttributeViewModel.orderItemUnitConsumption.consumedSerialNumber.length > 0 ? classes.workElementRunConsumptionSerialCaptured : classes.workElementRunConsumptionSerialNotCaptured} />
              <span>Serial: 
                <input key={consumptionWorkElementAttributeViewModel.consumptionWorkElementAttribute.billOfProcessProcessWorkElementAttributeId} 
                  type="text" id={consumptionWorkElementAttributeViewModel.consumptionWorkElementAttribute.billOfProcessProcessWorkElementAttributeId.toString()} 
                  name="consumedPartSerial" maxLength={20} readOnly={props.billOfProcessProcessWorkElementStatus === undefined || props.billOfProcessProcessWorkElementStatus !== 'In Progress' || props.isOrderItemUnitScrapped}
                  value={consumptionWorkElementAttributeViewModel.orderItemUnitConsumption.consumedSerialNumber} onChange={consumptionAttributeSerialNumberChangeHandler} />
                </span>
              </div>
            <div className={classes.workElementRunConsumptionValue}>{lookupPartById(consumptionWorkElementAttributeViewModel.consumptionWorkElementAttribute.attributeValue).part.partNumber + " (" + lookupPartById(consumptionWorkElementAttributeViewModel.consumptionWorkElementAttribute.attributeValue).part.partRevision + ") - " + lookupPartById(consumptionWorkElementAttributeViewModel.consumptionWorkElementAttribute.attributeValue).part.description }</div>
          </div>
        )}
      </div>
      </>
    );
}

export default BillOfProcessWorkElementRunConsumption;