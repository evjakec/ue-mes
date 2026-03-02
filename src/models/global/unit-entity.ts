import { PlantEntity } from "./plant-entity";

type UnitEntity = {
    unitId: number;
    plant:PlantEntity;
    name: string;
    displayName: string;
    lastModifiedBy: string;
    lastModifiedTime: Date;
    lastModifiedTimeUtc: Date;
}

export type {UnitEntity};