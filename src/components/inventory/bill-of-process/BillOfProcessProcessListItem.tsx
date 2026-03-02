import { useSortable } from "@dnd-kit/sortable";
import { BillOfProcessProcessEntity } from "../../../models/bill-of-process-process-entity";
import classes from './BillOfProcessProcessListItem.module.css'
import {CSS} from '@dnd-kit/utilities';

const BillOfProcessProcessListItem: React.FC<{billOfProcessProcess:BillOfProcessProcessEntity, 
  onProcessClicked:(selectedBillOfProcessProcessId:string)=>void,
  isSelected:boolean,
  showWorkElementCount:boolean}> = (props) => {
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: props.billOfProcessProcess.billOfProcessProcessId});
    
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const processListClickEventHandler = (event: React.MouseEvent<HTMLDivElement, MouseEvent>):void => {
    props.onProcessClicked(event.currentTarget.id);
  }
      
    return (
        <div ref={setNodeRef} className={`${classes['divBox']} ${props.isSelected ? classes['activeProcess'] : ''}`} style={style} {...attributes} {...listeners} onClick={processListClickEventHandler} id={props.billOfProcessProcess.billOfProcessProcessId.toString()}>
          {props.billOfProcessProcess.process.number + ' - ' + props.billOfProcessProcess.process.name} {props.showWorkElementCount && <>| <span><b>Work Elements: {props.billOfProcessProcess.billOfProcessProcessWorkElements.length}</b></span></>}
        </div>       
    );
}

export default BillOfProcessProcessListItem;
