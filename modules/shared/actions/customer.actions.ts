import * as constants from "../constants/customer.constants";

export const customerActions = {
    changeCustomer
};

export interface CustomerAction {
    type: constants.CUSTOMER_CHANGE,
    id: string
}

function changeCustomer(id: string) {
    return { type: constants.CUSTOMER_CHANGE, id: id };
}


// WEBPACK FOOTER //
// ./src/modules/shared/actions/customer.actions.ts