import { store } from "src/redux/store";
import { customerActions } from "../actions/customer.actions";
import { UIContext } from "../types/dto";

let currentCustomerId: string;
let currentSection: string;
let currentCulture: string;
let dateFormat: string;
let timeFormat: string;
let dateTimeFormat: string;

export const contextService = {
    getCurrentContext,
    getCurrentCustomerId,
    setCurrentCustomer,
    setCurrentSection,
    setCurrentCulture,
    setCurrentDateTimeFormat,
    getCurrentDateFormat,
    getCurrentTimeFormat,
    getCurrentDateTimeFormat
}

function getCurrentContext(): UIContext {
    let customerId = window.localStorage.getItem('contextCustomer') || currentCustomerId;

    return {
        customerId: customerId,
        section: currentSection,
        culture: currentCulture
    }
}

function getCurrentCustomerId() {
    return currentCustomerId || '';
}

function setCurrentCustomer(customerId: string) {
    currentCustomerId = customerId;
    window.localStorage.setItem('contextCustomer', currentCustomerId);
    store.dispatch(customerActions.changeCustomer(customerId));
}

function setCurrentSection(section: string) {
    currentSection = section;
}

function setCurrentCulture(culture: string) {
    currentCulture = culture;
}

function setCurrentDateTimeFormat(dateString: any, timeString: any){
    dateFormat = dateString || '';
    timeFormat = timeString || '';
    dateTimeFormat = dateString ? `${dateString} ${timeString}` : '';
}

function getCurrentDateFormat(){
    return dateFormat;
}

function getCurrentTimeFormat(){
    return timeFormat;
}

function getCurrentDateTimeFormat(){
    return dateTimeFormat;
}



// WEBPACK FOOTER //
// ./src/modules/shared/services/context.service.ts