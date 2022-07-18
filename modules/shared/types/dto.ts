export interface DataUpdateResult {
    id: string;
    eTag: string;
    updatedByName: string;
    updatedOnUtc: Date;
}

export interface RequestInfo {
    requestPending: boolean,
    spinnerVisible: boolean
}

export interface PagedResultSet<T> {
    results: T[];
    continuationToken?: string;
}

export interface ListItem {
    id: string;
    name: string;
}

export interface BasicUser {
    id: string;
    name: string;
    email: string;
    mobileNumber?: string;
    description: string;
    designation: string;
    externalSystemId: string;
    rolesInCustomer: string[];
    updatedByName?: string;
    updatedOnUtc?: Date;
}

export interface BasicCustomer {
    id: string;
    name: string;
    integrationStatus: string;
    siteInductionStatus: string;
    dateFormat?: string;
    timeFormat?: string;
}

export interface LocalisationText {
    key: string;
    customerId: string;
    culture: string;
    section: string;
    priority: number;
    value: string;
}

export interface Lookup {
    key: string;
    customerId: string;
    culture: string;
    section: string;
    priority: number;
    items: LookupItem[];
}

export interface LookupItem {
    text?: string;
    value?: string;
    remark?: string;
    childLookupKey?: string;
    sortOrder?: number;
    isExternalRoleItem?: boolean;
}

export interface Country {
    value: string;
    text: string;
    children: CountryState[];
}

export interface CountryState {
    value: string;
    text: string;
}

export interface EventAlarmMapping{
    eventCode: string;
    alarms: string[];
}

export interface Configuration {
    key: string;
    customerId: string;
    culture: string;
    section: string;
    priority: number;
    value: string;
}

export interface SearchCriteriaBase {
    includeDeleted?: boolean;
    hideIncludeDeleteOption?: boolean;
    selectedColumns?: string[];
}

export interface UIContext {
    customerId: string;
    section: string;
    culture: string;
}

export interface MobileNumber {
    iddCode?: string;
    number?: string;
}

export interface CabinetConfiguration {
    key: string;
    value?: string;
    inheritedValue?: string;
}

export interface SignalRInfo {
    url: string;
    accessToken: string;
}

export interface CabinetItemConfiguration {
    index: number;
    key: string;
    value?: string;
    error?: string;
    inheritedValue?: string;
}

export interface DateTimeFromatConfiguration {
    displayFormat: string;
    reportLongMomentDateFormat: string;
    momentDateFormat: string;
    momentTimeFormat: string;
    momentDateTimeFormat: string;
    momentDateTimeWithSecondsFormat: string;
    kendoDateTimeFormat: string;
    kendoDateFormat: string;
    kendoTimeFormat: string;
    kendoReactWrapperDateTimeFormat: string;
    isSelected: boolean;
}

export enum TimeDurations {
    Weekly = "WEEKLY",
    Fortnightly = "FORTNIGHTLY",
    Monthly = "MONTHLY",
    Quarterly = "QUARTERLY",
    Custom = "CUSTOM"
}

export interface Location {
    address?: string;
    latitude?: number;
    longitude?: number;
}

export interface DataMaskConfig {
    status?: string;
    isSelected?: boolean;
    id?: string;
    name?: string;
    cardType?: string;
    totalBits: number;
    sourceType?: string;
    sourceIdentifier?: string;
    facilityCode?: string;
    facilityCodeBitsInfo: BitInfo;
    cardDetailsBitsInfo: BitInfo;
    issueCodeBitsInfo: BitInfo;
}

export interface BitInfo {
    startBit: number;
    endBit: number;
}

export const defaultDataMaskConfig: DataMaskConfig = {
    name: "Wiegand 26/8 bit",
    totalBits: 26,
    facilityCodeBitsInfo: {
        startBit: 2,
        endBit: 9
    },
    cardDetailsBitsInfo: {
        startBit: 10,
        endBit: 25
    },
    issueCodeBitsInfo: {
        startBit: 0,
        endBit: 0
    }
}

export enum DataMaskSources {
    IntegrationSystem = "INTEGRATION_SYSTEM",
    ExternalSystem = "EXTERNAL_SYSTEM",
    Cabinet = "CABINET",
    NotApplicable = "NOT_APPLICABLE",
    Site = "SITE"
}

export enum DataMaskParentTypes {
    ExternalSystem = "EXTERNAL_SYSTEM",
    CabinetGroup = "CABINET_GROUP",
    Cabinet = "CABINET",
    Site = "SITE"
}

export enum DataMaskStatus {
    Active = "ACTIVE",
    Inactive = "INACTIVE"
}



// WEBPACK FOOTER //
// ./src/modules/shared/types/dto.ts