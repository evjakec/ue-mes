import { UnitEntity } from "./unit-entity";

type LineEntity = {
    lineId: number;
    unit:UnitEntity;
    name: string;
    displayName: string;
    lastModifiedBy: string;
    lastModifiedTime: Date;
    lastModifiedTimeUtc: Date;
}

export type {LineEntity};