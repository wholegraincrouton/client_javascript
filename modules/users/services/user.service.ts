import { apiService } from "../../shared/services";
import { BasicUser } from "src/modules/shared/types/dto";
import * as apiConstants from "src/modules/shared/constants/api.constants";
import { AccessibleItem, User, UserAccessRequestResult } from "../types/dto";

const service = apiConstants.ACCOUNTS;

let customerUsers: { customerId: string, userList: BasicUser[] }[] = [];

export const userService =
{
    generatePIN,
    sendActivationEmail,
    enableTwoFactorAuth,
    getEffectiveCustomerForUser,
    getUsers,
    getAccessibleItems,
    clearCustomerUserList,
    processAccessRequest
};

function generatePIN(userId: string) {
    return apiService.get('user', 'GetPIN', undefined, { userId })
}

function sendActivationEmail(id: string) {
    return apiService.post('account', 'SendActivationEmail', { id }, [], null, false, service)
}

function enableTwoFactorAuth(user: User) {
    return apiService.post('account', 'EnableTwoFactorAuth', user, [], null, false, service)
}

function getEffectiveCustomerForUser(userId: string) {
    return apiService.get<string>('user', 'GetEffectiveCustomerForUser', undefined, { userId })
}

function getUsers(customerId: string, includeDeletedData?: boolean) {
    // Global variable to avoid api calls everytime.
    if (customerUsers == undefined || customerUsers.find(cu => cu.customerId == customerId) == undefined || includeDeletedData == true) {
        return apiService.get<BasicUser[]>('user', 'GetUsersByCustomer', undefined, { customerId, includeDeletedData })
            .then((data) => {
                if (customerUsers == undefined) {
                    customerUsers = [];
                }
                if (customerUsers.find(cu => cu.customerId == customerId) == undefined && includeDeletedData != true) { // Avoid data duplication in race condition
                    customerUsers.push({ customerId: customerId, userList: data });
                }
                return data;
            });
    }
    else {
        var promise = new Promise<BasicUser[]>(resolve => {
            let users = customerUsers.find(cu => cu.customerId == customerId);
            resolve(users != undefined ? users.userList : []);
        });
        return promise;
    }
}

function getAccessibleItems(customerId: string, userId: string) {
    return apiService.get<AccessibleItem[]>('cabinet', 'GetUserAccessibleItemsByCustomer', undefined, { customerId, userId })
        .then((data) => {
            return data;
        })
}

function clearCustomerUserList() {
    if (customerUsers != undefined)
        customerUsers = []
}

function processAccessRequest(userId: string, adminUserId: string, grant: string) {
    let isGrant = grant.toLowerCase() == 'true' ? true : false;
    
    return apiService.post<UserAccessRequestResult>(
        'user', 'Access', { userId, adminUserId, isGrant }, [], null, false);
}


// WEBPACK FOOTER //
// ./src/modules/users/services/user.service.ts