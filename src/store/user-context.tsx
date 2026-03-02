import { ReactNode, createContext, useEffect, useState } from "react";
import { UserEntity } from "../models/authorization/user-entity";
import { useCookies } from "react-cookie";
import { postGetAuthenticatedUserByToken } from "../ui/scripts/ApiFunctions";

interface IProviderProps {
    children?: ReactNode
}

export const UserContext = createContext({
    loggedInUser:{} as UserEntity,
    setLoggedInUser: () => {},
    clearLoggedInUser: () => {},
});

const UserContextProvider:React.FC<IProviderProps> = ({children}) => 
{
    const [userTokenCookie] = useCookies(['userToken']);
    const [userState, setUserState] = useState({} as UserEntity);
    
    function setLoggedInUser() {
        if(userTokenCookie.userToken !== undefined)
        {   
            postGetAuthenticatedUserByToken(userTokenCookie).then((userResult) => {
                setUserState(userResult);
            }).catch(()=> {throw new Error('Unable to retrieve authenticated user from the token.')});
        }
    }

    function clearLoggedInUser() {
        setUserState({} as UserEntity);
    }

    const userValue = {
        loggedInUser:userState,
        setLoggedInUser:setLoggedInUser,
        clearLoggedInUser:clearLoggedInUser
    };

    useEffect(() => {
        if(userTokenCookie.userToken !== undefined)
        {   postGetAuthenticatedUserByToken(userTokenCookie).then(userResult => {
                setUserState(userResult);
            }).catch(()=> {throw new Error('Unable to retrieve authenticated user from the token.')});
        }
    }, [userTokenCookie]);

    return (
        <UserContext.Provider value={userValue}>{children}</UserContext.Provider>
    )
}

export default UserContextProvider;