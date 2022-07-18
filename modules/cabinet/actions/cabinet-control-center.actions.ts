import * as constants from "../constants/cabinet-control-center.constants";
import { Dispatch } from "redux";
import {
    Cabinet, SimulationMode, CabinetItemStatus, CabinetDoorStatus, CabinetPowerStatus,
    CabinetNetworkStatus, CabinetTwinDto, CabinetRelayStatus, CabinetConst, CabinetTwinPropertyDto,
    CabinetEventNameConst, TouchScreenMode, CabinetProvisioningStatus, DoorTimerStatus
} from "../types/dto";
import {
    CabinetSimulationState, VirtualCabinetItem, CabinetEvent, VirtualCabinetRelay,
    VirtualCabinetAccessDefinitionSnapshot, ItemConfiguration, VirtualCabinetUser, CabinetItemEvent
} from "../types/store";
import { cabinetService } from "../services/cabinet.service";
import { localise } from "../../shared/services";
import { alertActions } from "../../shared/actions/alert.actions";
import { cabinetControlCenterService } from "../services/cabinetControlCenter.service";
import { store } from "src/redux/store";
import { cabinetPermissionService } from "../components/CabinetControlCenter/shared/cabinet-permission-service";
import { cabinetItemStatusService } from "../components/CabinetControlCenter/shared/cabinet-item-status.service";
import { CabinetItemConfiguration } from "src/modules/shared/types/dto";
import { cabinetTimerService } from "../components/CabinetControlCenter/shared/cabniet-timer.service";
import { eventRuleService } from "../components/CabinetControlCenter/shared/event-rule-service";
import { cabinetResourceService } from "../components/CabinetControlCenter/shared/cabinet-resource-service";

export const cabinetControlCenterActions = {
    loadCabinet,
    autoProvisionCabinet,
    loginToCabinet,
    unloadCabinet,
    toggleDoor,
    togglePower,
    toggleNetwork,
    toggleItem,
    blinkItem,
    triggerTouchScreenInteraction,
    loadCabinetTwin,
    loadEvents,
    loadItemEvents,
    loadTouchScreenEvents,
    clearEventHistoryData,
    clearItemEventHistoryData,
    clearTouchScreenEventHistoryData,
    switchTouchScreenMode,
    signOut,
    triggerMultiCustodyLogin,
    multiCustodyLogin

}

export interface TriggerTouchScreenInteraction {
    type: constants.TRIGGER_TOUCH_SCREEN_INTERACTION
}

export interface LoadCabinetAction {
    type: constants.LOAD_CABINET,
    cabSimulationState: CabinetSimulationState
}

export interface LoadCabinetTwin {
    type: constants.LOAD_CABINET_TWIN,
    cabTwinState: any
}

export interface ProvisionSuccess {
    type: constants.PROVISION_SUCCESS,
    provisionData: any
}

export interface SetGlobalTimeState {
    type: constants.SET_GLOBAL_TIMER_STATE
}

export interface LoginSuccess {
    type: constants.CABINET_LOGIN_SUCCESS,
    userId: string;
    items: VirtualCabinetItem[];
}

export interface LoginError {
    type: constants.CABINET_LOGIN_ERROR,
    error: string;
}

export interface UnloadCabinet {
    type: constants.UNLOAD_CABINET
}

export interface ToggleDoor {
    type: constants.TOGGLE_DOOR,
    status: CabinetDoorStatus
}

export interface ToggleDoorTimer {
    type: constants.TOGGLE_DOOR_TIMER,
    status: DoorTimerStatus
}

export interface TogglePower {
    type: constants.TOGGLE_POWER,
    status: CabinetPowerStatus
}

export interface ToggleNetwork {
    type: constants.TOGGLE_NETWORK,
    status: CabinetNetworkStatus
}

export interface ToggleKey {
    type: constants.TOGGLE_ITEM,
    action: KeyState
}

export interface ToggleItemSuccess {
    type: constants.TOGGLE_ITEM_SUCCESS,
    items: VirtualCabinetItem[]
}

export interface ToggleRelay {
    type: constants.TOGGLE_RELAY,
    action: RelayState
}

export interface RelayState {
    index: number;
    status: CabinetRelayStatus
}

export interface KeyState {
    itemIndex?: number;
    name?: string;
    hardwareId?: string;
    status: CabinetItemStatus;
    lastAccessedByUserId?: string;
    lastAccessedByUserName?: string;
}

export interface QueueEvent {
    type: constants.QUEUE_EVENT;
    event: CabinetEvent;
    isHighPriority: boolean;
}

export interface DequeueHighPriorityEvents {
    type: constants.DEQUEUE_HIGH_PRIORITY_EVENTS;
    lastProcessedEventId: string;
}

export interface DequeueLowPriorityEvents {
    type: constants.DEQUEUE_LOW_PRIORITY_EVENTS;
    lastProcessedEventId: string;
}

export interface StartHighPriorityEventPublishing {
    type: constants.START_HIGH_PRIORITY_EVENT_PUBLISHING;
}

export interface StartLowPriorityEventPublishing {
    type: constants.START_LOW_PRIORITY_EVENT_PUBLISHING;
}

export interface StopHighPriorityEventPublishing {
    type: constants.STOP_HIGH_PRIORITY_EVENT_PUBLISHING;
}

export interface StopLowPriorityEventPublishing {
    type: constants.STOP_LOW_PRIORITY_EVENT_PUBLISHING;
}

export interface SignOut {
    type: constants.SIGN_OUT;
}

export interface LoadCabinetEventsAction {
    type: constants.LOAD_CABINET_EVENTS;
    cabineEventList: CabinetEvent[];
    cabinetEventContinuationToken?: string;
    isLoadMore: boolean;
}

export interface LoadCabinetItemEventsAction {
    type: constants.LOAD_CABINET_ITEM_EVENTS;
    cabinetItemEventList: CabinetItemEvent[];
    cabinetItemEventContinuationToken?: string;
    isLoadMore: boolean;
}

export interface LoadTouchScreenCabinetEventsAction {
    type: constants.LOAD_TOUCH_SCREEN_CABINET_EVENTS;
    touchScreenCabinetEventList: CabinetEvent[];
    touchScreenCabinetEventContinuationToken?: string;
    isLoadMore: boolean;
}

export interface ClearCabinetEventHistoryData {
    type: constants.CLEAR_CABINET_EVENT_HISTORY;
}

export interface ResetCabinetTimer {
    type: constants.RESET_CABINET_TIMER;
    cabinetTimerTimeInSeconds?: number;
}

export interface ClearCabinetItemEventHistoryData {
    type: constants.CLEAR_CABINET_ITEM_EVENT_HISTORY;
}

export interface ClearTouchScreenCabinetEventHistoryData {
    type: constants.CLEAR_TOUCH_SCREEN_CABINET_EVENT_HISTORY;
}

export interface CabinetTimerElapse {
    type: constants.CABINET_TIMER_ELAPSED;
    remainingTimeInSeconds?: number;
}

export interface CabinetTimerStart {
    type: constants.CABINET_TIMER_STARTED;
    remainingTimeInSeconds?: number;
}

export interface BlinkItem {
    type: constants.BLINK_ITEM;
    itemIndex: number;
}

export interface ChangeTouchScreen {
    type: constants.CHANGE_TOUCH_SCREEN;
    touchScreenMode: TouchScreenMode;
    items: VirtualCabinetItem[];
    item?: VirtualCabinetItem;
}

export interface OnTriggeringMultiCustodyLogin {
    type: constants.TRIGGER_MULTI_CUSTODY_LOGIN;
    touchScreenMode: TouchScreenMode;
    item: VirtualCabinetItem;
    previousTouchScreenMode: TouchScreenMode
}

export interface MultiCustodyWitnessLoginSuccess {
    type: constants.MULTI_CUSTODY_WITNESS_LOGIN_SUCCESS;
    userId: string;
}

export interface MultiCustodyWitnessLoginFail {
    type: constants.MULTI_CUSTODY_WITNESS_LOGIN_FAIL;
    userId: string;
    error: string;
}

export interface MultiCustodyAuthenticationSuccess {
    type: constants.MULTI_CUSTODY_AUTHENTICATION_COMPLETE;
    previousTouchScreenMode: TouchScreenMode;
    userId: string;
    items: VirtualCabinetItem[];
}

export interface MultiCustodyAuthenticationFail {
    type: constants.MULTI_CUSTODY_AUTHENTICATION_FAIL;
    error: string;
}

