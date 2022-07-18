import { contextService, applicationService } from ".";
import { Lookup } from "../types/dto";

export const lookupService = {
    getList,
    getText,
    getRemark,
    getTextFromMultipleLookups,
    getMergedList,
    getRemarkFromMultipleLookups,
    getLookupsByCustomer,
    getListByCustomer
}

function getText(lookupKey: string, value: string, customerId?: string, culture?: string, section?: string) {
    const list = getList(lookupKey, customerId, culture, section);
    const item = list.find(item => item.value == value);
    return item ? item.text : `${lookupKey}:${value}`;
}

function getTextFromMultipleLookups(lookupKeys: string[], value: string, customerId?: string, culture?: string, section?: string) {
    let text = value;
    lookupKeys.forEach((key) => {
        let list = getList(key, customerId, culture, section);
        let item = list.find(item => item.value == value);

        if (item && item.text)
            text = item.text;
    });
    return text;
}

function getRemark(lookupKey: string, value: string, customerId?: string, culture?: string, section?: string) {
    const list = getList(lookupKey, customerId, culture, section);
    const item = list.find(item => item.value == value);
    return item ? item.remark : `${lookupKey}:${value}`;
}

function getRemarkFromMultipleLookups(lookupKeys: string[], value: string, customerId?: string, culture?: string, section?: string) {
    for (let key of lookupKeys) {
        let list = getList(key, customerId, culture, section);
        let item = list.find(item => item.value == value);

        if (item && item.remark) {
            return item.remark;
        }
    }
    return '';
}

function getList(key: string, customerId?: string, culture?: string, section?: string) {

    const uiContext = contextService.getCurrentContext();
    customerId = customerId || uiContext.customerId;
    culture = culture || uiContext.culture;
    section = section || uiContext.section;

    //Get the matching possibilities and choose the first from the matches.
    //(lookups are already sorted according to priority)
    var matches = applicationService.lookups.filter(l =>
        l.key == key
        && (l.customerId == "*" || (customerId && l.customerId == customerId))
        && (l.culture == "*" || (culture && l.culture == culture))
        && (l.section == "*" || (section && l.section == section)));

    return matches[0] ? matches[0].items : [];
}

function getMergedList(keys: string[], customerId?: string, culture?: string, section?: string) {

    const uiContext = contextService.getCurrentContext();
    customerId = customerId || uiContext.customerId;
    culture = culture || uiContext.culture;
    section = section || uiContext.section;

    var matches = applicationService.lookups.filter(l =>
        keys.some((key) => key == l.key)
        && (l.customerId == "*" || (customerId && l.customerId == customerId))
        && (l.culture == "*" || (culture && l.culture == culture))
        && (l.section == "*" || (section && l.section == section)));

    let list: any[] = [];
    matches.forEach((lookup) => {
        list = list.concat(lookup.items);
    });
    return list;
}

function getLookupsByCustomer(customerId: string) {
    let lookupKeys: Lookup[] = [];
    lookupKeys = applicationService.lookups.filter(l =>
        l.customerId == customerId
    );
    return lookupKeys;
}

function getListByCustomer(keys: string[], customerId: string) {
    var matches = applicationService.lookups.filter(l =>
        keys.some((key) => key == l.key)
        && (customerId && l.customerId == customerId));

    let list: any[] = [];
    matches.forEach((lookup) => {
        list = list.concat(lookup.items);
    });
    return list;
}



// WEBPACK FOOTER //
// ./src/modules/shared/services/lookup.service.ts