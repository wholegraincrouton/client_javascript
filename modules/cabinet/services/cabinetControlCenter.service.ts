import { apiService, notificationDialogService, localise } from "src/modules/shared/services";
import { CabinetTwinDto, LoginResult, CabinetAlarmDto, CabinetEventNameConst } from "../types/dto";
import { store } from "../../../redux/store";
import { CabinetSimulationState, CabinetEvent, CabinetItemEvent } from "../types/store";
import * as constants from "../constants/cabinet-control-center.constants";
import { PagedResultSet } from "../../shared/types/dto";
import { cabinetTimerService } from "src/modules/cabinet/components/CabinetControlCenter/shared/cabniet-timer.service";
import { alertActions } from "src/modules/shared/actions/alert.actions";
import * as moment from 'moment';
import { eventRuleService } from "../components/CabinetControlCenter/shared/event-rule-service";
import * as apiConstants from "src/modules/shared/constants/api.constants";

var eventLowPrioritySyncReference: any;
var eventHighPrioritySyncReference: any;

const DEFAULT_PAGE_SIZE = 10;
const service = apiConstants.DEVICES;

export const cabinetControlCenterService =
{
    getCurrentCabinetTime,
    getAlarms,
    getEvents,
    getItemEvents,
    loginToCabinet,
    getCabinetTwin,
    setInitialCabinetStatus,
    registerCabinetEventSync,
    unRegisterCabinetEventSync,
    isAlarmClosed,
    isItemOverdue,
    deprovisionCabinet
};

function getCurrentCabinetTime() {
    let offset = store.getState().cabinetSimulation.timeOffset;
    return moment.utc().add(offset, "m").toDate();
}

function getAlarms(cabinetId: string, isActive: boolean) {
    return apiService.get<CabinetAlarmDto[]>('CabinetSimulator', 'GetAlarmsByStatus', undefined, { cabinetId, isActive }, null, false, service)
}

function getEvents(filter?: any) {
    let query = { sortBy: "eventCode", sortDir: "asc", IncludeDeleted: true, limit: DEFAULT_PAGE_SIZE, ...filter };
    return apiService.get<PagedResultSet<CabinetEvent>>('reports', 'cabinet-events', undefined, query, null, false, apiConstants.REPORTS, filter && filter.pageToken);
}

function getItemEvents(filter?: any) {
    let query = { sortBy: "eventCode", sortDir: "asc", IncludeDeleted: true, limit: DEFAULT_PAGE_SIZE, ...filter };
    return apiService.get<PagedResultSet<CabinetItemEvent>>('reports', 'cabinet-item-events', undefined, query, null, false, apiConstants.REPORTS, filter && filter.pageToken);
}

function loginToCabinet(userId: string, pin: string, cabinetId: string, customerId: string) {
    var creds = {
        userId,
        pin,
        cabinetId,
        customerId
    };
    return apiService.post<LoginResult>('CabinetSimulator', 'Login', creds, [], null, false, service);
}

function isAlarmClosed(cabinetId: string, alarmName: string) {
    return apiService.get<boolean>('CabinetSimulator', 'IsAlarmClosed', undefined,
        { cabinetId, alarmName }, null, false, service);
}

function isItemOverdue(cabinetId: string, itemIndex: number) {
    return apiService.get<boolean>('CabinetSimulator', 'GetOverdueItemStatus', undefined,
        { cabinetId, itemIndex }, null, false, service);
}

function setInitialCabinetStatus(cabinetId: string) {
    return apiService.get<CabinetTwinDto>('CabinetSimulator', 'SetInitialStatuses', undefined,
        { cabinetId }, null, false, service);
}

function getCabinetTwin(cabinetId: string, callbackFunction: () => any) {
    return apiService.get<CabinetTwinDto>('CabinetSimulator', 'GetCabinetTwinStatus', undefined,
        { cabinetId }, 'ERROR_RECORD_ALREADY_DELETED', false, service).catch((error: any) => {
            if (error.response.data == 'ERROR_RECORD_ALREADY_DELETED') {
                terminateCabinetSync(callbackFunction);
            }
        });
}

