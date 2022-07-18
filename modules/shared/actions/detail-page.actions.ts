import { Dispatch } from "redux";
import * as constants from "../constants/detail-page.constants";
import { apiService } from "../services";
import { DetailObject } from "../types/store";
import { DataUpdateResult } from "../types/dto";

export const detailPageActions = {
    loadData,
    saveData,
    deleteItem,
    clearStore
}

export interface LoadSuccessAction {
    type: constants.DETAIL_PAGE_LOAD_SUCCESS;
    pageName: string;
    item: DetailObject;
}

export interface SaveSuccessAction {
    type: constants.DETAIL_PAGE_SAVE_SUCCESS;
    pageName: string;
    item: DetailObject;
}

export interface DeleteSuccessAction {
    type: constants.DETAIL_PAGE_DELETE_SUCCESS;
    pageName: string;
}

export interface ClearAction {
    type: constants.DETAIL_PAGE_CLEAR_STORE;
    pageName: string;
}

export type DetailPageAction = LoadSuccessAction | SaveSuccessAction | DeleteSuccessAction | ClearAction;

function loadData(pageName: string, apiController: string, id: string, newObjectGenerator?: () => any, baseService? : string) {
    const promise = (id == "new") ?
        Promise.resolve<DetailObject>(newObjectGenerator ? newObjectGenerator() : { id: "" })
        :
        apiService.get<DetailObject>(apiController, undefined, [id], undefined, undefined, undefined, baseService);

    return (dispatch: Dispatch<DetailPageAction>) => {
        promise.then(result => {
            dispatch({ type: constants.DETAIL_PAGE_LOAD_SUCCESS, pageName, item: result })
        }, () => {
            dispatch({ type: constants.DETAIL_PAGE_CLEAR_STORE, pageName })
        });

        return promise;
    }
}

function saveData(pageName: string, apiController: string, itemToSave: DetailObject, baseService? : string) {

    const promise = (itemToSave.id == "") ?
        apiService.post<DataUpdateResult>(apiController, undefined, itemToSave, undefined, undefined, undefined, baseService) :
        apiService.put<DataUpdateResult>(apiController, undefined, itemToSave, baseService);

    return (dispatch: Dispatch<DetailPageAction>) => {
        promise.then(result => {
            dispatch({ type: constants.DETAIL_PAGE_SAVE_SUCCESS, pageName, item: { ...itemToSave, ...result } })
        })
        return promise;
    }
}

function deleteItem(pageName: string, apiController: string, id: string, baseService? : string) {
    return (dispatch: Dispatch<DetailPageAction>) => {
        return apiService.delete(apiController, undefined, id, baseService)
            .then(() => {
                dispatch({ type: constants.DETAIL_PAGE_DELETE_SUCCESS, pageName })
            })
    }
}

function clearStore(pageName: string) {
    return { type: constants.DETAIL_PAGE_CLEAR_STORE, pageName }
}


// WEBPACK FOOTER //
// ./src/modules/shared/actions/detail-page.actions.ts