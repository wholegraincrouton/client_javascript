import { apiService } from "src/modules/shared/services";
import { PendingDeviceUpdateStatus } from "../types/dto";

export const deviceUpdateService = {
    publish,
    getDeviceUpdateStatus
};

function publish(id: string) {
    return apiService.post('deviceUpdate', 'Publish', { id });
}

function getDeviceUpdateStatus() {
    return apiService.get<PendingDeviceUpdateStatus[]>('deviceUpdate', "GetPendingDeviceUpdates", undefined, null, undefined, true);
}



// WEBPACK FOOTER //
// ./src/modules/deviceUpdates/services/deviceUpdate.service.ts