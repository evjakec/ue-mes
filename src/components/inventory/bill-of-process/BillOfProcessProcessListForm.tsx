import { Form, redirect, useLoaderData, useNavigate } from 'react-router-dom';

import classes from './BillOfProcessProcessListForm.module.css'
import { LoaderFunctionArguments } from '../../../routes/types/LoaderFunctionArguments'
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import { ProcessEntity } from '../../../models/global/process-entity';
import { BillOfProcessEntity } from '../../../models/bill-of-process-entity';
import { useContext, useMemo, useRef, useState } from 'react';
import BillOfProcessProcessListItem from './BillOfProcessProcessListItem';
import { BillOfProcessProcessEntity } from '../../../models/bill-of-process-process-entity';
import { BillOfProcessProcessWorkElementEntity } from '../../../models/bill-of-process-process-work-element-entity';
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { postBillOfProcessProcessList } from '../../../ui/scripts/ApiFunctions';
import ErrorDisplay from '../../../ui/components/ErrorDisplay';
import Modal from '../../../ui/components/Modal';
import LoadingModal from '../../../ui/components/LoadingModal';
import { UserContext } from '../../../store/user-context';

const BillOfProcessProcessListForm:React.FC<{method:any}> = (props) => {
  // loader data
  const [processList, loadedBillOfProcess] = useLoaderData() as [ProcessEntity[], BillOfProcessEntity];
  const navigate = useNavigate();
  let formRef = useRef<HTMLFormElement>(null);
  
  const modalDialogSubmitContent = <div className={classes.confirmationModal}><p>Clicking <b>OK</b> will replace all existing BOP processes with the list on this screen.  Continue?</p></div>;
  const modalDialogCancelContent = <div className={classes.confirmationModal}><p>Clicking <b>OK</b> will lose any of the changes you have made on this screen.  If you want to save them, click Cancel below and then click <b>Submit Changes and Exit</b> on the form.  Continue?</p></div>; 
    
  // Context
  const {loggedInUser} = useContext(UserContext);
  
  // state variables
  const [workingBillOfProcessProcessIdList, setWorkingBillOfProcessProcessIdList] = useState([] as number[]);
  const [workingProcessIdList, setWorkingProcessIdList] = useState([] as number[]);
  const [isBillOfProcessProcessListChanged, setIsBillOfProcessProcessListChanged] = useState(false);
  const [billOfProcessProcessItems, setBillOfProcessProcessItems] = useState(loadedBillOfProcess.billOfProcessProcesses);
  const [showSubmitFormModal, setShowSubmitFormModal] = useState(false);
  const [showCancelFormModal, setShowCancelFormModal] = useState(false);
  const [componentError, setComponentError] = useState({} as Error);
  const [isLoading, setIsLoading] = useState(false);
    
  // to allow for reuse of the BillOfProcessProcessListItem component, we map the regular Process entities into BillOfProcessProcess entities.
  // Setting the BillOfProcessProcessId to ProcessId*-1 will avoid any ID collisions.
  // When the data is saved, they will get new IDs in the database anyway
  const [processItems, setProcessItems] = useState(processList.map((processItem,index) => 
    {
       return {billOfProcessProcessId:(processItem.processId*-1), 
        billOfProcess: loadedBillOfProcess,
        process: processItem,
        sequence:(index+1),
        lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : '',
        billOfProcessProcessWorkElements: [] as BillOfProcessProcessWorkElementEntity[]
      } as BillOfProcessProcessEntity;
    }));

  const itemIds = useMemo(() => billOfProcessProcessItems.map((billOfProcessProcessItem) => billOfProcessProcessItem.billOfProcessProcessId), [billOfProcessProcessItems]);
    
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const billOfProcessProcessListDragEndHandler = (event: DragEndEvent): void => {
    const {active, over} = event;

    if (over && active.id !== over.id) {
      setBillOfProcessProcessItems((billOfProcessProcessItems:BillOfProcessProcessEntity[]) => {
            const oldIndex = billOfProcessProcessItems.findIndex((item) => item.billOfProcessProcessId === active.id);
            const newIndex = billOfProcessProcessItems.findIndex((item) => item.billOfProcessProcessId === over.id);
            
            return arrayMove(billOfProcessProcessItems, oldIndex, newIndex);
        });
        setIsBillOfProcessProcessListChanged(true);
    }
    else
    {
      // This is hacky as all can be, but the click event on the item will not fire, so instead we call it here if the drag position has not changed.
      bopProcessListClickEventHandler(active.id.toString());
    }
}
  const bopProcessListClickEventHandler = (billOfProcessProcessId:string):void => {
    if(workingBillOfProcessProcessIdList.includes(+billOfProcessProcessId))
    {
      setWorkingBillOfProcessProcessIdList(prevList => prevList.filter(id => id !== +billOfProcessProcessId));
    }
    else{
      setWorkingBillOfProcessProcessIdList(prevList => [...prevList,+billOfProcessProcessId]);
    }
  }
    
  const processListClickEventHandler = (processId:string):void => {
    if(workingProcessIdList.includes(+processId))
    {
      setWorkingProcessIdList(prevList => prevList.filter(id => id !== +processId));
    }
    else{
      setWorkingProcessIdList(prevList => [...prevList,+processId]);
    }
  }

  const addProcessesToBillOfProcessHandler = ():void => {
    if(workingProcessIdList.length > 0)
    {
      // Loop through each selected item and add it to the BOP process list, while also removing it from the available processes list
      workingProcessIdList.forEach(function (value) {
        setBillOfProcessProcessItems(prevArray => [...prevArray,processItems[processItems.findIndex((item) => item.billOfProcessProcessId === value)]]);
        setProcessItems(prevArray => prevArray.filter(item => item.billOfProcessProcessId !== value));
      });
       
      setWorkingProcessIdList([]);
      setIsBillOfProcessProcessListChanged(true);
    }
  }

  const removeProcessesFromBillOfProcessHandler = ():void => {
    if(workingBillOfProcessProcessIdList.length > 0)
    {
      // Loop through each selected item and remove it from the BOP process list, while also adding it back to the available processes list
      // The available process list should also always be sorted by process number
      workingBillOfProcessProcessIdList.forEach(function (value) {
        setProcessItems(prevArray => [...prevArray,billOfProcessProcessItems[billOfProcessProcessItems.findIndex((item) => item.billOfProcessProcessId === value)]].sort((itemA,itemB) => +itemA.process.number - +itemB.process.number));
        setBillOfProcessProcessItems(prevArray => prevArray.filter(item => item.billOfProcessProcessId !== value));
      });
       
      setWorkingBillOfProcessProcessIdList([]); // clear the working array when finished
      setIsBillOfProcessProcessListChanged(true);
    }
  }

  const formSubmitHandler = ():void => {
    // Only post to the API if something in the list has changed.
    if(isBillOfProcessProcessListChanged)
    {
      setIsLoading(true);
      
      // Before we submit, we will resequence the items based on their order in the list.  Trying to update sequences while changing items would be a challenge.
      // This relies on the client giving us the correct order, but it should be solid based on how the list is managed.
      const updatedBillOfProcessProcessItems = billOfProcessProcessItems.map((billOfProcessProcessItem,index) =>
      {
        return ({...billOfProcessProcessItem, sequence:(index+1)}); // Sequence in the database will be 1 based, so add one to the index
      });

      postBillOfProcessProcessList(loadedBillOfProcess.billOfProcessId.toString(), updatedBillOfProcessProcessItems).then(()=> {
        setIsLoading(false);
        formRef.current?.dispatchEvent(
          new Event("submit", { cancelable: true, bubbles: true })
        );
      })
      .catch((fetchError) => {
        setIsLoading(false);
        setComponentError(fetchError)
      });
    }
  }

  const modalCancelCancelHandler = () =>
      {
        setShowCancelFormModal(false);
      }
  
      const modalCancelOkHandler = () =>
      {
        // close the dialog and navigate back to the Bill of Process screen
        setShowCancelFormModal(false);
        navigate('..'); 
      }
  
      const modalSubmitOkHandler = () =>
      {
        setShowSubmitFormModal(false);
        formSubmitHandler();
      }
  
      const modalSubmitCancelHandler = () =>
      {
        setShowSubmitFormModal(false);
      }
      
    const submitChangesHandler = () =>
    {
      // Only need to show the confirmation dialog if there have been changes.  Otherwise, just close the form.
      if(isBillOfProcessProcessListChanged)
      {
        setShowSubmitFormModal(true);
      }
      else
      {
        formSubmitHandler();
      }
    }

    const cancelChangesHandler = () =>
    {
      // Only need to show the confirmation dialog if there have been changes.  Otherwise, just close the form.
      if(isBillOfProcessProcessListChanged)
      {
        setShowCancelFormModal(true);
      }
      else
      {
        navigate('..');
      }
    }

  return (
      <Form method={props.method} className={classes.form} ref={formRef}>
        {showSubmitFormModal && <Modal showFromClient={showSubmitFormModal} children={modalDialogSubmitContent} allowBackdropClose={false} onCancel={modalSubmitCancelHandler} onOk={modalSubmitOkHandler}></Modal>}
        {showCancelFormModal && <Modal showFromClient={showCancelFormModal} children={modalDialogCancelContent} allowBackdropClose={false} onCancel={modalCancelCancelHandler} onOk={modalCancelOkHandler}></Modal>}
        {isLoading && <LoadingModal />}
        {componentError !== undefined && componentError.message && componentError.message.length > 0 && <ErrorDisplay title={'Error'} message={componentError.message} />}
        <div className={classes.formLayout}>
          <div className={classes.headerDiv}>
            <span><b>BOP ID</b> : {loadedBillOfProcess.billOfProcessId}</span>
          </div>
          <div className={classes.headerDiv}>
            <span><b>BOP Name</b> : {loadedBillOfProcess.name}</span>
          </div>
          <div className={classes.bopProcessListContainerOuter}>
          <span><b>Current BOP Process List</b></span>
            <div className={classes.bopProcessListContainer}>
              <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={billOfProcessProcessListDragEndHandler}
                    modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                    >
                    <SortableContext 
                        items={itemIds}
                        strategy={verticalListSortingStrategy}
                    >
                        {itemIds.map(item => 
                            <BillOfProcessProcessListItem 
                              key={'modal_current_' + item}
                              billOfProcessProcess={billOfProcessProcessItems[billOfProcessProcessItems.findIndex((billOfProcessProcessItem) => billOfProcessProcessItem.billOfProcessProcessId === item)]} 
                              isSelected={workingBillOfProcessProcessIdList.includes(item)}
                              onProcessClicked={bopProcessListClickEventHandler} 
                              showWorkElementCount={true}
                              />)}
                    </SortableContext>
                </DndContext>
            </div>
          </div>
          <div className={classes.middleColumn}>
            <div className={`${classes['divButton']} ${workingProcessIdList.length === 0 ? classes['divButtonDisabled'] : ''}`}
              onClick={addProcessesToBillOfProcessHandler}>
              <BiChevronLeft size={30} />
            </div>
            <div className={`${classes['divButton']} ${workingBillOfProcessProcessIdList.length === 0 ? classes['divButtonDisabled'] : ''}`}
              onClick={removeProcessesFromBillOfProcessHandler}>
              <BiChevronRight size={30} />
            </div>
          </div>
          <div className={classes.fullProcessListContainerOuter}>
          <span><b>Processes Available</b></span>
            <div className={classes.fullProcessListContainer}>
                  {processItems.map(item => 
                      <BillOfProcessProcessListItem 
                          key={'modal_available_' + item.billOfProcessProcessId}
                          billOfProcessProcess={item}
                          isSelected={workingProcessIdList.includes(item.billOfProcessProcessId)}
                          onProcessClicked={processListClickEventHandler} 
                          showWorkElementCount={false}
                      />
                  )}
              </div>
          </div>
          <div className={classes.actionsLayout}>
              <button type='button' className={classes.cancelButton} onClick={cancelChangesHandler}>Cancel</button>
              <button type='button' className={classes.submitButton} onClick={submitChangesHandler}>Submit Changes and Exit</button>
          </div>
        </div>
      </Form>
  );
}

export default BillOfProcessProcessListForm;

export async function action({params}:LoaderFunctionArguments) {
  
  const billOfProcessId = params.billOfProcessId ? params.billOfProcessId : '0';
  if(!isNaN(+billOfProcessId) && +billOfProcessId > 0)
  {
    return redirect('/inventory/billOfProcess/' + billOfProcessId);
  }

  // TODO: Handle bad responses here
  return redirect('/inventory/billOfProcess');
}