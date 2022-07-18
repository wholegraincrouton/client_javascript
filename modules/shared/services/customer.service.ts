import { applicationService, permissionService, apiService } from ".";
import { BasicCustomer } from "../types/dto";
import { Customer } from "src/modules/customers/types/dto";
import { contextService } from "./context.service";

export const customerService = {
    getCustomerList,
    getCustomerName,
    getCurrentCustomerData,
    setCustomerList,
    getFirstCustomerId,
    getCustomerData,
}

function getCustomerList() {
    return applicationService.customerList;
}

function getCustomerName(id: string) {
    let customer = applicationService.customerList.find(c => c.id == id);
    return customer && customer.name;
}

function getCurrentCustomerData() {
    let currentCustomerId = contextService.getCurrentCustomerId();
    let customer = applicationService.customerList.find(c => c.id == currentCustomerId);
    return customer;
}

function setCustomerList(customerList: BasicCustomer[]) {
    applicationService.customerList = sortCustomerList(customerList);
}

function sortCustomerList(customerList: BasicCustomer[]) {
    return customerList.sort(function (first, second) {
        if (first.name.toLowerCase() < second.name.toLowerCase()) { return -1; }
        if (first.name.toLowerCase() > second.name.toLowerCase()) { return 1; }
        return 0;
    });
}

function getFirstCustomerId(permission: string, isSysCostomerAllowed?: boolean) {
    let permittedCustomers = permissionService.getPermittedCustomersForSpecificPermission(permission);

    if (!isSysCostomerAllowed) {
        permittedCustomers = permittedCustomers.filter(c => c != '*');
    }

    let firstCustomerId;
    for (let customer of applicationService.customerList) {
        if (permittedCustomers.indexOf(customer.id) > -1) {
            firstCustomerId = customer.id;
            break;
        }
    }
    return firstCustomerId;
}

function getCustomerData(){
    return apiService.get<Customer[]>('customer', undefined, undefined, {})
        .then((data) => {  
            return data["results"] as Customer[];
        });   
}


// WEBPACK FOOTER //
// ./src/modules/shared/services/customer.service.ts