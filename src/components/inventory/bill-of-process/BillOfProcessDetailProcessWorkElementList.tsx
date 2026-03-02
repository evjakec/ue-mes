import { useEffect, useMemo, useState } from "react";
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { BillOfProcessProcessEntity } from "../../../models/bill-of-process-process-entity";
import classes from './BillOfProcessDetailProcessWorkElementList.module.css'
import { BillOfProcessProcessWorkElementEntity } from "../../../models/bill-of-process-process-work-element-entity";
import BillOfProcessProcessWorkElementListItem from "./BillOfProcessProcessWorkElementListItem";

const BillOfProcessDetailProcessWorkElementList: React.FC<{billOfProcessProcess:BillOfProcessProcessEntity, 
    billOfProcessProcessWorkElementList?:BillOfProcessProcessWorkElementEntity[],
    isSortable:boolean,
    selectedBillOfProcessProcesWorkElement?:BillOfProcessProcessWorkElementEntity, 
    onWorkElementClicked?:(selectedBillOfProcessProcesWorkElement:BillOfProcessProcessWorkElementEntity)=>void,
    onWorkElementDeleteClicked?:(selectedBillOfProcessProcesWorkElement:BillOfProcessProcessWorkElementEntity)=>void,
    onWorkElementListSequenceChanged?:(updatedBillOfProcessProcessWorkElementList:BillOfProcessProcessWorkElementEntity[],selectedBillOfProcessProcesWorkElement?:BillOfProcessProcessWorkElementEntity)=>void}> = (props) => {
    
    // Pass in BOP from props in the parent component
    const [billOfProcessProcessWorkElementItems, setBillOfProcessProcessWorkElementItems] = useState([] as BillOfProcessProcessWorkElementEntity[]);
    const [selectedBillOfProcessProcessId, setSelectedBillOfProcessProcessId] = useState(0);    
    
    const itemIds = useMemo(() => billOfProcessProcessWorkElementItems.sort((workElementA, workElementB) => workElementA.sequence - workElementB.sequence).map((billOfProcessProcessWorkElementItem) => billOfProcessProcessWorkElementItem.billOfProcessProcessWorkElementId), [billOfProcessProcessWorkElementItems]);
    
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const workElementListClickEventHandler = (billOfProcessProcessWorkElementId:string):void => {
        if(props.selectedBillOfProcessProcesWorkElement && +billOfProcessProcessWorkElementId === props.selectedBillOfProcessProcesWorkElement.billOfProcessProcessWorkElementId)
        {
            props.onWorkElementClicked && props.onWorkElementClicked({} as BillOfProcessProcessWorkElementEntity);
        }
        else
        {
          const selectedWorkElement = billOfProcessProcessWorkElementItems[billOfProcessProcessWorkElementItems.findIndex((item) => item.billOfProcessProcessWorkElementId === +billOfProcessProcessWorkElementId)];

          // if the selected Work Element is valid, call the onWorkElementClicked event to fill any related fields on the page or form.
          if(selectedWorkElement && selectedWorkElement.billOfProcessProcessWorkElementId !== 0)
          {
            props.onWorkElementClicked && props.onWorkElementClicked(selectedWorkElement);
          }
        }
    }
    
    const workElementListDeleteClickEventHandler = (billOfProcessProcessWorkElementId:string):void => {
        const selectedWorkElement = billOfProcessProcessWorkElementItems[billOfProcessProcessWorkElementItems.findIndex((item) => item.billOfProcessProcessWorkElementId === +billOfProcessProcessWorkElementId)];

        // if the selected Work Element is valid, call the onWorkElementClicked event to fill any related fields on the page or form.
        if(selectedWorkElement && selectedWorkElement.billOfProcessProcessWorkElementId !== 0)
        {
          props.onWorkElementDeleteClicked && props.onWorkElementDeleteClicked(selectedWorkElement);
        }
    }
    
    const workElementListDragEndHandler = (event: DragEndEvent): void => {
        const {active, over} = event;
    
        if (over && active.id !== over.id) {
                const oldIndex = billOfProcessProcessWorkElementItems.findIndex((item) => item.billOfProcessProcessWorkElementId === active.id);
                const newIndex = billOfProcessProcessWorkElementItems.findIndex((item) => item.billOfProcessProcessWorkElementId === over.id);
                
                const updatedBillOfProcessProcessWorkElementList = arrayMove(billOfProcessProcessWorkElementItems, oldIndex, newIndex).map((workElement,index) => {
                    return ({...workElement, sequence:(index+1)} as BillOfProcessProcessWorkElementEntity);
                });              
                
                setBillOfProcessProcessWorkElementItems(updatedBillOfProcessProcessWorkElementList);
                props.onWorkElementListSequenceChanged && props.onWorkElementListSequenceChanged(updatedBillOfProcessProcessWorkElementList, props.selectedBillOfProcessProcesWorkElement);
        }
        else
        {
          // This is hacky as all can be, but the click event on the item will not fire, so instead we call it here if the drag position has not changed.
          // The dnd kit issue list talks about this, but does not provide a great solution.  Will dig more later.
          workElementListClickEventHandler(active.id.toString());
        }
    }

    // use effect is used to ensure the work element list refreshes with each BOP Process change.  Otherwise, the process list will stick with the first chosen option.
     useEffect(() => {
            setSelectedBillOfProcessProcessId(props.billOfProcessProcess.billOfProcessProcessId);
            setBillOfProcessProcessWorkElementItems(props.billOfProcessProcessWorkElementList ? props.billOfProcessProcessWorkElementList : props.billOfProcessProcess.billOfProcessProcessWorkElements ? props.billOfProcessProcess.billOfProcessProcessWorkElements : [] as BillOfProcessProcessWorkElementEntity[]);
       }, [props.billOfProcessProcess,props.billOfProcessProcessWorkElementList]);
      
    return (<>
        {selectedBillOfProcessProcessId !== undefined && selectedBillOfProcessProcessId !== 0 && props.isSortable && 
            <div className={classes.bopDetailProcessWorkElementListContainer}>
                <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={workElementListDragEndHandler}
                    modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                    >
                    <SortableContext 
                        items={itemIds}
                        strategy={verticalListSortingStrategy}
                    >
                        {itemIds.map(item => 
                            <BillOfProcessProcessWorkElementListItem 
                            key={item}
                            billOfProcessProcessWorkElement={billOfProcessProcessWorkElementItems[billOfProcessProcessWorkElementItems.findIndex((billOfProcessProcessWorkElementItem) => billOfProcessProcessWorkElementItem.billOfProcessProcessWorkElementId === item)]} 
                            isSelected={props.selectedBillOfProcessProcesWorkElement !== undefined && item === props.selectedBillOfProcessProcesWorkElement.billOfProcessProcessWorkElementId}
                            includeActions={true}
                            onWorkElementClicked={workElementListClickEventHandler}
                            onWorkElementDeleteClicked={workElementListDeleteClickEventHandler}
                            />)}
                    </SortableContext>
                </DndContext>
            </div>
        }
        {selectedBillOfProcessProcessId !== undefined && selectedBillOfProcessProcessId !== 0 && !props.isSortable && 
            <div className={classes.bopDetailProcessWorkElementListContainer}>
                {itemIds.map(item => 
                    <BillOfProcessProcessWorkElementListItem 
                    billOfProcessProcessWorkElement={billOfProcessProcessWorkElementItems[billOfProcessProcessWorkElementItems.findIndex((billOfProcessProcessWorkElementItem) => billOfProcessProcessWorkElementItem.billOfProcessProcessWorkElementId === item)]} 
                    isSelected={false}
                    includeActions={false}
                    key={item}  />)}
            </div>
        }
    </>);
}

export default BillOfProcessDetailProcessWorkElementList;