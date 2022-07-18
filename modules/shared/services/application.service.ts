import { LocalisationText, Lookup, Configuration, ListItem, BasicCustomer } from "../types/dto";
import { coreApiService } from "./core-api.service";
import { contextService } from ".";

let localisationTexts: LocalisationText[] = [];
let lookups: Lookup[] = [];
let configurations: Configuration[] = [];
let customerList: BasicCustomer[] = [];
let permissions: string[] = [];

export const applicationService = {
    initializeApplicationData,
    initializeLookups,
    initializeLocalisations,
    initializePermittedLocalisations,
    clearSensitiveData,
    localisationTexts,
    lookups,
    configurations,
    customerList,
    permissions
}

function initializeApplicationData(isAuthenticated: boolean) {

    let promises: Promise<any>[] = [];

    if (isAuthenticated) {
        promises.push(
            initializePermittedLocalisations(),
            initialisePermittedConfigurations(),
            initializeLookups(),
            initialiseCustomers(),
            initializePermissions());
    }
    else {
        promises.push(
            initializeLocalisations(),
            initialiseConfigurations());
    }

    return Promise.all(promises);
}

function clearSensitiveData() {
    let imageURLConfigKeys = [
        "URL_IMG_LOGO_PRODUCT_BG_WHITE",
        "URL_IMG_LOGO_PRODUCT_BG_DARK",
        "URL_IMG_LOGO_PRODUCT_BG_WHITE_HORIZONTAL",
        "URL_IMG_LOGO_PRODUCT_BG_DARK_HORIZONTAL",
        "URL_IMG_LOGO_PRODUCT_SYMBOL"
    ];

    lookups.length = 0;
    customerList.length = 0;
    permissions.length = 0;
    configurations = configurations.filter((config) => {
        return imageURLConfigKeys.some(k => k == config.key);
    });
}

function refreshDataArray<T>(action: string, array: T[]) {
    return coreApiService.get<T[]>("application", action)
        .then(response => {
            array.length = 0;
            array.push(...response.data);
        });
}

function initializeLocalisations() {
    return refreshDataArray<LocalisationText>("GetUILocalisations", localisationTexts);
}

function initializePermittedLocalisations() {
    return refreshDataArray<LocalisationText>("GetPermittedUILocalisations", localisationTexts);
}

function initializeLookups() {
    return refreshDataArray<Lookup>("GetUILookups", lookups);
}

function initialiseConfigurations() {
    return refreshDataArray<Configuration>("GetConfigurations", configurations);
}

function initialisePermittedConfigurations() {
    return refreshDataArray<Configuration>("GetPermittedConfigurations", configurations);
}

function initialiseCustomers() {
    return new Promise<void>(resolve => {
        refreshDataArray<ListItem>("GetCustomerList", customerList)
            .then(() => {
                contextService.setCurrentCustomer(customerList[0].id);
                contextService.setCurrentDateTimeFormat(customerList[0].dateFormat, customerList[0].timeFormat);                
                resolve();
            });
    });
}

function initializePermissions() {
    return refreshDataArray<string>("GetPermissions", permissions);
}



// WEBPACK FOOTER //
// ./src/modules/shared/services/application.service.ts