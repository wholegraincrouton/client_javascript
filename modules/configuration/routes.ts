import { AppRouteInfo } from "../../routes/types";
import LookupManagement from "./components/LookupManagement/LookupManagement";
import LookupDetails from "./components/LookupDetails/LookupDetails";
import LocalisationManagement from "./components/LocalisationManagement/LocalisationManagement";
import ConfigurationManagement from "./components/ConfigurationManagement/ConfigurationManagement";
import ConfigurationDetails from "./components/ConfigurationDetails/ConfigurationDetails";
import LocalisationDetails from "./components/LocalisationDetails/LocalisationDetails";
import CustomerManagement from "../customers/components/CustomerManagement/CustomerManagement";
import CustomerDetails from "../customers/components/CustomerDetails/CustomerDetails";
import BulkDataManagement from "../bulkData/components/BulkDataManagement/BulkDataManagement";
import TemplateManagement from "../template/components/TemplateManagement/TemplateManagement";
import TemplateDetails from "../template/components/TemplateDetails/TemplateDetails";
import FirmwareManagement from "../firmware/components/FirmwareManagement/FirmwareManagement";
import FirmwareDetails from "../firmware/components/FirmwareDetails/FirmwareDetails";
import EventPriorityManagement from "../eventAlarms/components/Priority/EventPriorityManagement/EventPriorityManagement";

export const configurationRouteGroup: AppRouteInfo = {
    path: "/configuration",
    redirectTo: "/configuration/lookupmanagement",
    titleKey: "TEXT_SYSTEM_ADMINISTRATION",
    icon: "ty-icon_setting",
    children: [
        {
            path: "customermanagement",
            section: "CUSTOMER",
            titleKey: "TEXT_CUSTOMERS",
            component: CustomerManagement,
            intialSearchQueryObject: { includeDeleted: false, name: '' },
            children: [
                {
                    path: ":id",
                    titleKey: "TEXT_DETAILS",
                    component: CustomerDetails,
                    isDetailPage: true
                }
            ]
        },
        {
            path: "bulkdatamanagement",
            section: "BULKDATA",
            titleKey: "TEXT_BULKDATA",
            component: BulkDataManagement,
            intialSearchQueryObject: { includeDeleted: false }
        },
        {
            path: "templatemanagement",
            section: "TEMPLATE",
            titleKey: "TEXT_TEMPLATES",
            component: TemplateManagement,
            intialSearchQueryObject: { includeDeleted: false, culture: 'any', section: 'any', key: '', channel: 'EMAIL' },
            children: [
                {
                    path: ":id",
                    titleKey: "TEXT_DETAILS",
                    component: TemplateDetails,
                    isDetailPage: true
                }
            ]
        },
        {
            path: "configurationmanagement",
            section: "CONFIGURATION",
            titleKey: "TEXT_CONFIGURATIONS",
            component: ConfigurationManagement,
            intialSearchQueryObject: { includeDeleted: false, culture: 'any', section: 'any', key: '' },
            children: [
                {
                    path: ":id",
                    titleKey: "TEXT_DETAILS",
                    component: ConfigurationDetails,
                    isDetailPage: true
                }
            ]
        },
        {
            path: "localisationmanagement",
            section: "LOCALISATION",
            titleKey: "TEXT_LOCALISATIONS",
            component: LocalisationManagement,
            intialSearchQueryObject: { includeDeleted: false, culture: 'any', section: 'any', key: '' },
            children: [
                {
                    path: ":id",
                    titleKey: "TEXT_DETAILS",
                    component: LocalisationDetails,
                    isDetailPage: true
                }
            ]
        },
        {
            path: "lookupmanagement",
            section: "LOOKUP",
            titleKey: "TEXT_LOOKUPS",
            component: LookupManagement,
            intialSearchQueryObject: { includeDeleted: false, culture: 'any', section: 'any', key: '' },
            children: [
                {
                    path: ":id",
                    titleKey: "TEXT_DETAILS",
                    component: LookupDetails,
                    isDetailPage: true
                }
            ]
        },
        {
            path: "firmwaremanagement",
            section: "FIRMWARE",
            titleKey: "TEXT_FIRMWARE",
            component: FirmwareManagement,
            intialSearchQueryObject: { includeDeleted: false, version: 'any', from: '', to: '' },
            children: [
                {
                    path: ":id",
                    titleKey: "TEXT_DETAILS",
                    component: FirmwareDetails,
                    isDetailPage: true
                }
            ]
        },
        {
            path: "eventprioritymanagement",
            section: "EVENT_PRIORITIES",
            titleKey: "TEXT_EVENT_PRIORITY",
            component: EventPriorityManagement,
            intialSearchQueryObject: { includeDeleted: false, priority: 'any', event: '' }
        }
    ]
}



// WEBPACK FOOTER //
// ./src/modules/configuration/routes.ts