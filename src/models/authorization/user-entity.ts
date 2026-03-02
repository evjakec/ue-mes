import { UserAttributeEntity } from "./user-attribute-entity";
import { UserRoleEntity } from "./user-role-entity";

type UserEntity = {
    userId: number;
    loginName: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    jobTitle: string;
    isActive: boolean;
    userAttributes:UserAttributeEntity[];
    userRoles:UserRoleEntity[];
    userPhotoLink:string;
    lastModifiedBy: string;
    lastModifiedTime: Date;
    lastModifiedTimeUtc: Date;
}

export type {UserEntity};