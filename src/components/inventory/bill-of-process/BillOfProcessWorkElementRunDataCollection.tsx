import { useEffect, useMemo, useState } from "react";
import { BillOfProcessProcessWorkElementAttributeEntity } from "../../../models/bill-of-process-process-work-element-attribute-entity";
import classes from './BillOfProcessWorkElementRunDataCollection.module.css'
import { BillOfProcessProcessWorkElementEntity } from "../../../models/bill-of-process-process-work-element-entity";
import { WorkElementTypeAttributeEntity } from "../../../models/work-element-type-attribute-entity";
import { DataCollectionWorkElementAndOrderItemUnitValueViewModel } from "../../../view-models/data-collection-work-element-order-item-unit-view-model";

const BillOfProcessWorkElementRunDataCollection: React.FC<{runMode:string,
    isOrderItemUnitScrapped:boolean,                            
    billOfProcessProcessWorkElement:BillOfProcessProcessWorkElementEntity,
    billOfProcessProcessWorkElementStatus?:string,
    billOfProcessProcessWorkElementAttributes:BillOfProcessProcessWorkElementAttributeEntity[],
    dataCollectionWorkElementAndOrderItemUnitValueViewModel?:DataCollectionWorkElementAndOrderItemUnitValueViewModel[],
    onUpdateDataCollectionAttributes?:(updatedDataCollectionAttributeViewModels:DataCollectionWorkElementAndOrderItemUnitValueViewModel[])=>void,
    onSetActiveWorkElementValidationMessages?:(validationMessages:{errorMessages:string[], warningMessages:string[]})=>void }> = (props) => {

    // Default work element is used to reset the header controls after an item is added or edited.
    const emptyWorkElementAttributeWithParentWorkElement = useMemo(() => ({
        billOfProcessProcessWorkElementAttributeId:0,
        billOfProcessWorkElement:props.billOfProcessProcessWorkElement,
        workElementTypeAttribute:{} as WorkElementTypeAttributeEntity,
        attributeValue:''
      } as BillOfProcessProcessWorkElementAttributeEntity),[props.billOfProcessProcessWorkElement]);
    
      const [workElementAttributeText, setWorkElementAttributeText] = useState(emptyWorkElementAttributeWithParentWorkElement);
      const [workElementAttributesDataCollection, setWorkElementAttributesDataCollection] = useState([] as BillOfProcessProcessWorkElementAttributeEntity[]);
      const [workElementAttributeDataCollectionViewModels, setWorkElementAttributeDataCollectionViewModels] = useState([] as DataCollectionWorkElementAndOrderItemUnitValueViewModel[]);

      const workElementTextAttribute = props.billOfProcessProcessWorkElementAttributes && props.billOfProcessProcessWorkElementAttributes.find(workElementAttribute => workElementAttribute.workElementTypeAttribute.name === 'Work Element Text') ? props.billOfProcessProcessWorkElementAttributes.find(workElementAttribute => workElementAttribute.workElementTypeAttribute.name === 'Work Element Text') : emptyWorkElementAttributeWithParentWorkElement;
      const workElementDataCollectionAttributes = useMemo(() => (props.billOfProcessProcessWorkElementAttributes && props.billOfProcessProcessWorkElementAttributes.filter(workElementAttribute => workElementAttribute.workElementTypeAttribute.name !== 'Work Element Text') ? props.billOfProcessProcessWorkElementAttributes.filter(workElementAttribute => workElementAttribute.workElementTypeAttribute.name !== 'Work Element Text') : []),[props.billOfProcessProcessWorkElementAttributes]);
      const workElementDataCollectionAttributeViewModels = useMemo(() => (props.dataCollectionWorkElementAndOrderItemUnitValueViewModel && props.dataCollectionWorkElementAndOrderItemUnitValueViewModel.filter(workElementAttributeViewModel => workElementAttributeViewModel.dataCollectionWorkElementAttribute.workElementTypeAttribute.name !== 'Work Element Text') ? props.dataCollectionWorkElementAndOrderItemUnitValueViewModel.filter(workElementAttributeViewModel => workElementAttributeViewModel.dataCollectionWorkElementAttribute.workElementTypeAttribute.name !== 'Work Element Text') : []),[props.dataCollectionWorkElementAndOrderItemUnitValueViewModel]);
      
      const dataCollectionAttributeValueChangeHandler = (event:React.ChangeEvent<HTMLInputElement>) => {
        // the handler for attribute changes will be used to update the active work element attributes, but also the validation.
        // Data collection attributes can be required or not. 
        // If an attribute is required, and is missing attribute (length === 0), it should be reported as an error message.
        // If not required, but still missing, report it as a warning message
        // RunContent will assess these errors and warnings when the "Complete" button is clicked.
        const updatedDataCollectionAttributeViewModels = workElementAttributeDataCollectionViewModels.map(dataCollectionAttributeViewModel => {
          if(dataCollectionAttributeViewModel.dataCollectionWorkElementAttribute.billOfProcessProcessWorkElementAttributeId.toString() === event.currentTarget.id)
          {
            const updatedOrderItemUnitDataCollection = {...dataCollectionAttributeViewModel.orderItemUnitDataCollection, collectedValue:event.currentTarget.value};
            return {...dataCollectionAttributeViewModel, orderItemUnitDataCollection:updatedOrderItemUnitDataCollection};
          }

          return dataCollectionAttributeViewModel;
        });

        props.onUpdateDataCollectionAttributes && props.onUpdateDataCollectionAttributes([...updatedDataCollectionAttributeViewModels]);
      }

      const selectedWorkElementTypeAttributeListItemHandler = (event:React.ChangeEvent<HTMLSelectElement>) => {
        const updatedDataCollectionAttributeViewModels = workElementAttributeDataCollectionViewModels.map(dataCollectionAttributeViewModel => {
          if(dataCollectionAttributeViewModel.dataCollectionWorkElementAttribute.billOfProcessProcessWorkElementAttributeId.toString() === event.currentTarget.id)
          {
            const updatedOrderItemUnitDataCollection = {...dataCollectionAttributeViewModel.orderItemUnitDataCollection, collectedValue:event.currentTarget.value};
            return {...dataCollectionAttributeViewModel, orderItemUnitDataCollection:updatedOrderItemUnitDataCollection};
          }

          return dataCollectionAttributeViewModel;
        });

        props.onUpdateDataCollectionAttributes && props.onUpdateDataCollectionAttributes([...updatedDataCollectionAttributeViewModels]);
      }

      useEffect(() => {
        setWorkElementAttributeText(workElementTextAttribute ? workElementTextAttribute : emptyWorkElementAttributeWithParentWorkElement);
        setWorkElementAttributesDataCollection(workElementDataCollectionAttributes ? workElementDataCollectionAttributes : [] as BillOfProcessProcessWorkElementAttributeEntity[]);
        setWorkElementAttributeDataCollectionViewModels(workElementDataCollectionAttributeViewModels ? workElementDataCollectionAttributeViewModels : [] as DataCollectionWorkElementAndOrderItemUnitValueViewModel[]);
      }, [workElementTextAttribute,emptyWorkElementAttributeWithParentWorkElement,workElementDataCollectionAttributes, workElementDataCollectionAttributeViewModels]);
      
    return (
      <>
      <div className={classes.workElementRunDataCollectionText}>
          {workElementAttributeText.attributeValue}
      </div>
      <div className={classes.workElementRunDataCollection}>
       {props.runMode === "Preview" &&
        workElementAttributesDataCollection.map((dataCollectionWorkElementAttribute) => 
          <div key={dataCollectionWorkElementAttribute.workElementTypeAttribute.workElementTypeAttributeId} className={classes.workElementRunDataCollectionAttribute}>
            <div className={classes.workElementRunDataCollectionLabel}>{dataCollectionWorkElementAttribute.workElementTypeAttribute.name}</div>
            <div className={classes.workElementRunDataCollectionValue}>
              {(dataCollectionWorkElementAttribute.workElementTypeAttribute.workElementTypeAttributeListItems === undefined || dataCollectionWorkElementAttribute.workElementTypeAttribute.workElementTypeAttributeListItems.length === 0) && 
                <input type="text" id={dataCollectionWorkElementAttribute.billOfProcessProcessWorkElementAttributeId.toString()} name="dataCollectionAttributeValue" maxLength={4000} readOnly={true} />
              }
              {dataCollectionWorkElementAttribute.workElementTypeAttribute.workElementTypeAttributeListItems && dataCollectionWorkElementAttribute.workElementTypeAttribute.workElementTypeAttributeListItems.length > 0 && 
                <select id='workElementTypeAttributeListItemPreview' name='workElementTypeAttributeListItemPreview'>
                    <option> -- Select Attribute Value -- </option>
                    {dataCollectionWorkElementAttribute.workElementTypeAttribute.workElementTypeAttributeListItems.map((workElementTypeAttributeListItem) => 
                    <option key={workElementTypeAttributeListItem.name}
                        value={workElementTypeAttributeListItem.name}>{workElementTypeAttributeListItem.name}                    
                    </option>)}
                </select>
              }
            </div>
          </div>
        )}
        {props.runMode === "Run" &&
          workElementDataCollectionAttributeViewModels !== undefined && workElementDataCollectionAttributeViewModels.map((dataCollectionWorkElementAttributeViewModel) => 
          <div key={dataCollectionWorkElementAttributeViewModel.dataCollectionWorkElementAttribute.billOfProcessProcessWorkElementAttributeId} className={classes.workElementRunDataCollectionAttribute}>
            <div className={classes.workElementRunDataCollectionLabel}>{dataCollectionWorkElementAttributeViewModel.dataCollectionWorkElementAttribute.workElementTypeAttribute.name}</div>
            <div className={classes.workElementRunDataCollectionValue}>
              {(dataCollectionWorkElementAttributeViewModel.dataCollectionWorkElementAttribute.workElementTypeAttribute.workElementTypeAttributeListItems === undefined || dataCollectionWorkElementAttributeViewModel.dataCollectionWorkElementAttribute.workElementTypeAttribute.workElementTypeAttributeListItems.length === 0) && 
                <input type="text" id={dataCollectionWorkElementAttributeViewModel.dataCollectionWorkElementAttribute.billOfProcessProcessWorkElementAttributeId.toString()} 
                  name="dataCollectionAttributeValue" maxLength={4000} readOnly={props.billOfProcessProcessWorkElementStatus === undefined || props.billOfProcessProcessWorkElementStatus !== 'In Progress' || props.isOrderItemUnitScrapped}
                  value={dataCollectionWorkElementAttributeViewModel.orderItemUnitDataCollection.collectedValue} onChange={dataCollectionAttributeValueChangeHandler} /> 
              }
            {dataCollectionWorkElementAttributeViewModel.dataCollectionWorkElementAttribute.workElementTypeAttribute.workElementTypeAttributeListItems && dataCollectionWorkElementAttributeViewModel.dataCollectionWorkElementAttribute.workElementTypeAttribute.workElementTypeAttributeListItems.length > 0 && 
                <select id={dataCollectionWorkElementAttributeViewModel.dataCollectionWorkElementAttribute.billOfProcessProcessWorkElementAttributeId.toString()} 
                  name='workElementTypeAttributeListItem' disabled={props.billOfProcessProcessWorkElementStatus === undefined || props.billOfProcessProcessWorkElementStatus !== 'In Progress' || props.isOrderItemUnitScrapped}
                  value={dataCollectionWorkElementAttributeViewModel.orderItemUnitDataCollection.collectedValue} 
                  onChange={selectedWorkElementTypeAttributeListItemHandler}>
                    <option> -- Select Attribute Value -- </option>
                    {dataCollectionWorkElementAttributeViewModel.dataCollectionWorkElementAttribute.workElementTypeAttribute.workElementTypeAttributeListItems.map((workElementTypeAttributeListItem) => 
                    <option key={workElementTypeAttributeListItem.name}
                        value={workElementTypeAttributeListItem.name}>{workElementTypeAttributeListItem.name}                    
                    </option>)}
                </select>
              }
              </div>
          </div>
        )}
      </div>
      </>
    );
}

export default BillOfProcessWorkElementRunDataCollection;