import { Link, useLoaderData, useNavigate } from "react-router-dom";
import { PartEntity } from "../../../models/part-entity"
import { BillOfProcessEntity } from "../../../models/bill-of-process-entity";
import { useContext, useEffect, useState } from "react";
import BillOfProcessDetail from "./BillOfProcessDetail"
import classes from './BillOfProcess.module.css'
import { fetchBillOfProcessByPart } from "../../../ui/scripts/ApiFunctions";
import ErrorDisplay from "../../../ui/components/ErrorDisplay";
import LoadingModal from "../../../ui/components/LoadingModal";
import { UserContext } from "../../../store/user-context";

const BillOfProcess:React.FC = () => {
    // Context
    const {loggedInUser} = useContext(UserContext);

    // State
    const [partList, loadedBillOfProcess] = useLoaderData() as [PartEntity[], BillOfProcessEntity];
    const [billOfProcess, setBillOfProcess] = useState({} as BillOfProcessEntity);
    const [selectedPartId, setSelectedPartId] = useState('0');
    const [billOfProcessLoaded, setBillOfProcessLoaded] = useState(false);
    const [componentError, setComponentError] = useState({} as Error);
    const [isLoading, setIsLoading] = useState(false);
    
    // The flow of this component will be to open child modals and then refresh the main content once a modal is submitted.
    // Since the route already takes care of this loading, we will use navigations to refresh the screen with /billOfMaterial/:billOfMaterialId
    const navigate = useNavigate();

    const partSelectHandler = (event:React.ChangeEvent<HTMLSelectElement>) => {
        setIsLoading(true);
        setSelectedPartId(event.target.value);
                        
        if(event.target.value !== '0') 
        {
            fetchPartBillOfProcess(event.target.value);
        }
        else
        {
            navigate('/inventory/billOfProcess/');
            setIsLoading(false);
        }        
    }

    // If the BOP is available from the loader, set state accordingly.  
    // Also needs wrapped in useEffect as we want this to load one time at the end of rendering and not repeat until these states have changed again.
    useEffect(() => {
        if(loadedBillOfProcess !== undefined)
        {
            setBillOfProcess(loadedBillOfProcess);
            setSelectedPartId(loadedBillOfProcess.part.partId ? loadedBillOfProcess.part.partId.toString() : '0');
            setBillOfProcessLoaded(true);
        }
      }, [loadedBillOfProcess]);

    const fetchPartBillOfProcess = async (partId:string) => {
        const returnedBillOfProcess = await fetchBillOfProcessByPart(partId).catch((fetchError) => {setComponentError(fetchError)});

        // if a BOP was returned, we can set the state and render.  If not, the UI will be presented for adding a new BOP.
        // Therefore, we only set the BOP states when a valid object is returned
        if(returnedBillOfProcess && returnedBillOfProcess.billOfProcessId > 0)
        {
            navigate('/inventory/billOfProcess/' + returnedBillOfProcess.billOfProcessId);
        }
        
        setIsLoading(false);
    }

    return (
    <>
        {isLoading && <LoadingModal />}
        {componentError !== undefined && componentError.message && componentError.message.length > 0 && <ErrorDisplay title={'Error'} message={componentError.message} />}
        <label htmlFor="part">Part</label>
        <select id='part' name='part' value={selectedPartId} onChange={e => partSelectHandler(e)}>
            <option key={0} value={0}> -- Select Part -- </option>
            {partList.map((part) => 
            <option key={part.partId}
                value={part.partId}>{part.partNumber + ' (' + part.partRevision + ') - ' + part.description}                    
            </option>)}
        </select>
        {!billOfProcessLoaded && selectedPartId !== '0' && (
            <><p>This part does not have a Bill of Process assigned.  Click the button below to add a new one.</p>
            <div><Link to={"/inventory/billOfProcess/create-bill-of-process/" + selectedPartId} className={`${loggedInUser && loggedInUser.userId && loggedInUser.userId > 0 ? classes['button'] : classes['disabledButton']}`} >
              New Bill of Process
            </Link>
            </div>
          </>
        )}
        {billOfProcessLoaded && (
        <>
            <BillOfProcessDetail billOfProcess={billOfProcess} />
        </>)}
    </>
    );
};

export default BillOfProcess;
