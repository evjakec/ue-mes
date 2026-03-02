import { BillOfProcessEntity } from "../../../models/bill-of-process-entity";
import BillOfProcessDetailElements from "./BillOfProcessDetailElements";
import BillOfProcessDetailHeader from "./BillOfProcessDetailHeader";

const BillOfProcessDetail: React.FC<{billOfProcess:BillOfProcessEntity}> = (props) => {
    
    return (<>
        <BillOfProcessDetailHeader billOfProcess={props.billOfProcess} />
        <BillOfProcessDetailElements billOfProcess={props.billOfProcess} />    
    </>);
}

export default BillOfProcessDetail;