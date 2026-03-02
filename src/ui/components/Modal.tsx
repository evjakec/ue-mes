import { useNavigate } from 'react-router-dom';

import classes from './Modal.module.css';

const Modal:React.FC<{children:any, 
  allowBackdropClose:boolean,
  showFromClient?:boolean,
  onOk?:(event:React.MouseEvent<HTMLButtonElement>)=>void,
  onCancel?:(event:React.MouseEvent<HTMLButtonElement>)=>void,
  onClose?:()=>void}> = (props) => {
  const navigate = useNavigate();

  const closeHandler = () => {
    if(props.allowBackdropClose) 
    {
      props.onClose && props.onClose();
      navigate('..');
    };
  }

  const cancelHandler = (event:React.MouseEvent<HTMLButtonElement>) => {
    props.onCancel && props.onCancel(event);
  }

  const okHandler = (event:React.MouseEvent<HTMLButtonElement>) => {
    props.onOk && props.onOk(event);
  }

  return (
    <>
      <div className={classes.backdrop} onClick={closeHandler}>
        <dialog open={props.showFromClient ? props.showFromClient : true} className={`${props.showFromClient ? classes['modalClient'] : classes['modalRoute']}`}>
          <div>{props.children}</div>
          {(props.onCancel !== undefined || props.onOk !== undefined) && 
            <div className={classes.actionsDiv}>
              {props.onOk !== undefined && <button type='button' className={classes.actionButtonOk} onClick={okHandler}>OK</button>}
              {props.onCancel !== undefined && <button type='button' className={classes.actionButtonCancel} onClick={cancelHandler}>Cancel</button>}
            </div>
          }
        </dialog>
      </div>
    </>
  );
}

export default Modal;
