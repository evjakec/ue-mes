import { useEffect, useState } from "react";
import { BillOfProcessEntity } from "../../../models/bill-of-process-entity";
import BillOfProcessDetailProcessList from "./BillOfProcessDetailProcessList";
import { BillOfProcessProcessEntity } from "../../../models/bill-of-process-process-entity";
import BillOfProcessDetailProcessWorkElementList from "./BillOfProcessDetailProcessWorkElementList";
import classes from './BillOfProcessDetailElements.module.css'
import ButtonAction from "../../../ui/components/ButtonAction";

const BillOfProcessDetailElements: React.FC<{billOfProcess:BillOfProcessEntity}> = (props) => {
    const [selectedBillOfProcess, setSelectedBillOfProcess] = useState({} as BillOfProcessEntity);
    const [selectedBillOfProcessProcess, setSelectedBillOfProcessProcess] = useState({} as BillOfProcessProcessEntity);

    const selectedBillOfProcessProcessHandler = (liftedBillOfProcessProcess:BillOfProcessProcessEntity) => {
        setSelectedBillOfProcessProcess(liftedBillOfProcessProcess);
    }

    // use effect is used to ensure the process list refreshes with each BOP selection change.
    useEffect(() => {
        // If the incoming BOP ID has changed, then we need to clear the selected BOP Process as well
        if(selectedBillOfProcess.billOfProcessId !== props.billOfProcess.billOfProcessId)
        {
            setSelectedBillOfProcess(props.billOfProcess);
            setSelectedBillOfProcessProcess({} as BillOfProcessProcessEntity);
        }
      }, [props.billOfProcess, selectedBillOfProcess]);
      
    return (<>
    <div className={classes.processListWorkElementLayout}>
        <div className={classes.processList}>
            <BillOfProcessDetailProcessList billOfProcess={props.billOfProcess} onProcessClicked={selectedBillOfProcessProcessHandler} selectedBillOfProcessProcess={selectedBillOfProcessProcess} />
        </div>
        <div className={classes.workElementList}>
            {props.billOfProcess && props.billOfProcess.billOfProcessProcesses.length > 0 && 
            <>
            <p><b>Work Element List</b></p>
            <div className={classes.bopDetailProcessWorkElementListContainerOuter}>
                {selectedBillOfProcessProcess && selectedBillOfProcessProcess.billOfProcessProcessId > 0 &&  
                <>
                    <ButtonAction url={"/inventory/billOfProcess/edit-bill-of-process-work-elements/" + props.billOfProcess.billOfProcessId + '/' + selectedBillOfProcessProcess.billOfProcessProcessId}  buttonAction="Edit" />
                    <BillOfProcessDetailProcessWorkElementList billOfProcessProcess={selectedBillOfProcessProcess}
                        isSortable={false} />
                </>}
            </div>
            </>}
        </div>
    </div>
    </>);
}

export default BillOfProcessDetailElements;