export interface SwitchToMainMenuOnMultiCustodyAuthFail {
    type: constants.SWITCH_TO_MAIN_MENU_ON_MULTI_CUSTODY_AUTH_FAIL;
}

export interface WitnessUserTimeout {
    type: constants.WITNESS_USER_TIMEOUT;
    items: VirtualCabinetItem[];
}

export interface ChangeTouchScreenToNotificationMode {
    type: constants.CHANGE_TOUCH_SCREEN_WITH_OUT_ITEM_STATES;
    touchScreenMode: TouchScreenMode;
}

export interface ShowTouchScreenPopup {
    type: constants.SHOW_TOUCHSCREEN_POPUP;
    message: string;
}

export interface HideTouchScreenPopup {
    type: constants.HIDE_TOUCHSCREEN_POPUP;
}

export type CabinetControlCenterActions = LoadCabinetAction | ProvisionSuccess | LoginSuccess | LoginError | UnloadCabinet
    | ToggleDoor | TogglePower | ToggleNetwork | ToggleKey | LoadCabinetTwin | QueueEvent | DequeueHighPriorityEvents
    | DequeueLowPriorityEvents | StartHighPriorityEventPublishing | StartLowPriorityEventPublishing | StopHighPriorityEventPublishing
    | StopLowPriorityEventPublishing | ToggleRelay | LoadCabinetEventsAction | LoadCabinetItemEventsAction
    | LoadTouchScreenCabinetEventsAction | ClearCabinetEventHistoryData | ClearCabinetItemEventHistoryData | ClearTouchScreenCabinetEventHistoryData
    | ToggleItemSuccess | ChangeTouchScreen | BlinkItem | SignOut | OnTriggeringMultiCustodyLogin | MultiCustodyWitnessLoginSuccess
    | MultiCustodyWitnessLoginFail | MultiCustodyAuthenticationSuccess | MultiCustodyAuthenticationFail | SwitchToMainMenuOnMultiCustodyAuthFail
    | WitnessUserTimeout | ChangeTouchScreenToNotificationMode | SetGlobalTimeState
    | TriggerTouchScreenInteraction | CabinetTimerElapse | CabinetTimerStart | ResetCabinetTimer | ShowTouchScreenPopup | HideTouchScreenPopup | ToggleDoorTimer;

function triggerMultiCustodyLogin(item: VirtualCabinetItem, previousTouchScreenMode: TouchScreenMode) {

    let virtualCabinetState: CabinetSimulationState = store.getState().cabinetSimulation;

    return (dispatch: Dispatch<CabinetControlCenterActions>) => {

        if (item.multiCustodyWitnessCount) {
            let remainingWitnessCount = virtualCabinetState.multiCustodyLoginSuccessCount ?
                item.multiCustodyWitnessCount - virtualCabinetState.multiCustodyLoginSuccessCount : item.multiCustodyWitnessCount;

            let perWitnessTimeout = cabinetTimerService.getCabinetTimeOutInSecondsByKey('WITNESS_USER_TIMEOUT');

            cabinetTimerService.registerWitnessTimeoutTimer(perWitnessTimeout * remainingWitnessCount, () => onWitnessTimeOutExceed(item), dispatch);
        }

        dispatch({
            type: constants.TRIGGER_MULTI_CUSTODY_LOGIN,
            touchScreenMode: TouchScreenMode.MULTI_CUSTODY_LOGIN_SCREEN,
            item: item,
            previousTouchScreenMode: previousTouchScreenMode
        });

        eventRuleService.queueEvent(CabinetEventNameConst.EnterMultiCustody,
            getMultiCustodyEventDetailsObject(virtualCabinetState.loggedInUserId, item && item.itemIndex));
    };
}

function getUserDetailsFromAlternateId(alternateId: string, accessDefinitionSnapshot: VirtualCabinetAccessDefinitionSnapshot) {
    return accessDefinitionSnapshot.users.find(user => user.userId == alternateId);
}

function getItemDetailsOfMultiCustodyItem(virtualCabinetState: CabinetSimulationState) {
    if (virtualCabinetState.items && virtualCabinetState.multiCustodyLoginItemIndex) {
        return virtualCabinetState.items.find(item => item.itemIndex == virtualCabinetState.multiCustodyLoginItemIndex);
    }
    return undefined;
}

function multiCustodyLogin(alternateId: string, pin: string, cabinetId: string, customerId: string, previousTouchScreenMode: TouchScreenMode) {
    var accessDefinitionSnapshot: VirtualCabinetAccessDefinitionSnapshot = store.getState().cabinetSimulation.accessDefinitionSnapshot;
    let virtualCabinetState: CabinetSimulationState = store.getState().cabinetSimulation;

    let canLogin = cabinetPermissionService.canMultiCustodyWitnessLogin(alternateId);

    let userDetails = getUserDetailsFromAlternateId(alternateId, accessDefinitionSnapshot);

    let itemDetails = getItemDetailsOfMultiCustodyItem(virtualCabinetState);

    return (dispatch: Dispatch<CabinetControlCenterActions>) => {
        // Whether user in the cabinet
        if (!accessDefinitionSnapshot || !accessDefinitionSnapshot.users.some(u => u.userId == alternateId)) {

            eventRuleService.queueEvent(CabinetEventNameConst.MultiCustodyWitnessAuthFail,
                getMultiCustodyEventDetailsObject(virtualCabinetState.loggedInUserId, itemDetails && itemDetails.itemIndex));

            dispatch({ type: constants.MULTI_CUSTODY_WITNESS_LOGIN_FAIL, userId: alternateId, error: localise("ERROR_MULTI_CUSTODY_LOGIN") });

            if (isMaximumRetriesExceeded(virtualCabinetState)) {
                onMaximumRetriesExceed(dispatch, virtualCabinetState, alternateId, itemDetails, userDetails);
            }
        }

        // User does not have permission
        else if (!canLogin) {

            eventRuleService.queueEvent(CabinetEventNameConst.MultiCustodyWitnessAuthFail,
                getMultiCustodyEventDetailsObject(virtualCabinetState.loggedInUserId, itemDetails && itemDetails.itemIndex, userDetails && userDetails.id));

            dispatch({ type: constants.MULTI_CUSTODY_WITNESS_LOGIN_FAIL, userId: alternateId, error: localise("ERROR_FORBIDDEN_ACCESS") });

            if (isMaximumRetriesExceeded(virtualCabinetState)) {
                onMaximumRetriesExceed(dispatch, virtualCabinetState, alternateId, itemDetails, userDetails);
            }
        }

        // User already log in as either cabinet user or multicustody witness
        else if ((virtualCabinetState.loggedInUserAlternateId && virtualCabinetState.loggedInUserAlternateId == alternateId) ||
            (virtualCabinetState.multiCustodyLoginSuccessUsers &&
                virtualCabinetState.multiCustodyLoginSuccessUsers.find(loggedInUserId => loggedInUserId == alternateId))) {

            eventRuleService.queueEvent(CabinetEventNameConst.MultiCustodyWitnessAuthFail,
                getMultiCustodyEventDetailsObject(virtualCabinetState.loggedInUserId, itemDetails && itemDetails.itemIndex, userDetails && userDetails.id));
            dispatch({ type: constants.MULTI_CUSTODY_WITNESS_LOGIN_FAIL, userId: alternateId, error: localise("ERROR_MULTI_CUSTODY_WITNESS_ALREADY_LOGGEDIN") });

            if (isMaximumRetriesExceeded(virtualCabinetState)) {
                onMaximumRetriesExceed(dispatch, virtualCabinetState, alternateId, itemDetails, userDetails);
            }
        }

        //Can proceed with api login
        else {
            cabinetControlCenterService.loginToCabinet(alternateId, pin, cabinetId, customerId)
                .then((result) => {

                    if (result.succeeded) {

                        dispatch({ type: constants.MULTI_CUSTODY_WITNESS_LOGIN_SUCCESS, userId: alternateId }); // Per witness login success

                        // Per witness login success event
                        eventRuleService.queueEvent(CabinetEventNameConst.MultiCustodyWitnessAuthSuccess,
                            getMultiCustodyEventDetailsObject(virtualCabinetState.loggedInUserId, itemDetails && itemDetails.itemIndex, result.userId));

                        // All the witness successfully authenticated
                        if (virtualCabinetState.multiCustodyLoginSuccessCount != undefined && //multiCustodyLoginSuccessCount != undefined since this can be 0 
                            virtualCabinetState.multiCustodyLoginSuccessCount + 1 == virtualCabinetState.multiCustodyWitnessCount) {
                            let items = virtualCabinetState.items;

                            // Stop the WitnessTimeOutTimer
                            cabinetTimerService.unRegisterWitnessTimeoutTimer();

                            if (items) {
                                cabinetItemStatusService.setItemStatusByScreenMode(items, previousTouchScreenMode);

                                dispatch({
                                    type: constants.MULTI_CUSTODY_AUTHENTICATION_COMPLETE,
                                    userId: alternateId,
                                    previousTouchScreenMode: previousTouchScreenMode,
                                    items: items
                                });
                            }

                            // Auth complete event
                            setTimeout(() => {
                                queueMultiCustodyAuthCompleteEvent(dispatch, virtualCabinetState, itemDetails);
                            }, 1);// Use time out to avoid all the events to have the same time value.

                            setTimeout(() => {
                                queueMultiCustodyExitEvent(dispatch, virtualCabinetState, itemDetails);
                            }, 2)

                        }

                        if (result.isDuress) {
                            eventRuleService.queueEvent(CabinetEventNameConst.DuressLoggedIn, { userId: result.userId });
                        }
                    }

                    else {
                        eventRuleService.queueEvent(CabinetEventNameConst.MultiCustodyWitnessAuthFail,
                            getMultiCustodyEventDetailsObject(virtualCabinetState.loggedInUserId, itemDetails && itemDetails.itemIndex, userDetails && userDetails.id));

                        // On multi-custody login fail
                        dispatch({
                            type: constants.MULTI_CUSTODY_WITNESS_LOGIN_FAIL,
                            userId: alternateId,
                            error: localise(result.errorCode)
                        });

                        // If maximum retries exceeded
                        if (isMaximumRetriesExceeded(virtualCabinetState)) {
                            onMaximumRetriesExceed(dispatch, virtualCabinetState, alternateId, itemDetails, userDetails);
                        }
                    }
                });
        }
    }
}

