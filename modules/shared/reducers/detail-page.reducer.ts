import * as constants from "../constants/detail-page.constants";
import { DetailPageAction } from "../actions/detail-page.actions";

export function detailPage(state: {} = {}, action: DetailPageAction): {} {
    switch (action.type) {
        case constants.DETAIL_PAGE_LOAD_SUCCESS:
        case constants.DETAIL_PAGE_SAVE_SUCCESS:
            return {
                ...state,
                [action.pageName]: { item: action.item }
            }

        case constants.DETAIL_PAGE_DELETE_SUCCESS:
        case constants.DETAIL_PAGE_CLEAR_STORE:
            let copyState = { ...state };
            delete copyState[action.pageName]
            return copyState;
    }
    return state;
}



// WEBPACK FOOTER //
// ./src/modules/shared/reducers/detail-page.reducer.ts