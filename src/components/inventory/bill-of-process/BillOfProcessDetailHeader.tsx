import { BillOfProcessEntity } from "../../../models/bill-of-process-entity";
import ButtonAction from "../../../ui/components/ButtonAction";
import CommonStyledText from "../../../ui/components/CommonStyledText";
import classes from './BillOfProcessDetailHeader.module.css'

const BillOfProcessDetailHeader: React.FC<{billOfProcess:BillOfProcessEntity}> = (props) => {
    return (
    <div className={classes.bopDetail}>
        <div className={classes.bopDetailLabel}><ButtonAction url={"/inventory/billOfProcess/edit-bill-of-process/" + props.billOfProcess.billOfProcessId}  buttonAction="Edit" /></div>
        <div className={classes.bopDetailValue}><span></span></div>
        <div className={classes.bopDetailLabel}>BOP Name:</div>
        <div className={classes.bopDetailValue}>{props.billOfProcess.name}</div>
        <div className={classes.bopDetailLabel}>Description:</div>
        <div className={classes.bopDetailValue}>{props.billOfProcess.description}</div>
        <div className={classes.bopDetailLabel}>Part:</div>
        <div className={classes.bopDetailValue}>{props.billOfProcess.part.partNumber  + ' (' + props.billOfProcess.part.partRevision + ') '}</div>
        <div className={classes.bopDetailLabel}>Part Type:</div>
        <div className={classes.bopDetailValue}><CommonStyledText text={props.billOfProcess.part.partType} /></div>
        <div className={classes.bopDetailLabel}>Effective:</div>
        <div className={classes.bopDetailValue}>
            {new Date(props.billOfProcess.effectiveStartDate).toLocaleString()}
            <span><b>  to  </b></span>
            {!props.billOfProcess.effectiveEndDate && "No end date set"}
            {props.billOfProcess.effectiveEndDate && new Date(props.billOfProcess.effectiveEndDate).toLocaleString()}
        </div>
    </div>);
}

export default BillOfProcessDetailHeader;