function queueMultiCustodyAuthCompleteEvent(dispatch: any, virtualCabinetState: CabinetSimulationState, itemDetails?: VirtualCabinetItem) {
    eventRuleService.queueEvent(CabinetEventNameConst.MultiCustodyWitnessAuthProcessEnded,
        getMultiCustodyEventDetailsObject(virtualCabinetState.loggedInUserId, itemDetails && itemDetails.itemIndex));
}

function queueMultiCustodyExitEvent(dispatch: any, virtualCabinetState: CabinetSimulationState, itemDetails?: VirtualCabinetItem) {
    eventRuleService.queueEvent(CabinetEventNameConst.ExitMultiCustody,
        getMultiCustodyEventDetailsObject(virtualCabinetState.loggedInUserId, itemDetails && itemDetails.itemIndex));
}

function getMultiCustodyEventDetailsObject(loggedInUserId?: string, itemIndex?: Number, witnessId?: string) {
    return {
        userId: loggedInUserId,
        itemIndex: itemIndex,
        witnessId: witnessId
    }
}

function isMaximumRetriesExceeded(virtualCabinetState: CabinetSimulationState) {
    let maximumRetriesConfig = virtualCabinetState.cabinetConfigurations &&
        virtualCabinetState.cabinetConfigurations.find(config => config.key == 'WITNESS_MAXIMUM_RETRIES');
    let maximumRetries = maximumRetriesConfig && parseInt(maximumRetriesConfig.value);
    if (virtualCabinetState.multiCustodyFailedLoginAttempts != undefined && maximumRetries)
        return virtualCabinetState.multiCustodyFailedLoginAttempts + 1 == maximumRetries;
    else {
        return false;
    }
}

function onMaximumRetriesExceed(dispatch: any, virtualCabinetState: CabinetSimulationState, alternateId: string,
    itemDetails?: VirtualCabinetItem, userDetails?: VirtualCabinetUser) {

    cabinetTimerService.unRegisterWitnessTimeoutTimer();

    eventRuleService.queueEvent(CabinetEventNameConst.MultiCustodyFailedAttempt,
        getMultiCustodyEventDetailsObject(virtualCabinetState.loggedInUserId, itemDetails && itemDetails.itemIndex, userDetails && userDetails.id));

    setTimeout(() => {
        queueMultiCustodyExitEvent(dispatch, virtualCabinetState, itemDetails);
    }, 1)

    dispatch({
        type: constants.MULTI_CUSTODY_AUTHENTICATION_FAIL,
        error: localise("ERROR_MAXIMUM_RETRIES_EXCEEDED")
    });

    // Wait for 2 seconds in same screen and show the main menu
    setTimeout(function () { dispatch({ type: constants.SWITCH_TO_MAIN_MENU_ON_MULTI_CUSTODY_AUTH_FAIL }); }
        , 2000);
}

function onWitnessTimeOutExceed(item: VirtualCabinetItem) {
    let virtualCabinetState: CabinetSimulationState = store.getState().cabinetSimulation;

    return (dispatch: Dispatch<CabinetControlCenterActions>) => {

        var cabinetSimulation = store.getState().cabinetSimulation;
        var items: VirtualCabinetItem[] = cabinetSimulation.items;

        cabinetItemStatusService.setItemStatusByScreenMode(items, TouchScreenMode.MAIN_MENU);

        dispatch({ type: constants.WITNESS_USER_TIMEOUT, items: items });

        eventRuleService.queueEvent(CabinetEventNameConst.WitnessUserTimeout,
            getMultiCustodyEventDetailsObject(virtualCabinetState.loggedInUserId, item && item.itemIndex));

        setTimeout(() => {
            queueMultiCustodyExitEvent(dispatch, virtualCabinetState, item);
        }, 1)
    };
}

function unloadCabinet() {
    return { type: constants.UNLOAD_CABINET };
}

function loadCabinet(cabinetId: string, callbackFunction: () => any) {
    return (dispatch: Dispatch<CabinetControlCenterActions>) => {
        loadCabinetDetails(cabinetId, dispatch, callbackFunction);
    }
}

function triggerTouchScreenInteraction(logOutCallbackFunc: () => any, loggedInUserId?: string) {
    return (dispatch: Dispatch<CabinetControlCenterActions>) => {
        let canOpenDoor = cabinetPermissionService.canPermissionGrant("DEV_CAB_DOOR_OPEN", loggedInUserId);
        if (!canOpenDoor)
            cabinetTimerService.resetInactivityTimer(() => inactivityTimeOutCallback(() => logOutCallbackFunc()), dispatch)
    }
}

function loadEvents(filter: any, cabinetId: string, isLoadMore: boolean) {

    var promise = cabinetControlCenterService.getEvents({ ...filter, cabinetId: cabinetId });

    return (dispatch: Dispatch<CabinetControlCenterActions>) => {
        promise.then(pageResult => {
            let cabineEventList = pageResult.results;
            let continuationToken = pageResult.continuationToken;
            dispatch({
                type: constants.LOAD_CABINET_EVENTS, cabineEventList: cabineEventList,
                cabinetEventContinuationToken: continuationToken, isLoadMore: isLoadMore
            })
        });
    }
}

function loadItemEvents(filter: any, cabinetId: string, isLoadMore: boolean) {

    var promise = cabinetControlCenterService.getItemEvents({ ...filter, cabinetId: cabinetId });

    return (dispatch: Dispatch<CabinetControlCenterActions>) => {
        promise.then(pageResult => {
            let cabinetItemEventList = pageResult.results;
            let continuationToken = pageResult.continuationToken;
            dispatch({
                type: constants.LOAD_CABINET_ITEM_EVENTS, cabinetItemEventList: cabinetItemEventList,
                cabinetItemEventContinuationToken: continuationToken, isLoadMore: isLoadMore
            })
        });
    }
}

function loadTouchScreenEvents(filter: any, cabinetId: string, isLoadMore: boolean) {

    var promise = cabinetControlCenterService.getEvents({ ...filter, cabinetId: cabinetId });

    return (dispatch: Dispatch<CabinetControlCenterActions>) => {
        promise.then(pageResult => {
            let eventList = pageResult.results;
            let continuationToken = pageResult.continuationToken;
            dispatch({
                type: constants.LOAD_TOUCH_SCREEN_CABINET_EVENTS, touchScreenCabinetEventList: eventList,
                touchScreenCabinetEventContinuationToken: continuationToken, isLoadMore: isLoadMore
            })
        });
    }
}

