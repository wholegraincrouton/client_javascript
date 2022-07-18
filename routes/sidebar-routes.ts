import { AppRouteInfo } from "./types";
import { overviewRouteGroup } from "../modules/dashboard/routes";
import { userRouteGroup } from "../modules/users/routes";
import { configurationRouteGroup } from "../modules/configuration/routes";
import { cabinetRouteGroup } from "../modules/cabinet/routes";
import { accessGroupRouteGroup } from "../modules/accessGroups/routes"
import { reportRouteGroup } from "../modules/reports/routes";
import { eventAlarmsRouteGroup } from "../modules/eventAlarms/routes";
import { externalSystemRouteGroup } from "src/modules/externalSystems/routes";
import { helpCentreRouteGroup } from "src/modules/helpCentre/routes";

export const sidebarRoutes: AppRouteInfo[] = [
  overviewRouteGroup,
  userRouteGroup,
  cabinetRouteGroup,
  accessGroupRouteGroup,
  externalSystemRouteGroup,
  reportRouteGroup,
  eventAlarmsRouteGroup,
  configurationRouteGroup,
  helpCentreRouteGroup
];



// WEBPACK FOOTER //
// ./src/routes/sidebar-routes.ts