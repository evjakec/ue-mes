
import classes from './BillOfProcessProcessWorkElementListItem.module.css'
import { BillOfProcessProcessWorkElementEntity } from "../../../models/bill-of-process-process-work-element-entity";
import { useSortable } from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import { BiTrash } from 'react-icons/bi';

const BillOfProcessProcessWorkElementListItem: React.FC<{billOfProcessProcessWorkElement:BillOfProcessProcessWorkElementEntity,
  onWorkElementClicked?:(selectedBillOfProcessProcessWorkElementId:string)=>void,
  onWorkElementDeleteClicked?:(selectedBillOfProcessProcessWorkElementId:string)=>void,
  isSelected:boolean,
  includeActions:boolean}> = (props) => {
  
  const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
      } = useSortable({id: props.billOfProcessProcessWorkElement.billOfProcessProcessWorkElementId});
      
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const workElementListClickEventHandler = (event: React.MouseEvent<HTMLDivElement, MouseEvent>):void => {
    props.onWorkElementClicked && props.onWorkElementClicked(event.currentTarget.id);
  }

  const workElementListDeleteClickEventHandler = (buttonEvent:React.MouseEvent<HTMLButtonElement, MouseEvent>):void => {
    buttonEvent.preventDefault();
    props.onWorkElementDeleteClicked && props.onWorkElementDeleteClicked(buttonEvent.currentTarget.id);
  }

  return (
    <div className={`${classes['workElementListItemContainer']} ${props.isSelected ? classes['activeWorkElement'] : ''}`}>
      {props.includeActions &&
      <div className={classes.workElementListItemContainerAction}>
         <button id={props.billOfProcessProcessWorkElement.billOfProcessProcessWorkElementId.toString()} type='button' className={classes.actionButton} onClick={workElementListDeleteClickEventHandler}><BiTrash size={18}  />Delete</button>
      </div>
      }        
      <div className={`${classes['workElementListItemContainerContent']} ${props.isSelected ? classes['activeWorkElement'] : ''}`}>
        <div ref={setNodeRef} className={`${props.isSelected ? classes['activeWorkElement'] : ''}`} style={style} {...attributes} {...listeners} onClick={workElementListClickEventHandler} id={props.billOfProcessProcessWorkElement.billOfProcessProcessWorkElementId.toString()}>    
          {props.billOfProcessProcessWorkElement.name + ' (' + props.billOfProcessProcessWorkElement.workElementType.name + ')'} | <span><b>Work Element Attributes: {props.billOfProcessProcessWorkElement.billOfProcessProcessWorkElementAttributes.length}</b></span>
        </div>
      </div>
    </div>
  );
}

export default BillOfProcessProcessWorkElementListItem;