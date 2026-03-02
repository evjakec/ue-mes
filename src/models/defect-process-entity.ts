import { DefectEntity } from "./defect-entity";
import { ProcessEntity } from "./global/process-entity";

type DefectProcessEntity = {
    defectProcessId?: number;
    defect: DefectEntity;
    process: ProcessEntity;
    lastModifiedBy: string;
    lastModifiedTime?: Date;
    lastModifiedTimeUtc?: Date;
}

export type {DefectProcessEntity};