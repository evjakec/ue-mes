import { useState } from 'react';
import { EquipmentEntity } from '../../models/global/equipment-entity';
import { OrderItemUnitEquipmentAndUserViewModel } from '../../view-models/order-item-unit-equipment-user-view-model';
import classes from './RunStart.module.css'
import { fetchOrderItemUnitEquipmentAndUserBySerialNumber } from '../../ui/scripts/ApiFunctions';
import LoadingModal from '../../ui/components/LoadingModal';
import { useNavigate } from 'react-router-dom';

const RunStart:React.FC<{orderItemUnitEquipmentAndUser:OrderItemUnitEquipmentAndUserViewModel, 
  isOrderItemUnitEquipmentAndUserLoaded:boolean,
  equipmentList:EquipmentEntity[],
  onSetOrderItemUnitEquipmentAndUserHandler:(updatedOrderItemUnitEquipmentAndUserViewModel:OrderItemUnitEquipmentAndUserViewModel)=>void,
  onSetIsOrderItemUnitEquipmentAndUserLoadedHandler:(updatedOrderItemUnitEquipmentAndUserViewModel:OrderItemUnitEquipmentAndUserViewModel)=>void}> = (props) => {

  const navigate = useNavigate();
  
  // State variables
  const [serialNumberLookupErrorMessage, setSerialNumberLookupErrorMessage] = useState('');
  const [equipmentLookupErrorMessage, setEquipmentLookupErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const serialNumberChangeHandler = (event:React.ChangeEvent<HTMLInputElement>) => {
    // If we're in this handler, then we know nothing is currently loaded.  So it is okay to set the only property needed and elevate to main props.  
    const updatedOrderItemUnitEquipmentAndUserViewModel = {...props.orderItemUnitEquipmentAndUser, orderItemUnit:{serialNumber:event.target.value} } as OrderItemUnitEquipmentAndUserViewModel;
    props.onSetOrderItemUnitEquipmentAndUserHandler(updatedOrderItemUnitEquipmentAndUserViewModel);
  }

  const selectedEquipmentHandler = (selectedEquipmentName:string) => {
    // In this handler, we will simply set the selectedDataCollectionWorkElementAttribute
    // There will be a button next to the drop down for the user to add it to the list of assigned attributes. 
    const selectedEquipment = props.equipmentList.find(equipment => equipment.name === selectedEquipmentName);
    if(selectedEquipment)
    {
      const updatedOrderItemUnitEquipmentAndUserViewModel = {...props.orderItemUnitEquipmentAndUser, equipment:selectedEquipment } as OrderItemUnitEquipmentAndUserViewModel;
      props.onSetOrderItemUnitEquipmentAndUserHandler(updatedOrderItemUnitEquipmentAndUserViewModel);
    }
}

const serialNumberLookupHandler = () =>
{
  setIsLoading(true);
  // In this method, we will first search with an API call.  If one is found, then it will be elevated to main and further logic will take over from there.
  // If not found, display a message to the user.
  if (props.orderItemUnitEquipmentAndUser && props.orderItemUnitEquipmentAndUser.orderItemUnit && props.orderItemUnitEquipmentAndUser.orderItemUnit.serialNumber.length > 0)
  {
    setSerialNumberLookupErrorMessage('');

    fetchOrderItemUnitEquipmentAndUserBySerialNumber(props.orderItemUnitEquipmentAndUser.orderItemUnit.serialNumber).then(fetchedOrderItemUnitEquipmentAndUser => {
      if(fetchedOrderItemUnitEquipmentAndUser !== null)
      {
        navigate('/run/' + props.orderItemUnitEquipmentAndUser.orderItemUnit.serialNumber);
      }
      else
      {
        setSerialNumberLookupErrorMessage('The Order Item Unit was not found.  Please check the entry and try again.  If the entry is valid, please contact MES support for help.');
      }
      setIsLoading(false);
    }).catch((fetchError) => {
      setSerialNumberLookupErrorMessage(fetchError.message);
      setIsLoading(false);
    });
  }
  else
  {
    setSerialNumberLookupErrorMessage('Please enter a valid serial number before searching');
    setIsLoading(false);
  }
}

const equipmentLookupHandler = () =>
{
    // If a proper equipment is selected, navigate to run/equipmentName to load the screen
    if (props.orderItemUnitEquipmentAndUser && props.orderItemUnitEquipmentAndUser.equipment && props.orderItemUnitEquipmentAndUser.equipment.name.length > 0)
    {
      setEquipmentLookupErrorMessage('');
      navigate('/run/' + props.orderItemUnitEquipmentAndUser.equipment.name);
    }
    else
    {
      setEquipmentLookupErrorMessage('Please select an equipment from the list before searching');
    }
} 

    return (
        <div className={classes.runStartInputs}>
          {isLoading && <LoadingModal />}
          <div className={classes.serialNumberInputContainer}>
            <p>Scan or Enter a Serial Number to get started</p>
            <input type="text" id="serialNumber" name="serialNumber" className={classes.runStartInput} maxLength={50} value={props.orderItemUnitEquipmentAndUser && props.orderItemUnitEquipmentAndUser.orderItemUnit ? props.orderItemUnitEquipmentAndUser.orderItemUnit.serialNumber : ''} onChange={serialNumberChangeHandler} />
            <p><button type='button' className={classes.submitButton} onClick={serialNumberLookupHandler}>Search Serial Number</button></p>
            {serialNumberLookupErrorMessage.length > 0 && <div className={classes.errorMessage}><b>{serialNumberLookupErrorMessage}</b></div>}
          </div>
          <div className={classes.orSeparator}><h2>OR</h2></div>
          <div className={classes.equipmentInputContainer}>
            <p>Select an equipment from the list to get started</p>
            <select id='equipment' name='equipment' className={classes.runStartSelect} value={props.orderItemUnitEquipmentAndUser.equipment && props.orderItemUnitEquipmentAndUser.equipment.name ? props.orderItemUnitEquipmentAndUser.equipment.name : ''} onChange={e => selectedEquipmentHandler(e.target.value)}>
              <option> -- Select Equipment -- </option>
              {props.equipmentList.map((equipment) => 
              <option key={equipment.name}
                  value={equipment.name}>{equipment.name}                    
              </option>)}
            </select>
            <p><button type='button' className={classes.submitButton} onClick={equipmentLookupHandler}>Search Equipment</button></p>
            {equipmentLookupErrorMessage.length > 0 && <div className={classes.errorMessage}><b>{equipmentLookupErrorMessage}</b></div>}
          </div>
        </div>
    );
}

export default RunStart;