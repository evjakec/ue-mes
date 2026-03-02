import { useContext, useEffect, useState } from "react";
import BillOfProcessProcessListItem from "./BillOfProcessProcessListItem";
import { BillOfProcessProcessEntity } from "../../../models/bill-of-process-process-entity";
import classes from './BillOfProcessDetailProcessList.module.css'
import { Link } from "react-router-dom";
import { BillOfProcessEntity } from "../../../models/bill-of-process-entity";
import ButtonAction from "../../../ui/components/ButtonAction";
import { UserContext } from "../../../store/user-context";

const BillOfProcessDetailProcessList: React.FC<{billOfProcess:BillOfProcessEntity, 
    onProcessClicked:(selectedBillOfProcessProcess:BillOfProcessProcessEntity)=>void,
    selectedBillOfProcessProcess:BillOfProcessProcessEntity}> = (props) => {

    // Context
    const {loggedInUser} = useContext(UserContext);

    // State
    const [billOfProcessProcessItems, setBillOfProcessProcessItems] = useState([] as BillOfProcessProcessEntity[]);
    
    // The process list items can be toggled on\off, so if the same process is clicked sequentially, we need to display the opposite result.
    // If a new process is clicked, we simply set that to the new selected process and allow its work elements to render
    const processListClickEventHandler = (billOfProcessProcessId:string):void => {

        if(+billOfProcessProcessId === props.selectedBillOfProcessProcess.billOfProcessProcessId)
        {
          props.onProcessClicked({} as BillOfProcessProcessEntity);
        }
        else
        {
          const selectedProcess = billOfProcessProcessItems[billOfProcessProcessItems.findIndex((item) => item.billOfProcessProcessId === +billOfProcessProcessId)];

          // if the selected Process is valid, call the onProcessClicked event to fill the process work element list.
          if(selectedProcess && selectedProcess.billOfProcessProcessId > 0)
          {
            props.onProcessClicked(selectedProcess);
          }
        }
    }

    // use effect is used to ensure the process list refreshes with each BOP change.  Otherwise, the process list will stick with the first chosen option.
    useEffect(() => {
        setBillOfProcessProcessItems(props.billOfProcess.billOfProcessProcesses);
      }, [props.billOfProcess.billOfProcessProcesses]);
      
    return (<>
        {billOfProcessProcessItems.length === 0 && (
            <div className={classes.bopDetailProcessListEmpty}>
                <p>This BOP does not have any processes assigned.  Click the button below to edit the process list.</p>
                <div><Link to={"/inventory/billOfProcess/edit-bill-of-process-process-list/" + props.billOfProcess.billOfProcessId} className={`${loggedInUser && loggedInUser.userId && loggedInUser.userId > 0 ? classes['button'] : classes['disabledButton']}`} >
                    Edit Process List
                </Link>
                </div>
            </div>
            )}
        {billOfProcessProcessItems.length > 0 && <><p><b>Process List</b></p>
        <div className={classes.bopDetailProcessListContainerOuter}>
        <ButtonAction url={"/inventory/billOfProcess/edit-bill-of-process-process-list/" + props.billOfProcess.billOfProcessId}  buttonAction="Edit" />
        <div className={classes.bopDetailProcessListContainer}>
                {billOfProcessProcessItems.map(item => 
                    <BillOfProcessProcessListItem 
                        key={'current_' + item.billOfProcessProcessId}
                        billOfProcessProcess={item}
                        isSelected={item.billOfProcessProcessId === props.selectedBillOfProcessProcess.billOfProcessProcessId}
                        onProcessClicked={processListClickEventHandler} 
                        showWorkElementCount={true}
                    />
                )}
            </div>
        </div>
        </>}
    </>);
}

export default BillOfProcessDetailProcessList;