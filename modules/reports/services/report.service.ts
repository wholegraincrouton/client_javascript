import { apiService } from "src/modules/shared/services";
import { ItemEventHistory } from "../types/dto";
import { EventHistoryUserView, EventDetail, EventHistoryCabinetView } from "../types/dto";
import { OverdueItem } from "src/modules/reports/types/dto";
import * as apiConstants from "src/modules/shared/constants/api.constants";

const service = apiConstants.REPORTS;

export const reportService = {
    getTodayEventsList,
    getEventHistory,
    getUserEventHistory,
    getCabinetEventHistory,
    getItemEventHistory,
    getCurrentOverdueItemList,
    getCurrentItemStatusList,
    getDailyTransactionsList,
    getOnTimeReturnsList,
    getOverdueReturnsList,
    getActiveAlarms,
    sendOverdueAlertSMS,
    getItemWiseTransactionList,
    getUserWiseTransactionList,
    getUserAccessibleItemsList
}

//#region Cabinet Reports

function getTodayEventsList(customerId: string, site: string, cabinetId: string, eventName: string,
    itemNumber: Number, itemName: string, pageToken?: string, limit?: number) {
    return apiService.get<any>('reports', "todays-events", undefined,
        {
            customerId, site, cabinetId, itemNumber, itemName, eventName, limit
        }, undefined, true, service, pageToken);
}

function getEventHistory(customerId: string, site: string, cabinetId: string, itemNumber: Number,
    userId: string, multiCustody: string, eventCode: string, fromDate: string, toDate: string, role: string,
    pageToken?: string, limit?: number) {
    return apiService.get<EventDetail[]>('reports', "event-history", undefined,
        {
            customerId, site, cabinetId, itemNumber, multiCustody, eventCode, userId, role, fromDate, toDate, limit
        }, undefined, false, service, pageToken);
}

function getUserEventHistory(customerId: string, site: string, cabinetId: string, itemNumber: Number,
    userId: string, multiCustody: string, fromDate: string, toDate: string, eventCode: string) {
    return apiService.get<EventHistoryUserView>('reports', "user-event-history", undefined,
        {
            customerId, site, cabinetId, itemNumber, multiCustody, eventCode, userId, fromDate, toDate
        }, undefined, false, service);
}

function getCabinetEventHistory(customerId: string, site: string, cabinetId: string, itemNumber: Number,
    userId: string, multiCustody: string, fromDate: string, toDate: string, jobTitle: string, eventCode: string) {
    return apiService.get<EventHistoryCabinetView>('reports', "cabinet-event-history", undefined,
        {
            customerId, site, cabinetId, itemNumber, multiCustody, eventCode, userId, jobTitle, fromDate, toDate
        }, undefined, false, service);
}

//#endregion

//#region Item Reports

function getCurrentOverdueItemList(customerId: string, site: string, cabinetId: string,
    pageToken?: string, pageSize?: number) {
    return apiService.get<OverdueItem[]>('reports', "overdue-item-status", undefined,
        { customerId, site, cabinetId, limit: pageSize }, undefined, false, service, pageToken);
}

function getCurrentItemStatusList(customerId: string, site: string, cabinetId: string, itemNumber: Number,
    itemName: string, itemStatus: string, user: string, jobTitle: string, pageToken?: string, pageSize?: number) {
    return apiService.get<any>('reports', "item-status", undefined,
        {
            customerId, site, cabinetId, itemNumber, itemName, itemStatus, user, jobTitle, limit: pageSize
        }, undefined, false, service, pageToken);
}

function getDailyTransactionsList(customerId: string, site: string, cabinetId: string, selectedRole: string, selectedUser: string, startDate: string, endDate: string) {
    return apiService.get<any>('reports', "total-transaction-volume", undefined,
        { customerId: customerId, site: site, cabinetId: cabinetId, userRole: selectedRole, userId: selectedUser, fromDate: startDate, toDate: endDate },
        undefined, true, service);
}

function getOnTimeReturnsList(customerId: string, site: string, cabinetId: string, selectedRole: string, selectedUser: string, startDate: string, endDate: string) {
    return apiService.get<any>('reports', "on-time-return-history", undefined,
        { customerId: customerId, site: site, cabinetId: cabinetId, userRole: selectedRole, userId: selectedUser, fromDate: startDate, toDate: endDate },
        undefined, true, service);
}

function getOverdueReturnsList(customerId: string, site: string, cabinetId: string, selectedRole: string, selectedUser: string, startDate: string, endDate: string) {
    return apiService.get<any>('reports', "overdue-return-history", undefined,
        { customerId: customerId, site: site, cabinetId: cabinetId, userRole: selectedRole, userId: selectedUser, fromDate: startDate, toDate: endDate },
        undefined, true, service);
}

function getItemEventHistory(customerId: string, site: string, cabinetId: string, itemNumber: Number,
    eventCode: string, multiCustody: string, userId: string, jobTitle: string, fromDate: string, toDate: string) {
    return apiService.get<ItemEventHistory>('reports', "item-events-history", undefined,
        {
            customerId, site, cabinetId, itemNumber, multiCustody, eventCode, userId, jobTitle, fromDate, toDate
        }, undefined, false, service);
}

function getItemWiseTransactionList(customerId: string, site: string, cabinetId: string, itemNumber: Number, itemName: string, fromDate: string, toDate: string,
    pageToken?: string, limit?: number) {
    return apiService.get<any>('reports', 'item-wise-transaction', undefined,
        { customerId, site, cabinetId, itemNumber, itemName, fromDate, toDate, limit }, undefined, false, service)
}

function getUserWiseTransactionList(customerId: string, site: string, cabinetId: string, userId: string, jobTitle: string, role: string, fromDate: string, toDate: string,
    pageToken?: string, limit?: number) {
    return apiService.get<any>('reports', 'user-wise-transaction', undefined,
        { customerId, site, cabinetId, userId, jobTitle, role, fromDate, toDate, limit }, undefined, false, service)
}

function getUserAccessibleItemsList(site: string, cabinetId: string, itemIndex: number, accessGroupName: string, userId: string, lastUpdatedUserId: string,
    pageToken?: string, limit?: number) {
    return apiService.get<EventDetail[]>('reports', 'user-accessible-items', undefined,
        { site, cabinetId, itemIndex, accessGroupName, userId, lastUpdatedUserId, limit }, undefined, false, service, pageToken)
}

//#endregion

function getActiveAlarms() {
    return apiService.get<EventHistoryCabinetView>('reports', "active-alarms", undefined, undefined, null, false, service);
}

function sendOverdueAlertSMS(userId: string, cabinetName: string, userName: string, itemNumber: string, itemName: string) {
    return apiService.post<any>('alert', "SendOverdueAlertSMS", { userId, cabinetName, userName, itemNumber, itemName }, []);
}



// WEBPACK FOOTER //
// ./src/modules/reports/services/report.service.ts