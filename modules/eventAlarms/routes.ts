import { AppRouteInfo } from "../../routes/types";
import EventAlarmManagement from "./components/RuleEngine/EventAlarmManagement/EventAlarmManagement";
import EventAlarmDetails from "./components/RuleEngine/EventAlarmDetails/EventAlarmDetails";
import AlarmManagement from "./components/Alarms/AlarmManagement/AlarmManagement";
import AlertManagement from "./components/Alerts/AlertManagement/AlertManagement";
import AlarmDetails from "./components/Alarms/AlarmDetails/AlarmDetails";
import AlertDetails from "./components/Alerts/AlertDetails/AlertDetails";
import * as moment from "moment";
import { DefaultDateTimeFormats } from "../shared/constants/datetime.constants";

function getTime(isEndTime?: boolean) {
    let time = new Date();

    if (isEndTime) {
        return time.toISOString();
    }
    else {
        time.setMonth(time.getMonth() - 1);
        return time.toISOString();
    }
}

function getAlarmStartFilterTime() {
    let time = new Date();
    time.setMonth(time.getMonth() - 6);
    return moment(time).format(DefaultDateTimeFormats.DateTimeFormat);
}

export const eventAlarmsRouteGroup: AppRouteInfo = {
    path: "/eventalarm",
    redirectTo: "/eventalarm/alarmmanagement",
    titleKey: "TEXT_EVENTS_ALARMS",
    icon: "ty-ic_bell",
    children: [
        {
            path: "eventalarmmanagement",
            section: "EVENTS_AND_ALARMS",
            titleKey: "TEXT_EVENT_RULES",
            component: EventAlarmManagement,
            intialSearchQueryObject: { includeDeleted: false, event: 'any', eventSource: 'any', cabinet: 'any', site: 'any' },
            children: [
                {
                    path: ":id",
                    titleKey: "TEXT_DETAILS",
                    component: EventAlarmDetails,
                    isDetailPage: true
                }
            ]
        },
        {
            path: "alarmmanagement",
            section: "ALARMS",
            titleKey: "TEXT_ALARMS",
            component: AlarmManagement,
            intialSearchQueryObject: {
                includeDeleted: false, cabinet: 'any', event: 'any', alarm: 'any', status: 'ACTIVE',
                from: getAlarmStartFilterTime(), to: moment(new Date()).format(DefaultDateTimeFormats.DateTimeFormat)
            },
            children: [
                {
                    path: ":id",
                    titleKey: "TEXT_DETAILS",
                    component: AlarmDetails,
                    isDetailPage: true
                }
            ]
        },
        {
            path: "alertmanagement",
            section: "ALERTS",
            titleKey: "TEXT_ALERTS",
            component: AlertManagement,
            intialSearchQueryObject: {
                includeDeleted: false, role: 'any', user: '', eventSource: 'any', event: 'any', channel: 'any',
                alertStartTime: getTime(), alertEndTime: getTime(true), eventStartTime: getTime(), eventEndTime: getTime(true)
            },
            children: [
                {
                    path: ":id",
                    titleKey: "TEXT_DETAILS",
                    component: AlertDetails,
                    isDetailPage: true
                }
            ]
        }
    ]
};



// WEBPACK FOOTER //
// ./src/modules/eventAlarms/routes.ts