import { AppRouteInfo } from "./types";
import { appRoutes } from "./app-routes";
import { contextService } from "../modules/shared/services";

let flattenedRoutes: AppRouteInfo[] = [];
let currentRoute: AppRouteInfo | undefined;

const adminSections: string[] = [
    'USER', 'PERMISSION', 'CUSTOMER', 'BULKDATA', 'TEMPLATE', 'CONFIGURATION',
    'LOCALISATION', 'LOOKUP', 'FIRMWARE', 'EVENT_PRIORITIES', 'HELPCENTRE'
];

export const routeService = {
    routes: flattenedRoutes,
    initializeRoutes,
    setCurrentRoute,
    getCurrentRoute,
    adminSections
}

function initializeRoutes() {
    flattenNestedRoutes(flattenedRoutes, appRoutes);
}

function setCurrentRoute(route: AppRouteInfo) {
    currentRoute = route;
    contextService.setCurrentSection(route.section || "*");
}

function getCurrentRoute() {
    return currentRoute;
}

//Recursively process nested routes and update some nesting info fields.
function flattenNestedRoutes(flattenedRoutes: AppRouteInfo[], nestedRoutes: AppRouteInfo[], parent?: AppRouteInfo) {
    nestedRoutes.forEach(r => {
        r.parent = parent;
        if (parent) {
            r.path = (parent.path + "/" + r.path).replace("//", "/");
            r.section = (r.section && r.section.length > 0) ? r.section : parent.section;
        }

        if (r.children != null)
            flattenNestedRoutes(flattenedRoutes, r.children, r);

        flattenedRoutes.push(r);
    })
}


// WEBPACK FOOTER //
// ./src/routes/route.service.ts