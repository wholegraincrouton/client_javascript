import { apiService, contextService } from "../../services"
import { ListItem } from "../../types/dto";

let customerAccessGroups: { customerId: string, AccessGroupList : ListItem[] }[] = [];

export const accessGroupService = {
    getAccessGroups,
    clearAccessGroups
}

function getAccessGroups(includeDeletedData? : boolean) {
    let customerId = contextService.getCurrentCustomerId();

    if (customerAccessGroups == undefined || customerAccessGroups.find(cu => cu.customerId == customerId) == undefined || includeDeletedData == true) {
        return getAccessGroupList(customerId, includeDeletedData);
    }
    else {
        var promise = new Promise<ListItem[]>(resolve => {
            let accessGroups = customerAccessGroups.find(cu => cu.customerId == customerId);
            resolve(accessGroups != undefined ? accessGroups.AccessGroupList : []);
        });
        return promise;
    }
}

function clearAccessGroups() {
    if (customerAccessGroups != undefined)
    customerAccessGroups = []
}

function getAccessGroupList(customerId : string, includeDeletedData? : boolean){
    return apiService.get<ListItem[]>('Groups', 'GetCustomerAccessGroups', undefined, {includeDeletedData})
        .then((data) => {
            if (customerAccessGroups != undefined && customerAccessGroups.find(cu => cu.customerId == customerId) == undefined
                && includeDeletedData != true ) 
            { // Avoid data duplication in race condition
                customerAccessGroups.push({ customerId: customerId, AccessGroupList: data });
            }
            return data;
        });
}



// WEBPACK FOOTER //
// ./src/modules/shared/components/AccessGroupList/access-group-list-service.ts