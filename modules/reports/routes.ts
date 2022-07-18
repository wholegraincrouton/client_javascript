import { AppRouteInfo } from "../../routes/types";
import { Reports } from "./components/Reports";
import { UserEventHistoryReport } from "./components/CabinetReports/EventHistoryReport/UserEventHistoryReport/UserEventHistoryReport";
import { EventHistoryReport } from "./components/CabinetReports/EventHistoryReport/EventHistoryReport";
import { CabinetEventHistoryReport } from "./components/CabinetReports/EventHistoryReport/CabinetEventHistoryReport/CabinetEventHistoryReport";
import { ItemEventHistoryReport } from "./components/CabinetItemReports/ItemEventHistoryReport/ItemEventHistoryReport";
import { ActiveAlarmsReport } from "./components/AlarmReports/ActiveAlarmsReport/ActiveAlarmsReport";
import { CurrentItemStatusReport } from "./components/CabinetItemReports/CurrentItemStatusReport/CurrentItemStatusReport";
import { TransactionVolumeReport } from "./components/CabinetItemReports/TransactionVolumeReport/TransactionVolumeReport";
import { TodaysEventsReport } from "./components/CabinetReports/TodaysEventsReport/TodaysEventsReport";
import CurrentOverdueItemsReport from "./components/CabinetItemReports/CurrentOverdueItemsReport/CurrentOverdueItemsReport";
import { OnTimeReturnsReport } from "./components/CabinetItemReports/OnTimeReturnsReport/OnTimeReturnsReport";
import { OverdueReturnsReport } from "./components/CabinetItemReports/OverdueReturnsReport/OverdueReturnsReport";
import UserAccessAuditReport from "./components/AuditReports/UserAccessAuditReport/UserAccessAuditReport";
import UserRecordAuditReport from "./components/AuditReports/UserRecordAuditReport/UserRecordAuditReport";
import ReportSubscriptionManagement from "../subscriptions/components/SubscriptionManagement/SubscriptionManagement";
import ReportSubscriptionDetails from "../subscriptions/components/SubscriptionDetails/SubscriptionDetails";
import CustomerDetailReport from "./components/CustomerReports/CustomerDetailsReport/CustomerDetailsReport";
import CustomerCabinetReport from "./components/CustomerReports/CustomerCabinetReport/CustomerCabinetReport";
import CustomerResourceReport from "./components/CustomerReports/CustomerResourceReport/CustomerResourceReport";
import ItemRecordReport from "./components/AuditReports/ItemRecordReport/ItemRecordReport";
import { ItemWiseTransactionReport } from "./components/CabinetItemReports/ItemWiseTransactionReport/ItemWiseTransactionReport";
import { UserWiseTransactionReport } from "./components/CabinetItemReports/UserWiseTransactionReport/UserWiseTransactionReport";
import { UserAccessibleItemsReport } from "./components/CabinetItemReports/UserAccessibleItemsReport/UserAccessibleItemsReport";

