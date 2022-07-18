import { Dispatch } from "redux";
import { SortDescriptor } from "@progress/kendo-data-query";
import { store } from "src/redux/store";
import * as constants from "../constants/data-grid.constants";
import { PagedResultSet } from "../types/dto";
import { DataGridState } from "../types/store";
import { apiService, customerService } from "../services";
import { userService } from "src/modules/users/services/user.service";
import { cabinetService } from "src/modules/cabinet/services/cabinet.service";
import { firmwareService } from "src/modules/firmware/services/firmware.service";
import { cabinetGroupService } from "src/modules/cabinetGroups/services/cabinetGroup.service";
import { siteService } from "src/modules/sites/services/site.service";

const DEFAULT_PAGE_SIZE = 10;

export const dataGridActions = {
    loadData,
    loadMoreData,
    changeSelection,
    bulkDelete,
    clearData,
    refreshGrid
}

export interface LoadDataSuccessAction {
    type: constants.DATAGRID_LOAD_DATA_SUCCESS;
    gridName: string;
    dataItems: any[];
    continuationToken?: string;
    filter?: {};
    sort: SortDescriptor;
    apiController: string;
}

export interface LoadMoreSuccessAction {
    type: constants.DATAGRID_LOAD_MORE_SUCCESS;
    gridName: string;
    dataItems: any[];
    continuationToken?: string;
}

export interface ChangeSelectionAction {
    type: constants.DATAGRID_CHANGE_SELECTION;
    gridName: string;
    ids: string[];
    selected: boolean;
}

export interface ClearDataAction {
    type: constants.DATAGRID_CLEAR_DATA;
    gridName: string;
}

export type DataGridAction = LoadDataSuccessAction | LoadMoreSuccessAction | ChangeSelectionAction | ClearDataAction;

function loadData(gridName: string, apiController: string, sort: SortDescriptor, filter?: {},
    actionMethod?: string, disableRecordLimit?: boolean, baseService: string = '') {
    return (dispatch: Dispatch<any>) => {
        return loadGridData(sort, dispatch, gridName, filter, apiController, actionMethod, disableRecordLimit, baseService);
    }
}

function refreshGrid(gridName: string, baseService?: string) {
    var state: DataGridState = getGridState(gridName);

    return (dispatch: Dispatch<any>) => {
        if (state != undefined)
            return loadGridData(state.sort, dispatch, gridName, state.filter, state.apiController, undefined, undefined, baseService);
        else
            return Promise.resolve();

    }

}

function loadMoreData(gridName: string, action?: string, baseService?: string) {
    const state = getGridState(gridName);
    if (!state || !state.sort || !state.apiController)
        throw `You must load data with filter before loading more data (datagrid:'${gridName}').`;
    else if (!state.continuationToken)
        throw `No more data to load (datagrid:'${gridName}')`;

    return (dispatch: Dispatch<any>) => {
        let query = { sortBy: state.sort.field, sortDir: state.sort.dir, limit: DEFAULT_PAGE_SIZE, ...state.filter };

        return apiService.get<PagedResultSet<any>>(state.apiController, action || undefined, undefined, query, undefined, undefined, baseService, state.continuationToken)
            .then((resultSet: PagedResultSet<any>) => {

                resultSet.results.forEach(item => item.rowSelected = false);
                dispatch({
                    type: constants.DATAGRID_LOAD_MORE_SUCCESS,
                    gridName: gridName,
                    dataItems: resultSet.results,
                    continuationToken: resultSet.continuationToken
                });
            })
    }
}

function loadGridData(sort: SortDescriptor, dispatch: any, gridName: string, filter: any, apiController: string,
    actionMethod?: string, disableRecordLimit?: boolean, baseService: string = '') {
    let query = { sortBy: sort.field, sortDir: sort.dir, limit: disableRecordLimit ? undefined : DEFAULT_PAGE_SIZE, ...filter };

    return apiService.get<PagedResultSet<any>>(apiController, actionMethod, undefined, query, false, false, baseService)
        .then((resultSet: PagedResultSet<any>) => {
            resultSet.results.forEach(item => item.rowSelected = false);
            dispatch({
                type: constants.DATAGRID_LOAD_DATA_SUCCESS,
                gridName: gridName,
                dataItems: resultSet.results,
                continuationToken: resultSet.continuationToken,
                filter: filter,
                sort: sort,
                apiController: apiController
            });
        })
}

function changeSelection(gridName: string, ids: string[], selected: boolean): ChangeSelectionAction {
    return { type: constants.DATAGRID_CHANGE_SELECTION, gridName: gridName, ids: ids, selected: selected };
}

function bulkDelete(gridName: string, baseService?: string) {
    const state = getGridState(gridName);
    if (!state || !state.sort || !state.apiController)
        throw `You must load data with filter before bulk delete (datagrid:'${gridName}').`;

    let dataItems = state.dataItems.filter(item => item.rowSelected);
    let ids = state.dataItems.filter(item => item.rowSelected).map(item => item.id);

    return (dispatch: Dispatch<any>) => {
        apiService.deleteMultiple(state.apiController, undefined, ids, baseService)
            .then(() => {
                //Refresh data.
                dispatch(loadData(gridName, state.apiController, state.sort, state.filter, undefined, undefined, baseService));
                afterBulkDelete(gridName, ids, dataItems);
            })
    };
}

function clearData(gridName: string) {
    return { type: constants.DATAGRID_CLEAR_DATA, gridName: gridName };
}

function getGridState(gridName: string): DataGridState {
    return (store.getState() as any).dataGrid[gridName];
}

function afterBulkDelete(gridName: string, ids: any[], dataItems: any[]) {
    switch (gridName) {
        case "CustomerGrid":
            let customers = customerService.getCustomerList();

            ids.forEach((id) => {
                let item = customers.find(c => c.id == id);

                if (item)
                    customers.splice(customers.indexOf(item), 1);
            });

            customerService.setCustomerList(customers);
            break;
        case "UserGrid":
            userService.clearCustomerUserList();
            break;
        case "CabinetGrid":
            cabinetService.clearCabinetList();
            break;
        case "CabinetGroupGrid":
            cabinetGroupService.clearCabinetGroupList();
            break;
        case "SiteGrid":
            siteService.clearSitesList();
            break;
        case "FirmwareGrid":
            firmwareService.clearFirmwareList();
            dataItems.forEach(f => {
                firmwareService.deleteFile(f.version, f.fileName);
            });
            break;
    }
}


// WEBPACK FOOTER //
// ./src/modules/shared/actions/data-grid.actions.ts