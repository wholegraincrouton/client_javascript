import { coreApiService } from "./core-api.service";
import { AxiosResponse } from "axios";
import { applicationService } from "./application.service";
import { accountSessionService } from ".";

//Uses coreApiService and applicationService to auto-refresh client session data
//after each API call.
export const apiService = {
    get,
    post,
    put,
    delete: deleteRecord,
    deleteMultiple
};

function get<T>(controller: string, action: string = '', urlParams: string[] | undefined = undefined, queryParams: any = null
    , ignoreDisplayErrorCode: any = undefined, hideSpinner: boolean = false, baseService: string = '', pageToken?: string): Promise<T> {
    const apiPromise = coreApiService.get<T>(controller, action, urlParams, queryParams, ignoreDisplayErrorCode, hideSpinner, baseService,  pageToken);
    return handleApiCall(apiPromise);
}

function post<T>(controller: string, action: string = '', data: any = null, urlParams: string[] = [],
    ignoreDisplayErrorCode: any = undefined, hideSpinner: boolean = false, baseService: string = ''): Promise<T> {
    const apiPromise = coreApiService.post<T>(controller, action, data, urlParams, ignoreDisplayErrorCode, hideSpinner, baseService);
    return handleApiCall(apiPromise);
}

function put<T>(controller: string, action: string = '', data: any = null, baseService: string = ''): Promise<T> {
    const apiPromise = coreApiService.put<T>(controller, action, data, baseService);
    return handleApiCall(apiPromise);
}

function deleteRecord(controller: string, action: string = '', id: string, baseService: string = ''): Promise<{}> {
    const apiPromise = coreApiService.delete(controller, action, id, baseService);
    return handleApiCall(apiPromise);
}

function deleteMultiple(controller: string, action: string = '', ids: string[], baseService: string = ''): Promise<{}> {
    const apiPromise = coreApiService.deleteMultiple(controller, action, ids, baseService);
    return handleApiCall(apiPromise);
}

//Check for client session refresh header after each api call.
function handleApiCall<T>(axiosPromise: Promise<AxiosResponse>) {

    const wrappedPromise = new Promise<T>((resolve, reject) => {
        axiosPromise.then(response => {

            const data = response.data;

            if (hasSessionRefreshHeader(response)) {

                const isAuthenticated = accountSessionService.isAuthenticated();

                applicationService.initializeApplicationData(isAuthenticated)
                    .then(() => resolve(data))
                    .catch(error => reject(error));
            }
            else {
                resolve(data);
            }

        }).catch(error => reject(error))
    })

    return wrappedPromise;
}

function hasSessionRefreshHeader<T>(response: AxiosResponse<T>) {
    return (response.headers["x-refreshclientsession"] == "true");
}


// WEBPACK FOOTER //
// ./src/modules/shared/services/api.service.ts