function clearEventHistoryData() {
    return (dispatch: Dispatch<CabinetControlCenterActions>) => {
        dispatch({ type: constants.CLEAR_CABINET_EVENT_HISTORY });
    };
}

function clearItemEventHistoryData() {
    return (dispatch: Dispatch<CabinetControlCenterActions>) => {
        dispatch({ type: constants.CLEAR_CABINET_ITEM_EVENT_HISTORY });
    };
}

function clearTouchScreenEventHistoryData() {
    return (dispatch: Dispatch<CabinetControlCenterActions>) => {
        dispatch({ type: constants.CLEAR_TOUCH_SCREEN_CABINET_EVENT_HISTORY });
    };
}

function generateStorePropertiesFromTwin(cabinetTwin: CabinetTwinDto) {
    let cabinetStatus = cabinetTwin.reportedProperty && cabinetTwin.reportedProperty.cabinetStatus;
    let doorStatus: CabinetDoorStatus = CabinetDoorStatus.Open;
    let powerStatus: CabinetPowerStatus = CabinetPowerStatus.NoPower;
    let networkStatus: CabinetNetworkStatus = CabinetNetworkStatus.NoCommunication;
    let relayStatus: VirtualCabinetRelay[] = store.getState().cabinetSimulation && [...store.getState().cabinetSimulation.relays];
    let itemConfigurations = cabinetTwin.itemConfigurations;
    let cabinetConfigurations = cabinetTwin.cabinetConfigurations;
    let multiCustodyConfigOnCabinetLevel = cabinetConfigurations && cabinetConfigurations.find(cabinetConfig => cabinetConfig.key == "MULTI_CUSTODY");
    let returnWithoutWitnessConfigOnCabinetLevel = cabinetConfigurations && cabinetConfigurations.find(cabinetConfig => cabinetConfig.key == "RETURN_WITHOUT_WITNESS");

    let acPowerStatus = cabinetStatus && cabinetStatus.find(s => s.key == CabinetConst.STATE_AC_POWER);
    let batteryStatus = cabinetStatus && cabinetStatus.find(s => s.key == CabinetConst.STATE_BATTERY);
    let poeStatus = cabinetStatus && cabinetStatus.find(s => s.key == CabinetConst.STATE_POE);

    let acPowerStatusValue = acPowerStatus ? acPowerStatus.value : 0;
    let batteryStatusValue = batteryStatus ? batteryStatus.value : 0;
    let poeStatusValue = poeStatus ? poeStatus.value : 0;

    powerStatus = acPowerStatusValue == 0 && batteryStatusValue == 0 && poeStatusValue == 0 ? CabinetPowerStatus.NoPower :
        acPowerStatusValue == 1 && batteryStatusValue == 1 && poeStatusValue == 0 ? CabinetPowerStatus.AC_Battery :
            acPowerStatusValue == 0 && batteryStatusValue == 1 && poeStatusValue == 1 ? CabinetPowerStatus.Battery_POE :
                acPowerStatusValue == 1 ? CabinetPowerStatus.AC :
                    batteryStatusValue == 1 ? CabinetPowerStatus.Battery :
                        poeStatusValue == 1 ? CabinetPowerStatus.POE :
                            CabinetPowerStatus.NoPower;

    let lanStatus = cabinetStatus && cabinetStatus.find(s => s.key == CabinetConst.STATE_LAN);
    let wifiStatus = cabinetStatus && cabinetStatus.find(s => s.key == CabinetConst.STATE_WIFI);
    let lte4gStatus = cabinetStatus && cabinetStatus.find(s => s.key == CabinetConst.STATE_4G);

    let lanStatusValue = lanStatus ? lanStatus.value : 0;
    let wifiStatusValue = wifiStatus ? wifiStatus.value : 0;
    let lte4gStatusValue = lte4gStatus ? lte4gStatus.value : 0;

    networkStatus = lanStatusValue == 0 && wifiStatusValue == 0 && lte4gStatusValue == 0 ? CabinetNetworkStatus.NoCommunication :
        lanStatusValue == 1 ? CabinetNetworkStatus.LAN :
            wifiStatusValue == 1 ? CabinetNetworkStatus.WIFI :
                lte4gStatusValue == 1 ? CabinetNetworkStatus.LTE_4G :
                    CabinetNetworkStatus.NoCommunication;

    let cabinetItems: VirtualCabinetItem[] = store.getState().cabinetSimulation && [...store.getState().cabinetSimulation.items];

    if (itemConfigurations) {
        for (var i = 0; i < cabinetItems.length; i++) {
            let itemConfig = itemConfigurations.find(c => c.key == cabinetItems[i].itemIndex);

            if (itemConfig) {
                let itemNameConfig = itemConfig.value.find(c => c.key == "ITEM_NAME");

                if (itemNameConfig) {
                    cabinetItems[i].name = itemNameConfig.value;
                }
            }
        }
    }

    cabinetStatus && cabinetStatus.forEach((twin: CabinetTwinPropertyDto) => {
        switch (twin.key) {
            case CabinetConst.STATE_ITEM:
                cabinetItems.forEach((item: VirtualCabinetItem) => {
                    item.status = twin.value[item.itemIndex];
                    item.currentStatus = twin.value[item.itemIndex];
                    let itemProperty = itemConfigurations && itemConfigurations.find(c => c.key == item.itemIndex);
                    if (itemProperty && itemProperty.value) {
                        item.configurations = [];
                        let itemConfigs = itemProperty.value as CabinetItemConfiguration[];
                        itemConfigs.forEach(config => {
                            item.configurations && item.configurations.push({ index: config.index, key: config.key, value: config.value });
                        });
                        let itemGroupName = item.configurations.find(c => c.key == "ITEM_GROUP_NAME");
                        if (itemGroupName) {
                            item.itemGroupName = itemGroupName.value;
                            let maxItemCanTakenConfig = item.configurations.find(c => c.key == "MAX_KEY_TAKEN_FROM_GROUP");
                            if (maxItemCanTakenConfig && maxItemCanTakenConfig.value)
                                item.maxItemsCanTakenFromGroup = parseInt(maxItemCanTakenConfig.value);
                        }
                    }
                    let witnessCount = getMultiCustodyWitnessCount(item.itemIndex, itemConfigurations, multiCustodyConfigOnCabinetLevel);
                    item.multiCustodyWitnessCount = witnessCount ? parseInt(witnessCount) : undefined;
                    item.canReturnWithoutWitness = canReturnWithoutWitness(item.itemIndex, itemConfigurations, returnWithoutWitnessConfigOnCabinetLevel);
                    var itemStausObj = cabinetTwin.cabinetItemStatusList && cabinetTwin.cabinetItemStatusList.find(obj => {
                        return obj.itemIndex === item.itemIndex
                    });
                    item.lastAccessedByUserId = itemStausObj && itemStausObj.lastAccessedByUserId;
                    item.lastAccessedByUserName = itemStausObj && itemStausObj.lastAccessedByUserName;
                    item.lastAccessedOn = itemStausObj && itemStausObj.lastAccessedOn;
                });

                break;
            case CabinetConst.STATE_KEYPAD:
                break;
            case CabinetConst.STATE_DOOR:
                doorStatus = twin.value;
                break;
            case CabinetConst.STATE_RELAY:
                relayStatus.forEach((relay: VirtualCabinetRelay) => {
                    relay.status = twin.value[relay.relayIndex];
                });
                break;
        }
    });

    var storeUpdate = {
        cabinetStatus: cabinetStatus,
        doorStatus: doorStatus,
        powerStatus: powerStatus,
        networkStatus: networkStatus,
        items: cabinetItems,
        relayStatus: relayStatus
    }

    return storeUpdate;
}

/// This method is to get the witness count from configurations
function getMultiCustodyWitnessCount(itemIndex: number, itemConfigurations?: ItemConfiguration[], multiCustodyConfigOnCabinetLevel?: CabinetTwinPropertyDto) {
    let multiCustodyConfig = multiCustodyConfigOnCabinetLevel;
    let itemConfiguration = itemConfigurations && itemConfigurations.find(configItem => configItem.key == itemIndex);
    let multiCustodyOnItemLevel = itemConfiguration && itemConfiguration.value.find(itemConfig => itemConfig.key == "MULTI_CUSTODY");
    multiCustodyConfig = multiCustodyOnItemLevel || multiCustodyConfig;
    return multiCustodyConfig && multiCustodyConfig.value;
}

