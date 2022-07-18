import { AppRouteInfo } from "../../routes/types";
import AccessGroupManagement from "./components/AccessGroupManagement/AccessGroupManagement";
import AccessGroupDetails from "./components/AccessGroupDetails/AccessGroupDetails";

export const accessGroupRouteGroup: AppRouteInfo = {
    path: "/accessgroups",
    redirectTo: '/accessgroups/overview',
    titleKey: "TEXT_ACCESSGROUPS",
    section: "ACCESSGROUP",
    icon: "ty-icon_key",
    children: [
        {
            path: "/overview",
            section: "ACCESSGROUP",
            titleKey: "TEXT_ACCESSGROUPS",
            component: AccessGroupManagement,
            intialSearchQueryObject: { includeDeleted: false, groupName: '' },
            children: [
                {
                    path: ":id",
                    titleKey: "TEXT_DETAILS",
                    component: AccessGroupDetails,
                    isDetailPage: true
                }
            ]
        }
    ]
}



// WEBPACK FOOTER //
// ./src/modules/accessGroups/routes.ts