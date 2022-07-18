import axios, { AxiosResponse, AxiosRequestConfig, Method } from "axios";
import { alertActions } from "../actions/alert.actions";
import { spinnerActions } from "../actions/spinner.actions";
import { store } from "src/redux/store"
import { RequestInfo } from "../types/dto";
import { confirmDialogService, contextService, accountSessionService } from ".";
import * as constants from "src/modules/shared/constants/api.constants";
import { appInsights } from "src/AppInsights";
import { USER_SESSION_TIMEOUT } from "../constants/custom-events.constants";

axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['X-Frame-Options'] = 'SAMEORIGIN'
axios.defaults.withCredentials = true;
axios.defaults.baseURL = getBaseUrl(constants.DEFAULT);

export const coreApiService = {
    get,
    post,
    put,
    delete: deleteRecord,
    deleteMultiple
};

function get<T>(controller: string, action: string = '', urlParams: string[] = [],
    queryParams: any = null, ignoreDisplayErrorCode: any = undefined, hideSpinner: boolean = false, baseService: string = '', pageToken?: string) {
    return makeHttpRequest<T>("get", controller, action, urlParams, queryParams, null, ignoreDisplayErrorCode, hideSpinner, baseService, pageToken);
}

function post<T>(controller: string, action: string = '', data: any = null, urlParams: string[] = [],
    ignoreDisplayErrorCode: any = undefined, hideSpinner: boolean = false, baseService: string = '') {
    return makeHttpRequest<T>("post", controller, action, urlParams, undefined, data, ignoreDisplayErrorCode, hideSpinner, baseService);
}

function put<T>(controller: string, action: string = '', data: any = null, baseService: string = '') {
    return makeHttpRequest<T>("put", controller, action, undefined, undefined, data, undefined, false, baseService);
}

function deleteRecord(controller: string, action: string = '', id: string, baseService: string = '') {
    return makeHttpRequest("delete", controller, action, [id], null, null, undefined, false, baseService);
}

function deleteMultiple(controller: string, action: string = '', ids: string[], baseService: string = '') {
    return makeHttpRequest("delete", controller, action, undefined, { ids: ids }, null, undefined, false, baseService);
}

function getContextHeaders(pageToken?: string): any {
    const uiContext = contextService.getCurrentContext();

    let headers = {
        "X-CustomerId": uiContext.customerId,
        "X-Culture": uiContext.culture
    };

    if (pageToken) {
        headers["X-PageToken"] = pageToken;
    }

    return headers;
}

function makeHttpRequest<T>(
    httpMethod: Method,
    controller: string,
    action: string = '',
    urlParams: string[] | undefined = undefined,
    queryParams: any = null,
    data: any = null,
    ignoreDisplayErrorCode: any = undefined,
    hideSpinner: boolean = false,
    service: string = '',
    pageToken?: string) {

    var busyRequestInfo = getBusyRequestInfo();
    beginBusyRequest(busyRequestInfo, hideSpinner);

    let requestConfig: AxiosRequestConfig = {
        method: httpMethod,
        url: createUrl(controller, action, urlParams),
        params: queryParams,
        headers: getContextHeaders(pageToken),
        data: data
    };

    if (service) {
        requestConfig.baseURL = getBaseUrl(service);
    }

    let promise = axios.request(requestConfig)
        .then((response: AxiosResponse<T>) => {
            endBusyRequest(busyRequestInfo);
            return response;
        });

    promise.catch((err: any) => {
        handleError(err.response, busyRequestInfo, ignoreDisplayErrorCode);
    });

    return promise;
}

function handleError(response: AxiosResponse, busyRequestInfo: RequestInfo, ignoreDisplayErrorCode: any = undefined) {
    endBusyRequest(busyRequestInfo);

    var errorKey = '';

    if (response) {
        console.error(response.data);
        if (response.status == 401) {
            var userName = accountSessionService.getLoggedInUserDisplayName();
            accountSessionService.clearSession();

            if (response.statusText == "Session Expired") {
                appInsights.trackEvent({ name: USER_SESSION_TIMEOUT, properties: { userName } })
                window.location.href = "/#/account/sessionexpired";
            }
            else {
                window.location.href = "/#/account/login";
            }

            errorKey = "ERROR_UNAUTHORIZED_ACCESS";
        }
        if (response.status == 403) {
            errorKey = "ERROR_FORBIDDEN_ACCESS";
        }
        else if (response.status == 409) {
            confirmDialogService.showDialog("CONFIRMATION_CONCURRENCY",
                () => { window.location.reload() });
        }
        else {
            errorKey = response.data;
        }
    }
    else {
        errorKey = "ERROR_UNKNOWN";
    }

    if (errorKey.length > 0 && !(ignoreDisplayErrorCode || ignoreDisplayErrorCode == 'ERROR_RECORD_ALREADY_DELETED'))
        alertActions.showError(errorKey);

    return errorKey;
}

function createUrl(controler: string, action: string, urlParams?: string[]): string {
    let url = controler + (action != '' ? '/' + action : '');

    if (urlParams != null) {
        url += '/' + urlParams.join("/");
    }

    return url;
}

function beginBusyRequest(requestInfo: RequestInfo, hideSpinner: boolean) {
    setTimeout(() => {
        if (requestInfo.requestPending && !hideSpinner) {
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

function getBaseUrl(service: string) {
    let apiBaseUrl = '';

    switch (service) {
        case constants.ACCOUNTS:
            apiBaseUrl = appConfig.userAccountApiPort ? `${appConfig.apiUrl}${appConfig.userAccountApiPort}/api` : `${appConfig.apiUrl}/accounts/api`;
            break;
        case constants.REPORTS:
            apiBaseUrl = appConfig.reportsPortalApiPort ? `${appConfig.apiUrl}${appConfig.reportsPortalApiPort}/api` : `${appConfig.apiUrl}/reports/api`;
            break;
        case constants.DEVICES:
            apiBaseUrl = appConfig.devicemanagementApiPort ? `${appConfig.apiUrl}${appConfig.devicemanagementApiPort}/api` : `${appConfig.apiUrl}/devices/api`;
            break;
        case constants.DEFAULT:
            apiBaseUrl = appConfig.defaultApiPort ? `${appConfig.apiUrl}${appConfig.defaultApiPort}/api` : `${appConfig.apiUrl}/core/api`;
            break;
    }

    return apiBaseUrl;
}



// WEBPACK FOOTER //
// ./src/modules/shared/services/core-api.service.ts