import { apiService } from "src/modules/shared/services";
import { ItemGroup, ItemGroupItem } from "../types/dto";

let customerItemGroups: { customerId: string, itemGroupList: ItemGroup[] }[] = [];

export const itemGroupService =
{
    getItemGroups,
    getItemGroupItems,
    clearItemGroupList
};

function getItemGroups(customerId: string) {
    // Global variable to avoid api calls everytime.
    if (customerItemGroups == undefined || customerItemGroups.find(cu => cu.customerId == customerId) == undefined) {
        return apiService.get<ItemGroup[]>('itemGroup', 'GetItemGroupsByCustomer', undefined, { customerId })
            .then((data) => {
                if (customerItemGroups.find(cu => cu.customerId == customerId) == undefined) {
                    customerItemGroups.push({ customerId: customerId, itemGroupList: data });
                }
                return data;
            });
    }
    else {
        var promise = new Promise<ItemGroup[]>(resolve => {
            let itemGroups = customerItemGroups.find(cu => cu.customerId == customerId);
            resolve(itemGroups != undefined ? itemGroups.itemGroupList : []);
        });
        return promise;
    }
}

function getItemGroupItems(id: string) {
    return apiService.get<ItemGroupItem[]>('itemGroup', 'GetItemListByItemGroup', undefined, { itemGroupId: id })
        .then((data) => { return data });
}

function clearItemGroupList() {
    if (customerItemGroups != undefined)
        customerItemGroups = [];
}


// WEBPACK FOOTER //
// ./src/modules/itemGroups/services/itemGroup.service.ts