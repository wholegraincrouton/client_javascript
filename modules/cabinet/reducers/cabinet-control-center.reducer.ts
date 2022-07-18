import { CabinetSimulationState, CabinetEvent, CabinetItemEvent } from "../types/store";
import { CabinetControlCenterActions } from "../actions/cabinet-control-center.actions";
import * as constants from "../constants/cabinet-control-center.constants";
import { TouchScreenMode, CabinetTwinPropertyDto, CabinetConst, CabinetNetworkStatus, CabinetPowerStatus } from "../types/dto";

function updateCabinetState(key: string, status: any, CabinetSimulationState?: CabinetTwinPropertyDto[]) {
    let cabinetStatusForStatusList = CabinetSimulationState;
    var speakerStatus = cabinetStatusForStatusList && cabinetStatusForStatusList.find(cs => cs.key == key)
    if (speakerStatus) {
        speakerStatus.value = status;
    }
}

export function cabinetSimulation(state: CabinetSimulationState = {}, action: CabinetControlCenterActions) {
    switch (action.type) {
        case constants.UNLOAD_CABINET: {
            return {};
        }
        case constants.LOAD_CABINET: {
            return { ...action.cabSimulationState, lowPriorityEvents: state.lowPriorityEvents, highPriorityEvents: state.highPriorityEvents }
        }
        case constants.LOAD_CABINET_EVENTS: {
            let events: CabinetEvent[] = []
            if (action.isLoadMore) {
                events = state.eventHistory != undefined ? state.eventHistory.concat(action.cabineEventList) : action.cabineEventList;
            }
            else {
                events = action.cabineEventList
            }
            return { ...state, eventHistory: events, cabinetEventContinuationToken: action.cabinetEventContinuationToken };
        }
        case constants.LOAD_CABINET_ITEM_EVENTS: {
            let events: CabinetItemEvent[] = []
            if (action.isLoadMore) {
                events = state.itemHistory != undefined ? state.itemHistory.concat(action.cabinetItemEventList) : action.cabinetItemEventList;
            }
            else {
                events = action.cabinetItemEventList
            }
            return { ...state, itemHistory: events, cabinetItemEventContinuationToken: action.cabinetItemEventContinuationToken };
        }
        case constants.LOAD_TOUCH_SCREEN_CABINET_EVENTS: {
            let events: CabinetEvent[] = []
            if (action.isLoadMore) {
                events = state.touchScreenEventHistory != undefined ?
                    state.touchScreenEventHistory.concat(action.touchScreenCabinetEventList) : action.touchScreenCabinetEventList;
            }
            else {
                events = action.touchScreenCabinetEventList
            }
            return { ...state, touchScreenEventHistory: events, touchScreenCabinetEventContinuationToken: action.touchScreenCabinetEventContinuationToken };
        }
        case constants.CLEAR_CABINET_EVENT_HISTORY: {
            return { ...state, eventHistory: undefined, cabinetEventContinuationToken: undefined };
        }
        case constants.CLEAR_CABINET_ITEM_EVENT_HISTORY: {
            return { ...state, itemHistory: undefined, cabinetItemEventContinuationToken: undefined };
        }
        case constants.CLEAR_TOUCH_SCREEN_CABINET_EVENT_HISTORY: {
            return { ...state, touchScreenEventHistory: undefined, touchScreenCabinetEventContinuationToken: undefined };
        }
        case constants.CABINET_TIMER_ELAPSED: {
            return { ...state, cabinetTimerTimeInSeconds: action.remainingTimeInSeconds }
        }
        case constants.LOAD_CABINET_TWIN: {
            return { ...state, ...action.cabTwinState }
        }
        case constants.PROVISION_SUCCESS: {
            return { ...state, ...action.provisionData }
        }
        case constants.TOGGLE_DOOR: {
            return { ...state, doorStatus: action.status }
        }
        case constants.TOGGLE_DOOR_TIMER: {
            return { ...state, doorTimerStatus: action.status }
        }
        case constants.TOGGLE_POWER: {
            let cabinetStatusForStatusList = state.cabinetStatus;
            switch (action.status) {
                case CabinetPowerStatus.AC:
                    updateCabinetState(CabinetConst.STATE_AC_POWER, 1, cabinetStatusForStatusList);
                    updateCabinetState(CabinetConst.STATE_BATTERY, 0, cabinetStatusForStatusList);
                    updateCabinetState(CabinetConst.STATE_POE, 0, cabinetStatusForStatusList);
                    break;
                case CabinetPowerStatus.Battery:
                    updateCabinetState(CabinetConst.STATE_BATTERY, 1, cabinetStatusForStatusList);
                    updateCabinetState(CabinetConst.STATE_AC_POWER, 0, cabinetStatusForStatusList);
                    updateCabinetState(CabinetConst.STATE_POE, 0, cabinetStatusForStatusList);
                    break;
                case CabinetPowerStatus.NoPower:
                    updateCabinetState(CabinetConst.STATE_POE, 0, cabinetStatusForStatusList);
                    updateCabinetState(CabinetConst.STATE_BATTERY, 0, cabinetStatusForStatusList);
                    updateCabinetState(CabinetConst.STATE_AC_POWER, 0, cabinetStatusForStatusList);
                    break;
                case CabinetPowerStatus.POE:
                    updateCabinetState(CabinetConst.STATE_POE, 1, cabinetStatusForStatusList);
                    updateCabinetState(CabinetConst.STATE_BATTERY, 0, cabinetStatusForStatusList);
                    updateCabinetState(CabinetConst.STATE_AC_POWER, 0, cabinetStatusForStatusList);
                    break;
                case CabinetPowerStatus.AC_Battery:
                    updateCabinetState(CabinetConst.STATE_BATTERY, 1, cabinetStatusForStatusList);
                    updateCabinetState(CabinetConst.STATE_AC_POWER, 1, cabinetStatusForStatusList);
                    updateCabinetState(CabinetConst.STATE_POE, 0, cabinetStatusForStatusList);
                    break;
                case CabinetPowerStatus.Battery_POE:
                    updateCabinetState(CabinetConst.STATE_BATTERY, 1, cabinetStatusForStatusList);
                    updateCabinetState(CabinetConst.STATE_AC_POWER, 0, cabinetStatusForStatusList);
                    updateCabinetState(CabinetConst.STATE_POE, 1, cabinetStatusForStatusList);
                    break;
            }
            return { ...state, powerStatus: action.status, cabinetStatus: cabinetStatusForStatusList }
        }
        case constants.TOGGLE_NETWORK: {
            let cabinetStatusForStatusList = state.cabinetStatus;
            let key = '';
            switch (action.status) {
                case CabinetNetworkStatus.LAN:
                    updateCabinetState(CabinetConst.STATE_LAN, 1, cabinetStatusForStatusList);
                    updateCabinetState(CabinetConst.STATE_4G, 0, cabinetStatusForStatusList);
                    updateCabinetState(CabinetConst.STATE_WIFI, 0, cabinetStatusForStatusList);
                    break;
                case CabinetNetworkStatus.WIFI:
                    updateCabinetState(CabinetConst.STATE_LAN, 0, cabinetStatusForStatusList);
                    updateCabinetState(CabinetConst.STATE_4G, 0, cabinetStatusForStatusList);
                    updateCabinetState(CabinetConst.STATE_WIFI, 1, cabinetStatusForStatusList);
                    break;
                case CabinetNetworkStatus.NoCommunication:
                    updateCabinetState(CabinetConst.STATE_LAN, 0, cabinetStatusForStatusList);
                    updateCabinetState(CabinetConst.STATE_4G, 0, cabinetStatusForStatusList);
                    updateCabinetState(CabinetConst.STATE_WIFI, 0, cabinetStatusForStatusList);
                    break;
                case CabinetNetworkStatus.LTE_4G:
                    updateCabinetState(CabinetConst.STATE_LAN, 0, cabinetStatusForStatusList);
                    updateCabinetState(CabinetConst.STATE_4G, 1, cabinetStatusForStatusList);
                    updateCabinetState(CabinetConst.STATE_WIFI, 0, cabinetStatusForStatusList);
                    break;
            }

            updateCabinetState(key, action.status, cabinetStatusForStatusList);
            return { ...state, networkStatus: action.status, cabinetStatus: cabinetStatusForStatusList }
        }
        case constants.TOGGLE_ITEM: {
            let items = state.items && [...state.items];
            let index = items && items.findIndex(i => i.itemIndex == action.action.itemIndex);
            if (index != undefined && items) {
                items[index].status = action.action.status;
                items[index].currentStatus = action.action.status;
                items[index].lastAccessedByUserId = action.action.lastAccessedByUserId;
                items[index].lastAccessedByUserName = action.action.lastAccessedByUserName;
                items[index].lastAccessedOn = new Date();
            }
            return { ...state, items }
        }
        case constants.TOGGLE_ITEM_SUCCESS: {
            return { ...state, items: action.items }
        }
        case constants.CABINET_TIMER_STARTED: {
            return { ...state, cabinetTimerTimeInSeconds: action.remainingTimeInSeconds }
        }
        case constants.TOGGLE_RELAY: {
            let relays = state.relays && [...state.relays];
            if (relays) {
                relays[action.action.index - 1].status = action.action.status;
            }
            return { ...state, relays }
        }
        case constants.CABINET_LOGIN_SUCCESS: {
            let users = state.accessDefinitionSnapshot && state.accessDefinitionSnapshot.users;
            let loggedInUser = users && users.find(u => u.id == action.userId);

            return {
                ...state, items: action.items, touchScreenMode: TouchScreenMode.MAIN_MENU, userLoggedIn: true,
                loggedInUserId: action.userId, loggedInUserName: loggedInUser && loggedInUser.name,
                loggedInUserAlternateId: loggedInUser && loggedInUser.userId
            };
        }
        case constants.CHANGE_TOUCH_SCREEN_WITH_OUT_ITEM_STATES: {
            return { ...state, touchScreenMode: action.touchScreenMode }
        }
        case constants.CABINET_LOGIN_ERROR: {
            return { ...state, userLoggedIn: false, loggedInUser: undefined, loginError: action.error }
        }
        case constants.QUEUE_EVENT: {
            if (action.isHighPriority) {
                let highPriorityEvents = state.highPriorityEvents ? [...state.highPriorityEvents, action.event] : [action.event];
                return { ...state, highPriorityEvents: highPriorityEvents }
            }
            else {
                let lowPriorityEvents = state.lowPriorityEvents ? [...state.lowPriorityEvents, action.event] : [action.event];
                return { ...state, lowPriorityEvents: lowPriorityEvents }
            }
        }
        case constants.DEQUEUE_HIGH_PRIORITY_EVENTS: {
            let lastProcessedHighPriorityIndex = state.highPriorityEvents && state.highPriorityEvents.findIndex(e => e.id == action.lastProcessedEventId);
            if (state.highPriorityEvents && lastProcessedHighPriorityIndex != undefined && lastProcessedHighPriorityIndex >= 0) {
                let unprocessedEvents = state.highPriorityEvents.slice(lastProcessedHighPriorityIndex + 1);
                return { ...state, highPriorityEvents: unprocessedEvents };
            }
        }
        case constants.DEQUEUE_LOW_PRIORITY_EVENTS: {
            let lastProcessedLowPriorityIndex = state.lowPriorityEvents && state.lowPriorityEvents.findIndex(e => e.id == action.lastProcessedEventId);
            if (state.lowPriorityEvents && lastProcessedLowPriorityIndex != undefined && lastProcessedLowPriorityIndex >= 0) {
                let unprocessedEvents = state.lowPriorityEvents.slice(lastProcessedLowPriorityIndex + 1);
                return { ...state, lowPriorityEvents: unprocessedEvents };
            }
        }
        case constants.START_HIGH_PRIORITY_EVENT_PUBLISHING: {
            return { ...state, highPriorityEventPublishingInProgress: true }
        }
        case constants.START_LOW_PRIORITY_EVENT_PUBLISHING: {
            return { ...state, lowPriorityEventPublishingInProgress: true }
        }
        case constants.STOP_HIGH_PRIORITY_EVENT_PUBLISHING: {
            return { ...state, highPriorityEventPublishingInProgress: false }
        }
        case constants.STOP_LOW_PRIORITY_EVENT_PUBLISHING: {
            return { ...state, lowPriorityEventPublishingInProgress: false }
        }
        case constants.SET_GLOBAL_TIMER_STATE: {
            return { ...state, hasGlobalTimerTriggered: true }
        }
        case constants.RESET_CABINET_TIMER: {
            return { ...state, cabinetTimerTimeInSeconds: action.cabinetTimerTimeInSeconds }
        }
        case constants.CHANGE_TOUCH_SCREEN: {
            return {
                ...state, touchScreenMode: action.touchScreenMode, items: action.items, item: action.item,
                isMultiCustodyLogin: false, multiCustodyLoginItemIndex: undefined, multiCustodyWitnessCount: undefined
            }
        }
        case constants.SIGN_OUT: {
            return {
                ...state, userLoggedIn: false, loggedInUser: undefined, loggedInUserName: undefined, item: undefined, cabinetTimerTimeInSeconds: undefined,
                loggedInUserAlternateId: undefined, loggedInUserId: undefined, touchScreenMode: TouchScreenMode.LOGIN_SCREEN, hasGlobalTimerTriggered: false,
                doorTimeOutRemaningSeconds: undefined, isMultiCustodyLogin: false, loginError: undefined,
                multiCustodyLoginItemIndex: undefined, multiCustodyWitnessCount: undefined, multiCustodyLoginSuccessCount: undefined,
                multiCustodyLoginSuccessUsers: undefined, multiCustodyTemparyLoginCount: undefined, multiCustodyFailedLoginAttempts: undefined
            }
        }
        case constants.BLINK_ITEM: {
            return { ...state, blinkItemIndex: action.itemIndex }
        }
        // On clicking on multicustody item button in menu to show the witness login screens.
        case constants.TRIGGER_MULTI_CUSTODY_LOGIN: {
            let multiCustodyLoginSuccessCount = state.multiCustodyLoginSuccessCount == undefined ? 0 : state.multiCustodyLoginSuccessCount;
            return {
                ...state, isMultiCustodyLogin: true, touchScreenMode: action.touchScreenMode, previousTouchScreenMode: action.previousTouchScreenMode,
                multiCustodyLoginItemIndex: action.item.itemIndex, multiCustodyWitnessCount: action.item.multiCustodyWitnessCount,
                multiCustodyFailedLoginAttempts: 0, multiCustodyLoginSuccessCount: multiCustodyLoginSuccessCount, multiCustodyTemparyLoginCount: 0, loginError: undefined
            }
        }
        //On one witness login successfully; increase both multiCustodyLoginSuccessCount and multiCustodyTemparyLoginCount and add temporary user
        // to multiCustodyLoginSuccessUsers list.
        case constants.MULTI_CUSTODY_WITNESS_LOGIN_SUCCESS: {
            let multiCustodyLoginSuccessCount = state.multiCustodyLoginSuccessCount != undefined ? state.multiCustodyLoginSuccessCount + 1 : 1;
            let multiCustodyTemparyLoginCount = state.multiCustodyTemparyLoginCount != undefined ? state.multiCustodyTemparyLoginCount + 1 : 1;
            let multiCustodyLoginSuccessUsers = state.multiCustodyLoginSuccessUsers || [];
            multiCustodyLoginSuccessUsers.push(action.userId);
            return {
                ...state, isMultiCustodyLogin: true,
                multiCustodyLoginSuccessCount: multiCustodyLoginSuccessCount,
                multiCustodyLoginSuccessUsers: multiCustodyLoginSuccessUsers,
                multiCustodyFailedLoginAttempts: 0,
                multiCustodyTemparyLoginCount: multiCustodyTemparyLoginCount,
                loginError: undefined
            }
        }
        // On one witness login failed; increase multiCustodyFailedLoginAttempts
        case constants.MULTI_CUSTODY_WITNESS_LOGIN_FAIL: {
            let failedAttemptCount = state.multiCustodyFailedLoginAttempts != undefined ? state.multiCustodyFailedLoginAttempts + 1 : 1;
            return {
                ...state, loginError: action.error, multiCustodyFailedLoginAttempts: failedAttemptCount
            }
        }

        // When all the witnesses logged in for multicustody item;
        case constants.MULTI_CUSTODY_AUTHENTICATION_COMPLETE: {
            return {
                ...state, isMultiCustodyLogin: false,
                touchScreenMode: action.previousTouchScreenMode,
                items: action.items,
                multiCustodyLoginItemIndex: undefined,
                multiCustodyWitnessCount: undefined,
                multiCustodyFailedLoginAttempts: undefined,
                multiCustodyTemparyLoginCount: undefined
            }
        }

        // When multicustody authentication failed (after maximum retries exceeded);
        // Remove the temporary logged in user from multiCustodyLoginSuccessUsers list and set the count of multiCustodyLoginSuccessCount;
        // Since still in the multicustody login ui do not clear the multiCustodyWitnessCount value. it will be cleared on after time out.
        case constants.MULTI_CUSTODY_AUTHENTICATION_FAIL: {
            let multiCustodyTemparyLoginCount = state.multiCustodyTemparyLoginCount != undefined ?
                state.multiCustodyTemparyLoginCount : 0;
            let multiCustodyLoginSuccessCount = state.multiCustodyLoginSuccessCount != undefined ?
                state.multiCustodyLoginSuccessCount - multiCustodyTemparyLoginCount < 0 ? 0 :
                    state.multiCustodyLoginSuccessCount - multiCustodyTemparyLoginCount : 0;
            let multiCustodyLoginSuccessUsers = state.multiCustodyLoginSuccessUsers || [];
            multiCustodyLoginSuccessUsers.splice(multiCustodyLoginSuccessCount - multiCustodyTemparyLoginCount);
            return {
                ...state, loginError: action.error,
                multiCustodyLoginItemIndex: undefined,
                multiCustodyLoginSuccessCount: multiCustodyLoginSuccessCount,
                multiCustodyLoginSuccessUsers: multiCustodyLoginSuccessUsers,
                multiCustodyTemparyLoginCount: undefined,
                multiCustodyFailedLoginAttempts: undefined
            }
        }
        case constants.SWITCH_TO_MAIN_MENU_ON_MULTI_CUSTODY_AUTH_FAIL: {
            return { ...state, isMultiCustodyLogin: false, multiCustodyWitnessCount: undefined, touchScreenMode: TouchScreenMode.MAIN_MENU }
        }
        case constants.WITNESS_USER_TIMEOUT: {
            let multiCustodyTemparyLoginCount = state.multiCustodyTemparyLoginCount != undefined ?
                state.multiCustodyTemparyLoginCount : 0;
            let multiCustodyLoginSuccessCount = state.multiCustodyLoginSuccessCount != undefined ?
                state.multiCustodyLoginSuccessCount - multiCustodyTemparyLoginCount < 0 ? 0 :
                    state.multiCustodyLoginSuccessCount - multiCustodyTemparyLoginCount : 0;
            let multiCustodyLoginSuccessUsers = state.multiCustodyLoginSuccessUsers || [];
            multiCustodyLoginSuccessUsers.splice(multiCustodyLoginSuccessCount - multiCustodyTemparyLoginCount);
            return {
                ...state, isMultiCustodyLogin: false, touchScreenMode: TouchScreenMode.MAIN_MENU,
                items: action.items,
                multiCustodyLoginItemIndex: undefined,
                multiCustodyWitnessCount: undefined,
                multiCustodyLoginSuccessCount: multiCustodyLoginSuccessCount,
                multiCustodyLoginSuccessUsers: multiCustodyLoginSuccessUsers,
                multiCustodyTemparyLoginCount: undefined,
                multiCustodyFailedLoginAttempts: undefined
            }
        }
        case constants.SHOW_TOUCHSCREEN_POPUP: {
            return { ...state, touchScreenPopupMessage: action.message }
        }
        case constants.HIDE_TOUCHSCREEN_POPUP: {
            return { ...state, touchScreenPopupMessage: undefined }
        }
    }
    return state;
}




// WEBPACK FOOTER //
// ./src/modules/cabinet/reducers/cabinet-control-center.reducer.ts