import { DefectEntity } from "./defect-entity";

type DefectCategoryEntity = {
    defectCategoryId?: number;
    name: string;
    description: string;
    lastModifiedBy: string;
    lastModifiedTime?: Date;
    lastModifiedTimeUtc?: Date;
    defects:DefectEntity[];
}

export type {DefectCategoryEntity};