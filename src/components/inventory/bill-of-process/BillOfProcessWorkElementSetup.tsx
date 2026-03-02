import { useEffect, useState } from "react";
import { BillOfProcessProcessWorkElementEntity } from "../../../models/bill-of-process-process-work-element-entity";
import classes from './BillOfProcessWorkElementSetup.module.css'
import { BillOfProcessProcessWorkElementAttributeEntity } from "../../../models/bill-of-process-process-work-element-attribute-entity";
import BillOfProcessWorkElementSetupText from "./BillOfProcessWorkElementSetupText";
import BillOfProcessWorkElementSetupImage from "./BillOfProcessWorkElementSetupImage";
import BillOfProcessWorkElementSetupDataCollection from "./BillOfProcessWorkElementSetupDataCollection";
import BillOfProcessWorkElementSetupConsumption from "./BillOfProcessWorkElementSetupConsumption";
import { WorkElementTypeAttributeEntity } from "../../../models/work-element-type-attribute-entity";
import { BillOfMaterialEntity } from "../../../models/bill-of-material-entity";

const BillOfProcessWorkElementSetup: React.FC<{billOfProcessProcessWorkElement:BillOfProcessProcessWorkElementEntity
    billOfProcessProcessWorkElementList:BillOfProcessProcessWorkElementEntity[],
    workElementTypeAttributes:WorkElementTypeAttributeEntity[],
    billOfMaterial?:BillOfMaterialEntity,
    onSaveActiveWorkElementAttributes:(billOfProcessProcessWorkElementAttributes:BillOfProcessProcessWorkElementAttributeEntity[])=>void}> = (props) => {
    
    const [isWorkElementHydrated, setIsWorkElementHydrated] = useState(false);
    const [activeWorkElementAttributes, setActiveWorkElementAttributes] = useState([] as BillOfProcessProcessWorkElementAttributeEntity[]);
    // const [props.billOfProcessProcessWorkElement, setprops.billOfProcessProcessWorkElement] = useState(props.billOfProcessProcessWorkElement);

    const activeWorkElementAttributesSaveHanlder = (updatedBillOfProcessProcessWorkElementAttributes:BillOfProcessProcessWorkElementAttributeEntity[]) => {
        setActiveWorkElementAttributes(updatedBillOfProcessProcessWorkElementAttributes);
        props.onSaveActiveWorkElementAttributes(updatedBillOfProcessProcessWorkElementAttributes);
    }

    useEffect(() => {
        setIsWorkElementHydrated(props.billOfProcessProcessWorkElement && props.billOfProcessProcessWorkElement.billOfProcessProcessWorkElementId !== undefined && props.billOfProcessProcessWorkElement.billOfProcessProcessWorkElementId !== 0);
        setActiveWorkElementAttributes(props.billOfProcessProcessWorkElement.billOfProcessProcessWorkElementAttributes);
      }, [props.billOfProcessProcessWorkElement,props.billOfProcessProcessWorkElementList]);
      
    return (
    <>
        {props.billOfProcessProcessWorkElement.workElementType 
            && isWorkElementHydrated 
            && 
            <><div className={classes.workElementSetupContainer}>
                {props.billOfProcessProcessWorkElement.workElementType.name === 'Text' &&
                    <div>
                        <BillOfProcessWorkElementSetupText 
                            billOfProcessProcessWorkElement={props.billOfProcessProcessWorkElement}
                            billOfProcessProcessWorkElementAttributes={activeWorkElementAttributes}
                            workElementTypeAttributes={props.workElementTypeAttributes}
                            onWorkElementAttributesUpdated={activeWorkElementAttributesSaveHanlder}
                            />
                    </div>
                }
                {props.billOfProcessProcessWorkElement.workElementType.name === 'Image' &&
                    <div>
                        <BillOfProcessWorkElementSetupImage 
                            billOfProcessProcessWorkElement={props.billOfProcessProcessWorkElement}
                            billOfProcessProcessWorkElementAttributes={activeWorkElementAttributes}
                            workElementTypeAttributes={props.workElementTypeAttributes}
                            onWorkElementAttributesUpdated={activeWorkElementAttributesSaveHanlder}
                            />
                    </div>
                } 
                {props.billOfProcessProcessWorkElement.workElementType.name === 'Data Collection' &&
                    <div>
                        <BillOfProcessWorkElementSetupDataCollection 
                            billOfProcessProcessWorkElement={props.billOfProcessProcessWorkElement}
                            billOfProcessProcessWorkElementAttributes={activeWorkElementAttributes}
                            workElementTypeAttributes={props.workElementTypeAttributes}
                            onWorkElementAttributesUpdated={activeWorkElementAttributesSaveHanlder}
                            />
                    </div>
                }  
                {props.billOfProcessProcessWorkElement.workElementType.name === 'Consumption' &&
                    <div>
                        <BillOfProcessWorkElementSetupConsumption 
                            billOfProcessProcessWorkElement={props.billOfProcessProcessWorkElement}
                            billOfProcessProcessWorkElementAttributes={activeWorkElementAttributes}
                            workElementTypeAttributes={props.workElementTypeAttributes}
                            billOfMaterial={props.billOfMaterial as BillOfMaterialEntity}
                            onWorkElementAttributesUpdated={activeWorkElementAttributesSaveHanlder}
                            />
                    </div>
                }                
            </div>
            </>
        }
    </>
    );
}

export default BillOfProcessWorkElementSetup;