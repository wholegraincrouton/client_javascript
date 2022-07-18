import { AppRouteInfo } from "../../routes/types";
import CabinetManagemnet from "./components/CabinetManagement/CabinetManagement";
import CabinetDetails from "./components/CabinetDetails/CabinetDetails";
import CabinetControlCenterContainer from "./components/CabinetControlCenter/CabinetControlCenterContainer";
import DeviceUpdateManagement from "../deviceUpdates/components/DeviceUpdateManagement/DeviceUpdateManagement";
import DeviceUpdateDetails from "../deviceUpdates/components/DeviceUpdateDetails/DeviceUpdateDetails";
import ItemGroupManagement from "../itemGroups/components/ItemGroupManagement/ItemGroupManagement";
import ItemGroupDetails from "../itemGroups/components/ItemGroupDetails/ItemGroupDetails";
import SiteManagement from "../sites/components/SiteManagement/SiteManagement";
import SiteDetails from "../sites/components/SiteDetails/SiteDetails";

export const cabinetRouteGroup: AppRouteInfo = {
    path: '/cabinet',
    redirectTo: '/cabinet/cabinetmanagement',
    titleKey: 'TEXT_CABINETS',
    icon: "ty-ic_cabinet",
    children: [
        {
            path: "cabinetmanagement",
            section: "CABINET",
            titleKey: "TEXT_CABINETS",
            component: CabinetManagemnet,
            intialSearchQueryObject: { includeDeleted: false, site: 'any', name: '', itemCount: 0, area: 'any', firmwareVersion: 'any' },
            children: [
                {
                    path: ":id",
                    titleKey: "TEXT_DETAILS",
                    component: CabinetDetails,
                    isDetailPage: true,
                    children: [
                        {
                            path: "controlCenter",
                            titleKey: "TEXT_CABINET_CONTROL_CENTER",
                            component: CabinetControlCenterContainer
                        }
                    ]
                }
            ]
        },        
        {
            path: "sitemanagement",
            section: "SITE",
            titleKey: "TEXT_SITES",
            component: SiteManagement,
            intialSearchQueryObject: { includeDeleted: false, label: '', type: 'any' },
            children: [
                {
                    path: ":id",
                    titleKey: "TEXT_DETAILS",
                    component: SiteDetails,
                    isDetailPage: true
                }
            ]
        },
        {
            path: "itemgroupmanagement",
            section: "ITEMGROUP",
            titleKey: "TEXT_ITEM_GROUPS",
            component: ItemGroupManagement,
            intialSearchQueryObject: { includeDeleted: false, name: '', maxItemsPerUser: 'any' },
            children: [
                {
                    path: ":id",
                    titleKey: "TEXT_DETAILS",
                    component: ItemGroupDetails,
                    isDetailPage: true
                }
            ]
        },       
        {
            path: "deviceupdatemanagement",
            section: "DEVICEUPDATE",
            titleKey: "TEXT_DEVICEUPDATES",
            component: DeviceUpdateManagement,
            intialSearchQueryObject: { includeDeleted: false, label: '', type: 'any' },
            children: [
                {
                    path: ":id",
                    titleKey: "TEXT_DETAILS",
                    component: DeviceUpdateDetails,
                    isDetailPage: true
                }
            ]
        }
    ]
}


// WEBPACK FOOTER //
// ./src/modules/cabinet/routes.ts