import * as signalR from "@aspnet/signalr";
import axios from "axios";
import { store } from "src/redux/store";
import * as alarmConstants from '../../eventAlarms/constants/alarm.constants';
import { ActiveAlarmStatsUpdated } from "src/modules/eventAlarms/actions/alarm-actions";
import { accountSessionService, contextService } from ".";
import { PendingDeviceUpdateStatus } from "src/modules/deviceUpdates/types/dto";
import { DeviceUpdateStatusUpdated } from "src/modules/deviceUpdates/actions/device-update-actions";
import * as deviceUpdateConstants from '../../deviceUpdates/constants/device-update.constants';
import { ItemStatusUpdate } from "src/modules/dashboard/types/dto";
import { DashboardItemStatusUpdated, DashboardAlarmStatusUpdated } from "src/modules/dashboard/actions/dashboard-actions";
import * as dashboardConstants from "src/modules/dashboard/constants/dashboard.constants";
import { AlarmStatusUpdate } from "src/modules/eventAlarms/types/dto";

let connection: signalR.HubConnection;

export const signalrService = {
    connect,
    reconnectOnPageReload
};

let apiBaseUrl: string;

function connect(userId: string) {
    apiBaseUrl = appConfig.signalRApiPort ?
        `${appConfig.apiUrl}${appConfig.signalRApiPort}/api` : `${appConfig.apiUrl}/notifier/api`;

    intiateSignalR(userId);
}

function reconnectOnPageReload() {
    if (accountSessionService.isAuthenticated()) {
        let signalRInfo = accountSessionService.getSignalRCookie();
        let userId = accountSessionService.getLoggedInUserId();

        if (signalRInfo == undefined || signalRInfo.url == undefined || signalRInfo.accessToken == undefined) {
            connect(userId);
        }

        else {
            initiateSignalRConnection(signalRInfo.url, signalRInfo.accessToken, userId, true)
                .then(() => {
                    console.log("Connected on Page Reload")
                })
                .catch(err => {
                    if (err.statusCode == 401) {
                        connect(userId);
                    }
                });
        }
    }
    else {
        console.log("Not authenticated");
    }
}

function intiateSignalR(userId: string) {
    getConnectionInfo(userId)
        .then(
            info => {
                // make compatible with old and new SignalRConnectionInfo
                info.accessToken = info.accessToken || info.accessKey || (info.value && info.value.accessToken);
                info.url = info.url || info.endpoint || (info.value && info.value.url);

                accountSessionService.setSignalRCookie({ url: info.url, accessToken: info.accessToken });

                initiateSignalRConnection(info.url, info.accessToken, userId)
                    .then(() => {
                        console.log("Connected")
                    })
                    .catch(() => {
                        console.log("Connection Error");
                    });;
            }
        )
        .catch(err => {
            console.log(err)
        });
}

function initiateSignalRConnection(url: string, accessToken: string, userId: string, isOnReload: boolean = false) {

    const options = {
        accessTokenFactory: () => accessToken
    };

    connection = new signalR.HubConnectionBuilder()
        .withUrl(url, options)
        .configureLogging(signalR.LogLevel.Error) //.configureLogging(signalR.LogLevel.Information)
        .build();

    connection.on('newMessage', newMessage);
    connection.on('updateAlarmStatus', updateAlarmStatus);
    connection.on('updateDeviceUpdateStatus', updateDeviceUpdateStatus);
    connection.on('updateItemStatus', updateItemStatus);
    connection.onclose(() => console.log('disconnected'));

    return connection.start()
        .then(() => {
            if (!isOnReload) {
                addToGroup(userId)
                    .then(data =>
                        console.log(data.value)
                    )
                    .catch(err => {
                        console.log("Error adding to group");
                    })
            }
        })
        .catch(err => {
            throw err;
        });
}

function getConnectionInfo(userId: string) {
    return axios.post(`${apiBaseUrl}/negotiate`, null, getAxiosConfig(userId))
        .then(resp => resp.data);
}

function getAxiosConfig(userId: string) {
    const uiContext = contextService.getCurrentContext();
    const config = {
        headers: { 'x-ms-signalr-userid': userId, 'X-CustomerId': uiContext.customerId, }
    };
    return config;
}

function addToGroup(userId: string) {
    const uiContext = contextService.getCurrentContext();
    return axios.post(`${apiBaseUrl}/addToGroup?userId=${userId}`,null, {headers: {'X-CustomerId': uiContext.customerId}})
        .then(resp => resp.data);
}

function newMessage(message: any) {
    console.log(message);
}

function updateAlarmStatus(activeAlarmStat: AlarmStatusUpdate) {
    let activeAlarmAction: ActiveAlarmStatsUpdated = {
        type: alarmConstants.ACTIVE_ALARM_STATS_UPDATED,
        updatingAlarmStat: { alarmCustomerId: activeAlarmStat.alarmCustomerId, cabinetAlarms: activeAlarmStat.cabinetAlarms }
    };
    store.dispatch(activeAlarmAction);

    let dashboardAlarmStatusUpdateAction: DashboardAlarmStatusUpdated = {
        type: dashboardConstants.DASHBOARD_ALARM_STATUS_UPDATED,
        alarmStatusUpdate: activeAlarmStat
    };
    store.dispatch(dashboardAlarmStatusUpdateAction);
}

function updateDeviceUpdateStatus(deviceUpdate: PendingDeviceUpdateStatus) {
    let deviceUpdateStatusAction: DeviceUpdateStatusUpdated = {
        type: deviceUpdateConstants.DEVICE_UPDATE_STATUS_UPDATED,
        updatingDeviceUpdate: {
            deviceUpdateCustomerId: deviceUpdate.deviceUpdateCustomerId,
            cabinetManifests: deviceUpdate.cabinetManifests
        }
    };
    store.dispatch(deviceUpdateStatusAction);
}

function updateItemStatus(itemStatusUpdate: ItemStatusUpdate) {
    let dashboardItemStatusUpdateAction: DashboardItemStatusUpdated = {
        type: dashboardConstants.DASHBOARD_ITEM_STATUS_UPDATED,
        itemStatusUpdate: itemStatusUpdate
    };
    store.dispatch(dashboardItemStatusUpdateAction);
}



// WEBPACK FOOTER //
// ./src/modules/shared/services/signalr.service.ts