function canReturnWithoutWitness(itemIndex: number, itemConfigurations?: ItemConfiguration[], returnWithoutWitnessConfigOnCabinetLevel?: CabinetTwinPropertyDto) {
    let returnWithoutWitnessConfig = returnWithoutWitnessConfigOnCabinetLevel;
    let itemConfiguration = itemConfigurations && itemConfigurations.find(configItem => configItem.key == itemIndex);
    let returnWithoutWitnessItemConfig = itemConfiguration && itemConfiguration.value.find(itemConfig => itemConfig.key == "RETURN_WITHOUT_WITNESS");
    returnWithoutWitnessConfig = returnWithoutWitnessItemConfig || returnWithoutWitnessConfig;
    return (returnWithoutWitnessConfig && returnWithoutWitnessConfig.value.toUpperCase() == "YES") ? true : false;
}

function loadCabinetTwin(cabinetId: string, callbackFunction: () => any) {
    var cabinetSimulation: CabinetSimulationState = store.getState().cabinetSimulation;

    var promise = cabinetControlCenterService.getCabinetTwin(cabinetId, callbackFunction);

    return (dispatch: Dispatch<CabinetControlCenterActions>) => {
        promise.then((cabinetTwin: CabinetTwinDto) => {
            var storeStates = generateStorePropertiesFromTwin(cabinetTwin);

            let cabinetSimulationObj: any = {
                accessDefinitionSnapshot: cabinetTwin.cabinetAccessDefSnapshot,
                cabinetConfigurations: cabinetTwin.cabinetConfigurations,
                itemConfigurations: cabinetTwin.itemConfigurations,
                itemStatus: cabinetTwin.cabinetItemStatusList,
                cabinetEventActions: cabinetTwin.cabinetEventActions,
                cabinetStatus: storeStates.cabinetStatus,
                doorStatus: storeStates.doorStatus,
                powerStatus: storeStates.powerStatus,
                networkStatus: storeStates.networkStatus,
                items: storeStates.items,
                relayStatus: storeStates.relayStatus,
                alarms: cabinetTwin.alarms
            };

            if (cabinetTwin.cabinetConfigurations) {
                let nameConfig = cabinetTwin.cabinetConfigurations.find(c => c.key == "NAME");

                if (nameConfig) {
                    cabinetSimulationObj.cabinetName = nameConfig.value;
                }

                let groupConfig = cabinetTwin.cabinetConfigurations.find(c => c.key == "SITE");

                if (groupConfig) {
                    cabinetSimulationObj.siteName = groupConfig.value;
                }

                let timeOffsetConfig = cabinetTwin.timeOffsetInMinutes;

                if (timeOffsetConfig) {
                    cabinetSimulationObj.timeOffset = timeOffsetConfig;
                }

                let itemGroup = cabinetTwin.cabinetConfigurations.find((i: any) => i.key == "ITEM_GROUPS");
                if (itemGroup) {
                    var itemGroupObjects = JSON.parse(itemGroup.value);
                    itemGroup.value = itemGroupObjects.map((i: any) => i.itemGroupName).join();
                }

                let dataMask = cabinetTwin.cabinetConfigurations.find((i: any) => i.key == "DATAMASK");
                if (dataMask) {
                    dataMask.value = JSON.stringify(dataMask.value);
                }
            }

            dispatch({ type: constants.LOAD_CABINET_TWIN, cabTwinState: cabinetSimulationObj });
            cabinetControlCenterService.registerCabinetEventSync(callbackFunction);
            cabinetResourceService.setCabinetBuzzer(cabinetTwin.cabinetBuzzerBlobURL);
            if (storeStates.doorStatus == CabinetDoorStatus.Open && cabinetSimulation.simulationMode == SimulationMode.VirtualCabinet && !cabinetSimulation.userLoggedIn) {
                let items: VirtualCabinetItem[] = cabinetSimulationObj.items != undefined ? cabinetSimulationObj.items : [];
                var screenMode = TouchScreenMode.DISPLAY_NOTIFICATION;
                cabinetItemStatusService.setItemStatusByScreenMode(items, screenMode);
                dispatch({ type: constants.CHANGE_TOUCH_SCREEN, touchScreenMode: screenMode, items, undefined });
            }
        }).catch((error) => {
            console.log('Error loading device twin: ' + error);
        })
    }
}

function autoProvisionCabinet(provisioningKey: string, hardwareId: string, itemCount: number,
    items: VirtualCabinetItem[], callbackFunction: () => any) {
    var promise = cabinetService.provisionCabinet(provisioningKey, hardwareId, itemCount, items);

    return (dispatch: Dispatch<CabinetControlCenterActions>) => {
        promise.then((data: any) => {
            let provisionData: any = {
                linked: true,
                simulationMode: SimulationMode.VirtualCabinet,
            };
            dispatch({ type: constants.PROVISION_SUCCESS, provisionData });
            cabinetControlCenterService.setInitialCabinetStatus(data.cabinetId).then(() => {
                loadCabinetTwin(data.cabinetId, callbackFunction)(dispatch);
                alertActions.showSuccess("TEXT_VIRTUAL_CABINET_PROVISION_SUCCESS");
            });
        })
            .catch(() => {
                alertActions.showError("ERROR_VIRTUAL_CABINET_PROVISION");
            });
    }
}

function loginToCabinet(userId: string, pin: string, cabinetId: string, customerId: string, simulationMode: SimulationMode, callbackFunction: () => any) {
    var accessDefinitionSnapshot: VirtualCabinetAccessDefinitionSnapshot = store.getState().cabinetSimulation.accessDefinitionSnapshot;
    let canLogin = cabinetPermissionService.canLoginToVirtualCabinet(userId);

    return (dispatch: Dispatch<CabinetControlCenterActions>) => {
        if (!accessDefinitionSnapshot || !accessDefinitionSnapshot.users.some(u => u.userId == userId)) {
            dispatch({ type: constants.CABINET_LOGIN_ERROR, error: localise("ERROR_VIRTUAL_CABINET_LOGIN") });
        }
        else if (!canLogin) {
            dispatch({ type: constants.CABINET_LOGIN_ERROR, error: localise("ERROR_FORBIDDEN_ACCESS") });
        }
        else {
            cabinetControlCenterService.loginToCabinet(userId, pin, cabinetId, customerId)
                .then((result) => {
                    if (result.succeeded) {

                        let items = store.getState().cabinetSimulation.items;

                        cabinetItemStatusService.setItemStatusByScreenMode(items, TouchScreenMode.MAIN_MENU, result.userId);

                        dispatch({ type: constants.CABINET_LOGIN_SUCCESS, userId: result.userId, items });


                        eventRuleService.queueEvent(CabinetEventNameConst.UserLoginAttemptSuccess, { userId: result.userId });

                        var canOpenDoor = cabinetPermissionService.canPermissionGrant('DEV_CAB_DOOR_OPEN');

                        if (canOpenDoor) {
                            if (SimulationMode.VirtualCabinet == simulationMode) {
                                var doorTimeOutInSeconds = cabinetTimerService.getCabinetTimeOutInSecondsByKey('DOOR_TIMEOUT');
                                var maxMultiCustodyUserLogins = 0;
                                items.forEach((item: VirtualCabinetItem) => {
                                    if (item.multiCustodyWitnessCount && item.multiCustodyWitnessCount > maxMultiCustodyUserLogins) {
                                        maxMultiCustodyUserLogins = cabinetItemStatusService.isItemAccessible(item) ? item.multiCustodyWitnessCount : maxMultiCustodyUserLogins;
                                    }
                                });

                                var totalWitnessTimeInSeconds = 0;
                                if (maxMultiCustodyUserLogins > 0) {
                                    let perWitnessTimeout = cabinetTimerService.getCabinetTimeOutInSecondsByKey('WITNESS_USER_TIMEOUT');
                                    totalWitnessTimeInSeconds = perWitnessTimeout * maxMultiCustodyUserLogins;
                                }

                                doorTimeOutInSeconds += totalWitnessTimeInSeconds;

                                dispatch({ type: constants.CABINET_TIMER_STARTED, remainingTimeInSeconds: doorTimeOutInSeconds });


                                cabinetTimerService.registerDoorOpenTimer(() => doorTimeOutCallback(), doorTimeOutInSeconds, dispatch);
                                dispatch({ type: constants.RESET_CABINET_TIMER, cabinetTimerTimeInSeconds: doorTimeOutInSeconds });
                                cabinetTimerService.startCabinetTimer(() => cabinetTimerElapseCallback(), dispatch);

                                eventRuleService.queueEvent(CabinetEventNameConst.DoorUnlocked, { userId: result.userId });
                                setTimeout(() => {
                                    eventRuleService.queueEvent(CabinetEventNameConst.DoorOpened, { userId: result.userId });
                                }, 1)
                            }
                            dispatch({ type: constants.TOGGLE_DOOR, status: CabinetDoorStatus.Open });
                            dispatch({ type: constants.TOGGLE_DOOR_TIMER, status: DoorTimerStatus.Running });
                        }
                        else {
                            SimulationMode.VirtualCabinet == simulationMode && cabinetTimerService.registerInactivityTimer(() => inactivityTimeOutCallback(() => callbackFunction()), dispatch);
                        }

                        if (result.isDuress) {
                            SimulationMode.VirtualCabinet == simulationMode && eventRuleService.queueEvent(CabinetEventNameConst.DuressLoggedIn, { userId: result.userId });
                        }
                    }

                    else {
                        dispatch({ type: constants.CABINET_LOGIN_ERROR, error: localise(result.errorCode) })
                    }
                });
        }
    }
}

