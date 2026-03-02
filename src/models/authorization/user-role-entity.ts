import { RoleEntity } from "./role-entity";
import { UserEntity } from "./user-entity";

type UserRoleEntity = {
    userRoleId: number;
    user:UserEntity;
    role: RoleEntity;
    lastModifiedBy: string;
    lastModifiedTime: Date;
    lastModifiedTimeUtc: Date;
}

export type {UserRoleEntity};