export const reportRouteGroup: AppRouteInfo = {
    path: "/reports",
    titleKey: "TEXT_REPORTS",
    redirectTo: '/reports/overview',
    section: "REPORTS",
    icon: "ty-icon_statics",
    children: [
        {
            path: "overview",
            section: "REPORTS",
            titleKey: "TEXT_REPORTS",
            component: Reports,
            children: [
                {
                    path: "todays_events_report",
                    section: "REPORTS",
                    titleKey: "TEXT_TODAYS_EVENTS",
                    component: TodaysEventsReport
                },
                {
                    path: "cabinet_history_report",
                    titleKey: "TEXT_CABINET_HISTORY",
                    section: "REPORTS",
                    component: EventHistoryReport
                },
                {
                    path: "user_event_history",
                    titleKey: "TEXT_CABINET_HISTORY_USER",
                    section: "REPORTS",
                    component: UserEventHistoryReport
                },
                {
                    path: "cabinet_events_history",
                    titleKey: "TEXT_CABINET_HISTORY_CABINET",
                    section: "REPORTS",
                    component: CabinetEventHistoryReport
                },
                {
                    path: "item_events_history",
                    titleKey: "TEXT_ITEM_EVENT_HISTORY",
                    section: "REPORTS",
                    component: ItemEventHistoryReport
                },
                {
                    path: "current_overdue_items_report",
                    section: "REPORTS",
                    titleKey: "TEXT_CURRENT_OVERDUE_ITEMS",
                    component: CurrentOverdueItemsReport
                },
                {
                    path: "current_item_status_report",
                    section: "REPORTS",
                    titleKey: "TEXT_CURRENT_ITEM_STATUS",
                    component: CurrentItemStatusReport
                },
                {
                    path: "total_transaction_volume_report",
                    section: "REPORTS",
                    titleKey: "TEXT_TRANSACTION_VOLUME",
                    component: TransactionVolumeReport
                },
                {
                    path: "on_time_returns_history_report",
                    section: "REPORTS",
                    titleKey: "TEXT_ON_TIME_RETURNS_REPORT",
                    component: OnTimeReturnsReport
                },
                {
                    path: "overdue_returns_history_report",
                    section: "REPORTS",
                    titleKey: "TEXT_OVERDUE_RETURNS_HISTORY",
                    component: OverdueReturnsReport
                },
                {
                    path: "user_access_report",
                    titleKey: "TEXT_USER_ACCESS_REPORT",
                    section: "REPORTS",
                    component: UserAccessAuditReport
                },
                {
                    path: "user_audit_report",
                    titleKey: "TEXT_USER_RECORD_REPORT",
                    section: "REPORTS",
                    component: UserRecordAuditReport
                },
                {
                    path: "customer_details_report",
                    titleKey: "TEXT_CUSTOMER_DETAILS_REPORT",
                    section: "REPORTS",
                    component: CustomerDetailReport
                },
                {
                    path: "customer_cabinet_report",
                    titleKey: "TEXT_CUSTOMER_CABINET_REPORT",
                    section: "REPORTS",
                    component: CustomerCabinetReport
                },
                {
                    path: "customer_resource_report",
                    titleKey: "TEXT_CUSTOMER_RESOURCE_REPORT",
                    section: "REPORTS",
                    component: CustomerResourceReport
                },
                {
                    path: "active_alarms_report",
                    titleKey: "TEXT_ACTIVE_ALARMS",
                    section: "REPORTS",
                    component: ActiveAlarmsReport
                },
                {
                    path: "item_record_report",
                    titleKey: "TEXT_ITEM_RECORDS",
                    section: "REPORTS",
                    component: ItemRecordReport
                },
                {
                    path: "item_wise_transaction_report",
                    titleKey: "TEXT_ITEM_WISE_TRANSACTION_REPORT",
                    section: "REPORTS",
                    component: ItemWiseTransactionReport
                },
                {
                    path: "user_wise_transaction_report",
                    titleKey: "TEXT_USER_WISE_TRANSACTION_REPORT",
                    section: "REPORTS",
                    component: UserWiseTransactionReport
                },
                {
                    path: "current_user_accessible_items_report",
                    titleKey: "TEXT_CURRENT_USER_ACCESSIBLE_ITEMS_REPORT",
                    section: "REPORTS",
                    component: UserAccessibleItemsReport
                }
            ]
        },
        {
            path: "reportsubscriptionmanagement",
            section: "REPORTSUBSCRIPTION",
            titleKey: "TEXT_REPORT_SUBSCRIPTIONS",
            component: ReportSubscriptionManagement,
            intialSearchQueryObject: { includeDeleted: false, report: 'any', user: 'any' },
            children: [
                {
                    path: ":id",
                    titleKey: "TEXT_DETAILS",
                    component: ReportSubscriptionDetails,
                    isDetailPage: true
                }
            ]
        }
    ]
}


// WEBPACK FOOTER //
// ./src/modules/reports/routes.ts