import { apiService, lookupService, localise } from "src/modules/shared/services";
import { Alarm, ActiveAlarmStatus } from "../types/dto";
import * as apiConstants from "src/modules/shared/constants/api.constants";

const service = apiConstants.DEVICES;

export const alarmsService =
{
    closeAlarm,
    getActiveAlarms,
    closeAlarms,
    getClosedByEventText
}

function getActiveAlarms() {
    return apiService.get<ActiveAlarmStatus[]>('alarms', "activeAlarms", undefined, null, undefined, true, service);
}

function closeAlarm(alarm: Alarm) {
    return apiService.post('alarms', "Close", alarm, [], null, false, service);
}

function closeAlarms(alarmIds: string[]) {
    return apiService.put('alarms', "CloseAlarms",  alarmIds, service);
}

function getClosedByEventText(value: string) {
    return `${localise("TEXT_CLOSED_BY")} "${lookupService.getTextFromMultipleLookups(["LIST_CABINET_HIGH_PRIORITY_EVENTS",
        "LIST_CABINET_LOW_PRIORITY_EVENTS", "LIST_CABINET_ITEM_EVENTS"], value)}"`;
}



// WEBPACK FOOTER //
// ./src/modules/eventAlarms/services/alarms.service.ts