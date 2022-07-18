import { SearchCriteriaBase, CabinetConfiguration, CabinetItemConfiguration, Location } from "../../shared/types/dto";
import { VirtualCabinetAccessDefinitionSnapshot, ItemConfiguration } from "./store";
import { DataMaskConfig } from "src/modules/shared/types/dto";

export interface CabinetSearchCriteria extends SearchCriteriaBase {
    name: string;
    groupId?: string;
    itemCount: number;
    area: string;
    firmwareVersion: string;
    site: string;
}

export interface Cabinet {
    id: string;
    customerId?: string;
    name: string;
    groupId: string;
    groupName: string;
    provisioningKey: string;
    hardwareId: string;
    itemCount: string;
    relayCount: number;
    timeZone: string;
    site: string;
    siteName: string;
    area: string;
    remark: string;
    items: CabinetItem[];
    configurations: CabinetConfiguration[];
    inheritedConfigurations: CabinetConfiguration[];
    dataMask?: DataMaskConfig;
    isDeleted?: boolean;
    updatedByName?: string;
    updatedOnUtc?: Date;
    isVirtualCabinet?: boolean;
    etag?: string;
    provisioningStatus: CabinetProvisioningStatus;
    lockStatus: string;
    firmwareVersion?: string;
    chassisSerialNumber?: string;
    lastDisconnectedOnUtc?: Date;
    automaticUpdatesInterval?: string;
}

export interface CabinetBasicDetails {
    id: string;
    name: string;
    itemCount: number;
    description: string;
    area: string;
    site: string;
    cabinetGroupId: string;
    cabinetGroupName: string;
    cabinetLocation?: Location;
    items: CabinetItem[];
    provisioningKey: string;
    cabinetSerialNo: string;
    siteName: string;
}

export interface CabinetItem {
    number: number;
    hardwareId: string;
    name?: string;
    type?: string;
    configurations?: CabinetItemConfiguration[];
}

export interface CabinetItemBasicDetails {
    number: number;
    name?: string;
    type?: string;
    itemExpirary?: string;
    multicustodyWitnessCount?: string;
    returnWithoutWitness?: string;
    itemGroup?: string;
    serialNumber?: string;
    requiredError?: string;
    duplicateError?: string;
}

export interface CabinetItemGroup {
    itemGroupIndex: number;
    itemGroupName: string;
    remark: string;
    maximumKeys?: string;
    rowSelected: boolean;
    emptyError?: string;
    duplicateError?: string;
}

export interface CabinetItemDetails {
    cabinetId: string;
    cabinetName: string;
    cabinetItems: CabinetItem[];
}

export interface CabinetProvisionDto {
    provisioningKey: string;
    hardwareId: string;
    itemCount: number;
    items: CabinetItem[]
}

export interface CabinetTwinDto {
    reportedProperty?: ReportedPropertyDto;
    cabinetConfigurations?: CabinetTwinPropertyDto[];
    cabinetEventActions?: CabinetEventAction[];
    itemConfigurations?: ItemConfiguration[];
    cabinetItemStatusList?: CabinetItemStatusDto[];
    cabinetItemGroupList?: CabinetItemGroup[];
    cabinetAccessDefSnapshot: VirtualCabinetAccessDefinitionSnapshot;
    alarms?: Alarm[];
    cabinetBuzzerBlobURL: string;
    timeOffsetInMinutes: number;
}

export interface Alarm {
    alarm: string;
    status: CabinetAlarmStatus;
    startTime?: Date;
    endTime?: Date;
    duration?: number;
    canListAtCabinet?: boolean;
}

export interface CabinetEventAction {
    event: string;
    rules: EventRule[];
}

export interface EventRule {
    action: string;
    item?: string;
    duration: string;
    messageContent: string;
    canAlarmListedInCabinet: string;
}

export interface CabinetItemStatusDto {
    itemIndex: number;
    itemName: string;
    lastAccessedByUserId: string;
    lastAccessedByUserName: string;
    lastAccessedOn: Date;
    itemStatus: CabinetItemStatus;
}

export interface ReportedPropertyDto {
    cabinetStatus: CabinetTwinPropertyDto[],
    itemStatus: CabinetTwinPropertyDto[]
}

export interface CabinetTwinPropertyDto {
    key: string;
    value: any;
    lastAccessedBy?: string;
}

export interface CabinetAlarmDto {
    alarmName: string;
    status: string;
    startDateTime: Date;
    endDateTime: Date;
}

export interface LoginResult {
    succeeded: boolean;
    userId: string;
    errorCode: string;
    isDuress: boolean;
}

export enum SimulationMode {
    Mirror,
    VirtualCabinet
}

export enum CabinetAlarmStatus {
    Closed,
    Active
}

