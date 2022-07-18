import * as constants from "../constants/notification-dialog.constants";
import {  NotificationDialogState } from "../types/store";
import { NotificationDialogAction } from "../services/notification-dialog.service";

export function notificationDialog(state: NotificationDialogState = {visible: false}, action: NotificationDialogAction) {
    switch (action.type) {
        case constants.NOTIFICATION_DIALOG_SHOW:
            return {
                visible: action.visibility,
                message: action.message,
                title: action.title,
                hasSave: action.hasSave
            };
        case constants.NOTIFICATION_DIALOG_HIDE:
            return {
                visible: false
            };
    }
    return state;
}


// WEBPACK FOOTER //
// ./src/modules/shared/reducers/notification-dialog.reducer.ts