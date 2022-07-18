import { LookupItem } from "../../types/dto";
import { lookupService, permissionService, contextService } from "../../services";

export const RoleFilter = (item: LookupItem) => {
    let customerId = contextService.getCurrentCustomerId();
    const excludedRolesList = lookupService.getList("LIST_EXCLUDED_ROLES", customerId);
    const canViewExcludedRoles = permissionService.checkIfPermissionExistsForCustomer("VIEW_EXCLUDED_ROLES", customerId);
    let isExcludedRole = excludedRolesList.find(r => r.value == item.value);    
    return !isExcludedRole || (isExcludedRole && canViewExcludedRoles);
}



// WEBPACK FOOTER //
// ./src/modules/shared/components/RoleFilter/RoleFilter.tsx