export enum CabinetPowerStatus {
    NoPower,
    AC,
    Battery,
    POE,
    AC_Battery,
    Battery_POE
}

export enum CabinetNetworkStatus {
    NoCommunication,
    LAN,
    WIFI,
    LTE_4G
}

export enum CabinetRelayStatus {
    Off,
    On
}

export enum DoorTimerStatus {
    NotRunning,
    Running,
    Expired
}

export enum CabinetKeypadStatus {
    Off,
    On
}

export enum CabinetDoorStatus {
    Close,
    Open
}

export enum CabinetItemStatus {
    Removed = 0,
    Available = 1,
    Overdue = 2,
    ForcedKey = 3,
    Disabled = 4,
    MultiCustody = 5,
    itemGrouped = 6,
}

export enum CabinetItemStatusColor {
    Available = "#009566",
    Unavailable = "#F15A29",
    Overdue = "#C92329",
    Disabled = "#606060",
    ItemGrouped = "#0D81DC",
    MultiCustody = "#703F95"
}

export enum CabinetAlarmFilterMode {
    Active = "active",
    Closed = "closed"
}

export enum TouchScreenMode {
    RETURN_ITEM,
    MAIN_MENU,
    RETRIEVE_ITEM,
    LOGIN_SCREEN,
    RETURN_OVERRIDE,
    MULTI_CUSTODY_LOGIN_SCREEN,
    ITEM_HISTORY,
    ITEM_HISTORY_ITEM,
    EVENT_HISTORY,
    DISPLAY_NOTIFICATION,
    ABOUT_CABINET,
    MAINTENANCE,
    ALARM_MANAGEMENT
}

export enum CabinetProvisioningStatus {
    Deprovisioned = 0,
    Provisioned = 1,
    DeprovisionInProgress = 2
}

export interface KeypadOptions {
    on: boolean;
    controlId: string;
    label: string;
    remark: string;
    type: string;
}

export class CabinetConst {
    // Display Status Value
    static readonly STATUS_ITEM_VALUE_AVAILABLE = "TEXT_AVAILABLE";
    static readonly STATUS_ITEM_VALUE_DISABLED = "TEXT_DISABLED";
    static readonly STATUS_ITEM_VALUE_MULTICUSTODY = "TEXT_MULTICUSTODY";
    static readonly STATUS_ITEM_VALUE_REMOVED = "TEXT_REMOVED";
    static readonly STATUS_ITEM_VALUE_OVERDUE = "TEXT_OVERDUE";
    static readonly STATUS_ITEM_VALUE_FORCEDKEY = "TEXT_FORCEDKEY";
    static readonly STATUS_VALUE_ON = "TEXT_ON";
    static readonly STATUS_VALUE_OFF = "TEXT_OFF";
    static readonly STATUS_VALUE_OPEN = "TEXT_OPEN";
    static readonly STATUS_VALUE_ACTIVE = "TEXT_ACTIVE";
    static readonly STATUS_VALUE_INACTIVE = "TEXT_INACTIVE";
    static readonly STATUS_VALUE_CLOSE = "TEXT_CLOSE";
    static readonly STATUS_VALUE_NO_POWER = "TEXT_NO_POWER";
    static readonly STATUS_VALUE_POWER_AC = "TEXT_AC";
    static readonly STATUS_VALUE_POWER_BATTERY = "TEXT_BATTERY";
    static readonly STATUS_VALUE_POWER_POE = "TEXT_POE";
    static readonly STATUS_VALUE_POWER_AC_BATTERY = "TEXT_AC_BATTERY";
    static readonly STATUS_VALUE_POWER_BATTERY_POE = "TEXT_BATTERY_POE";
    static readonly STATUS_VALUE_NO_COMMUNICATION = "TEXT_NO_COMMUNICATION";
    static readonly STATUS_VALUE_NETWORK_LAN = "TEXT_LAN";
    static readonly STATUS_VALUE_NETWORK_WIFI = "TEXT_WIFI";
    static readonly STATUS_VALUE_NETWORK_4G = "TEXT_4G";
    static readonly STATUS_VALUE_START = "TEXT_START";
    // For comparision//
    static readonly STATE_DOOR = "STATE_DOOR";
    static readonly STATE_POWER = "STATE_POWER";
    static readonly STATE_AC_POWER = "STATE_AC_POWER";
    static readonly STATE_BATTERY = "STATE_BATTERY";
    static readonly STATE_POE = "STATE_POE";
    static readonly STATE_NETWORK = "STATE_NETWORK";
    static readonly STATE_LAN = "STATE_LAN";
    static readonly STATE_WIFI = "STATE_WIFI";
    static readonly STATE_4G = "STATE_4G";
    static readonly STATE_MULTI_CUSTODY = "STATE_AUTHORISED_MULTICUSTODY";
    static readonly STATE_RELAY = "STATE_RELAY";
    static readonly STATE_ITEM = "STATE_ITEM";
    static readonly STATE_ALARM = "STATE_ALARM";
    static readonly STATE_KEYPAD = "STATE_KEYPAD";
    // Display Label//
    static readonly STATE_DISPLAY_DOOR = "STATE_DOOR";
    static readonly STATE_DISPLAY_SCREEN = "STATE_SCREEN";
    static readonly STATE_DISPLAY_POWER = "STATE_POWER";
    static readonly STATE_DISPLAY_NETWORK = "STATE_NETWORK";
    static readonly STATE_DISPLAY_MULTI_CUSTODY = "STATE_AUTHORISED_MULTICUSTODY";
    static readonly STATE_DISPLAY_RELAY = "STATE_RELAY";
    static readonly STATE_DISPLAY_ITEM = "STATE_ITEM";
    static readonly STATE_DISPLAY_KEYPAD = "STATE_KEYPAD";
    static readonly STATE_DISPLAY_ALARM_AC_POWER_DISCONNECTED = "STATE_ALARM_AC_POWER_DISCONNECTED";
    static readonly STATE_DISPLAY_ALARM_CABINET_CONTROL_UNIT_TAMPERED = "STATE_ALARM_CABINET_CU_TAMPERED";
    static readonly STATE_DISPLAY_ALARM_CABINET_DOOR_TAMPERED = "STATE_ALARM_CABINET_DOOR_TAMPERED";
    static readonly STATE_DISPLAY_ALARM_CABINET_REMOVED_FROM_WALL = "STATE_ALARM_CABINET_REMOVED_FROM_WALL";
    static readonly STATE_DISPLAY_ALARM_DOOR_LEFT_OPEN = "STATE_ALARM_DOOR_LEFT_OPEN";
    static readonly STATE_DISPLAY_ALARM_DURESS = "STATE_ALARM_DURESS";
    static readonly STATE_DISPLAY_ALARM_LOW_BATTERY = "STATE_ALARM_LOW_BATTERY";
    static readonly STATE_DISPLAY_ALARM_ITEM_OVERDUE = "STATE_ALARM_ITEM_OVERDUE";

}

