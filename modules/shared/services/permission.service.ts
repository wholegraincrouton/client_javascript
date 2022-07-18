import { AppRouteInfo } from "../../../routes/types";
import { contextService } from "./context.service";
import { applicationService } from ".";
import { apiService } from "../../shared/services";
import { PermissionConfig } from "src/modules/security/types/dto";
import { customerService } from "./customer.service";

const webRoles: string[] = [
    "PLATFORM_ADMIN",
    "CIC_SIT_ENGINEER",
    "CIC_CLIENT_SUPPORT_ENGINEER",
    "CIC_FIELD_TECHNICIAN",
    "CIC_SALES_MANAGER",
    "CIC_PRODUCTION_MANAGER",
    "CIC_DEVOPS_MANAGER",
    "CIC_FINANCE_MANAGER",
    "CIC_CHANNEL_SALES_MANAGER",
    "CUSTOMER_ADMIN",
    "CABINET_ADMIN",
    "SECURITY_USER_ADMIN",
    "BUSINESS_USER_ADMIN",
    "SYSTEM_MONITOR",
    "CABINET_SUPERVISOR"
];

let customerRoles: { customerId: string, permissionConfigList: PermissionConfig[] }[] = [];

export const permissionService = {
    canActivateRoute,
    InitializeNavigationRoutes,
    canPermissionGrant,
    getPermittedCustomersBySection,
    isActionPermittedForCustomer,
    checkIfPermissionExists,
    checkIfPermissionExistsForCustomer,
    getPermittedCustomersForSpecificPermission,
    getPermissionsForRole,
    getConfiguredRoles,
    clearRoleList,
    hasWebPermissions,
    webRoles
}

function canActivateRoute(section?: string) {
    let permissionsObj = getPermissions();

    if (section != undefined && permissionsObj) {
        var permissionKey = 'NAV_' + section;
        return checkIfPermissionExists(permissionKey);
    }
    return false;
}

function InitializeNavigationRoutes(routes?: AppRouteInfo[], customerId?: string) {
    if (customerId) {
        routes && routes.forEach(sectionEle => {
            sectionEle.canAccess = checkIfPermissionExistsForCustomer('NAV_' + sectionEle.section, customerId);
        });
    } else {
        routes && routes.forEach(sectionEle => {
            sectionEle.canAccess = checkIfPermissionExists('NAV_' + sectionEle.section);

            if(sectionEle.section == "EXTERNAL_SYSTEM") {
                sectionEle.canAccess = sectionEle.canAccess && checkVASPermissionsExist(sectionEle.section);
            }
        });
    }
}

function checkVASPermissionsExist(section?: string) {
    var canAccess = false;
    var currentCustomer = customerService.getCurrentCustomerData();    
    switch(section){
        case "EXTERNAL_SYSTEM":
            canAccess =  currentCustomer && currentCustomer.integrationStatus == "ENABLED" ? true : false;
    }      
    return canAccess;
}

function canPermissionGrant(action: string) {
    const section = contextService.getCurrentContext().section;
    var permissionKey = section + "_" + action;
    return checkIfPermissionExists(permissionKey);
}

function isActionPermittedForCustomer(action: string, selectedCustomer?: string, section?: string) {
    const context = contextService.getCurrentContext();
    selectedCustomer = selectedCustomer || context.customerId;
    section = section || context.section;
    var permissionKey = section + "_" + action;

    return selectedCustomer == 'any' ?
        checkIfPermissionExists(permissionKey) :
        checkIfPermissionExistsExactMatch(`${selectedCustomer}:${permissionKey}`);
}

function getPermittedCustomersBySection(permissionSuffix?: string): string[] {
    var permittedCustomers: string[] = [];
    var section = contextService.getCurrentContext().section;

    getPermissions().forEach((element: string) => {
        if (element.includes(section ? (section + '_' + permissionSuffix) : '')) {
            var customerId = element.split(/[:]/)[0];
            permittedCustomers.push(customerId)
        }
    });

    return permittedCustomers;
}

function getPermittedCustomersForSpecificPermission(permission: string) {
    var permittedCustomers: string[] = [];

    getPermissions().forEach((element: string) => {
        if (element.includes(permission)) {
            var customerId = element.split(/[:]/)[0];
            permittedCustomers.push(customerId)
        }
    });

    return permittedCustomers;
}

function getPermissions() {
    return applicationService.permissions;
}

function checkIfPermissionExists(permissionToCheck: string) {
    var permissions = getPermissions();
    for (let permission of permissions) {
        if (permission.endsWith(":" + permissionToCheck))
            return true;
    }
    return false;
}

function checkIfPermissionExistsExactMatch(permissionToCheck: string) {
    var permissions = getPermissions();
    for (let permission of permissions) {
        if (permission == permissionToCheck)
            return true;
    }
    return false;
}

function checkIfPermissionExistsForCustomer(permissionToCheck: string, customer: string = '') {
    var permissions = getPermissions();
    const customerId = customer || contextService.getCurrentCustomerId();
    
    for (let permission of permissions) {
        let values = permission.split(":");
        
        if (values[0] == customerId && values[1] == permissionToCheck)
            return true;
    }
    return false;
}

function getPermissionsForRole(customerId: string, role: string) {
    return apiService.get<string[]>('permissions', 'GetPermissionsByRole', undefined, { customerId, role })
        .then((data) => { return data });
}

function getConfiguredRoles(customerId: string) {
    if (customerRoles == undefined || customerRoles.find(cu => cu.customerId == customerId) == undefined) {
        return apiService.get<PermissionConfig[]>('permissions', 'GetRolesByCustomer', undefined, { customerId })
            .then((data) => {
                if (customerRoles.find(cu => cu.customerId == customerId) == undefined) {
                    customerRoles.push({ customerId: customerId, permissionConfigList: data });
                }
                return data;
            });
    }
    else {
        var promise = new Promise<PermissionConfig[]>(resolve => {
            let roles = customerRoles.find(cu => cu.customerId == customerId);
            resolve(roles != undefined ? roles.permissionConfigList : []);
        });
        return promise;
    }
}

function clearRoleList() {
    if (customerRoles != undefined)
        customerRoles = []
}

function hasWebPermissions(customerId: string, roles: string[]) {
    return roles.some(r => webRoles.includes(r));
}


// WEBPACK FOOTER //
// ./src/modules/shared/services/permission.service.ts