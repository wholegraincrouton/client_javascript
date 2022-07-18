import { AppRouteInfo } from "../../routes/types";
import { Content } from "./components/Content/Content";
import { ContactDetails } from "./components/ContactDetails/ContactDetails";

export const helpCentreRouteGroup: AppRouteInfo = {
    path: "/help",
    titleKey: "TEXT_HELP",
    redirectTo: "/help/overview",
    section: "HELPCENTRE",
    icon: "ty-ic_import_contacts",
    children: [
        {
            path: "/overview",
            section: "HELPCENTRE",
            titleKey: "TEXT_HELP",
            component: Content,
            children: [
                {
                    path: "/contact_us",
                    titleKey: "TEXT_CONTACT_US",
                    section: "HELPCENTRE",
                    component: ContactDetails
                }
            ]
        }
    ]
}


// WEBPACK FOOTER //
// ./src/modules/helpCentre/routes.ts