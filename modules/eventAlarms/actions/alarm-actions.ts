import * as constants from '../constants/alarm.constants';
import { Dispatch } from "redux";
import { ActiveAlarmStatus } from "../types/dto";
import { alarmsService } from '../services/alarms.service';

export const alarmActions = {
    getActiveAlarms
}


export interface AllActiveAlarmStatsLoaded {
    type: constants.ALL_ACTIVE_ALARM_STATS_LOADED;
    allAlarmStats: ActiveAlarmStatus[];
}

export interface ActiveAlarmStatsUpdated {
    type: constants.ACTIVE_ALARM_STATS_UPDATED;
    updatingAlarmStat: ActiveAlarmStatus;
}

export type ActiveAlarmStatActions = AllActiveAlarmStatsLoaded | ActiveAlarmStatsUpdated;

function getActiveAlarms() {
    return (dispatch: Dispatch<ActiveAlarmStatActions>) => {
        var promise = alarmsService.getActiveAlarms();
        promise.then(alarms => {
            let activeAlarmAction: AllActiveAlarmStatsLoaded = {
                type: constants.ALL_ACTIVE_ALARM_STATS_LOADED,
                allAlarmStats: alarms
            };
            dispatch(activeAlarmAction);
        });
    }
}


// WEBPACK FOOTER //
// ./src/modules/eventAlarms/actions/alarm-actions.ts