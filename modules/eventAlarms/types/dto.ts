import { SearchCriteriaBase } from "../../shared/types/dto";

export interface EventAlarmSearchCriteria extends SearchCriteriaBase {
    contextCustomerId: string;
    eventSource: string;
    event: string;
    cabinet: string;
    site: string;
}

export interface AlarmSearchCriteria extends SearchCriteriaBase {
    contextCustomerId: string;
    cabinet: string;
    alarm: string;
    status: string;
    from: string;
    to: string;
}

export interface AlertSearchCriteria extends SearchCriteriaBase {
    contextCustomerId: string;
    userName: string;
    role: string;
    eventSource: string;
    event: string;
    channel: string;
    alertStartTime: string;
    alertEndTime: string;
    eventStartTime: string;
    eventEndTime: string;
}

export interface EventPrioritySearchCriteria extends SearchCriteriaBase {
    contextCustomerId: string;
    event: string;
    priority: string;
}

export interface EventAlarmConfig {
    id: string;
    customerId?: string;
    eventSource?: EventSource;
    eventSourceId?: string;
    eventCode?: string;
    remark?: string;
    isDefault?: boolean;
    emailAlertConfiguration?: AlertConfig;
    smsAlertConfiguration?: AlertConfig;
    eventActions?: ActionConfig[];
    alarmConfiguration?: AlarmConfig;
    isDeleted?: boolean;
    updatedByID?: string;
    updatedByName?: string;
    updatedOnUtc?: Date;
    eTag?: string;
}

export interface AlertConfig {
    alertType: AlertType;
    template: string;
    users: string[];
    roles: string[];
}

export enum AlertType {
    EMail,
    SMS
}

export interface ActionConfig {
    name: string;
    duration: string;
    content: string;
}

export interface AlarmConfig {
    alarmName: string;
    canCloseFromWeb: boolean;
    canHandleFromCabinet: boolean;
    sendEscalationAlert: boolean;
    escalationInterval: string;
    escalationAlertUsers: string[];
    closeEvents: string[];
}

export interface Alarm {
    id: string;
    alarmCode: string;
    startedUserName?: string;
    event: string;
    status: string
    customerId: string;
    cabinetId: string;
    cabinetName: string;
    cabinetGroupId: string;
    cabinetGroupName: string;
    startTime: Date;
    endTime?: Date;
    smsUsers: string[];
    emailUsers: string[];
    remarks?: string;
    closedByName?: string;
    updatedByName: string;
    updatedOnUtc: Date;
    siteName: string;
}

export interface Alert {
    id: string;
    customerId: string;
    userName: string;
    eventSource: string;
    event: string;
    channel: string;
    alertTime: Date;
    eventTime: Date;
    senderId: string;
    subject: string;
    content: string;
}

export interface EventPriority {
    customerId: string;
    event: string;
    priority: string;
    remark: string;
}

export interface EventSource {
    type: string;
    id?: string;
    isItemEvent?: boolean;
    itemNumber?: number;
}

export interface EventAction {
    refId?: string;
    actionType: number;
    action?: string;
    alertAction?: string;
    templateKey?: string;
    recipientType: string;
    userId?: string;
    role?: string;
    cabinetAction?: string;
    duration?: string;
    escalationTime?: string;
    escalationEvent?: string;
    messageContent?: string;
}

export interface ActiveAlarmStatus {
    alarmCustomerId: string;
    cabinetAlarms: CabinetAlarmDetails[];
}

export interface AlarmStatusUpdate extends ActiveAlarmStatus {
    alarmCabinetGroupId: string;
    alarmCabinetId: string;
    highSeverityAlarmCountChange: number;
    lowSeverityAlarmCountChange: number;
    highSeverityEscalatedAlarmCountChange: number;
    lowSeverityEscalatedAlarmCountChange: number;
    impactedCabinetCountChange: number;
    alarmSite: string;
}

export interface CabinetAlarmDetails {
    cabinetId: string;
    alarmIdList: string[];
}

export interface ActiveAlarmStoreStatus {
    activeAlarms: ActiveAlarmStatus[];
}

export enum EventSources {
    Web = "WEB",
    Cabinet = "CABINET",
    CabinetGroup = "CABINETGROUP",
    Site = "SITE"
}

export enum ActionTypes {
    AlertForUser = 1,
    ActionAtCabinet = 2
}

export enum CabinetActions {
    TouchScreenPopup = "TOUCH_SCREEN_POPUP_SHOW"
}

export enum ActionErrors {
    UserAlertRequiredError = "USER_ALERT_REQUIRED_ERROR",
    CabinetActionRequiredError = "CABINET_ACTION_REQUIRED_ERROR",
    UserAlertDuplicateError = "USER_ALERT_DUPLICATE_ERROR",
    CabinetActionDuplicateError = "CABINET_ACTION_DUPLICATE_ERROR",
    EscalationTimeError = "ESCALATION_TIME_ERROR",
}

export enum EventActionConfigs {
    MaxLengthPattern = "#MAXLENGTH#",
    EscalationSuffix = "_ESC_"
}

export enum AlarmStatus {
    Active = "ACTIVE",
    ClosedByWebUser = "CLOSED_BY_WEB_USER",
    ClosedByCabinetUser = "CLOSED_BY_CABINET_USER",
    ClosedByCabinetEvent = "CLOSED_BY_CABINET_EVENT"
}

export enum AlarmUpdateStatus {
    Active = "ACTIVE",
    Closed = "CLOSED"
}

export enum EventPriorities {
    Any = "any",
    High = "HIGH",
    Low = "LOW"
}



// WEBPACK FOOTER //
// ./src/modules/eventAlarms/types/dto.ts