function createCabinetSimulationStateObj(cabinet: Cabinet) {
    let simulationMode;
    let hardwareId;
    let relayCount;
    if ((cabinet.provisioningStatus != CabinetProvisioningStatus.Deprovisioned) && !cabinet.isVirtualCabinet) {
        simulationMode = SimulationMode.Mirror;
        hardwareId = cabinet.hardwareId;
        relayCount = cabinet.relayCount;
    } else {
        simulationMode = SimulationMode.VirtualCabinet;
        hardwareId = (cabinet.provisioningStatus != CabinetProvisioningStatus.Deprovisioned) ? cabinet.hardwareId : eventRuleService.generateUniqueId();
        relayCount = (cabinet.provisioningStatus != CabinetProvisioningStatus.Deprovisioned) ? cabinet.relayCount : 2;
    }

    var items = cabinet.items.map(i => {
        return {
            itemIndex: i.number,
            hardwareId: ((cabinet.provisioningStatus != CabinetProvisioningStatus.Deprovisioned) ? i.hardwareId : "virtual-cabinet-item-" + i.number),
            status: CabinetItemStatus.Available, //This is just the default value which will get replaced from twin
            currentStatus: CabinetItemStatus.Available //This is just the default value which will get replaced from twin
        }
    });
    let relays: VirtualCabinetRelay[] = [];

    for (let i = 1; i <= relayCount; i++) {
        relays.push({ relayIndex: i, status: CabinetRelayStatus.Off });
    }

    let cabSimulation: CabinetSimulationState = {
        customerId: cabinet.customerId,
        cabinetId: cabinet.id,
        hardwareId: hardwareId,
        provisioningKey: cabinet.provisioningKey,
        itemCount: parseInt(cabinet.itemCount),
        provisioningStatus: cabinet.provisioningStatus,
        linked: (cabinet.provisioningStatus != CabinetProvisioningStatus.Deprovisioned),
        touchScreenMode: TouchScreenMode.LOGIN_SCREEN,
        simulationMode: simulationMode,
        items,
        relays
    };

    return cabSimulation;
}

function toggleDoor(status: CabinetDoorStatus, callbackFunction: () => any, userId?: string) {
    return (dispatch: Dispatch<CabinetControlCenterActions>) => {
        if (status == CabinetDoorStatus.Close) {

            var cabinetSimulate: CabinetSimulationState = store.getState().cabinetSimulation;
            
            if (SimulationMode.VirtualCabinet == cabinetSimulate.simulationMode) {
                cabinetTimerService.unRegisterDoorOpenTimer();
                cabinetTimerService.unRegisterWitnessTimeoutTimer();
                cabinetTimerService.unRegisterGlobalTimer();
                cabinetTimerService.endCabinetDisplayTimer();

                if (cabinetSimulate.doorTimerStatus == DoorTimerStatus.Running) {
                    eventRuleService.queueEvent(CabinetEventNameConst.DoorClosedWithinValidTime, { userId });
                }
                else {
                    eventRuleService.queueEvent(CabinetEventNameConst.DoorClosedAfterOpenedTooLong, { userId });
                }
                
                setTimeout(() => {
                    eventRuleService.queueEvent(CabinetEventNameConst.DoorLocked, { userId });
                }, 1);


                var items = cabinetSimulate.items;

                if (cabinetSimulate.isMultiCustodyLogin && SimulationMode.VirtualCabinet == cabinetSimulate.simulationMode) {
                    let multiCustodyItem = items && items.find(item => item.itemIndex == cabinetSimulate.multiCustodyLoginItemIndex);
                    setTimeout(() => {
                        queueMultiCustodyExitEvent(dispatch, cabinetSimulate, multiCustodyItem);
                    }, 2);
                }
            }

            if (cabinetSimulate.userLoggedIn) {
                SimulationMode.VirtualCabinet == cabinetSimulate.simulationMode && setTimeout(() => {
                    queueSignOutEvent(dispatch);
                    //SignOut the user
                    dispatch({ type: constants.SIGN_OUT });
                    cabinetPermissionService.clearPermissions();
                }, 3);
            }
            else {
                dispatch({ type: constants.CHANGE_TOUCH_SCREEN_WITH_OUT_ITEM_STATES, touchScreenMode: TouchScreenMode.LOGIN_SCREEN });
            }
            loadCabinetTwin(cabinetSimulate.cabinetId != undefined ? cabinetSimulate.cabinetId : '', callbackFunction);
        }

        dispatch({ type: constants.TOGGLE_DOOR, status });
        dispatch({ type: constants.TOGGLE_DOOR_TIMER, status: DoorTimerStatus.NotRunning });
    }
}

function cabinetTimerElapseCallback() {
    return (dispatch: Dispatch<CabinetControlCenterActions>) => {
        var timeInSeconds = store.getState().cabinetSimulation.cabinetTimerTimeInSeconds;
        if (timeInSeconds > 0) {
            dispatch({ type: constants.CABINET_TIMER_ELAPSED, remainingTimeInSeconds: (timeInSeconds - 1) });
        }
        else {
            cabinetTimerService.endCabinetDisplayTimer();
        }
    };
}

function doorTimeOutCallback() {
    return (dispatch: Dispatch<CabinetControlCenterActions>) => {
        cabinetTimerService.unRegisterWitnessTimeoutTimer();
        cabinetTimerService.unRegisterGlobalTimer();

        dispatch({ type: constants.TOGGLE_DOOR_TIMER, status: DoorTimerStatus.Expired });

        var cabinetSimulationObj: CabinetSimulationState = store.getState().cabinetSimulation

        //queue event "DOOR_OPEN_TOO_LONG"
        eventRuleService.queueEvent(CabinetEventNameConst.DoorOpenTooLong, { userId: cabinetSimulationObj.loggedInUserId });

        var cabinetSimulate: CabinetSimulationState = store.getState().cabinetSimulation;

        var items = cabinetSimulate.items;

        if (cabinetSimulate.isMultiCustodyLogin) {
            let multiCustodyItem = items && items.find(item => item.itemIndex == cabinetSimulate.multiCustodyLoginItemIndex);
            setTimeout(() => {
                queueMultiCustodyExitEvent(dispatch, cabinetSimulate, multiCustodyItem);
            }, 1)
        }

        if (cabinetSimulate.userLoggedIn) {
            setTimeout(() => {
                queueSignOutEvent(dispatch);
                //SignOut the user
                dispatch({ type: constants.SIGN_OUT });
                resetKeyPanelOnUserSignOut(cabinetSimulationObj, dispatch);
                cabinetTimerService.endCabinetDisplayTimer();
                cabinetPermissionService.clearPermissions();
            }, 2)

        }
    };
}

function inactivityTimeOutCallback(redirectBackFunction: () => any) {
    return (dispatch: Dispatch<CabinetControlCenterActions>) => {
        var cabinetSimulation: CabinetSimulationState = store.getState().cabinetSimulation;
        //queue event "NO_ACTIVITY"
        eventRuleService.queueEvent(CabinetEventNameConst.NoActivity, { userId: cabinetSimulation.loggedInUserId });

        queueSignOutEvent(dispatch);

        //SignOut the user
        dispatch({ type: constants.SIGN_OUT });
        if (cabinetSimulation.cabinetId != undefined && cabinetSimulation.doorStatus == CabinetDoorStatus.Close) {
            loadCabinetDetails(cabinetSimulation.cabinetId, dispatch, () => redirectBackFunction());
        }
        cabinetTimerService.unRegisterInactivityTimer();
        cabinetPermissionService.clearPermissions();
    };
}

