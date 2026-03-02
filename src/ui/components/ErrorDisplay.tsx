import { Link } from 'react-router-dom';
import classes from './ErrorDisplay.module.css';

const ErrorDisplay: React.FC<{ title: string; message: string; isRunMode?:boolean }> = (props) => {

  // Assume default path if no run mode boolean is provided
  const errorHomeRedirect = props.isRunMode !== undefined && props.isRunMode ? '/run' : '/';

  return (
    <>
      <div className={classes.errorBlock}>
        <h1>{props.title}</h1>
        <p>{props.message}</p>
        <Link to={errorHomeRedirect}>
              Return Home
        </Link>
      </div>
    </>
  );
};

export default ErrorDisplay;