function registerCabinetEventSync(callbackFunction: () => any) {
    if (!eventLowPrioritySyncReference) {
        eventLowPrioritySyncReference = setInterval(function () {
            publishLowPriorityEvents(callbackFunction);
        }, cabinetTimerService.getCabinetSyncTimeInSeconds("LOW_PRIORITY_EVENT_SYNC_INTERVAL"));
    }

    if (!eventHighPrioritySyncReference) {
        eventHighPrioritySyncReference = setInterval(function () {
            publishHighPriorityEvents(callbackFunction);
        }, cabinetTimerService.getCabinetSyncTimeInSeconds("HIGH_PRIORITY_EVENT_SYNC_INTERVAL"));
    }
}

function unRegisterCabinetEventSync() {
    clearInterval(eventLowPrioritySyncReference);
    eventLowPrioritySyncReference = undefined;
    clearInterval(eventHighPrioritySyncReference);
    eventHighPrioritySyncReference = undefined;
}

function terminateCabinetSync(callbackFunction: () => any) {
    unRegisterCabinetEventSync();
    notificationDialogService.showDialog(localise('ERROR_CABINET_ALREADY_DELETED'), () => { callbackFunction() }, "Error");
}

function publishLowPriorityEvents(callbackFunction: () => any) {
    let cabinetSimulation: CabinetSimulationState = store.getState().cabinetSimulation;

    if (cabinetSimulation == undefined)
        return;

    const { lowPriorityEventPublishingInProgress, lowPriorityEvents, cabinetId } = cabinetSimulation;

    if (lowPriorityEventPublishingInProgress || lowPriorityEvents == undefined || lowPriorityEvents.length == 0)
        return;

    publishEvents(false, lowPriorityEvents, callbackFunction, cabinetId);
}

function publishHighPriorityEvents(callbackFunction: () => any) {
    let cabinetSimulation: CabinetSimulationState = store.getState().cabinetSimulation;

    if (cabinetSimulation == undefined)
        return;

    const { highPriorityEventPublishingInProgress, highPriorityEvents, cabinetId } = cabinetSimulation;

    if (highPriorityEventPublishingInProgress || highPriorityEvents == undefined || highPriorityEvents.length == 0)
        return;

    publishEvents(true, highPriorityEvents, callbackFunction, cabinetId);
}

function publishEvents(isHighPriorityEvent: boolean, events: any, callbackFunction: () => any, cabinetId?: string) {
    store.dispatch({ type: isHighPriorityEvent ? constants.START_HIGH_PRIORITY_EVENT_PUBLISHING : constants.START_LOW_PRIORITY_EVENT_PUBLISHING });
    apiService.post('CabinetSimulator', 'publishEvents', { cabinetId: cabinetId, cabinetSimulatedEvents: events }, undefined, undefined, true, service)
        .then((lastProcessedEventId: string) => {
            store.dispatch({
                type: isHighPriorityEvent ? constants.DEQUEUE_HIGH_PRIORITY_EVENTS : constants.DEQUEUE_LOW_PRIORITY_EVENTS,
                lastProcessedEventId
            });
            store.dispatch({ type: isHighPriorityEvent ? constants.STOP_HIGH_PRIORITY_EVENT_PUBLISHING : constants.STOP_LOW_PRIORITY_EVENT_PUBLISHING });
        })
        .catch((error: any) => {
            if (error.response.data == 'ERROR_RECORD_ALREADY_DELETED') {
                terminateCabinetSync(callbackFunction);
            }
            store.dispatch({ type: isHighPriorityEvent ? constants.STOP_HIGH_PRIORITY_EVENT_PUBLISHING : constants.STOP_LOW_PRIORITY_EVENT_PUBLISHING });
        });
}

function deprovisionCabinet(cabinetId: string) {
    let events = [{
        id: eventRuleService.generateUniqueId(),
        eventCode: CabinetEventNameConst.CabinetDeprovisionFromCabinet,
        isHighPriority: true,
        eventSource: null,
        eventTime: Date.UTC,
        eventUploadedTime: Date.UTC,
        context: null
    }];

    apiService.post('CabinetSimulator', 'publishEvents', { cabinetId: cabinetId, cabinetSimulatedEvents: events }, undefined, undefined, true, service)
        .then((result: string) => {
            alertActions.showSuccess('TEXT_DEPROVISION_SUCCESS_EVENT_SEND_SUCCESSFULLY');
        });
}


// WEBPACK FOOTER //
// ./src/modules/cabinet/services/cabinetControlCenter.service.ts