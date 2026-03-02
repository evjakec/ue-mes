import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import classes from './ErrorPage.module.css'
import MainHeader from '../ui/components/MainHeader';
import ErrorDisplay from '../ui/components/ErrorDisplay';
import RunHeader from '../components/run/RunHeader';
import { OrderItemUnitEquipmentAndUserViewModel } from '../view-models/order-item-unit-equipment-user-view-model';

const ErrorPage:React.FC<{isRunMode:boolean}> = (props) => {
  const error = useRouteError();
  
  let title = 'An error occurred!';
  let message = 'Something went wrong!';

  if (isRouteErrorResponse(error)) {
    if (error.status === 500) {
      message = error.data.message;
    }
  
    if (error.status === 404) {
      title = 'Not found!';
      message = 'Could not find resource or page.';
    }
  }
  else
  {
    // If not coming from a route error response, still see if we can get the error message to display
    try
    {
      const errorResponse = error as Error;
      if(errorResponse && errorResponse.message) {
        message = errorResponse.message;
      }
    }
    catch(errorWithTheError)
    {
      message = 'An error has occurred with no message available.'
    }
  }

  return (
    <>
      {props.isRunMode && <RunHeader orderItemUnitEquipmentAndUser={{} as OrderItemUnitEquipmentAndUserViewModel} isOrderItemUnitEquipmentAndUserLoaded={false} />}
      {!props.isRunMode && <MainHeader isRunMode={props.isRunMode} />}
      <main className={classes.mainContentContainer}>
        <ErrorDisplay title={title} message={message} isRunMode={props.isRunMode} />
      </main>
    </>
  );
}

export default ErrorPage;