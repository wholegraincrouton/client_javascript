import * as spinnerConsts from "../constants/spinner.constants";
import { GlobalSpinnerState } from "../types/store";
import { SpinnerAction } from "../actions/spinner.actions";

export const spinner = (state: GlobalSpinnerState = { pendingRequestCount: 0}, action: SpinnerAction): GlobalSpinnerState => {
    switch (action.type) {
        case spinnerConsts.SHOW_SPINNER: 
            return { ...state, pendingRequestCount: state.pendingRequestCount + 1 };        
        case spinnerConsts.HIDE_SPINNER: {
            if(state.pendingRequestCount > 0)
                return { ...state, pendingRequestCount: state.pendingRequestCount - 1 };
            else 
                return { ...state };
        }
    }
    return state
}


// WEBPACK FOOTER //
// ./src/modules/shared/reducers/spinner.reducer.ts