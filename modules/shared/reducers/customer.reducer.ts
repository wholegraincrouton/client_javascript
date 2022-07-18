import { CUSTOMER_CHANGE } from "../constants/customer.constants";
import { CustomerAction } from "../actions/customer.actions";

export function customer(state: string = '', action: CustomerAction) {
    switch (action.type) {
        case CUSTOMER_CHANGE:
            return action.id;
    }
    return state;
}


// WEBPACK FOOTER //
// ./src/modules/shared/reducers/customer.reducer.ts