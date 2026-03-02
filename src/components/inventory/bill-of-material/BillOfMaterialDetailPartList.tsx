import { useContext, useEffect, useState } from "react";
import { BillOfMaterialPartEntity } from "../../../models/bill-of-material-part-entity";
import classes from './BillOfMaterialDetailPartList.module.css'
import { Link } from "react-router-dom";
import { BillOfMaterialEntity } from "../../../models/bill-of-material-entity";
import ButtonAction from "../../../ui/components/ButtonAction";
import BillOfMaterialPartListItem from "./BillOfMaterialPartListItem";
import { UserContext } from "../../../store/user-context";

const BillOfMaterialDetailPartList: React.FC<{billOfMaterial:BillOfMaterialEntity, 
    onPartClicked?:(selectedBillOfMaterialPart:BillOfMaterialPartEntity)=>void,
    selectedBillOfMaterialPart?:BillOfMaterialPartEntity}> = (props) => {

    // Context
    const {loggedInUser} = useContext(UserContext);
    
    // State
    const [billOfMaterialPartItems, setBillOfMaterialPartItems] = useState([] as BillOfMaterialPartEntity[]);
    
    // The part list items can be toggled on\off, so if the same part is clicked sequentially, we need to display the opposite result.
    // If a new part is clicked, we simply set that to the new selected part and allow its work elements to render
    const partListClickEventHandler = (billOfMaterialPartId:string):void => {

        if(props.selectedBillOfMaterialPart && +billOfMaterialPartId === props.selectedBillOfMaterialPart.billOfMaterialPartId)
        {
            props.onPartClicked && props.onPartClicked({} as BillOfMaterialPartEntity);
        }
        else
        {
          const selectedPart = billOfMaterialPartItems[billOfMaterialPartItems.findIndex((item) => item.billOfMaterialPartId === +billOfMaterialPartId)];

          // if the selected Part is valid, call the onPartClicked event to fill the part work element list.
          if(selectedPart && selectedPart.billOfMaterialPartId > 0)
          {
            props.onPartClicked && props.onPartClicked(selectedPart);
          }
        }
    }

    // use effect is used to ensure the part list refreshes with each BOP change.  Otherwise, the part list will stick with the first chosen option.
    useEffect(() => {
        setBillOfMaterialPartItems(props.billOfMaterial.billOfMaterialParts);
      }, [props.billOfMaterial.billOfMaterialParts]);
      
    return (<>
        {billOfMaterialPartItems.length === 0 && (
                <><p>This BOM does not have any parts assigned.  Click the button below to edit the part list.</p>
                <div><Link to={"/inventory/billOfMaterial/edit-bill-of-material-part-list/" + props.billOfMaterial.billOfMaterialId} className={`${loggedInUser && loggedInUser.userId && loggedInUser.userId > 0 ? classes['button'] : classes['disabledButton']}`} >
                    Edit Part List
                </Link>
                </div>
            </>
            )}
        {billOfMaterialPartItems.length > 0 && <><p><b>Part List</b></p>
        <div className={classes.bomDetailPartListContainerOuter}>
            <div className={classes.bomDetailPartListContainerActions}>
                <ButtonAction url={"/inventory/billOfMaterial/edit-bill-of-material-part-list/" + props.billOfMaterial.billOfMaterialId}  buttonAction="Edit" />
            </div>
        <div className={classes.bomDetailPartListContainer}>
                {billOfMaterialPartItems.map(item => 
                    <BillOfMaterialPartListItem 
                        key={item.billOfMaterialPartId}
                        billOfMaterialPart={item}
                        isSelected={props.selectedBillOfMaterialPart !== undefined && item.billOfMaterialPartId === props.selectedBillOfMaterialPart.billOfMaterialPartId}
                        onPartClicked={partListClickEventHandler} 
                    />
                )}
            </div>
        </div>
        </>}
    </>);
}

export default BillOfMaterialDetailPartList;