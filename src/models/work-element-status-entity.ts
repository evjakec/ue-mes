type WorkElementStatusEntity = {
    workElementStatusId: number;
    name: string;
    description: string;
    lastModifiedBy: string;
    lastModifiedTime?: Date;
    lastModifiedTimeUtc?: Date;
}

export type {WorkElementStatusEntity};