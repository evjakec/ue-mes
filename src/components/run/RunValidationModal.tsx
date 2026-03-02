import classes from './RunValidationModal.module.css'

const RunValidationModal: React.FC<{workElementButtonAction:string,
    validationMessages:{errorMessages:string[], warningMessages:string[]}}> = (props) => {
    return (    
    <div className={classes.workElementValidationModal}>
        {props.workElementButtonAction === "Complete" &&
        <div>
            <p>You are attempting to <b>{props.workElementButtonAction}</b> this work element, but the element is not valid.</p>
            {props.validationMessages.errorMessages.length > 0 && 
            <div>
                <div>The attribute errors below must be corrected as these are required attributes.</div>
                <div className={classes.errorsContainer}>
                    <ul>
                        {props.validationMessages.errorMessages.map(validationError => <li key={validationError}>{validationError}</li>)}
                    </ul>
                </div>
                {props.validationMessages.warningMessages.length > 0 && 
                <div>
                    <div>There are also attribute warnings below. If you do not intend to skip these warnings, please correct them as well.</div>
                    <div className={classes.warningsContainer}>
                        <ul>
                            {props.validationMessages.warningMessages.map(validationWarning => <li key={validationWarning}>{validationWarning}</li>)}
                        </ul>
                    </div>
                </div>
                }
            <p>Click "<b>OK</b>" or "<b>Cancel</b>" below to close this dialog and correct the errors.</p>
            </div>
            }
            {props.validationMessages.errorMessages.length === 0 && props.validationMessages.warningMessages.length > 0 && 
            <div>
                <div>The attribute warnings below can be skipped as these are not required attributes.  If you intended to enter valid attribute values, click <b>Cancel</b> below and correct the attributes.  Otherwise, click <b>OK</b> to submit the {props.workElementButtonAction} action.</div>
                <div className={classes.warningsContainer}>
                    <ul>
                        {props.validationMessages.warningMessages.map(validationWarning => <li key={validationWarning}>{validationWarning}</li>)}
                    </ul>
                </div>
            </div>
            }
        </div>}
        {props.workElementButtonAction === "Bypass" &&
        <div>
            <p>You are attempting to <b>{props.workElementButtonAction}</b> this work element.  Any data entered on the screen will be skipped and not captured for this serial number</p>
            <p>Click "<b>OK</b>" to proceed with bypassing, or "<b>Cancel</b>" to close this dialog and return to the screen.</p>
        </div>}
    </div>
    );
}

export default RunValidationModal;