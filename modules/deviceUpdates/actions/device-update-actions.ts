import * as constants from '../constants/device-update.constants';
import { Dispatch } from 'redux';
import { deviceUpdateService } from '../services/deviceUpdate.service';
import { PendingDeviceUpdateStatus } from '../types/dto';

export const deviceUpdateActions = {
    getDeviceUpdateStatus
}

export interface DeviceUpdateStatusLoaded {
    type: constants.DEVICE_UPDATE_STATUS_LOADED;
    allDeviceUpdates: PendingDeviceUpdateStatus[];
}

export interface DeviceUpdateStatusUpdated {
    type: constants.DEVICE_UPDATE_STATUS_UPDATED;
    updatingDeviceUpdate: PendingDeviceUpdateStatus;
}

export type DeviceUpdateStatusActions = DeviceUpdateStatusLoaded | DeviceUpdateStatusUpdated;

function getDeviceUpdateStatus() {
    return (dispatch: Dispatch<DeviceUpdateStatusActions>) => {
        var promise = deviceUpdateService.getDeviceUpdateStatus();
        promise.then(deviceUpdates => {
            let deviceUpdateStatusAction: DeviceUpdateStatusLoaded = {
                type: constants.DEVICE_UPDATE_STATUS_LOADED,
                allDeviceUpdates: deviceUpdates
            };
            dispatch(deviceUpdateStatusAction);
        });
    }
}


// WEBPACK FOOTER //
// ./src/modules/deviceUpdates/actions/device-update-actions.ts