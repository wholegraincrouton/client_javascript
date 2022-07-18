import { store } from "src/redux/store"
import * as constants from "../constants/confirm-dialog.constants";
import { localise } from ".";

export const confirmDialogService = {
    showDialog,
    hideDialog,
    dialogYes,
    dialogNo,
}

let yesCallback: () => void;
let noCallback: (() => void) | undefined;

function showDialog(messageKey: string, yesCallbackFn: () => void, noCallbackFn?: () => void,
    titleKey?: string) {

    titleKey = titleKey || "CONFIRMATION_TITLE";
    yesCallback = yesCallbackFn;
    noCallback = noCallbackFn;

    store.dispatch(showConfirmDialogAction(localise(messageKey), localise(titleKey)));
}

function hideDialog() {
    store.dispatch(hideConfirmDialogAction());
}

function dialogYes() {
    yesCallback && yesCallback();
}

function dialogNo() {
    noCallback && noCallback();
}

export interface ConfirmDialogAction {
    type: constants.CONFIRM_DIALOG_SHOW | constants.CONFIRM_DIALOG_HIDE;
    visibility?: boolean,
    message?: string,
    title?: string
}

function showConfirmDialogAction(message: string, title: string): ConfirmDialogAction {
    return {
        type: constants.CONFIRM_DIALOG_SHOW,
        visibility: true,
        message,
        title
    };
}

function hideConfirmDialogAction(): ConfirmDialogAction {
    return {
        type: constants.CONFIRM_DIALOG_SHOW,
    };
}


// WEBPACK FOOTER //
// ./src/modules/shared/services/confirm-dialog.service.ts