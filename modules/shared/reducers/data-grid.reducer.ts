import { DataGridState } from "../types/store";
import { DataGridAction } from "../actions/data-grid.actions";
import * as constants from "../constants/data-grid.constants";

export function dataGrid(state: {} = {}, action: DataGridAction): {} {
    switch (action.type) {
        case constants.DATAGRID_LOAD_DATA_SUCCESS:
            let gridState1: DataGridState = {
                dataItems: action.dataItems,
                continuationToken: action.continuationToken,
                filter: action.filter,
                sort: action.sort,
                apiController: action.apiController
            };
            return {
                ...state, [action.gridName]: gridState1
            }

        case constants.DATAGRID_LOAD_MORE_SUCCESS:
            let gridState2: DataGridState = state[action.gridName];
            return {
                ...state, [action.gridName]: {
                    ...gridState2,
                    dataItems: [...gridState2.dataItems, ...action.dataItems],
                    continuationToken: action.continuationToken
                }
            }

        case constants.DATAGRID_CHANGE_SELECTION:
            let gridState3: DataGridState = state[action.gridName];
            gridState3.dataItems.forEach(item => {
                if (action.ids.find(id => item.id == id))
                    item.rowSelected = action.selected;
            })
            return {
                ...state, [action.gridName]: {
                    ...gridState3
                }
            }

        case constants.DATAGRID_CLEAR_DATA:
            let copyState = { ...state };
            delete copyState[action.gridName]
            return copyState;
    }
    return state;
}



// WEBPACK FOOTER //
// ./src/modules/shared/reducers/data-grid.reducer.ts