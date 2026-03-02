import classes from './RunScrapOrderItemUnit.module.css'
import { useContext, useEffect, useState } from 'react';
import { OrderItemUnitScrapEntity } from '../../models/order-item-unit-scrap-entity';
import { OrderItemUnitEquipmentAndUserViewModel } from '../../view-models/order-item-unit-equipment-user-view-model';
import { UserContext } from '../../store/user-context';
import { DefectCategoryEntity } from '../../models/defect-category-entity';
import { DefectEntity } from '../../models/defect-entity';
import { fetchDefectCategoriesWithDefects, postOrderItemUnitScrap, postOrderItemUnitScrapReclassify, postOrderItemUnitScrapReturnToProduction } from '../../ui/scripts/ApiFunctions';
import LoadingModal from '../../ui/components/LoadingModal';
import Modal from '../../ui/components/Modal';
import ErrorDisplay from '../../ui/components/ErrorDisplay';

const RunScrapOrderItemUnit:React.FC<{orderItemUnitEquipmentAndUser:OrderItemUnitEquipmentAndUserViewModel,
    workElementInProgress:boolean,
    onRunScrapOrderItemUnitComplete:(serialNumber:string)=>void,
    onRunScrapOrderItemUnitCancel:()=>void}> = (props) => {
    
    const modalDialogScrapContent = <div className={classes.confirmationModal}><p>Clicking <b>OK</b> will scrap this order item unit and return to the main run screen.  Continue?</p></div>;
    const modalDialogReclassifyContent = <div className={classes.confirmationModal}><p>Clicking <b>OK</b> will reclassify this scrap to the new defect and return to the main run screen.  Continue?</p></div>;
    const modalDialogReturnToProductionContent = <div className={classes.confirmationModal}><p>Clicking <b>OK</b> will remove the scrap record from this unit and return to the main run screen.  Only click OK if you are sure the unit is good and can resume production.  Continue?</p></div>;

    const isUnitScrapped = props.orderItemUnitEquipmentAndUser && props.orderItemUnitEquipmentAndUser.orderItemUnit && props.orderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitScrap && props.orderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitScrap.orderItemUnitScrapId > 0;
    
    // Context
    const {loggedInUser} = useContext(UserContext);
  
    // State
    const [defectCategoryList, setDefectCategoryList] =  useState([] as DefectCategoryEntity[]);
    const [defectList, setDefectList] = useState([] as DefectEntity[]);
    const [selectedDefectCategory, setSelectedDefectCategory] = useState({} as DefectCategoryEntity);
    const [componentError, setComponentError] = useState({} as Error);
    const [isLoading, setIsLoading] = useState(false);
      
    const [orderItemUnitScrap, setOrderItemUnitScrap] = useState(
        {
            orderItemUnitScrapId:props.orderItemUnitEquipmentAndUser.orderItemUnit && props.orderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitScrap && props.orderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitScrap.orderItemUnitScrapId,
            orderItemUnit:props.orderItemUnitEquipmentAndUser.orderItemUnit,
            equipment:props.orderItemUnitEquipmentAndUser.equipment,
            user:loggedInUser,
            defect:props.orderItemUnitEquipmentAndUser.orderItemUnit && props.orderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitScrap && props.orderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitScrap.defect ? props.orderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitScrap.defect : {} as DefectEntity,
            scrapDate:new Date(),
            scrapDateUtc:new Date(),            
            comment:'',
            lastModifiedBy:loggedInUser.loginName !== undefined ? loggedInUser.loginName : '',
        } as OrderItemUnitScrapEntity);

    const [scrapOrderItemUnitValidationErrors, setScrapOrderItemUnitValidationErrors] = useState([] as {errorMessage:string}[]);
    const [isRunScrapOrderItemUnitValid, setIsRunScrapOrderItemUnitValid] = useState(true);
    const [showSubmitScrapModal, setShowSubmitScrapModal] = useState(false);
    const [showSubmitReclassifyModal, setShowSubmitReclassifyModal] = useState(false);
    const [showSubmitReturnToProductionModal, setShowSubmitReturnToProductionModal] = useState(false);
    
    const getRunScrapOrderItemUnitIsValid = (scrapAction:string):boolean => {
        // The form is valid when all required fields have been entered and the item quantity is > 0
        let currentValidationErrors =  [] as {errorMessage:string}[];
  
        if((orderItemUnitScrap.defect === undefined 
            || orderItemUnitScrap.defect.defectId === undefined
            || orderItemUnitScrap.defect.defectId <= 0) 
            && scrapAction !== 'ReturnToProduction')
        {
          currentValidationErrors = [...currentValidationErrors, {errorMessage:'You must select a defect for the scrap record.'}];
        }

        if(orderItemUnitScrap.comment === undefined || orderItemUnitScrap.comment.length === 0)
        {
          currentValidationErrors = [...currentValidationErrors, {errorMessage:'You must provide a comment.'}];
        }

        setIsRunScrapOrderItemUnitValid(currentValidationErrors.length === 0);
        setScrapOrderItemUnitValidationErrors(currentValidationErrors);
  
        return currentValidationErrors.length === 0;
      }

    const selectedDefectCategoryHandler = (event:React.ChangeEvent<HTMLSelectElement>) => {
        const defectCategoryFromList = defectCategoryList.find(defectCategory => defectCategory.defectCategoryId === +event.target.value);
        if(defectCategoryFromList !== undefined)
        {
            setSelectedDefectCategory(defectCategoryFromList);
            setDefectList(defectCategoryFromList.defects);

            // Also, if the defect category has changed, we need to now clear the order item unit scrap defect and force the user to select a new one.
            const updatedOrderItemUnitScrap = {...orderItemUnitScrap, defect: {} as DefectEntity};
            setOrderItemUnitScrap(updatedOrderItemUnitScrap);
        }
        else
        {
            setSelectedDefectCategory({} as DefectCategoryEntity);
            setDefectList([] as DefectEntity[]);
        }
    }

    const selectedDefectHandler = (event:React.ChangeEvent<HTMLSelectElement>) => {
        const defectFromList = defectList.find(defect => defect.defectId === +event.target.value);
        if(defectFromList !== undefined)
        {
            const updatedOrderItemUnitScrap = {...orderItemUnitScrap, defect: defectFromList};
            setOrderItemUnitScrap(updatedOrderItemUnitScrap);
        }
    }
    
    const orderItemUnitScrapCommentChangeHandler = (event:React.ChangeEvent<HTMLTextAreaElement>) => {
        const updatedOrderItemUnitScrap = {...orderItemUnitScrap, comment: event.target.value};
        setOrderItemUnitScrap(updatedOrderItemUnitScrap);
    }
    
    const orderItemUnitSubmitHandler = (scrapAction:string):void => {
        setIsLoading(true);
        
        if(scrapAction === 'Scrap')
        {
            postOrderItemUnitScrap(orderItemUnitScrap).then(()=> {
                setIsLoading(false);
                props.onRunScrapOrderItemUnitComplete(orderItemUnitScrap.orderItemUnit.serialNumber);
            }).catch((fetchError) => {
                setComponentError(fetchError);
                setIsLoading(false);   
            });
        }

        if(scrapAction === 'Reclassify')
        {
            postOrderItemUnitScrapReclassify(orderItemUnitScrap).then(()=> {
                setIsLoading(false);   
                props.onRunScrapOrderItemUnitComplete(orderItemUnitScrap.orderItemUnit.serialNumber);
            }).catch((fetchError) => {
                setComponentError(fetchError);
                setIsLoading(false);   
            });
        }

        if(scrapAction === 'ReturnToProduction')
        {
            postOrderItemUnitScrapReturnToProduction(orderItemUnitScrap).then(()=> {
                setIsLoading(false);   
                props.onRunScrapOrderItemUnitComplete(orderItemUnitScrap.orderItemUnit.serialNumber);
            }).catch((fetchError) => {
                setComponentError(fetchError);
                setIsLoading(false);   
            });
        }
    }

    const modalSubmitScrapOkHandler = () =>
    {
        setShowSubmitScrapModal(false);
        orderItemUnitSubmitHandler('Scrap');
    }

    const modalSubmitReclassifyOkHandler = () =>
    {
        setShowSubmitReclassifyModal(false);
        orderItemUnitSubmitHandler('Reclassify');
    }

    const modalSubmitReturnToProductionOkHandler = () =>
    {
        setShowSubmitReturnToProductionModal(false);
        orderItemUnitSubmitHandler('ReturnToProduction');
    }
  
    const modalSubmitCancelHandler = () =>
    {
        // Just need one cancel to handle all 3 modals
        setShowSubmitScrapModal(false);
        setShowSubmitReclassifyModal(false);
        setShowSubmitReturnToProductionModal(false);
    }
    
    const submitScrapHandler = () =>
    {
        // Only show the submit dialog when there are no validation errors.
        if(getRunScrapOrderItemUnitIsValid('Scrap'))
        {
            setShowSubmitScrapModal(true);
        }
    }
    
    const submitReclassifyHandler = () =>
    {
        // Only show the submit dialog when there are no validation errors.
        if(getRunScrapOrderItemUnitIsValid('Reclassify'))
        {
            setShowSubmitReclassifyModal(true);
        }
    }
    
    const submitReturnToProductionHandler = () =>
    {
        // Only show the submit dialog when there are no validation errors.
        if(getRunScrapOrderItemUnitIsValid('ReturnToProduction'))
        {
            setShowSubmitReturnToProductionModal(true);
        }
    }

    const cancelChangesHandler = () =>
    {
        props.onRunScrapOrderItemUnitCancel();
    }
    
    useEffect(() => {
        fetchDefectCategoriesWithDefects().then((defectCategoriesResult) => {
            setDefectCategoryList(defectCategoriesResult);

            if(props.orderItemUnitEquipmentAndUser.orderItemUnit 
                && props.orderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitScrap
                && props.orderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitScrap.orderItemUnitScrapId > 0 )
                {
                    const currentScrapDefectCategory = defectCategoriesResult.find(defectCategory => defectCategory.defectCategoryId === props.orderItemUnitEquipmentAndUser.orderItemUnit.orderItemUnitScrap.defect.defectCategory.defectCategoryId);
                    if(currentScrapDefectCategory) {
                        setSelectedDefectCategory(currentScrapDefectCategory);
                        setDefectList(currentScrapDefectCategory.defects);
                    }
                }
        }).catch((fetchError) => {setComponentError(fetchError)});
      }, [props.orderItemUnitEquipmentAndUser.orderItemUnit]);      
    
    return (
      <div className={classes.scrapModalLayout}>
        {isLoading && <LoadingModal />}
        {showSubmitScrapModal && <Modal showFromClient={showSubmitScrapModal} children={modalDialogScrapContent} allowBackdropClose={false} onCancel={modalSubmitCancelHandler} onOk={modalSubmitScrapOkHandler}></Modal>}
        {showSubmitReclassifyModal && <Modal showFromClient={showSubmitReclassifyModal} children={modalDialogReclassifyContent} allowBackdropClose={false} onCancel={modalSubmitCancelHandler} onOk={modalSubmitReclassifyOkHandler}></Modal>}
        {showSubmitReturnToProductionModal && <Modal showFromClient={showSubmitReturnToProductionModal} children={modalDialogReturnToProductionContent} allowBackdropClose={false} onCancel={modalSubmitCancelHandler} onOk={modalSubmitReturnToProductionOkHandler}></Modal>}
        {componentError !== undefined && componentError.message && componentError.message.length > 0 && <ErrorDisplay title={'Error'} message={componentError.message} />}
        {!isRunScrapOrderItemUnitValid && 
              <>
                <div className={classes.errorMessage}><b>The form is invalid.  Please correct the errors below and try again:</b>
                  <ul>
                    {scrapOrderItemUnitValidationErrors.map((error:any) => <li key={error.errorMessage}>{error.errorMessage}</li>)}
                  </ul>
                </div>
            </>}
        <div>
            <label htmlFor="serialNumber">Serial Number</label>
            <input type="text" id="serialNumber" name="serialNumber" readOnly={true} defaultValue={orderItemUnitScrap && orderItemUnitScrap.orderItemUnit ? orderItemUnitScrap.orderItemUnit.serialNumber : ''} />
            {isUnitScrapped && (<label htmlFor="scrapId">Scrap ID</label>)}
            {isUnitScrapped && (
                <div className={classes.orderItemUnitScrapIdContainer}>
                    <input type="number" id="scrapId" name="scrapId" readOnly={true} defaultValue={orderItemUnitScrap ? orderItemUnitScrap.orderItemUnitScrapId : ''} />
                </div>
            )}
            <label htmlFor="defectCategory">Defect Category</label>
            <select id='defectCategory' name='defectCategory' value={selectedDefectCategory.defectCategoryId} onChange={selectedDefectCategoryHandler}>            
                <option> -- Select Category -- </option>
                {defectCategoryList.map((defectCategory) => 
                <option key={defectCategory.defectCategoryId}
                    value={defectCategory.defectCategoryId}>{defectCategory.name}                    
                </option>)}
            </select>
            <label htmlFor="defect">Defect</label>
            <select id='defect' name='defect' value={orderItemUnitScrap.defect.defectId} onChange={selectedDefectHandler}>
                <option> -- Select Defect -- </option>
                {defectList.map((defect) => 
                <option key={defect.defectId}
                    value={defect.defectId}>{defect.name}
                </option>)}
            </select>
            <div>
                <label htmlFor="defectComment">Comment</label>
                <div className={classes.orderItemUnitScrapComment}>
                    <textarea id="defectComment" name="defectComment" rows={3} maxLength={2000} value={orderItemUnitScrap.comment} onChange={orderItemUnitScrapCommentChangeHandler} />
                </div>
            </div>
        </div>
        <div className={classes.actionsLayout}>
            <p className={classes.actions}>
                <button type='button' className={classes.cancelButton} onClick={cancelChangesHandler}>Cancel</button>
                {!isUnitScrapped && <button type='button' className={classes.submitButton} onClick={submitScrapHandler}>Submit Scrap</button>}
                {isUnitScrapped && 
                <>
                    <button type='button' className={classes.submitButton} onClick={submitReclassifyHandler}>Reclassify Scrap</button>
                    <button type='button' className={classes.submitButton} onClick={submitReturnToProductionHandler}>Return to Production</button>
                </>}
            </p>
        </div>
      </div>
  );
}

export default RunScrapOrderItemUnit;