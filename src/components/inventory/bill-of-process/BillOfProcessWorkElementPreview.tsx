import { useCallback, useEffect, useMemo, useState } from 'react';
import { BillOfProcessProcessWorkElementEntity } from '../../../models/bill-of-process-process-work-element-entity';
import { OrderItemUnitWorkElementHistoryEntity } from '../../../models/order-item-unit-work-element-history-entity';
import classes from './BillOfProcessWorkElementPreview.module.css'
import { OrderItemUnitEntity } from '../../../models/order-item-unit-entity';
import { WorkElementStatusEntity } from '../../../models/work-element-status-entity';
import BillOfProcessWorkElementRunText from './BillOfProcessWorkElementRunText';
import BillOfProcessWorkElementRunImage from './BillOfProcessWorkElementRunImage';
import BillOfProcessWorkElementRunDataCollection from './BillOfProcessWorkElementRunDataCollection';
import BillOfProcessWorkElementRunConsumption from './BillOfProcessWorkElementRunConsumption';
import { BillOfMaterialEntity } from '../../../models/bill-of-material-entity';

const BillOfProcessWorkElementRun:React.FC<{billOfProcessProcessWorkElement:BillOfProcessProcessWorkElementEntity,
    billOfMaterial?:BillOfMaterialEntity,
    billOfProcessProcessWorkElementList:BillOfProcessProcessWorkElementEntity[]}> = (props) => {

    // Default work element is used to reset the header controls after an item is added or edited.
    const emptyOrderItemUnitWorkElementHistory = useMemo(() => ({
        orderItemUnitWorkElementHistoryId:0,
        orderItemUnit:{} as OrderItemUnitEntity,
        billOfProcessProcessWorkElement:{} as BillOfProcessProcessWorkElementEntity,
        workElementStatus:{} as WorkElementStatusEntity,
        startDate:new Date(),
        startDateUtc:new Date()
      } as OrderItemUnitWorkElementHistoryEntity),[]);

    // putting this in here for testing, but will likely need to move it out to the parent component
    const [mockedOrderItemUnitWorkElementHistories, setMockedOrderItemUnitWorkElementHistories] = useState([] as OrderItemUnitWorkElementHistoryEntity[]);
    const [isWorkElementHydrated, setIsWorkElementHydrated] = useState(false);
    
    const refreshMockedOrderItemUnitWorkElementHistoriesWithSelectedWorkElement = useCallback(():void => 
    {
        const updatedOrderItemUnitWorkElements = props.billOfProcessProcessWorkElementList.map((workElement) => {
            
            return {...emptyOrderItemUnitWorkElementHistory, 
                workElementStatus: workElement.sequence < props.billOfProcessProcessWorkElement.sequence ? {name:"Complete"} as WorkElementStatusEntity : 
                    workElement.sequence === props.billOfProcessProcessWorkElement.sequence ? {name:"In Progress"} as WorkElementStatusEntity : 
                    {name:"Unknown"} as WorkElementStatusEntity,
                billOfProcessProcessWorkElement:workElement};
          });

          setMockedOrderItemUnitWorkElementHistories(updatedOrderItemUnitWorkElements);
    },[emptyOrderItemUnitWorkElementHistory,props.billOfProcessProcessWorkElement,props.billOfProcessProcessWorkElementList]);

    useEffect(() => {
        setIsWorkElementHydrated(props.billOfProcessProcessWorkElement && props.billOfProcessProcessWorkElement.billOfProcessProcessWorkElementId !== undefined && props.billOfProcessProcessWorkElement.billOfProcessProcessWorkElementId !== 0 && props.billOfProcessProcessWorkElementList.findIndex(workElement => workElement.billOfProcessProcessWorkElementId === props.billOfProcessProcessWorkElement.billOfProcessProcessWorkElementId) >= 0)
        refreshMockedOrderItemUnitWorkElementHistoriesWithSelectedWorkElement();
    }, [props.billOfProcessProcessWorkElement, props.billOfProcessProcessWorkElementList,refreshMockedOrderItemUnitWorkElementHistoriesWithSelectedWorkElement]);
        
    return (        
        <div className={classes.workElementContainerOuter}>
            <div className={classes.workElementContainerLeft}>
                <div className={classes.workElementListContainerOuter}>
                    {props.billOfProcessProcessWorkElementList.map(workElement => {
                        const mockedOrderItemUnitWorkElementHistory = mockedOrderItemUnitWorkElementHistories.find(orderItemUnitWorkElementHistory => orderItemUnitWorkElementHistory.billOfProcessProcessWorkElement.billOfProcessProcessWorkElementId === workElement.billOfProcessProcessWorkElementId);
                        return (<div key={workElement.billOfProcessProcessWorkElementId} 
                            className={`${classes['divWorkElementRun']} ${mockedOrderItemUnitWorkElementHistory && mockedOrderItemUnitWorkElementHistory.workElementStatus ? classes[mockedOrderItemUnitWorkElementHistory.workElementStatus.name.replace(/\s/g, "")] : 'Unknown'}`}>
                            {workElement.name}
                        </div>);
                        }
                    )}                
                </div>
            </div>
            <div className={classes.workElementContainerRight}>
                <div className={classes.workElementContentContainerOuter}>
                {props.billOfProcessProcessWorkElement.workElementType 
                    && isWorkElementHydrated 
                    && 
                    <div className={classes.workElementSetupContainer}>
                        {props.billOfProcessProcessWorkElement.workElementType.name === 'Text' &&
                        <div>
                            <BillOfProcessWorkElementRunText
                                runMode="Preview"
                                billOfProcessProcessWorkElement={props.billOfProcessProcessWorkElement}
                                billOfProcessProcessWorkElementAttributes={props.billOfProcessProcessWorkElement.billOfProcessProcessWorkElementAttributes}
                                />
                        </div>}
                        {props.billOfProcessProcessWorkElement.workElementType.name === 'Image' &&
                        <div>
                            <BillOfProcessWorkElementRunImage
                                runMode="Preview"
                                billOfProcessProcessWorkElement={props.billOfProcessProcessWorkElement}
                                billOfProcessProcessWorkElementAttributes={props.billOfProcessProcessWorkElement.billOfProcessProcessWorkElementAttributes}
                                />
                        </div>}
                        {props.billOfProcessProcessWorkElement.workElementType.name === 'Data Collection' &&
                        <div>
                            <BillOfProcessWorkElementRunDataCollection
                                runMode="Preview"
                                isOrderItemUnitScrapped={false}
                                billOfProcessProcessWorkElement={props.billOfProcessProcessWorkElement}
                                billOfProcessProcessWorkElementAttributes={props.billOfProcessProcessWorkElement.billOfProcessProcessWorkElementAttributes}
                                />
                        </div>}
                        {props.billOfProcessProcessWorkElement.workElementType.name === 'Consumption' &&
                        <div>
                            <BillOfProcessWorkElementRunConsumption
                                runMode="Preview"
                                isOrderItemUnitScrapped={false}
                                billOfProcessProcessWorkElement={props.billOfProcessProcessWorkElement}
                                billOfMaterial={props.billOfMaterial as BillOfMaterialEntity}
                                billOfProcessProcessWorkElementAttributes={props.billOfProcessProcessWorkElement.billOfProcessProcessWorkElementAttributes}
                                />
                        </div>}
                    </div>
                }
                </div>
            </div>
        </div>);
}

export default BillOfProcessWorkElementRun;