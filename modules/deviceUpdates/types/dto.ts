import { SearchCriteriaBase } from "../../shared/types/dto";

export interface DeviceUpdateSearchCriteria extends SearchCriteriaBase {
    contextCustomerId: string;
    label: string;
    type: string;
}

export interface DeviceUpdate {
    id: string;
    customerId?: string;
    updateLabel:string;
    remark?: string;
    localTime: Date;
    status: string;
    manifest: Manifest;
    cabinetIds: string[];
    isDeleted?: boolean;
    updatedByName?: string;
    updatedOnUtc?: Date;
    etag?: string;
}

export interface Manifest {
    includeLookups?: boolean;
    includeConfigurations?: boolean;
    includeAccessDefinitions?: boolean;
    includeEventRules?: boolean;
    includeFirmware?: boolean;
    firmware?: string;
}

export enum DeviceUpdateStates {
    Draft = "DRAFT",
    PublishingInProgress = "PUBLISHING_INPROGRESS",
    Published = "PUBLISHED"
}

export interface DeviceUpdateStatus {
    customerDeviceUpdates: PendingDeviceUpdateStatus[];
}

export interface PendingDeviceUpdateStatus {
    deviceUpdateCustomerId: string;
    cabinetManifests: CabinetManifestsDetails[];
}

export interface CabinetManifestsDetails {
    cabinetId: string;
    manifestList: string[];
}

export enum DeviceUpdatePlaceholders {
    UpdateLabelPrefix = "Update_at_",
    Remark = "This is a manual update"
}


// WEBPACK FOOTER //
// ./src/modules/deviceUpdates/types/dto.ts