export class VirtualCabinetConstatnts {
    static readonly VcFirmwareVersion = "vc-firmware";
    static readonly VcChassisNumber = "vc-chassis"
}

export class CabinetEventNameConst {
    static readonly DuressLoggedIn = "DURESS";
    static readonly UserLoginAttemptSuccess = "USER_LOGIN_ATTEMPT_SUCCESSFUL";
    static readonly UserSignedOut = "USER_LOGOUT";
    static readonly DoorOpened = "DOOR_OPENED";
    static readonly DoorClosedWithinValidTime = "DOOR_CLOSED_WITHIN_VALID_TIME";
    static readonly DoorClosedAfterOpenedTooLong = "DOOR_CLOSED_AFTER_OPENED_TOO_LONG";
    static readonly PowerAcOn = "AC_POWER_ON";
    static readonly PowerAcOff = "AC_POWER_OFF";
    static readonly PowerBatteryConnected = "BATTERY_CONNECTED";
    static readonly PowerBatteryDisconnected = "BATTERY_DISCONNECTED";
    static readonly PowerPoeOn = "POE_ON";
    static readonly PowerPoeOff = "POE_OFF";
    static readonly NetworkLanConnected = "LAN_CABLE_CONNECTED";
    static readonly NetworkLanDisconnected = "LAN_CABLE_DISCONNECTED";
    static readonly NetworkWifiConnected = "WiFi_NETWORK_CONNECTED";
    static readonly NetworkWifiDisconnected = "WiFi_NETWORK_DISCONNECTED";
    static readonly Network4GTurnedOn = "LTE_4G_CONNECTION_TURNED_ON";
    static readonly Network4GConnected = "LTE_4G_NETWORK_CONNECTED";
    static readonly Network4GDisconnected = "LTE_4G_NETWORK_DISCONNECTED";
    static readonly ItemReturnedWithinValidTime = "ITEM_RETURNED_WITHIN_VALID_TIME";
    static readonly ItemReturnedAfterValidTime = "ITEM_RETURNED_AFTER_VALID_TIME";
    static readonly ItemReturnOverrideWithinValidTime = "ITEM_OVERRIDE_RETURNED_WITHIN_VALID_TIME";
    static readonly ItemReturnOverrideAfterValidTime = "ITEM_OVERRIDE_RETURNED_AFTER_VALID_TIME";
    static readonly ItemRetrieved = "ITEM_RETRIEVED";
    static readonly ItemForced = "ITEM_FORCED_REMOVED";
    static readonly RelayOn = "RELAY_ON";
    static readonly RelayOff = "RELAY_OFF";
    static readonly EnterMultiCustody = "MULTICUSTODY_ENTER";
    static readonly ExitMultiCustody = "MULTICUSTODY_EXIT";
    static readonly MultiCustodyWitnessAuthSuccess = "MULTICUSTODY_WITNESS_AUTHENTICATION_SUCCESSFUL";
    static readonly MultiCustodyWitnessAuthFail = "MULTICUSTODY_WITNESS_AUTHENTICATION_FAIL";
    static readonly MultiCustodyWitnessAuthProcessEnded = "MULTICUSTODY_WITNESS_AUTHENTICATION_PROCESS_ENDED";
    static readonly MultiCustodyFailedAttempt = "MULTICUSTODY_FAILED_ATTEMPT";
    static readonly MultiCustodyItemRetreived = "MULTICUSTODY_ITEM_RETRIEVED";
    static readonly MultiCustodyItemReturnWithinValidTime = "MULTICUSTODY_ITEM_RETURNED_WITHIN_VALID_TIME";
    static readonly MultiCustodyItemReturnAfterValidTime = "MULTICUSTODY_ITEM_RETURNED_AFTER_VALID_TIME";
    static readonly MulticustodyItemReturnOverrideWithinValidTime = "MULTICUSTODY_ITEM_OVERRIDE_RETURNED_WITHIN_VALID_TIME";
    static readonly MulticustodyItemReturnOverrideAfterValidTime = "MULTICUSTODY_ITEM_OVERRIDE_RETURNED_AFTER_VALID_TIME";
    static readonly WitnessUserTimeout = "WITNESS_USER_TIMEOUT";
    static readonly DoorOpenTooLong = "DOOR_OPEN_TOO_LONG";
    static readonly NoActivity = "NO_ACTIVITY";
    static readonly DoorLocked = "DOOR_LOCKED";
    static readonly DoorUnlocked = "DOOR_UNLOCKED";
    static readonly AlarmStarted = "ALARM_STARTED";
    static readonly AlarmClosed = "ALARM_CLOSED";
    static readonly CabinetDeprovisionFromCabinet = "CABINET_DEPROVISION_FROM_CABINET";
    static readonly CabinetDeprovisionFromSoftware = "CABINET_DEPROVISION_FROM_SOFTWARE";
    static readonly ItemOverdue = "ITEM_OVERDUE";
}

