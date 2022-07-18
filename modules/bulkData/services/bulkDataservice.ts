import { blobApiService } from "src/modules/shared/services/blob-api.service";

export const bulkDataservice = {
    uploadFile,
    deleteFile,
    getLogFile
};

function uploadFile(url: string, contentLength: number, data: any) {
    return blobApiService.putBlob(url, contentLength, data);
}

function deleteFile(url: string) {
    return blobApiService.deleteBlob(url);
}

function getLogFile(url: string) {
    return blobApiService.getBlob(url);
}


// WEBPACK FOOTER //
// ./src/modules/bulkData/services/bulkDataservice.ts