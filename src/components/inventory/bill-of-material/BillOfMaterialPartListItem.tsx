import { BillOfMaterialPartEntity } from "../../../models/bill-of-material-part-entity";
import classes from './BillOfMaterialPartListItem.module.css'

const BillOfMaterialPartListItem: React.FC<{billOfMaterialPart:BillOfMaterialPartEntity, 
  onPartClicked?:(selectedBillOfMaterialPartId:string)=>void,
  isSelected:boolean}> = (props) => {
  
  const partListClickEventHandler = (event: React.MouseEvent<HTMLDivElement, MouseEvent>):void => {
    props.onPartClicked && props.onPartClicked(event.currentTarget.id);
  }
      
    return (
        <div className={`${classes['divBox']} ${props.isSelected ? classes['activePart'] : ''}`} onClick={partListClickEventHandler} id={props.billOfMaterialPart.billOfMaterialPartId.toString()}>
          {props.billOfMaterialPart.part.partNumber +  ' (' + props.billOfMaterialPart.part.partRevision + ') - ' + props.billOfMaterialPart.part.description} | <span><b>Quantity: {props.billOfMaterialPart.quantity + ' ' + props.billOfMaterialPart.part.unitOfMeasure.name}</b></span>
        </div>       
    );
}

export default BillOfMaterialPartListItem;
