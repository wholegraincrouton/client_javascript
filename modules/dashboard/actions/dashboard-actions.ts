import { Dispatch } from "redux";
import * as constants from '../constants/dashboard.constants';
import { cabinetGroupService } from "src/modules/cabinetGroups/services/cabinetGroup.service";
import { cabinetService } from "src/modules/cabinet/services/cabinet.service";
import { CabinetAlarmSummary, CabinetSnapshot, DashboardState, CabinetItemEventSummary, ItemStatusUpdate } from "src/modules/dashboard/types/dto";
import { CabinetBasicDetails } from "src/modules/cabinet/types/dto";
import { store } from "src/redux/store";
import { userService } from "src/modules/users/services/user.service";
import { ListItem, BasicUser } from "src/modules/shared/types/dto";
import { dashboardService } from "src/modules/dashboard/services/dashboard.service";
import { AlarmStatusUpdate } from "src/modules/eventAlarms/types/dto";
import { siteService } from "src/modules/sites/services/site.service";
import { Site } from "src/modules/sites/types/dto";

export const dashBoardActions = {
    loadCabinetGroups,
    loadCabinets,
    loadUsers,
    loadCabinetSnapshotSummaryList,
    loadItemEventStats,
    updateCabinetSummaryByCabinetGroup,
    updateCabinetSummaryByCabinet,
    saveDashboardFilters,
    loadAlarmStats,
    loadSites,
    updateCabinetSummaryBySite
}

export interface CabinetGroupsLoaded {
    type: constants.CABINET_GROUPS_LOADED;
    cabinetGroups: ListItem[];
}

export interface SitesLoaded {
    type: constants.SITES_LOADED;
    sites: Site[];
}

export interface SaveDashboardFilters {
    type: constants.DASHBOARD_FILTER_CHANGED
    cabinetGroupId: string;
    cabinetId: string;
    eventsTimeDuration: string;
    alarmsTimeDuration: string;
}

export interface CabinetsLoaded {
    type: constants.CABINETS_LOADED;
    cabinets: CabinetBasicDetails[];
}

export interface UsersLoaded {
    type: constants.USERS_LOADED;
    users: BasicUser[];
}

export interface CabinetAlarmsLoaded {
    type: constants.CABINET_ALARMS_LOADED;
    cabinetAlarms: CabinetAlarmSummary;
}

export interface CabinetSnapshotListLoaded {
    type: constants.CABINETS_SUMMARY_LIST_LOADED;
    cabinetSummaryList: CabinetSnapshot[];
}

export interface ItemEventStatsLoaded {
    type: constants.ITEM_EVENT_STATS_LOADED;
    itemEventSummary: CabinetItemEventSummary;
}

export interface AlarmStatsLoaded {
    type: constants.ALARM_STATS_LOADED;
    cabinetAlarmSummary: CabinetAlarmSummary;
}

export interface CabinetGroupChanged {
    type: constants.SITE_CHANGED;
    cabinetCount: number;
    cabinetItemCount: number;
}

export interface SiteChanged {
    type: constants.SITE_CHANGED;
    cabinetCount: number;
    cabinetItemCount: number;
}

export interface DashboardItemStatusUpdated {
    type: constants.DASHBOARD_ITEM_STATUS_UPDATED;
    itemStatusUpdate: ItemStatusUpdate;
}

export interface DashboardAlarmStatusUpdated {
    type: constants.DASHBOARD_ALARM_STATUS_UPDATED;
    alarmStatusUpdate: AlarmStatusUpdate;
}

export type DashboardActions = CabinetGroupsLoaded | CabinetsLoaded | UsersLoaded |
    CabinetAlarmsLoaded | CabinetSnapshotListLoaded | CabinetGroupChanged | SaveDashboardFilters |
    ItemEventStatsLoaded | AlarmStatsLoaded | DashboardItemStatusUpdated | DashboardAlarmStatusUpdated | SitesLoaded | SiteChanged;

function loadCabinetGroups(customerId: string) {
    return (dispatch: Dispatch<DashboardActions>) => {
        customerId && cabinetGroupService.getCabinetGroups(customerId).then((cabinetGroups) => {
            dispatch({ type: constants.CABINET_GROUPS_LOADED, cabinetGroups: cabinetGroups });
        });
    }
}

function loadSites(customerId: string) {
    return (dispatch: Dispatch<DashboardActions>) => {
        customerId && siteService.getSites(customerId).then((sites) => {
            dispatch({ type: constants.SITES_LOADED, sites: sites });
        });
    }
}

function saveDashboardFilters(cabinetGroupId: string, cabinetId: string,
    eventsTimeDuration: string, alarmsTimeDuration: string) {
    return (dispatch: Dispatch<DashboardActions>) => {
        dispatch({
            type: constants.DASHBOARD_FILTER_CHANGED,
            cabinetGroupId: cabinetGroupId, cabinetId: cabinetId,
            eventsTimeDuration: eventsTimeDuration, alarmsTimeDuration: alarmsTimeDuration
        });
    }
}

