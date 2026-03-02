import classes from './RunHeader.module.css'
import headerLogoOnlyImage from '../../ui/images/mechanical-arm-svgrepo-com.svg'
import { OrderItemUnitEquipmentAndUserViewModel } from '../../view-models/order-item-unit-equipment-user-view-model';
import { useContext, useState } from 'react';
import { UserContext } from '../../store/user-context';
import { BiUserCircle } from 'react-icons/bi';
import UserLogin from '../../ui/components/UserLogin';

const RunHeader:React.FC<{orderItemUnitEquipmentAndUser:OrderItemUnitEquipmentAndUserViewModel,
  isOrderItemUnitEquipmentAndUserLoaded:boolean}> = (props) => {

  const {loggedInUser} = useContext(UserContext);
  const [showSignInModal, setShowSignInModal] = useState(false);
  
  const signInButtonHandler = () =>
  {
    setShowSignInModal(true);
  }

  const signOutButtonHandler = () =>
  {
    setShowSignInModal(true);
  }

  const signInModalCloseHandler = () => {
    setShowSignInModal(false);
  }

return (
  <header>
    {showSignInModal && 
      <>
        <div className={classes.signInModalBackdrop} onClick={signInModalCloseHandler} />
          <dialog open={showSignInModal} className={classes.signInModal}>
            <div><UserLogin /></div>
        </dialog>
      </>
    }
      <div className={classes.runHeaderContainer}>
        <div className={classes.runLogoImageDiv}>
          <img src={headerLogoOnlyImage} className={classes.runLogoImage} alt='Company Logo'></img>
        </div>
        { props.isOrderItemUnitEquipmentAndUserLoaded && 
          <div className={classes.runHeaderDetails}>
            Order : <b>{props.orderItemUnitEquipmentAndUser && props.orderItemUnitEquipmentAndUser.orderItemUnit && props.orderItemUnitEquipmentAndUser.orderItemUnit && props.orderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitId > 0 ? props.orderItemUnitEquipmentAndUser.orderItemUnit.orderItem.order.number : 'NA'}</b>
              |   Equipment: <b>{props.orderItemUnitEquipmentAndUser && props.orderItemUnitEquipmentAndUser.equipment && props.orderItemUnitEquipmentAndUser.equipment.equipmentId > 0  ? props.orderItemUnitEquipmentAndUser.equipment.name : 'NA'}</b>
                  |  Serial Number: <b>{props.orderItemUnitEquipmentAndUser && props.orderItemUnitEquipmentAndUser.orderItemUnit && props.orderItemUnitEquipmentAndUser.orderItemUnit && props.orderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitId > 0 ? props.orderItemUnitEquipmentAndUser.orderItemUnit.serialNumber : 'NA'}</b>
          </div>
        }
      {loggedInUser && loggedInUser.userId && loggedInUser.userId > 0 &&
          <div className={classes.signInContainer}>
            <img alt={loggedInUser.firstName + ' ' + loggedInUser.lastName + ' profile photo'} src={loggedInUser.userPhotoLink} className={classes.smallProfilePhotoRounded} referrerPolicy="no-referrer"></img>
            <button type='button' className={classes.signInButton} onClick={signOutButtonHandler}>{loggedInUser.firstName}</button>
          </div>
        }
        {(!loggedInUser || !loggedInUser.userId || loggedInUser.userId <= 0) &&
          <div className={classes.signInContainer}>
            <BiUserCircle className={classes.smallProfilePhotoRounded}/>                
            <button type='button' className={classes.signInButton} onClick={signInButtonHandler}>Sign In</button>
          </div>
        }
      </div>
    </header>
  );
}

export default RunHeader;