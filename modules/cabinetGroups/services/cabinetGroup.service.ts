import { apiService } from "src/modules/shared/services";
import { ListItem, CabinetConfiguration } from "src/modules/shared/types/dto";

let customerCabinetGroups: { customerId: string, cabinetGroupList: ListItem[] }[] = [];

export const cabinetGroupService =
{
    getCabinetGroups,
    getCabinetGroupConfigurations,
    clearCabinetGroupList
};

function getCabinetGroups(customerId: string) {
    // Global variable to avoid api calls everytime.
    if (customerCabinetGroups == undefined || customerCabinetGroups.find(cu => cu.customerId == customerId) == undefined) {
        return apiService.get<ListItem[]>('cabinetGroup', 'GetCabinetGroupsByCustomer', undefined, { customerId })
            .then((data) => {
                if (customerCabinetGroups.find(cu => cu.customerId == customerId) == undefined) {
                    customerCabinetGroups.push({ customerId: customerId, cabinetGroupList: data });
                }
                return data;
            });
    }
    else {
        var promise = new Promise<ListItem[]>(resolve => {
            let cabinetGroups = customerCabinetGroups.find(cu => cu.customerId == customerId);
            resolve(cabinetGroups != undefined ? cabinetGroups.cabinetGroupList : []);
        });
        return promise;
    }
}

function getCabinetGroupConfigurations(cabinetGroupId: string) {
    return apiService.get<CabinetConfiguration[]>('cabinetGroup', 'GetCabinetGroupConfigurationsByCabinetGroup', undefined, { cabinetGroupId })
        .then((data) => { return data });
}

function clearCabinetGroupList() {
    if (customerCabinetGroups != undefined)
        customerCabinetGroups = [];
}


// WEBPACK FOOTER //
// ./src/modules/cabinetGroups/services/cabinetGroup.service.ts