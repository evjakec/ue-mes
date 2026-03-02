import { ReactNode, createContext, useEffect, useState } from "react";
import { fetchWorkElementTypeAttributeData, fetchWorkElementTypeData } from "../ui/scripts/ApiFunctions";
import { WorkElementTypeAttributeEntity } from "../models/work-element-type-attribute-entity";
import { WorkElementTypeEntity } from "../models/work-element-type-entity";

interface IProviderProps {
    children?: ReactNode
}

export const WorkElementSetupContext = createContext({
    workElementTypes:[] as WorkElementTypeEntity[],
    workElementTypeAttributes:[] as WorkElementTypeAttributeEntity[],
    componentError:{} as Error,
    setWorkElementTypes: (inputWorkElementTypes:WorkElementTypeEntity[]) => {},
    setWorkElementTypeAttributes: (inputWorkElementTypeAttributes:WorkElementTypeAttributeEntity[]) => {},
    setComponentError: (inputError:Error) => {},
});

const WorkElementSetupContextProvider:React.FC<IProviderProps> = ({children}) => 
{
    const [workElementTypesState, setWorkElementTypesState] =  useState([{workElementTypeId:-1,name:' -- Select Type -- '} as WorkElementTypeEntity]);
    const [workElementTypeAttributesState, setWorkElementTypeAttributesState] = useState([] as WorkElementTypeAttributeEntity[]);
    const [componentErrorState, setComponentErrorState] = useState({} as Error);
    
    function setWorkElementTypes(inputWorkElementTypes:WorkElementTypeEntity[]) {
        setWorkElementTypesState(inputWorkElementTypes);
    }

    function setWorkElementTypeAttributes(inputWorkElementTypeAttributes:WorkElementTypeAttributeEntity[]) {
        setWorkElementTypeAttributesState(inputWorkElementTypeAttributes);
    }

    function setComponentError(inputError:Error) {
        setComponentErrorState(inputError);
    }

    const workElementSetupValue = {
        workElementTypes:workElementTypesState,
        workElementTypeAttributes:workElementTypeAttributesState,
        componentError:componentErrorState,
        setWorkElementTypes:setWorkElementTypes,
        setWorkElementTypeAttributes:setWorkElementTypeAttributes,
        setComponentError:setComponentError
    };

    useEffect(() => {
        fetchWorkElementTypeAttributeData().then(workElementTypeAttributes => {
            setWorkElementTypeAttributes(workElementTypeAttributes);
          })
          .catch((error) => {setComponentError(error as Error);});
          fetchWorkElementTypeData().then((workElementTypeResult) => {
            setWorkElementTypes(workElementTypeResult);
          })
          .catch((error) => {setComponentError(error as Error);});
    }, []);

    return (
        <WorkElementSetupContext.Provider value={workElementSetupValue}>{children}</WorkElementSetupContext.Provider>
    )
}

export default WorkElementSetupContextProvider;