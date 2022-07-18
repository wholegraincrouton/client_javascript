import { blobApiService } from "src/modules/shared/services/blob-api.service";
import { store } from "src/redux/store";
import cookies from "js-cookie";
import * as constants from "../constants/customer-logo.constants";

const cookieName = "Customer";
let customerLogo: any;

export const customerLogoService = {
    setCustomerLogo,
    removeCustomerLogo,
    uploadCustomerLogoFile,
    deleteCustomerLogoFile,
    changeCustomerLogo
};

function setCustomerLogo(file: any) {
    customerLogo = file;
}

function removeCustomerLogo() {
    customerLogo = undefined;
}

function uploadCustomerLogoFile(url: string) {
    return blobApiService.putBlob(url, customerLogo.size, customerLogo);
}

function deleteCustomerLogoFile(url: string) {
    return blobApiService.deleteBlob(url);
}

function changeCustomerLogo(hasLogo: boolean, logoURL?: string, hasChanged: boolean = false) {
    if (hasChanged) {
        let customerCookie = cookies.get(cookieName);
        if (customerCookie != undefined) {
            let customerInfo = JSON.parse(customerCookie);
            customerInfo.customer.hasLogo = hasLogo;
            customerInfo.customer.logoURL = logoURL;
            const cookieContent = JSON.stringify({ customer: customerInfo.customer });
            cookies.set(cookieName, cookieContent);
        }
    }

    store.dispatch({
        type: constants.CHANGE_CUSTOMER_LOGO,
        hasLogo,
        logoURL
    });
}



// WEBPACK FOOTER //
// ./src/modules/customers/services/customer-logo.service.ts