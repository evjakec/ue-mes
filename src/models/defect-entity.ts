import { DefectCategoryEntity } from "./defect-category-entity";
import { DefectProcessEntity } from "./defect-process-entity";

type DefectEntity = {
    defectId?: number;
    defectCategory:DefectCategoryEntity;
    name: string;
    description: string;
    isActive:boolean;
    isReworkable:boolean;
    lastModifiedBy: string;
    lastModifiedTime?: Date;
    lastModifiedTimeUtc?: Date;
    defectProcesses:DefectProcessEntity[];
}

export type {DefectEntity};