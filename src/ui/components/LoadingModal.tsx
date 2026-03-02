import classes from './LoadingModal.module.css';
import LoadingElement from './LoadingElement';

const LoadingModal:React.FC = () => {
  
  return (
    <>
      <div className={classes.backdrop}>
        <dialog open={true} className={classes.loadingModal}>
          <div><LoadingElement/></div>
        </dialog>
      </div>
    </>
  );
}

export default LoadingModal;
