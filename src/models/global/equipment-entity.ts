import { LineEntity } from "./line-entity";
import { ProcessEntity } from "./process-entity";

type EquipmentEntity = {
    equipmentId: number;
    line: LineEntity;
    process: ProcessEntity;
    name: string;
    lastModifiedBy: string;
    lastModifiedTime: Date;
    lastModifiedTimeUtc: Date;
}

export type {EquipmentEntity};