import { OrderItemEntity } from "../../models/order-item-entity";

export function splitStringOnUpperCase(inputString:string):string[]
{
    const resultString:string[] = inputString
        .trim()
        .split(/(?=[A-Z])/)
        .map(element => element.trim().toLocaleLowerCase());

    return resultString;
}

export function isValidDate(inputDate:any) {
    return inputDate instanceof Date && !isNaN(+inputDate);
}

export function getAttributeValueByName (attributeName:string, orderItem:OrderItemEntity):string {
    const orderItemAttribute = orderItem.orderItemAttributes.filter(orderItemAttribute => orderItemAttribute.itemAttributeType.name === attributeName);
    if(orderItemAttribute[0])
    {
        return orderItemAttribute[0].attributeValue;
    }

    return '';
}

export function millimetersToInches(inputMillimeters:number) {
    return (inputMillimeters/25.4).toFixed(2);
}

export function getDynamicIGUStyleHeightPercentage(inputValue:number, rangeMinimum:number, rangeMaximum:number, percentMinimum:number, percentMaximum:number) {
    // This function is used to dynamcially size (width, height) a styled div.
    // environment variables will be used to provide the range and percent min\max settings.
    // An example:
    //  Assume the percentage width\height has to be 80-100%.  The percentMinimum would be 80 and the percentMaximum would be 100
    //  Now assume the rangeMinimum is 508 and the rangeMaximum is 3000
    //  If the caller provides an inputValue of 508, then this function will return 80 as it is the minimum value and thus returns percentMinimum + 0
    //  If the caller provides an inputValue of 3000, then this function will return 100 as it is the maximum and thus returns percentMinimum + 20
    //  If the caller provides an inputValue of 1980 , then this function will return 91.81 which is the result of the math below
    let returnValue = ((((inputValue-rangeMinimum)/(rangeMaximum-rangeMinimum))*(percentMaximum-percentMinimum))+percentMinimum).toFixed(2);
    //return ((((inputValue-rangeMinimum)/(rangeMaximum-rangeMinimum))*(percentMaximum-percentMinimum))+percentMinimum).toFixed(2);
    return returnValue;
}

export function getDynamicIGUStyleWidthPercentage(inputValue:number, iguHeight:number, rangeMinimum:number, rangeMaximum:number, percentMinimum:number, percentMaximum:number) {
    // The width of the IGU div is dependent on the height.
    // An example:
    //  if the IGU height percentage comes in at 100% with a height value of 3000 and the width value is 1500 then...
    //  1500/3000 is 50%
    //  50% of 100% is 50%, so this is the end result.
    //  If the IGU height percentage comes in at 72% with a height value of 2160 and the width value is 500 then (500/2160=23%, 23% of 72% is 16.56%)
    const iguHeightPercent = +getDynamicIGUStyleHeightPercentage(iguHeight,rangeMinimum, rangeMaximum, percentMinimum, percentMaximum);
    let returnValue = ((inputValue/iguHeight)*iguHeightPercent).toFixed(2);
    //return ((((inputValue-rangeMinimum)/(rangeMaximum-rangeMinimum))*(percentMaximum-percentMinimum))+percentMinimum).toFixed(2);
    return returnValue;
}