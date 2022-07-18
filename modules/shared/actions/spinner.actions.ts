import * as spinnerConsts from "../constants/spinner.constants";

export const spinnerActions = {
    showSpinner,
    hideSpinner
};

export interface SpinnerAction {
    type: spinnerConsts.SHOW_SPINNER | spinnerConsts.HIDE_SPINNER
}

function showSpinner(): SpinnerAction {
    return {type: spinnerConsts.SHOW_SPINNER};
}

function hideSpinner(): SpinnerAction {
    return {type: spinnerConsts.HIDE_SPINNER};
}


// WEBPACK FOOTER //
// ./src/modules/shared/actions/spinner.actions.ts