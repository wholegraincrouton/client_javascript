import { apiService } from "src/modules/shared/services";
import { UserGroup} from "../types/dto";

let customerUserGroups: { customerId: string, userGroupList: UserGroup[] }[] = [];

export const userGroupService = {
    getUserGroups,
    clearUserGroupList
};

function getUserGroups(customerId: string) {
    // Global variable to avoid api calls everytime.
    if (customerUserGroups == undefined || customerUserGroups.find(cu => cu.customerId == customerId) == undefined) {
        return apiService.get<UserGroup[]>('userGroup', 'GetUserGroupsByCustomer', undefined, { customerId })
            .then((data) => {
                if (customerUserGroups.find(cu => cu.customerId == customerId) == undefined) {
                    customerUserGroups.push({ customerId: customerId, userGroupList: data });
                }
                return data;
            });
    }
    else {
        var promise = new Promise<UserGroup[]>(resolve => {
            let userGroups = customerUserGroups.find(cu => cu.customerId == customerId);
            resolve(userGroups != undefined ? userGroups.userGroupList : []);
        });
        return promise;
    }
}

function clearUserGroupList() {
    if (customerUserGroups != undefined)
        customerUserGroups = [];
}



// WEBPACK FOOTER //
// ./src/modules/userGroups/services/userGroup.service.ts