import { apiService } from "src/modules/shared/services";
import { store } from "src/redux/store";
import { TimeDurations } from "src/modules/shared/types/dto";
import * as apiConstants from "src/modules/shared/constants/api.constants";

const service = apiConstants.REPORTS;

export const dashboardService = {
    getItemEventStats,
    getAlarmStats,
    getCabinetSnapshotSummary,
    getSelectedCabinetGroup,
    getSelectedCabinet,
    getItemEventsSelectedTimeDuration,
    getAlarmsSelectedTimeDuration,
    getSelectedSite
}

//#region Get widget data

function getItemEventStats(customerId: string, site: string, cabinetId: string, from: Date, to: Date) {
    return apiService.get<any>('reports', "event-statistics", undefined,
        { customerId: customerId, site: site, cabinetId: cabinetId, fromDate: from, toDate: to }, undefined, true, service);
}

function getAlarmStats(customerId: string, site: string, cabinetId: string, from: string, to: string) {
    return apiService.get<any>('reports', "alarm-statistics", undefined,
        { customerId: customerId, site: site, cabinetId: cabinetId, fromDate: from, toDate: to }, undefined, true, service);
}

function getCabinetSnapshotSummary(customerId: string, site: string, cabinetId: string) {
    return apiService.get<any>('reports', "cabinet-statistics", undefined,
        { customerId: customerId, site: site, cabinetId: cabinetId }, undefined, true, service);
}

//#endregion

//#region Get filter values

function getSelectedCabinetGroup() {
    let storeData = store.getState().dashboard;
    let previousFilteredCabinetGroupId = storeData.selectedCabnietGroupId;


    let selectedCabinetGroupId = previousFilteredCabinetGroupId == undefined ?
        'any' : previousFilteredCabinetGroupId;

    return selectedCabinetGroupId;
}

function getSelectedCabinet() {
    let storeData = store.getState().dashboard;
    let previousFilteredCabnietId = storeData.selectedCabnietId;
    let selectedCabinetId = previousFilteredCabnietId == undefined ?
        'any' : previousFilteredCabnietId;
    return selectedCabinetId;
}

function getItemEventsSelectedTimeDuration() {
    let storeData = store.getState().dashboard;
    let previousTimeDuration = storeData.selectedEventsTimeDuration;
    let timeDuration = previousTimeDuration == undefined ?
        TimeDurations.Weekly : previousTimeDuration;
    return timeDuration;
}

function getAlarmsSelectedTimeDuration() {
    let storeData = store.getState().dashboard;
    let previousTimeDuration = storeData.selectedAlarmsTimeDuration;
    let timeDuration = previousTimeDuration == undefined ?
        TimeDurations.Weekly : previousTimeDuration;
    return timeDuration;
}

function getSelectedSite() {
    let storeData = store.getState().dashboard;
    let previousFilteredSite = storeData.selectedSite;


    let selectedSite = previousFilteredSite == undefined ?
        'any' : previousFilteredSite;

    return selectedSite;
}

//#endregion


// WEBPACK FOOTER //
// ./src/modules/dashboard/services/dashboard.service.ts