import { UserAttributeTypeEntity } from "./user-attribute-type-entity";
import { UserEntity } from "./user-entity";

type UserAttributeEntity = {
    userAttributeId: number;
    user:UserEntity;
    userAttributeType: UserAttributeTypeEntity;
    userAttributeValue: string;
    lastModifiedBy: string;
    lastModifiedTime: Date;
    lastModifiedTimeUtc: Date;
}

export type {UserAttributeEntity};