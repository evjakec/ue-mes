import { BillOfMaterialEntity } from "../../../models/bill-of-material-entity";
import BillOfMaterialDetailHeader from "./BillOfMaterialDetailHeader";
import BillOfMaterialDetailPartList from "./BillOfMaterialDetailPartList";

const BillOfMaterialDetail: React.FC<{billOfMaterial:BillOfMaterialEntity}> = (props) => {
    
    return (
        <>
            <BillOfMaterialDetailHeader billOfMaterial={props.billOfMaterial} />
            <BillOfMaterialDetailPartList billOfMaterial={props.billOfMaterial} />    
        </>
    );
}

export default BillOfMaterialDetail;