import { SiteEntity } from "./site-entity";

type PlantEntity = {
    plantId: number;
    site:SiteEntity;
    name: string;
    displayName: string;
    lastModifiedBy: string;
    lastModifiedTime: Date;
    lastModifiedTimeUtc: Date;
}

export type {PlantEntity};