import { Link } from "react-router-dom";
import classes from './ButtonAction.module.css'
import { BiEdit, BiAddToQueue, BiTrash } from 'react-icons/bi';
import { useContext } from "react";
import { UserContext } from "../../store/user-context";

const ButtonAction:React.FC<{url:string, buttonAction:string}> = (props) => {
    
  // Context
  const {loggedInUser} = useContext(UserContext);

    return (
      <>
       <Link to={props.url} className={`${loggedInUser && loggedInUser.userId && loggedInUser.userId > 0 ? classes['button'] : classes['disabledButton']}`} >
          {props.buttonAction === 'Edit' && <BiEdit size={18} />}
          {props.buttonAction === 'Add' && <BiAddToQueue size={18} />}
          {props.buttonAction === 'Delete' && <BiTrash size={18} />}
          {props.buttonAction}
        </Link>
      </>
    );
  }
  
  export default ButtonAction;