export class AlarmTypes {
    static readonly AcPowerDisconnected = "AC_POWER_DISCONNECTED";
    static readonly CabinetControlUnitTampered = "CABINET_CU_TAMPERED";
    static readonly CabinetDoorTampered = "CABINET_DOOR_TAMPERED";
    static readonly CabinetRemovedFromWall = "CABINET_REMOVED_FROM_WALL";
    static readonly DoorLeftOpen = "DOOR_LEFT_OPEN";
    static readonly Duress = "DURESS";
    static readonly LowBattery = "LOW_BATTERY";
    static readonly ExtremeLowBattery = "EXTREME_LOW_BATTERY";
    static readonly BatteryDisconnected = "BATTERY_DISCONNECTED";
    static readonly KeyForcefulRetrieve = "KEY_FORCEFUL_RETRIEVE";
    static readonly GroundConnectionDisconnected = "GROUND_CONNECTION_DISCONNECTED";
    static readonly ItemOverdue = "ITEM_OVERDUE";
}

export class DurationTimeConstants {
    static readonly Indefinite = "INDEFINITE";
    static readonly NotApplicable = "N/A";
}

export interface CabinetDetail {
    cabinetId: string;
    itemIndexes: number[];
}

export interface TempCabinetGroupDetail {
    groupId: string;
    cabinets: TempCabinetDetail[];
    isSelected?: boolean;
    groupName?: string;
}

export interface TempSiteDetail {
    siteId: string;
    cabinets: TempCabinetDetail[];
    isSelected?: boolean;
    siteName?: string;
}

export interface TempCabinetDetail {
    cabinetId: string;
    isSelected?: boolean;
    cabinetName?: string;
    items?: TempItemDetail[];
}

export interface TempItemDetail {
    number: number;
    isSelected?: boolean;
    cabinetId?: string;
    cabinetGroupId?: string;
    cabinetName?: string;
    cabinetGroupName?: string;
    name?: string;
    type?: string;
    itemGroup?: string;
    siteName?: string;
    siteId?: string;
}

export enum ItemStatus {
    InCabinet = "AVAILABLE",
    OutOfCabinetScheduled = "REMOVED",
    OutOfCabinetOverdue = "OVERDUE"
}

export enum CabinetLockState {
    Locked = "Locked",
    UnLocked = "UnLocked"
}


// WEBPACK FOOTER //
// ./src/modules/cabinet/types/dto.ts