function togglePower(status: CabinetPowerStatus, userId?: string) {
    return (dispatch: Dispatch<CabinetControlCenterActions>) => {
        let virtualCabinetState: CabinetSimulationState = store.getState().cabinetSimulation;
        let previousPowerState = virtualCabinetState.powerStatus || 0;

        var newStatus = status;
        let eventNameList = [];

        switch (previousPowerState) {
            case (CabinetPowerStatus.NoPower): {
                newStatus = status;

                eventNameList.push(status == CabinetPowerStatus.AC ? CabinetEventNameConst.PowerAcOn :
                    status == CabinetPowerStatus.Battery ? CabinetEventNameConst.PowerBatteryConnected : CabinetEventNameConst.PowerPoeOn);
                break;
            }

            case (CabinetPowerStatus.AC): {
                newStatus = status == CabinetPowerStatus.Battery ? CabinetPowerStatus.AC_Battery :
                    status == CabinetPowerStatus.POE ? CabinetPowerStatus.POE : CabinetPowerStatus.NoPower;

                switch (status) {
                    case (CabinetPowerStatus.Battery): {
                        eventNameList.push(CabinetEventNameConst.PowerBatteryConnected);
                        break;
                    }
                    case (CabinetPowerStatus.POE): {
                        eventNameList.push(CabinetEventNameConst.PowerAcOff);
                        eventNameList.push(CabinetEventNameConst.PowerPoeOn);
                        break;
                    }
                    default: {
                        eventNameList.push(CabinetEventNameConst.PowerAcOff);
                        break;
                    }
                }
                break;
            }

            case (CabinetPowerStatus.Battery): {
                newStatus = status == CabinetPowerStatus.AC ? CabinetPowerStatus.AC_Battery :
                    status == CabinetPowerStatus.POE ? CabinetPowerStatus.Battery_POE : CabinetPowerStatus.NoPower;

                switch (status) {
                    case (CabinetPowerStatus.AC): {
                        eventNameList.push(CabinetEventNameConst.PowerAcOn);
                        break;
                    }
                    case (CabinetPowerStatus.POE): {
                        eventNameList.push(CabinetEventNameConst.PowerPoeOn);
                        break;
                    }
                    default: {
                        eventNameList.push(CabinetEventNameConst.PowerBatteryDisconnected);
                        break;
                    }
                }
                break;
            }

            case (CabinetPowerStatus.POE): {
                newStatus = status == CabinetPowerStatus.AC ? CabinetPowerStatus.AC :
                    status == CabinetPowerStatus.Battery ? CabinetPowerStatus.Battery_POE : CabinetPowerStatus.NoPower;

                switch (status) {
                    case (CabinetPowerStatus.AC): {
                        eventNameList.push(CabinetEventNameConst.PowerPoeOff);
                        eventNameList.push(CabinetEventNameConst.PowerAcOn);
                        break;
                    }
                    case (CabinetPowerStatus.Battery): {
                        eventNameList.push(CabinetEventNameConst.PowerBatteryConnected);
                        break;
                    }
                    default: {
                        eventNameList.push(CabinetEventNameConst.PowerPoeOff);
                        break;
                    }
                }
                break;
            }

            case (CabinetPowerStatus.AC_Battery): {
                newStatus = status == CabinetPowerStatus.POE ? CabinetPowerStatus.Battery_POE :
                    status == CabinetPowerStatus.AC ? CabinetPowerStatus.Battery :
                        status == CabinetPowerStatus.Battery ? CabinetPowerStatus.AC : CabinetPowerStatus.NoPower;

                switch (status) {
                    case (CabinetPowerStatus.POE): {
                        eventNameList.push(CabinetEventNameConst.PowerAcOff);
                        eventNameList.push(CabinetEventNameConst.PowerPoeOn);
                        break;
                    }
                    case (CabinetPowerStatus.AC): {
                        eventNameList.push(CabinetEventNameConst.PowerAcOff);
                        break;
                    }
                    case (CabinetPowerStatus.Battery): {
                        eventNameList.push(CabinetEventNameConst.PowerBatteryDisconnected);
                        break;
                    }
                    default: {
                        eventNameList.push(CabinetEventNameConst.PowerAcOff);
                        eventNameList.push(CabinetEventNameConst.PowerBatteryDisconnected);
                        break;
                    }
                }
                break;
            }

            case (CabinetPowerStatus.Battery_POE): {
                newStatus = status == CabinetPowerStatus.AC ? CabinetPowerStatus.AC_Battery :
                    status == CabinetPowerStatus.Battery ? CabinetPowerStatus.POE :
                        status == CabinetPowerStatus.POE ? CabinetPowerStatus.Battery : CabinetPowerStatus.NoPower;

                switch (status) {
                    case (CabinetPowerStatus.AC): {
                        eventNameList.push(CabinetEventNameConst.PowerPoeOff);
                        eventNameList.push(CabinetEventNameConst.PowerAcOn);
                        break;
                    }
                    case (CabinetPowerStatus.Battery): {
                        eventNameList.push(CabinetEventNameConst.PowerBatteryDisconnected);
                        break;
                    }
                    case (CabinetPowerStatus.POE): {
                        eventNameList.push(CabinetEventNameConst.PowerPoeOff);
                        break;
                    }
                    default: {
                        eventNameList.push(CabinetEventNameConst.PowerBatteryDisconnected);
                        eventNameList.push(CabinetEventNameConst.PowerPoeOff);
                        break;
                    }
                }
                break;
            }
        }

        dispatch({ type: constants.TOGGLE_POWER, status: newStatus });

        eventNameList.forEach(eventName => {
            eventRuleService.queueEvent(eventName, { userId });
        });
    }
}

function toggleNetwork(status: CabinetNetworkStatus, userId?: string) {
    return (dispatch: Dispatch<CabinetControlCenterActions>) => {

        let virtualCabinetState: CabinetSimulationState = store.getState().cabinetSimulation;
        let previousNetworkState = virtualCabinetState.networkStatus || 0;

        let newStatus = status;
        let eventNameList: string[] = [];

        switch (previousNetworkState) {
            case (status): {
                newStatus = CabinetNetworkStatus.NoCommunication;
                let disConnectedEventName = getNetworkDisconnectedEvent(status);
                disConnectedEventName && eventNameList.push(disConnectedEventName);
                break;
            }
            case (CabinetNetworkStatus.NoCommunication): {
                let connectedEventName = getNetworkConnectedEvent(status);
                connectedEventName && eventNameList.push(connectedEventName);
                break;
            }
            default: {
                let disConnectedEventName = getNetworkDisconnectedEvent(previousNetworkState);
                disConnectedEventName && eventNameList.push(disConnectedEventName);

                if (status != CabinetNetworkStatus.NoCommunication) {
                    let connectedEventName = getNetworkConnectedEvent(status);
                    connectedEventName && eventNameList.push(connectedEventName);
                }
                break;
            }
        }

        dispatch({ type: constants.TOGGLE_NETWORK, status: newStatus });

        eventNameList.forEach(eventName => {
            eventRuleService.queueEvent(eventName, { userId });
        });
    }
}

function getNetworkConnectedEvent(status: CabinetNetworkStatus) {
    switch (status) {
        case (CabinetNetworkStatus.LAN): {
            return CabinetEventNameConst.NetworkLanConnected;
        }
        case (CabinetNetworkStatus.WIFI): {
            return CabinetEventNameConst.NetworkWifiConnected;
        }
        case (CabinetNetworkStatus.LTE_4G): {
            return CabinetEventNameConst.Network4GConnected;
        }
        default: {
            return;
        }
    }
}

function getNetworkDisconnectedEvent(status: CabinetNetworkStatus) {
    switch (status) {
        case (CabinetNetworkStatus.LAN): {
            return CabinetEventNameConst.NetworkLanDisconnected;
        }
        case (CabinetNetworkStatus.WIFI): {
            return CabinetEventNameConst.NetworkWifiDisconnected;
        }
        case (CabinetNetworkStatus.LTE_4G): {
            return CabinetEventNameConst.Network4GDisconnected;
        }
        default: {
            return;
        }
    }
}

