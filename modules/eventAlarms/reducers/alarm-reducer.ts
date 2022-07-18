import * as constants from '../constants/alarm.constants'
import { ActiveAlarmStatActions } from "../actions/alarm-actions";
import { ActiveAlarmStoreStatus, ActiveAlarmStatus } from "../types/dto";

export function activeAlarm(state: ActiveAlarmStoreStatus = { activeAlarms: [] }, action: ActiveAlarmStatActions) {
    switch (action.type) {
        case constants.ALL_ACTIVE_ALARM_STATS_LOADED:{
            return { ...state, activeAlarms: action.allAlarmStats };
        }
        case constants.ACTIVE_ALARM_STATS_UPDATED: {
            let updatingAlarmStat: ActiveAlarmStatus = action.updatingAlarmStat;

            let alarmStats: ActiveAlarmStatus[] = [...state.activeAlarms];

            if (alarmStats == null || alarmStats == undefined || alarmStats.length == 0){
                alarmStats = [];
                alarmStats.push(updatingAlarmStat);
            }
            else{
                let customerAlarmIndex = alarmStats.findIndex(a => a.alarmCustomerId == updatingAlarmStat.alarmCustomerId);
                if (customerAlarmIndex != -1) {
                    alarmStats[customerAlarmIndex] = updatingAlarmStat;
                }
                else {
                    alarmStats.push(updatingAlarmStat);
                }
            }             
            return { ...state, activeAlarms: alarmStats};
        }
    }
    return state;
}


// WEBPACK FOOTER //
// ./src/modules/eventAlarms/reducers/alarm-reducer.ts