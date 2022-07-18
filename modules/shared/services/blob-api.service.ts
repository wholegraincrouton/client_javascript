import axios, { AxiosResponse, AxiosRequestConfig, Method } from "axios";
import { alertActions } from "src/modules/shared/actions/alert.actions";
import { store } from "src/redux/store";
import { spinnerActions } from "src/modules/shared/actions/spinner.actions";
import { RequestInfo } from "../types/dto";

export const blobApiService = {
    getBlob,
    putBlob,
    deleteBlob
};

function getHeaders(contentLength: number): any {
    return {
        "x-ms-blob-type": "BlockBlob",
        "x-ms-blob-content-type": "aplication/octet-stream",
        "Content-Length": contentLength
    }
}

function getBlob(url: string) {
    return makeHttpRequest("get", url);
}

function putBlob(url: string, contentLength: number, data: any) {
    return makeHttpRequest("put", url, getHeaders(contentLength), data);
}

function deleteBlob(url: string) {
    return makeHttpRequest("delete", url, undefined, null, true);
}

function makeHttpRequest(httpMethod: Method, url: string,
    headers?: any, data: any = null, hideError: boolean = false) {

    var busyRequestInfo = getBusyRequestInfo();
    beginBusyRequest(busyRequestInfo);

    let requestConfig: AxiosRequestConfig = {
        method: httpMethod,
        url: url,
        headers: headers,
        data: data
    };

    let promise = axios.request(requestConfig)
        .then((response: AxiosResponse) => {
            endBusyRequest(busyRequestInfo);
            return response;
        });

    promise.catch((err: any) => {
        handleError(err.response, busyRequestInfo, hideError);
    });

    return promise;
}

function handleError(response: AxiosResponse, busyRequestInfo: RequestInfo, hideError: boolean = false) {
    endBusyRequest(busyRequestInfo);

    var errorKey = '';

    if (response) {
        console.error(response.data);
        if (response.status == 401) {
            errorKey = "ERROR_UNAUTHORIZED_ACCESS";
        }
        if (response.status == 403) {
            errorKey = "ERROR_FORBIDDEN_ACCESS";
        }
        else {
            errorKey = response.data;
        }
    }
    else {
        errorKey = "ERROR_UNKNOWN";
    }

    if (errorKey.length > 0 && !hideError)
        alertActions.showError(errorKey);

    return errorKey;
}

function beginBusyRequest(requestInfo: RequestInfo) {
    setTimeout(() => {
        if (requestInfo.requestPending) {
            store.dispatch(spinnerActions.showSpinner());
            requestInfo.spinnerVisible = true;
        }
    }, 500);
}

function endBusyRequest(requestInfo: RequestInfo) {
    requestInfo.requestPending = false;
    if (requestInfo.spinnerVisible) {
        store.dispatch(spinnerActions.hideSpinner());
    }
}

function getBusyRequestInfo(): RequestInfo {
    return {
        requestPending: true,
        spinnerVisible: false
    };
}


// WEBPACK FOOTER //
// ./src/modules/shared/services/blob-api.service.ts