function switchTouchScreenMode(screenMode: TouchScreenMode, callbackFunction: () => any, item?: VirtualCabinetItem) {
    var cabinetSimulation = store.getState().cabinetSimulation;
    SimulationMode.VirtualCabinet == cabinetSimulation.simulationMode && cabinetTimerService.unRegisterWitnessTimeoutTimer();// Stop if there is any currently active witness timeout
    return (dispatch: Dispatch<CabinetControlCenterActions>) => {
        //Re-calculate the item 'Status'

        var items: VirtualCabinetItem[] = cabinetSimulation.items;

        if (cabinetSimulation.isMultiCustodyLogin) {
            let multiCustodyItem = items.find(item => item.itemIndex == cabinetSimulation.multiCustodyLoginItemIndex);
            queueMultiCustodyExitEvent(dispatch, cabinetSimulation, multiCustodyItem);
        }

        //Register the global timer only once in the following screen modes
        if (SimulationMode.VirtualCabinet == cabinetSimulation.simulationMode && (screenMode == TouchScreenMode.EVENT_HISTORY
            || screenMode == TouchScreenMode.ITEM_HISTORY
            || screenMode == TouchScreenMode.ALARM_MANAGEMENT
            || screenMode == TouchScreenMode.MAINTENANCE
            || screenMode == TouchScreenMode.ITEM_HISTORY_ITEM || screenMode == TouchScreenMode.ABOUT_CABINET)
            && !cabinetSimulation.hasGlobalTimerTriggered) {
            dispatch({ type: constants.SET_GLOBAL_TIMER_STATE });
            var gloabalTimeOut = cabinetTimerService.getCabinetTimeOutInSecondsByKey('GLOBAL_SESSION_TIMEOUT');
            cabinetTimerService.registerGlobalTimer(() => doorTimeOutCallback(), gloabalTimeOut, dispatch)
            cabinetTimerService.unRegisterDoorOpenTimer();
            dispatch({ type: constants.RESET_CABINET_TIMER, cabinetTimerTimeInSeconds: gloabalTimeOut });
            cabinetTimerService.startCabinetTimer(() => cabinetTimerElapseCallback(), dispatch);
        }

        cabinetItemStatusService.setItemStatusByScreenMode(items, screenMode);

        let canOpenDoor = cabinetPermissionService.canPermissionGrant("DEV_CAB_DOOR_OPEN", cabinetSimulation.loggedInUserId);
        if (!canOpenDoor)
            SimulationMode.VirtualCabinet == cabinetSimulation.simulationMode && cabinetTimerService.resetInactivityTimer(() => inactivityTimeOutCallback(() => callbackFunction()), dispatch);

        dispatch({ type: constants.CHANGE_TOUCH_SCREEN, touchScreenMode: screenMode, items, item });
    }
}

function resetKeyPanelOnUserSignOut(cabinetSimulation: CabinetSimulationState, dispatch: any) {
    let items: VirtualCabinetItem[] = cabinetSimulation.items != undefined ? cabinetSimulation.items : [];
    let screenMode = (cabinetSimulation.doorStatus == CabinetDoorStatus.Close || cabinetSimulation.simulationMode == SimulationMode.Mirror) ? TouchScreenMode.LOGIN_SCREEN : TouchScreenMode.DISPLAY_NOTIFICATION;
    cabinetItemStatusService.setItemStatusByScreenMode(items, screenMode);
    dispatch({ type: constants.CHANGE_TOUCH_SCREEN, touchScreenMode: screenMode, items, undefined });
}

function signOut(callbackFunction: () => any, cabinetId?: string) {
    return (dispatch: Dispatch<CabinetControlCenterActions>) => {
        var cabinetSimulation = store.getState().cabinetSimulation;

        SimulationMode.VirtualCabinet == cabinetSimulation.simulationMode && queueSignOutEvent(dispatch);

        dispatch({ type: constants.SIGN_OUT });
        resetKeyPanelOnUserSignOut(cabinetSimulation, dispatch);

        if (SimulationMode.VirtualCabinet == cabinetSimulation.simulationMode) {
            if (cabinetSimulation.doorStatus == CabinetDoorStatus.Close) {
                cabinetTimerService.unRegisterDoorOpenTimer();
            }
            cabinetTimerService.unRegisterInactivityTimer();
            cabinetTimerService.unRegisterGlobalTimer();
        }
        cabinetPermissionService.clearPermissions();
        if (cabinetSimulation.doorStatus == CabinetDoorStatus.Close) {
            loadCabinetTwin(cabinetId != undefined ? cabinetId : '', callbackFunction);
        }
    }
}

function queueSignOutEvent(dispatch: any) {
    var cabinetSimulation = store.getState().cabinetSimulation;
    var userId = cabinetSimulation.loggedInUserId;

    eventRuleService.queueEvent(CabinetEventNameConst.UserSignedOut, { userId });
}

function loadCabinetDetails(cabinetId: string, dispatch: any, callbackFunction: () => any) {
    var promise = cabinetService.getCabinet(cabinetId);
    promise.then(cabinet => {
        let cabSimulationState = createCabinetSimulationStateObj(cabinet);
        dispatch({ type: constants.LOAD_CABINET, cabSimulationState });
        (cabinet.provisioningStatus != CabinetProvisioningStatus.Deprovisioned) && loadCabinetTwin(cabinetId, callbackFunction)(dispatch);
    });
}

function toggleItem(item: VirtualCabinetItem, status: CabinetItemStatus, lastAccessedByUserId?: string, userDisplayName?: string) {
    return (dispatch: Dispatch<CabinetControlCenterActions>) => {

        dispatch({ type: constants.TOGGLE_ITEM, action: { itemIndex: item.itemIndex, status, lastAccessedByUserId, lastAccessedByUserName: userDisplayName } });
        var cabinetSimulationObj = store.getState().cabinetSimulation;
        var items: VirtualCabinetItem[] = cabinetSimulationObj.items;

        cabinetItemStatusService.setItemStatusByScreenMode(items,
            cabinetSimulationObj.isMultiCustodyLogin == true ? cabinetSimulationObj.previousTouchScreenMode : cabinetSimulationObj.touchScreenMode);

        dispatch({ type: constants.TOGGLE_ITEM_SUCCESS, items });

        let isMultiCustodyItem = (item.multiCustodyWitnessCount && item.multiCustodyWitnessCount != 0) ? true : false;
        let eventName: string;
        if (status == CabinetItemStatus.Available) {
            //TODO introduce a method to check item status
            cabinetControlCenterService.isItemOverdue(cabinetSimulationObj.cabinetId, item.itemIndex)
                .then((result) => {
                    eventName = getItemReturnEventName(cabinetSimulationObj.touchScreenMode, isMultiCustodyItem, result);
                })
                .catch(() => {
                    eventName = getItemReturnEventName(cabinetSimulationObj.touchScreenMode, isMultiCustodyItem, false);
                })
                .finally(() => {
                    eventRuleService.queueEvent(eventName, { userId: lastAccessedByUserId, itemIndex: item.itemIndex });
                });
        }
        else {
            eventName = isMultiCustodyItem ? CabinetEventNameConst.MultiCustodyItemRetreived : CabinetEventNameConst.ItemRetrieved;
            eventRuleService.queueEvent(eventName, { userId: lastAccessedByUserId, itemIndex: item.itemIndex });
        }
    }
}

function getItemReturnEventName(touchScreenMode: TouchScreenMode, isMultiCustodyItem: boolean, isOverdue: boolean) {
    var eventName;
    if (touchScreenMode == TouchScreenMode.RETURN_OVERRIDE) {
        eventName = isMultiCustodyItem ?
            isOverdue ? CabinetEventNameConst.MulticustodyItemReturnOverrideAfterValidTime : CabinetEventNameConst.MulticustodyItemReturnOverrideWithinValidTime
            : isOverdue ? CabinetEventNameConst.ItemReturnOverrideAfterValidTime : CabinetEventNameConst.ItemReturnOverrideWithinValidTime;
    }
    else {
        eventName = isMultiCustodyItem ?
            isOverdue ? CabinetEventNameConst.MultiCustodyItemReturnAfterValidTime : CabinetEventNameConst.MultiCustodyItemReturnWithinValidTime
            : isOverdue ? CabinetEventNameConst.ItemReturnedAfterValidTime : CabinetEventNameConst.ItemReturnedWithinValidTime;
    }
    return eventName;
}

function blinkItem(index: number) {
    return (dispatch: Dispatch<CabinetControlCenterActions>) => {
        dispatch({ type: constants.BLINK_ITEM, itemIndex: index });
    }
}


// WEBPACK FOOTER //
// ./src/modules/cabinet/actions/cabinet-control-center.actions.ts