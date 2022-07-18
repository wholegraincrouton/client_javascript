import * as alertConstants from '../constants/alert.constants';
import { Alert } from '../types/store';
import { store } from "../../../redux/store";
import { localise } from '../services';

export const alertActions = {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    clearAlert
};

let alertTimeoutSubscription: any = null;

export interface AlertAction {
    type: alertConstants.ALERT_SHOW | alertConstants.ALERT_CLEAR,
    alert?: Alert
}

function clearAlert() {
    store.dispatch({ type: alertConstants.ALERT_CLEAR });
}

function showSuccess(messageKey: string) {
    showAlert('success', messageKey)(store.dispatch);
}

function showError(messageKey: string) {
    showAlert('danger', messageKey)(store.dispatch);
}

function showWarning(messageKey: string) {
    showAlert('warning', messageKey)(store.dispatch);
}

function showInfo(messageKey: string) {
    showAlert('info', messageKey)(store.dispatch);
}

function showAlert(alertType: string, messageKey: string) {
    return (dispatch: any) => {
        dispatch({ type: alertConstants.ALERT_SHOW, alert: { alertType, message: localise(messageKey) } });

        if (alertTimeoutSubscription != null)
            clearTimeout(alertTimeoutSubscription);

        alertTimeoutSubscription = setTimeout(() => {
            clearAlert()
        }, 3000);
    }
}


// WEBPACK FOOTER //
// ./src/modules/shared/actions/alert.actions.ts