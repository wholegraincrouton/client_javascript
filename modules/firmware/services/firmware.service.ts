import { apiService } from "src/modules/shared/services";
import { blobApiService } from "src/modules/shared/services/blob-api.service";
import { Firmware } from "../types/dto";
import * as apiConstants from "src/modules/shared/constants/api.constants";

let firmware: Firmware[] = [];
let file: any;

const service = apiConstants.DEVICES;

export const firmwareService = {
    getFirmwareList,
    clearFirmwareList,
    setUploadFile,
    clearUploadFile,
    uploadFile,
    deleteFile
};

function getFirmwareList(filterActive: boolean) {
    // Cached data to avoid api calls everytime.
    if (firmware == undefined || firmware.length == 0) {
        return apiService.get<Firmware[]>('FirmwareList', 'GetFirmwareList', undefined, { filterActive }, null, false, service);
    }
    else {
        var promise = new Promise<Firmware[]>(resolve => {
            resolve(firmware || []);
        });
        return promise;
    }
}

function clearFirmwareList() {
    if (firmware != undefined)
        firmware = [];
}

function setUploadFile(fileContent: any) {
    file = fileContent;
}

function clearUploadFile() {
    file = undefined;
}

function uploadFile(version: string, fileName: string, fileSize: number) {
    return apiService.get('FirmwareList', 'GetFirmwareFileWriteURL', undefined, { version, fileName }, null, false, service)
        .then((url: string) => {
            blobApiService.putBlob(url, fileSize, file)
                .then(result => file = undefined)
                .catch(error => console.log(error));
        });
}

function deleteFile(version: string, fileName: string) {
    return apiService.get('FirmwareList', 'GetFirmwareFileDeleteURL', undefined, { version, fileName }, null, false, service)
        .then((url: string) => {
            blobApiService.deleteBlob(url)
                .then(result => file = undefined)
                .catch(error => console.log(error));
        });
}


// WEBPACK FOOTER //
// ./src/modules/firmware/services/firmware.service.ts