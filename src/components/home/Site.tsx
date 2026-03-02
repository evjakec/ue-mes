import { useLoaderData } from "react-router-dom"
import {SiteEntity} from "../../models/global/site-entity";

const Site:React.FC = () => {
    const site = useLoaderData() as SiteEntity;
    
    return (
        <>
        <h1>{site.name} - ({site.displayName})</h1>
        <div>
            <img alt={site.name + ' picture'} src={process.env.PUBLIC_URL + '/site-images/' + site.displayName + '.png'}></img>
        </div>
        </>
    )
}

export default Site;