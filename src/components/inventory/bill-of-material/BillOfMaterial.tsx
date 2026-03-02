import { Link, useLoaderData, useNavigate } from "react-router-dom";
import { PartEntity } from "../../../models/part-entity"
import { useContext, useEffect, useState } from "react";
import classes from './BillOfMaterial.module.css'
import { BillOfMaterialEntity } from "../../../models/bill-of-material-entity";
import BillOfMaterialDetail from "./BillOfMaterialDetail";
import { fetchBillOfMaterialByPart } from "../../../ui/scripts/ApiFunctions";
import ErrorDisplay from "../../../ui/components/ErrorDisplay";
import { UserContext } from "../../../store/user-context";
import LoadingModal from "../../../ui/components/LoadingModal";

const BillOfMaterial:React.FC = () => {
    // Context
    const {loggedInUser} = useContext(UserContext);

    // State
    const [partList, loadedBillOfMaterial] = useLoaderData() as [PartEntity[], BillOfMaterialEntity];
    const [billOfMaterial, setBillOfMaterial] = useState({} as BillOfMaterialEntity);
    const [selectedPartId, setSelectedPartId] = useState('0');
    const [billOfMaterialLoaded, setBillOfMaterialLoaded] = useState(false);
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
            fetchPartBillOfMaterial(event.target.value);
        }
        else
        {
            navigate('/inventory/billOfMaterial/');
            setIsLoading(false);
        }
    }

    // If the BOM is available from the loader, set state accordingly.  
    // Also needs wrapped in useEffect as we want this to load one time at the end of rendering and not repeat until these states have changed again.
    useEffect(() => {
        if(loadedBillOfMaterial !== undefined)
        {
            setBillOfMaterial(loadedBillOfMaterial);
            setSelectedPartId(loadedBillOfMaterial.part.partId ? loadedBillOfMaterial.part.partId.toString() : '0');
            setBillOfMaterialLoaded(true);
        }
      }, [loadedBillOfMaterial]);

    const fetchPartBillOfMaterial = async (partId:string) => {
        const returnedBillOfMaterial = await fetchBillOfMaterialByPart(partId).catch((fetchError) => {setComponentError(fetchError)});

        // if a BOM was returned, we can set the state and render.  If not, the UI will be presented for adding a new BOM.
        // Therefore, we only set the BOM states when a valid object is returned
        if(returnedBillOfMaterial && returnedBillOfMaterial.billOfMaterialId > 0)
        {
            navigate('/inventory/billOfMaterial/' + returnedBillOfMaterial.billOfMaterialId);
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
        {!billOfMaterialLoaded && selectedPartId !== '0' && (
          <>
            <p>This part does not have a Bill of Material assigned.  Click the button below to add a new one.</p>
            <div>
                <Link to={"/inventory/billOfMaterial/create-bill-of-material/" + selectedPartId} className={`${loggedInUser && loggedInUser.userId && loggedInUser.userId > 0 ? classes['button'] : classes['disabledButton']}`} >New Bill of Material</Link>
            </div>
          </>
        )}
        {billOfMaterialLoaded && (
        <>
            <BillOfMaterialDetail billOfMaterial={billOfMaterial} />
        </>)}
    </>
    );
};

export default BillOfMaterial;
