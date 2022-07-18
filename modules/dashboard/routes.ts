import { AppRouteInfo } from "../../routes/types";
import Dashboard from "./Dashboard";

export const overviewRouteGroup: AppRouteInfo = {
    path: "/dashboard",
    redirectTo: "/dashboard/overview",
    titleKey: "TEXT_DASHBOARD",
    section:"DASHBOARD",
    icon: "ty-ic_timeline",
    children: [
        {
            path: "/overview",
            section: "DASHBOARD",
            component: Dashboard
        }
    ]
}


// WEBPACK FOOTER //
// ./src/modules/dashboard/routes.ts