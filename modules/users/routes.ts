import { AppRouteInfo } from "../../routes/types";
import UserManagement from "./components/UserManagement/UserManagement";
import UserDetails from "./components/UserDetails/UserDetails";
import PermissionManagement from "../security/components/PermissionManagement/PermissionManagement";
import PermissionDetails from "../security/components/PermissionDetails/PermissionDetails";
import UserGroupManagement from "../userGroups/components/UserGroupManagement/UserGroupManagement";
import UserGroupDetails from "../userGroups/components/UserGroupDetails/UserGroupDetails";
import { UserAccess } from "./components/UserAccess/UserAccess";


export const userRouteGroup: AppRouteInfo = {
    path: "/users",
    redirectTo: "/users/usermanagement",
    titleKey: "TEXT_USERS",
    icon: "ty-icon_Users",
    children: [
        {
            path: "usermanagement",
            section: "USER",
            titleKey: "TEXT_USERS",
            component: UserManagement,
            intialSearchQueryObject: { includeDeleted: false, name: '', role: 'any' },
            children: [
                {
                    path: ":id",
                    titleKey: "TEXT_DETAILS",
                    component: UserDetails,
                    isDetailPage: true
                }
            ]
        },
        {
            path: "usergroupmanagement",
            section: "USERGROUP",
            titleKey: "TEXT_USER_GROUPS",
            component: UserGroupManagement,
            intialSearchQueryObject: { includeDeleted: false, name: '' },
            children: [
                {
                    path: ":id",
                    titleKey: "TEXT_DETAILS",
                    component: UserGroupDetails,
                    isDetailPage: true
                }
            ]
        },
        {
            path: "permissionmanagement",
            section: "PERMISSION",
            titleKey: "TEXT_ROLES",
            component: PermissionManagement,
            intialSearchQueryObject: { includeDeleted: false, role: 'any' },
            children: [
                {
                    path: ":id",
                    titleKey: "TEXT_DETAILS",
                    component: PermissionDetails,
                    isDetailPage: true
                }
            ]
        },
        {
            path: "access/:userId/:adminId/:isGrant",
            component: UserAccess,
            section: "PUBLIC",
            layout: "anonymous",
            isPublic: true
        }
    ]
}


// WEBPACK FOOTER //
// ./src/modules/users/routes.ts