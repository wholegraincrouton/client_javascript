import { SearchCriteriaBase } from "../../shared/types/dto";

export interface CustomerSearchCriteria extends SearchCriteriaBase {
    name: string;
}

export class CustomerLogoConstants {
    static readonly DefaultLogoPath = "/images/defaultUserImage.png";
}

export interface Customer {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email: string;
    salesForceCustomerId: string;
    country: string;
    state: string;
    billingCurrency: string;
    status: string;
    emailAlertStatus: string;
    smsAlertStatus: string;
    integrationStatus: string;
    siteInductionStatus: string;
    mobileAppStatus: string;
    hasLogo?: boolean;
    maxSmsPerCustomer?: number;
    maxSmsPerUser?: number;
    logoURL?: string;
    isDeleted?: boolean;
    updatedByName?: string;
    updatedOnUtc?: Date;
    eTag?: string;
    billedBy?: string;
    resellerName?: string;
    licenseFeePerCabinet?: number;
    integrationFeePercentage?: number;
    licensePeriod?: number;
    dateFormat?: string;
    timeFormat?: string;
}

export enum BillingTypes {
    CIC = "CIC",
    Reseller = "RESELLER"
}


// WEBPACK FOOTER //
// ./src/modules/customers/types/dto.ts