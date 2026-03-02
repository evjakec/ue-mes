import { BillOfProcessProcessWorkElementEntity } from "../../models/bill-of-process-process-work-element-entity";
import { ConsumptionWorkElementAndOrderItemUnitValueViewModel } from "../../view-models/consumption-work-element-order-item-unit-view-model";
import { DataCollectionWorkElementAndOrderItemUnitValueViewModel } from "../../view-models/data-collection-work-element-order-item-unit-view-model";
import { fetchConsumptionValidationMessages } from "./ApiFunctions";

export async function getActiveWorkElementValidationMessagesAsync (activeWorkElement:BillOfProcessProcessWorkElementEntity,
    dataCollectionWorkElementAndOrderItemUnitValueViewModel:DataCollectionWorkElementAndOrderItemUnitValueViewModel[],
    consumptionWorkElementAndOrderItemUnitValueViewModel:ConsumptionWorkElementAndOrderItemUnitValueViewModel[]):Promise<{errorMessages:string[], warningMessages:string[]}>
{
    
    switch(activeWorkElement.workElementType.name) {
        case "Text":
            return {errorMessages:[],warningMessages:[]} as {errorMessages:string[], warningMessages:string[]}; // no validation for Text work elements
        case "Image":
            return {errorMessages:[],warningMessages:[]} as {errorMessages:string[], warningMessages:string[]}; // no validation for Image work elements
        case "Data Collection":
        {
            return getActiveDataCollectionWorkElementValidationMessages(dataCollectionWorkElementAndOrderItemUnitValueViewModel);
        }
        case "Consumption":
        {
            return getActiveConsumptionWorkElementResponses(consumptionWorkElementAndOrderItemUnitValueViewModel);
            //return {errorMessages:[],warningMessages:[]} as {errorMessages:string[], warningMessages:string[]}; // Assume no errors if work element type is not found
        }
        default:
            return {errorMessages:[],warningMessages:[]} as {errorMessages:string[], warningMessages:string[]}; // Assume no errors if work element type is not found
    }
}

// Data collection validation is pretty simple.  We just need to verify if a value was set or not.
// Then, use the isRequired property of the work element type attribute to determine if this is a blocking error, or just a warning
export function getActiveDataCollectionWorkElementValidationMessages(dataCollectionAttributeViewModels:DataCollectionWorkElementAndOrderItemUnitValueViewModel[]):{errorMessages:string[], warningMessages:string[]} 
{
    let updatedErrorAndWarningMessages = {errorMessages:[],warningMessages:[]} as {errorMessages:string[], warningMessages:string[]};
    dataCollectionAttributeViewModels.forEach(dataCollectionAttributeViewModel => {
        if(dataCollectionAttributeViewModel.orderItemUnitDataCollection === undefined || dataCollectionAttributeViewModel.orderItemUnitDataCollection.collectedValue.length === 0)
        {
            if(dataCollectionAttributeViewModel.dataCollectionWorkElementAttribute.workElementTypeAttribute.isRequiredAtRun)
            {
                updatedErrorAndWarningMessages = {...updatedErrorAndWarningMessages,errorMessages:[...updatedErrorAndWarningMessages.errorMessages,
                    dataCollectionAttributeViewModel.dataCollectionWorkElementAttribute.workElementTypeAttribute.name + ' is required, but no value was entered. ']};
            }
            else
            {
                updatedErrorAndWarningMessages = {...updatedErrorAndWarningMessages,warningMessages:[...updatedErrorAndWarningMessages.warningMessages
                ,'No value was entered for ' + dataCollectionAttributeViewModel.dataCollectionWorkElementAttribute.workElementTypeAttribute.name]};
            }
        }
    });

    return updatedErrorAndWarningMessages;
};

export async function getActiveConsumptionWorkElementResponses(consumptionWorkElementAndOrderItemUnitValueViewModels:ConsumptionWorkElementAndOrderItemUnitValueViewModel[]):Promise<{errorMessages:string[], warningMessages:string[]}> 
{
    const consumptionIsValidPromises = consumptionWorkElementAndOrderItemUnitValueViewModels.map(async (consumptionWorkElementAndOrderItemUnitValueViewModel) => 
        {
            return fetchConsumptionValidationMessages(consumptionWorkElementAndOrderItemUnitValueViewModel.orderItemUnitConsumption.consumedSerialNumber,consumptionWorkElementAndOrderItemUnitValueViewModel.consumptionWorkElementAttribute.attributeValue)
                .catch(()=> {throw new Error('Unable to fetch the consumption validation messages.')});
      });

      const consumptionIsValidResults = await Promise.all(consumptionIsValidPromises).then(consumptionIsValidPromiseResults => {
        let updatedErrorAndWarningMessages = {errorMessages:[],warningMessages:[]} as {errorMessages:string[], warningMessages:string[]};
        consumptionIsValidPromiseResults.forEach(consumptionIsValidKeyValuePairResult => {
            if(consumptionIsValidKeyValuePairResult.errorMessages.length > 0)
            {
                updatedErrorAndWarningMessages = {...updatedErrorAndWarningMessages,errorMessages:[...updatedErrorAndWarningMessages.errorMessages.concat(
                    consumptionIsValidKeyValuePairResult.errorMessages)]};
            }
        });
        return updatedErrorAndWarningMessages;
      });
      return consumptionIsValidResults;      
}
