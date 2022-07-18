import { SearchCriteriaBase } from "../../shared/types/dto";
import { DataMaskConfig } from "src/modules/shared/types/dto";
import { CabinetDetail, TempCabinetGroupDetail, TempSiteDetail } from "src/modules/cabinet/types/dto";

export interface ExternalSystemSearchCriteria extends SearchCriteriaBase {
    contextCustomerId: string;
    integrationSystem: string;
    integrationStatus: string;
}

export interface ExternalSystem {
    id: string;
    customerId?: string;
    integrationSystem: string;
    description: string;
    exportEventFromDate?: string;
    tempExportEventFromDate?: string;
    exportEvents: string[];
    tempExportEventDetails: TempEventDetail[];
    integrationStatus: string;
    isExternalSystemConnected: string;
    isMiddlewareConnected: string;
    isDeleted?: boolean;
    updatedByName?: string;
    updatedOnUtc?: Date;
    etag?: string;
    userSynchronisationSelection?: string;
    userFieldMappingList?: UserFieldMap[],
    tempUserFieldMappingList?: TempUserFieldMap[],
    syncInterval?: string;
    scheduleDay?: string;
    scheduleTime?: string;
    provisioningKey?: string;
    externalSystemConfigurations?: ExternalSystemConfiguration[];
    tempExternalSystemConfigurations?: TempExternalSystemConfiguration[];
    applicableDataMaskId?: string;
    dataMasks?: DataMaskConfig[];
    tempDataMasks?: DataMaskConfig[];
    antiTailgatingStatus?: string;
    antiTailgatingItemsetName?: string;
    antiTailgatingItemset?: CabinetDetail[];
    tempAntiTailgatingItemset?: TempCabinetGroupDetail[];
    userGroups?: ExternalUserGroup[];
    selectedUserGroups: string[];
    timeZone?: string;
    alertUsers?: string[];
    isAutoSyncEnabled: boolean;
    externalId?: string;
    accessGrantURL?: string;
    webhookURL?: string;
    deviceMappings?: ExternalDeviceMapping[];
    tempDeviceMappings?: ExternalDeviceMapping[];
    customFields?: ExternalSystemCustomFields;
    tempSiteDetails?: TempSiteDetail[];
}

export interface ExternalUserGroup {
    id: string;
    name: string;
    description: string;
    role: string;
}

export interface UserGroup {
    id: string;
    name: string;
    description: string;
}

export interface ExternalSystemConfiguration {
    key: string;
    value: string;
}

export interface ExternalDeviceMapping {
    cabinet: string;
    device: string;
}

export interface ExternalSystemCustomFields {
    field1: any;
    field2: any;
    field3: any;
}

export interface TempExternalSystemConfiguration {
    key: string;
    text?: string;
    value?: string;
    remark?: string;
    childLookup?: string;
    sortOrder?: number;
}

export interface UserFieldMap {
    systemField: string;
    thirdPartyField: string;
}

export interface TempUserFieldMap {
    isSelected?: boolean;
    isMandatory?: boolean;
    systemField: string;
    tytonUserFieldText?: string;
    thirdPartyField?: string;
    description?: string;
}

export interface TempEventDetail {
    eventKey: string;
    remark?: string;
    rowSelected?: boolean;
    index?: number;
}

export interface MiddlewareLogEvent {
    type: string;
    datetime: Date;
    integrationSystem: string;
    recordCount: number;
    message: string;
}

export interface MiddlewareLogContinuationToken {
    nextPartitionKey: string;
    nextRowKey: string;
    nextTableName: string;
    targetLocation: StorageLocation;
}

export enum StorageLocation {
    Primary = 0,
    Secondary = 1
}

export enum IntegrationStatus {
    Inactive = "INACTIVE",
    Active = "ACTIVE"
}

export enum UserSynchronisationSelection {
    IntervalBased = "IntervalBased",
    ScheduleBased = "ScheduleBased"
}

export enum MiddlewareLogEventPlaceholders {
    Count = "#COUNT",
    ExternalSystem = "#EXTERNALSYSTEM"
}

export enum AntiTailgatingStatus {
    Inactive = "INACTIVE",
    Active = "ACTIVE"
}

export enum IntegrationSystems {
    Gallagher8 = "GALLAGHER_8_0",
    Genetec = "GENETEC",
    Generic = "GENERIC",
    Sine = "SINE",
    Integriti = "INTEGRITI",
    AzureAD = "AZURE_AD",
    Brivo = "BRIVO",
    CCure = "CCURE",
    C4 = "C4"
}

export const complexIntegrations: string[] =
    [
        IntegrationSystems.Gallagher8,
        IntegrationSystems.Genetec,
        IntegrationSystems.Integriti,
        IntegrationSystems.CCure,
        IntegrationSystems.C4
    ]


// WEBPACK FOOTER //
// ./src/modules/externalSystems/types/dto.ts