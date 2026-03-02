type SupplierEntity = {
    supplierId: number;
    name: string;
    address?: string;
    postalCode?: string;
    city?: string;
    stateOrProvince?: string;
    country?: string;
    phoneNumber?: string;
    emailAddress: string;
    contactName?: string;
    isActive: boolean;
    lastModifiedBy: string;
    lastModifiedTime: Date;
    lastModifiedTimeUtc: Date;
}

export type {SupplierEntity};