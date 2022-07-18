import { apiService } from "./api.service";
import { confirmDialogService } from "./confirm-dialog.service";
import { customerService } from "./customer.service";
import { globalDirtyService } from "./global-dirty.service";
import { localise } from "./localisation.service";
import { lookupService } from "./lookup.service";
import { navService } from "./nav.service";
import { permissionService } from './permission.service'
import { contextService } from "./context.service";
import { notificationDialogService } from "./notification-dialog.service";
import { configService } from "./configuration.service";
import { applicationService } from "./application.service";
import { accountSessionService } from "./account-session.service";
import { utilityService } from "./util.service";
import { routeService } from "src/routes/route.service";
import { uiDomService } from "./ui-dom.service";

export {
    apiService,
    confirmDialogService,
    notificationDialogService,
    customerService,
    globalDirtyService,
    localise,
    configService,
    lookupService,
    permissionService,
    navService,
    contextService,
    applicationService,
    accountSessionService,
    utilityService,
    routeService,
    uiDomService
}


// WEBPACK FOOTER //
// ./src/modules/shared/services/index.ts