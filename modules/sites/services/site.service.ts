import { apiService } from "src/modules/shared/services";
import { CabinetConfiguration } from "src/modules/shared/types/dto";
import { Site } from "../types/dto";

let customerSites: { customerId: string, sitesList: Site[] }[] = [];

export const siteService = {
    getSite,
    getSites,
    clearSitesList,
    getSiteConfigurations
};

function getSite(siteId: string) {
    return apiService.get<Site>('site', undefined, [siteId]);
}

function getSites(customerId: string) {
    // Global variable to avoid api calls everytime.
    if (customerSites == undefined || customerSites.find(cu => cu.customerId == customerId) == undefined) {
        return apiService.get<Site[]>('site', 'GetSitesByCustomer', undefined, { customerId })
            .then((data) => {
                if (customerSites.find(cu => cu.customerId == customerId) == undefined) {
                    customerSites.push({ customerId: customerId, sitesList: data });
                }
                return data;
            });
    }
    else {
        var promise = new Promise<Site[]>(resolve => {
            let sites = customerSites.find(cu => cu.customerId == customerId);
            resolve(sites != undefined ? sites.sitesList : []);
        });
        return promise;
    }
}

function getSiteConfigurations(site: string) {
    return apiService.get<CabinetConfiguration[]>('site', 'GetSiteConfigurationsBySite', undefined, { site })
        .then((data) => { return data });
}

function clearSitesList() {
    if (customerSites != undefined)
        customerSites = [];
}


// WEBPACK FOOTER //
// ./src/modules/sites/services/site.service.ts