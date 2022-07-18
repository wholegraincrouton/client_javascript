
import { AlertAction } from "../actions/alert.actions";
import { Alert } from "../types/store";
import { ALERT_SHOW, ALERT_CLEAR } from "../constants/alert.constants";

export function alert(state: Alert= {}, action: AlertAction) {
    switch(action.type) {
        case ALERT_SHOW:{ 
            return { ...action.alert };
        }
        case ALERT_CLEAR:
            return {};
    }

    return state;
}


// WEBPACK FOOTER //
// ./src/modules/shared/reducers/alert.reducer.ts