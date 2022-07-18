import { Country, CountryState } from "../types/dto";
import { lookupService } from "./lookup.service";

let countryList: Country[] = [];

export const countryService = {
    getCountryList,
    getStateList,
    getCountryName,
    getStateName
}

function getCountryList(): Country[] {
    if (countryList.length == 0) {
        countryList = lookupService.getList('LIST_COUNTRIES').map(i => {
            return {
                value: i.value || '',
                text: i.text || '',
                children: lookupService.getList(i.childLookupKey || "").map(s => {
                    return {
                        value: s.value || '',
                        text: s.text || ''
                    }
                })
            }
        });
    }

    return countryList;
}

function getStateList(countryValue: string): CountryState[] {
    const country = countryList.find(c => c.value == countryValue);
    return country ? country.children : [];
}

function getCountryName(countryValue: string) {
    const countryList = countryService.getCountryList();
    const country = countryList.find(c => c.value == countryValue);
    return country ? country.text : '';
}

function getStateName(countryValue: string, stateValue: string) {
    const countryList = countryService.getCountryList();
    const country = countryList.find(c => c.value == countryValue);
    if (country && country.children) {
        const countryState = country.children.find(s => s.value == stateValue);
        return countryState ? countryState.text : '';
    }
    return '';
}



// WEBPACK FOOTER //
// ./src/modules/shared/services/country.service.ts