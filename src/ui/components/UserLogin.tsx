import { Form, useLocation } from 'react-router-dom';

import classes from './UserLogin.module.css';
// import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { useCookies } from 'react-cookie';
import { useContext, useRef} from 'react';
import { UserContext } from '../../store/user-context';
import { postNoAuthenticate } from '../scripts/ApiFunctions';

const UserLogin:React.FC = () => {
  
    const [userTokenCookie, setUserTokenCookie, removeUserTokenCookie] = useCookies(['userToken']);
    const {loggedInUser, setLoggedInUser, clearLoggedInUser} = useContext(UserContext);
    const routeLocation = useLocation();
    const isInRunMode = routeLocation.pathname.includes('/run');
    const formActionRedirect = isInRunMode ? '/run/logout' : '/logout';

    let formRef = useRef<HTMLFormElement>(null);
        
    const loginSuccessHandler = ():void => {
      postNoAuthenticate().then((stringResponse) => {
            if(stringResponse !== "Failed to authenticate")
            {
                setUserTokenCookie('userToken',stringResponse);
                setLoggedInUser();
            }
        }).catch(()=> {throw new Error('Unable to authenticate with Hard Coded ID.')})
    }

    // const loginErrorHandler = () => {
    //     console.log('Login Failed');
    // } 

      const logoutFormSubmitHandler = ():void => {
        
        // Clear the user token query
        removeUserTokenCookie('userToken');
        clearLoggedInUser();

        // Then complete the submit, which will route them back to home.
        formRef.current?.dispatchEvent(
            new Event("submit", { cancelable: true, bubbles: true })
        )
      }
        
    return (
    <div className={classes.userLoginContainer}>
      {!userTokenCookie.userToken && 
      <div className={classes.loggedOutUserContainer}>
        {/* <GoogleLogin
          onSuccess={loginSuccessHandler}
          onError={loginErrorHandler}
          shape='pill'
          size='large'
          /> */}
          <div className={classes.loginButtonContainer}>
              <button type='button' className={classes.signInButton} onClick={loginSuccessHandler}>Sign In</button>
            </div>
        </div>
      }
      {userTokenCookie.userToken && 
        <Form action={formActionRedirect} method="post" ref={formRef}>
            <div className={classes.loggedInUserContainer}>
              <img alt={loggedInUser.firstName + ' ' + loggedInUser.lastName + ' profile photo'} src={loggedInUser.userPhotoLink} className={classes.loggedInUserPhoto} referrerPolicy="no-referrer"></img>
              <div>
                <div><b>{loggedInUser.firstName + ' ' + loggedInUser.lastName}</b></div>
                <div>{loggedInUser.jobTitle}</div>
              </div>              
            </div>
            <div className={classes.logoutButtonContainer}>
              <button type='button' className={classes.signOutButton} onClick={logoutFormSubmitHandler}>Sign Out</button>
            </div>            
        </Form>
      }
    </div>
  );
}

export default UserLogin;
