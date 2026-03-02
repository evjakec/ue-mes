import { OrderItemEntity } from "../../models/order-item-entity";
import { getAttributeValueByName, getDynamicIGUStyleHeightPercentage, getDynamicIGUStyleWidthPercentage, millimetersToInches } from "../../ui/scripts/CommonFunctions";
import classes from './OrderItem.module.css'

// If for whatever reason the environment variables are not available, the defaults will be used.
const iguMinLengthInMillimeters = process.env.REACT_APP_IGU_MIN_HEIGHT_MM ? +process.env.REACT_APP_IGU_MIN_HEIGHT_MM : 508;
const iguMaxLengthInMillimeters = process.env.REACT_APP_IGU_MAX_HEIGHT_MM ? +process.env.REACT_APP_IGU_MAX_HEIGHT_MM : 3000;
const iguDivMinPercent = process.env.REACT_APP_IGU_DIV_MIN_PERCENT ? +process.env.REACT_APP_IGU_DIV_MIN_PERCENT : 50;
const iguDivMaxPercent = process.env.REACT_APP_IGU_DIV_MAX_PERCENT ? +process.env.REACT_APP_IGU_DIV_MAX_PERCENT : 100;

const OrderItem: React.FC<{orderItem:OrderItemEntity}> = (props) => {
    return (
    <div className={classes.orderItemContainer}>
        <div className={classes.orderItemHeader}>
            <div className={`${classes['orderItemLabel']} ${classes['orderItemPart']}`}>Part</div>
            <div className={`${classes['orderItemLabel']} ${classes['orderItemQuantity']}`}>Quantity</div>
            <div className={`${classes['orderItemLabel']} ${classes['orderItemHxW']}`}>H x W</div>
            <div className={`${classes['orderItemLabel']} ${classes['orderItemIGUType']}`}>IGU type</div>
            <div className={`${classes['orderItemLabel']} ${classes['orderItemScribeOrientation']}`}>Scribe Orientation</div>
            <div className={`${classes['orderItemLabel']} ${classes['orderItemIGUStep']}`}>IGU Step</div>
        </div>
        <div className={classes.orderItemDetail}>
            <div className={`${classes['orderItemValue']} ${classes['orderItemPart']}`}>{props.orderItem.finishedPart.partNumber + '-' + props.orderItem.finishedPart.partRevision + ' : ' + props.orderItem.finishedPart.description}</div>
            <div className={`${classes['orderItemValue']} ${classes['orderItemQuantity']}`}>{props.orderItem.quantity}</div>
            <div className={`${classes['orderItemValue']} ${classes['orderItemHxW']}`}>
                <div className={classes.box} 
                    // The dynamic height and width are based on the IGU dimensions.  The visual will be of the IGU as it is installed in a window, so some could appear portait, while others landscape.
                    // We acheive this by first setting the height to a percentage of the containing div, and then set the width based on the height.
                    style={{width: `${getDynamicIGUStyleWidthPercentage(+getAttributeValueByName('Width (mm)',props.orderItem),+getAttributeValueByName('Height (mm)',props.orderItem),iguMinLengthInMillimeters,iguMaxLengthInMillimeters,iguDivMinPercent,iguDivMaxPercent)}%`
                        , height: `${getDynamicIGUStyleHeightPercentage(+getAttributeValueByName('Height (mm)',props.orderItem),iguMinLengthInMillimeters,iguMaxLengthInMillimeters,iguDivMinPercent,iguDivMaxPercent)}%`}}>
                </div>
            </div>
            <div className={`${classes['orderItemValue']} ${classes['orderItemIGUType']}`}>
                <img alt={"IGU Type" + getAttributeValueByName('IGU Type',props.orderItem)} src={process.env.PUBLIC_URL + '/igu-images/IGUType' + getAttributeValueByName('IGU Type',props.orderItem) + '.png'}></img>
            </div>
            <div className={`${classes['orderItemValue']} ${classes['orderItemScribeOrientation']}`}>
                <img alt={"Scribe Orientation" + getAttributeValueByName('Scribe Orientation',props.orderItem)} src={process.env.PUBLIC_URL + '/igu-images/ScribeOrientation' + getAttributeValueByName('Scribe Orientation',props.orderItem) + '.png'}></img>
            </div>
            <div className={`${classes['orderItemValue']} ${classes['orderItemIGUStep']}`}><img alt={"IGU Step " + getAttributeValueByName('IGU Step',props.orderItem)} src={process.env.PUBLIC_URL + '/igu-images/IGUStep' + getAttributeValueByName('IGU Step',props.orderItem) + '.png'}></img></div>
        </div>
        <div className={classes.orderItemFooter}>
            <div className={`${classes['orderItemLabel']} ${classes['orderItemPart']}`}></div>
            <div className={`${classes['orderItemLabel']} ${classes['orderItemQuantity']}`}></div>
            <div className={`${classes['orderItemLabel']} ${classes['orderItemHxW']}`}>{millimetersToInches(+getAttributeValueByName('Height (mm)',props.orderItem)) + '" x ' + millimetersToInches(+getAttributeValueByName('Width (mm)',props.orderItem)) + '"'}</div>
            <div className={`${classes['orderItemLabel']} ${classes['orderItemIGUType']}`}><b>{getAttributeValueByName('IGU Type',props.orderItem)}</b></div>
            <div className={`${classes['orderItemLabel']} ${classes['orderItemScribeOrientation']}`}><b>{getAttributeValueByName('Scribe Orientation',props.orderItem)}</b></div>
            <div className={`${classes['orderItemLabel']} ${classes['orderItemIGUStep']}`}></div>
        </div>
    </div>);
}

export default OrderItem;