import { store } from "src/redux/store"
import { getFormNames, isDirty } from 'redux-form'
import { localise, confirmDialogService } from ".";

let globalIsDirty = false;

export const globalDirtyService = {
    isDirty: globalIsDirty, //Maintains the manual isDirty flag 
    checkGlobalDirtyConfirmation,
    checkGlobalDirtyConfirmationRouter,
    setDirty,
    showDirtyConfirmation
}

//This is to handle browser window close event.
window.onbeforeunload = (ev) => {
    if (isPageDirty())
        ev.returnValue = localise("CONFIRMATION_UNSAVED_CHANGES");
}

function checkGlobalDirtyConfirmation(proceedCallback: () => void, stopCallback?: () => void, messageKey?: string) {

    if (isPageDirty()) {
        confirmDialogService.showDialog(
            messageKey || "CONFIRMATION_UNSAVED_CHANGES",
            () => { proceedCallback(); setDirty(false); },
            () => { stopCallback && stopCallback(); })
    }
    else {
        proceedCallback();
    }
}

//react-router <Prompt/> will call this function upon router navigation.
function checkGlobalDirtyConfirmationRouter(
    message: string,
    routerCallback: (allowRouteTransition: boolean) => void) {

    checkGlobalDirtyConfirmation(() => { routerCallback(true) }, () => { routerCallback(false) }, message);
}

//Checks whether anything in the page (redux-form or custom dirty) is dirty.
function isPageDirty() {
    return globalIsDirty || isAnyReduxFormDirty();
}

//Redux-form dirty check is handled automatically using this.
//Developer doesn't have to set the 'dirty' flag manually.
function isAnyReduxFormDirty() {
    const storeState = store.getState();
    let formNames = getFormNames()(storeState);

    for (let i: number = 0; i < formNames.length; i++) {
        let isCurrentFormDirty = isDirty(formNames[i])(storeState);
        if (isCurrentFormDirty)
            return true;
    }

    return false;
}

//Updates the manual isDirty flag. Call this manually if you are not using redux-form.
function setDirty(dirty: boolean) {
    globalIsDirty = dirty;
}

function showDirtyConfirmation(proceedActionFn: () => void, messageKey?: string) {
    confirmDialogService.showDialog(messageKey || 'CONFIRMATION_UNSAVED_CHANGES', () => { proceedActionFn(); }, () => { })
}



// WEBPACK FOOTER //
// ./src/modules/shared/services/global-dirty.service.ts