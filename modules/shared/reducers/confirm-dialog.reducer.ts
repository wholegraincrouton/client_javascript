import * as constants from "../constants/confirm-dialog.constants";
import { ConfirmDialogState } from "../types/store";
import { ConfirmDialogAction } from "../services/confirm-dialog.service";

export function confirmDialog(state: ConfirmDialogState = {visible: false}, action: ConfirmDialogAction) {
    switch (action.type) {
        case constants.CONFIRM_DIALOG_SHOW:
            return {
                visible: action.visibility,
                message: action.message,
                title: action.title
            };
        case constants.CONFIRM_DIALOG_HIDE:
            return {
                visible: false
            };
    }
    return state;
}


// WEBPACK FOOTER //
// ./src/modules/shared/reducers/confirm-dialog.reducer.ts