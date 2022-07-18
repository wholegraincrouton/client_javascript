import { AppRouteInfo } from "src/routes/types";
import ExternalSystemManagement from "./components/ExternalSystemManagement/ExternalSystemManagement";
import ExternalSystemDetails from "./components/ExternalSystemDetails/ExternalSystemDetails";

export const externalSystemRouteGroup: AppRouteInfo = {
    path: "/externalsystems",
    redirectTo: "/externalsystems/externalsystemmanagement",
    titleKey: "TEXT_EXTERNAL_SYSTEMS",
    icon: "ty-icon_share",
    children: [
        {
            path: "externalsystemmanagement",
            section: "EXTERNAL_SYSTEM",
            titleKey: "TEXT_EXTERNAL_SYSTEMS",
            component: ExternalSystemManagement,
            intialSearchQueryObject: {
                includeDeleted: false, integrationSystem: 'any', integrationStatus: 'any'
            },
            children: [
                {
                    path: ":id",
                    titleKey: "TEXT_DETAILS",
                    component: ExternalSystemDetails,
                    isDetailPage: true
                }
            ]
        }
    ]
}



// WEBPACK FOOTER //
// ./src/modules/externalSystems/routes.ts