function updateCabinetSummaryByCabinetGroup(cabinetGroupId: string) {
    return (dispatch: Dispatch<DashboardActions>) => {
        let dashBoardState: DashboardState = store.getState().dashboard;
        let cabinets = cabinetGroupId == 'any' ? dashBoardState.cabinets : dashBoardState.cabinets.filter(c => c.cabinetGroupId == cabinetGroupId);
        let cabinetItemCount: number = getCabinetItemCount(cabinets);
        dispatch({ type: constants.CABINET_SUMMARY_CHANGED, cabinetCount: cabinets.length, cabinetItemCount: cabinetItemCount });
    }
}

function updateCabinetSummaryBySite(site: string) {
    return (dispatch: Dispatch<DashboardActions>) => {
        let dashBoardState: DashboardState = store.getState().dashboard;
        let cabinets = site == 'any' ? dashBoardState.cabinets : dashBoardState.cabinets.filter(c => c.site == site);
        
        let cabinetItemCount: number = getCabinetItemCount(cabinets);
        dispatch({ type: constants.CABINET_SUMMARY_CHANGED, cabinetCount: cabinets.length, cabinetItemCount: cabinetItemCount });
    }
}

function updateCabinetSummaryByCabinet(site: string, cabinetId: string) {
    return (dispatch: Dispatch<DashboardActions>) => {
        let cabinetStats = getCabinetStats(site, cabinetId)
        dispatch({ type: constants.CABINET_SUMMARY_CHANGED, cabinetCount: cabinetStats.cabinetCount, cabinetItemCount: cabinetStats.cabinetItemCount });
    }
}

function getCabinetStats(site: string, cabinetId: string) {
    let dashBoardState: DashboardState = store.getState().dashboard;
    let cabinets: CabinetBasicDetails[] = [];
    if (site == 'any')
        cabinets = (cabinetId == 'any') ? dashBoardState.cabinets : dashBoardState.cabinets.filter(c => c.id == cabinetId);
    else
        cabinets = (cabinetId == 'any') ? dashBoardState.cabinets.filter(c => c.site == site)
            : dashBoardState.cabinets.filter(c => c.site == site && c.id == cabinetId);

    let cabinetItemCount: number = getCabinetItemCount(cabinets);
    return { cabinetCount: cabinets.length, cabinetItemCount: cabinetItemCount };
}

function loadCabinets(customerId: string) {
    return (dispatch: Dispatch<DashboardActions>) => {
        customerId && cabinetService.getCabinets(customerId).then((cabinets) => {
            dispatch({ type: constants.CABINETS_LOADED, cabinets: cabinets });

            let dashboardStore = store.getState().dashboard;

            let statDetails = getCabinetStats(dashboardStore.selectedCabnietGroupId == undefined ? 'any' : dashboardStore.selectedCabnietGroupId
                , dashboardStore.selectedCabnietId == undefined ? 'any' : dashboardStore.selectedCabnietId);

            dispatch({
                type: constants.CABINET_SUMMARY_CHANGED, cabinetCount: statDetails.cabinetCount,
                cabinetItemCount: statDetails.cabinetItemCount
            });
        });
    }
}

function loadUsers(customerId: string) {
    return (dispatch: Dispatch<DashboardActions>) => {
        customerId && userService.getUsers(customerId).then((users) => {
            dispatch({ type: constants.USERS_LOADED, users: users });
        });
    }
}

function loadCabinetSnapshotSummaryList(customerId: string, site: string, cabinetId: string) {
    return (dispatch: Dispatch<DashboardActions>) => {
        dashboardService.getCabinetSnapshotSummary(customerId, site, cabinetId).then((cabinetSummaryList: CabinetSnapshot[]) => {
            dispatch({ type: constants.CABINETS_SUMMARY_LIST_LOADED, cabinetSummaryList: cabinetSummaryList });
        });
    }
}

function loadItemEventStats(customerId: string, site: string, cabinetId: string, from: Date, end: Date) {
    return (dispatch: Dispatch<DashboardActions>) => {
        dashboardService.getItemEventStats(customerId, site, cabinetId, from, end)
            .then((itemEventSummary: CabinetItemEventSummary) => {
                dispatch({ type: constants.ITEM_EVENT_STATS_LOADED, itemEventSummary: itemEventSummary });
            });
    }
}

function loadAlarmStats(customerId: string, site: string, cabinetId: string, from: string, end: string) {
    return (dispatch: Dispatch<DashboardActions>) => {
        dashboardService.getAlarmStats(customerId, site, cabinetId, from, end)
            .then((cabinetAlarmSummary: CabinetAlarmSummary) => {
                dispatch({ type: constants.ALARM_STATS_LOADED, cabinetAlarmSummary: cabinetAlarmSummary });
            });
    }
}

function getCabinetItemCount(cabinets: CabinetBasicDetails[]) {
    let cabinetItemCount: number = 0;
    cabinets && cabinets.forEach((cabinetDetail: CabinetBasicDetails) => {
        cabinetItemCount += cabinetDetail.itemCount;
    });
    return cabinetItemCount;
}



// WEBPACK FOOTER //
// ./src/modules/dashboard/actions/dashboard-actions.ts