import { DashboardState } from "src/modules/dashboard/types/dto";
import { contextService } from "src/modules/shared/services";
import { DashboardActions } from '../actions/dashboard-actions';
import * as constants from '../constants/dashboard.constants';

export function dashboard(state: DashboardState = { cabinets: [] }, action: DashboardActions) {
    let selectedCustomerId = contextService.getCurrentCustomerId();
    let selectedSite = state.selectedSite;
    let selectedCabinetId = state.selectedCabnietId;

    switch (action.type) {
        case constants.CABINETS_LOADED:
            return { ...state, cabinets: action.cabinets, cabinetCount: action.cabinets.length };
        case constants.CABINET_GROUPS_LOADED:
            return { ...state, cabinetGroups: action.cabinetGroups, cabinetGroupCount: action.cabinetGroups.length };
        case constants.SITES_LOADED:
                return { ...state, sites: action.sites, sitesCount: action.sites.length };
        case constants.CABINET_ALARMS_LOADED:
            return { ...state, cabinetAlarmSummary: action.cabinetAlarms };
        case constants.CABINETS_SUMMARY_LIST_LOADED:
            return { ...state, cabinetSnapshotList: action.cabinetSummaryList };
        case constants.ITEM_EVENT_STATS_LOADED:
            return { ...state, itemEventSummary: action.itemEventSummary };
        case constants.ALARM_STATS_LOADED:
            return { ...state, cabinetAlarmSummary: action.cabinetAlarmSummary };
        case constants.DASHBOARD_FILTER_CHANGED:
            return {
                ...state, selectedCabnietGroupId: action.cabinetGroupId, selectedCabnietId: action.cabinetId,
                selectedEventsTimeDuration: action.eventsTimeDuration, selectedAlarmsTimeDuration: action.alarmsTimeDuration
            };
        case constants.CABINET_SUMMARY_CHANGED:
            return { ...state, cabinetCount: action.cabinetCount, cabinetItemCount: action.cabinetItemCount };
        case constants.USERS_LOADED:
            return { ...state, users: action.users };
        case constants.DASHBOARD_ITEM_STATUS_UPDATED:
            let newItemState: DashboardState = { ...state };

            if (state.itemEventSummary && state.cabinetAlarmSummary && selectedCustomerId == action.itemStatusUpdate.customerId &&
                (selectedSite == 'any' || selectedSite == action.itemStatusUpdate.site) &&
                (selectedCabinetId == 'any' || selectedCabinetId == action.itemStatusUpdate.cabinetId)) {

                let overdueCount = state.itemEventSummary.overdueCount + action.itemStatusUpdate.overdueItemCountChange;
                let unAvailableItemCount = state.itemEventSummary.unAvailableItemCount + action.itemStatusUpdate.outItemCountChange;
                let availableItemCount = state.itemEventSummary.availableItemCount + action.itemStatusUpdate.inItemCountChange;

                newItemState.itemEventSummary = {
                    ...state.itemEventSummary,
                    overdueCount: overdueCount < 0 ? 0 : overdueCount,
                    unAvailableItemCount: unAvailableItemCount < 0 ? 0 : unAvailableItemCount,
                    availableItemCount: availableItemCount < 0 ? 0 : availableItemCount
                };
            };
            return { ...newItemState };
        case constants.DASHBOARD_ALARM_STATUS_UPDATED:
            let newAlarmState: DashboardState = { ...state };

            if (state.itemEventSummary && state.cabinetAlarmSummary && selectedCustomerId == action.alarmStatusUpdate.alarmCustomerId &&
                (selectedSite == 'any' || selectedSite == action.alarmStatusUpdate.alarmSite) &&
                (selectedCabinetId == 'any' || selectedCabinetId == action.alarmStatusUpdate.alarmCabinetId)) {

                let sev1AlarmCount = state.cabinetAlarmSummary.sev1AlarmCount + action.alarmStatusUpdate.lowSeverityAlarmCountChange;
                let sev2AlarmCount = state.cabinetAlarmSummary.sev2AlarmCount + action.alarmStatusUpdate.highSeverityAlarmCountChange;
                let sev1EscalatedAlarmCount = state.cabinetAlarmSummary.sev1AlarmEscalationCount + action.alarmStatusUpdate.lowSeverityEscalatedAlarmCountChange;
                let sev2EscalatedAlarmCount = state.cabinetAlarmSummary.sev2AlarmEscalationCount + action.alarmStatusUpdate.highSeverityEscalatedAlarmCountChange;
                let cabinetCount = state.cabinetAlarmSummary.cabinetCount + action.alarmStatusUpdate.impactedCabinetCountChange;
                
                newAlarmState.cabinetAlarmSummary = {
                    ...state.cabinetAlarmSummary,
                    sev1AlarmCount: sev1AlarmCount < 0 ? 0 : sev1AlarmCount,
                    sev2AlarmCount: sev2AlarmCount < 0 ? 0 : sev2AlarmCount,
                    sev1AlarmEscalationCount: sev1EscalatedAlarmCount < 0 ? 0 : sev1EscalatedAlarmCount,
                    sev2AlarmEscalationCount: sev2EscalatedAlarmCount < 0 ? 0 : sev2EscalatedAlarmCount,
                    cabinetCount: cabinetCount < 0 ? 0 : cabinetCount
                };
            };

            return { ...newAlarmState };
    }
    return state;
}


// WEBPACK FOOTER //
// ./src/modules/dashboard/reducers/dashboard-reducer.ts