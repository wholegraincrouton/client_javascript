import { apiService } from "src/modules/shared/services";

export const helpcentreService =
{
    getDownloadUrl
};

function getDownloadUrl(fileName: string, basePath: string) {
    return apiService.get('HelpCentre', 'GetDownloadUrl',undefined, { blobReference: fileName, basePath: basePath });
}



// WEBPACK FOOTER //
// ./src/modules/helpCentre/services/helpcentre.service.ts