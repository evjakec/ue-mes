import { NavLink } from 'react-router-dom';
import headerLogoImage from '../images/mechanical-arm-svgrepo-com.svg'
import classes from './MainHeader.module.css';
import { useContext, useEffect, useState } from 'react';
import { BiSolidUserCircle } from 'react-icons/bi';
import UserLogin from './UserLogin';
import { UserContext } from '../../store/user-context';

const MainHeader:React.FC<{isRunMode:boolean}> =(props) => {

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

  useEffect(() => {
      setShowSignInModal(false);
    },[]);
  
  return (
    <>
      {!props.isRunMode && 
        <>
          {showSignInModal && 
          <>
            <div className={classes.signInModalBackdrop} onClick={signInModalCloseHandler} />
              <dialog open={showSignInModal} className={classes.signInModal}>
                <div><UserLogin /></div>
            </dialog>
          </>
          }
          <header className={classes.setupHeader}>
            <div>
              <img src={headerLogoImage} className={classes.setupLogoImage} alt='Company Logo'></img>
              <nav className={classes.navBody}>
                <ul className={classes.list}>
                  <li key='Home'>
                    <NavLink
                      to="/"
                      className={({ isActive }) =>
                        isActive ? classes.active : undefined
                      }
                    >
                      Home
                    </NavLink>
                  </li>
                  <li key='Inventory'>
                    <NavLink
                      to="/inventory"
                      className={({ isActive }) =>
                        isActive ? classes.active : undefined
                      }
                    >
                      Inventory
                    </NavLink>
                  </li>
                  <li key='Orders'>
                    <NavLink
                      to="/orders"
                      className={({ isActive }) =>
                        isActive ? classes.active : undefined
                      }
                    >
                      Orders
                    </NavLink>
                  </li>
                </ul>
              </nav>
            </div>
            <div>
              {loggedInUser && loggedInUser.userId && loggedInUser.userId > 0 &&
                <div className={classes.signInContainer}>
                  <img alt={loggedInUser.firstName + ' ' + loggedInUser.lastName + ' profile photo'} src={loggedInUser.userPhotoLink} className={classes.smallProfilePhotoRounded} referrerPolicy="no-referrer"></img>
                  <button type='button' className={classes.signInButton} onClick={signOutButtonHandler}>{loggedInUser.firstName}</button>
                </div>
              }
              {(!loggedInUser || !loggedInUser.userId || loggedInUser.userId <= 0) &&
                <div className={classes.signInContainer}>
                  <BiSolidUserCircle className={classes.smallProfilePhotoRounded}/>                
                  <button type='button' className={classes.signInButton} onClick={signInButtonHandler}>Sign In</button>
                </div>
              }
            </div>
          </header>
        </>
      }
    </>
  );
}

export default MainHeader;