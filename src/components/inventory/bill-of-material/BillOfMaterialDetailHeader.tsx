import { BillOfMaterialEntity } from "../../../models/bill-of-material-entity";
import ButtonAction from "../../../ui/components/ButtonAction";
import CommonStyledText from "../../../ui/components/CommonStyledText";
import classes from './BillOfMaterialDetailHeader.module.css'

const BillOfMaterialDetailHeader: React.FC<{billOfMaterial:BillOfMaterialEntity}> = (props) => {
    return (
    <div className={classes.bomDetail}>
        <div className={classes.bomDetailLabel}><ButtonAction url={"/inventory/billOfMaterial/edit-bill-of-material/" + props.billOfMaterial.billOfMaterialId}  buttonAction="Edit" /></div>
        <div className={classes.bomDetailValue}><span></span></div>
        <div className={classes.bomDetailLabel}>BOM Name:</div>
        <div className={classes.bomDetailValue}>{props.billOfMaterial.name}</div>
        <div className={classes.bomDetailLabel}>Description:</div>
        <div className={classes.bomDetailValue}>{props.billOfMaterial.description}</div>
        <div className={classes.bomDetailLabel}>Part:</div>
        <div className={classes.bomDetailValue}>{props.billOfMaterial.part.partNumber  + ' (' + props.billOfMaterial.part.partRevision + ') '}</div>
        <div className={classes.bomDetailLabel}>Part Type:</div>
        <div className={classes.bomDetailValue}><CommonStyledText text={props.billOfMaterial.part.partType} /></div>
        <div className={classes.bomDetailLabel}>Effective:</div>
        <div className={classes.bomDetailValue}>
            {new Date(props.billOfMaterial.effectiveStartDate).toLocaleString()}
            <span><b>  to  </b></span>
            {!props.billOfMaterial.effectiveEndDate && "No end date set"}
            {props.billOfMaterial.effectiveEndDate && new Date(props.billOfMaterial.effectiveEndDate).toLocaleString()}
        </div>
    </div>);
}

export default BillOfMaterialDetailHeader;