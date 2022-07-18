import * as constants from '../constants/device-update.constants';
import { DeviceUpdateStatus, PendingDeviceUpdateStatus } from "../types/dto";
import { DeviceUpdateStatusActions } from "../actions/device-update-actions";

export function deviceUpdateStatus(state: DeviceUpdateStatus = { customerDeviceUpdates: [] }, action: DeviceUpdateStatusActions) {
    switch (action.type) {
        case constants.DEVICE_UPDATE_STATUS_LOADED: {
            return { ...state, customerDeviceUpdates: action.allDeviceUpdates };
        }
        case constants.DEVICE_UPDATE_STATUS_UPDATED: {
            let updatingDeviceUpdate: PendingDeviceUpdateStatus = action.updatingDeviceUpdate;

            let deviceUpdateStatus: PendingDeviceUpdateStatus[] = [...state.customerDeviceUpdates];

            if (deviceUpdateStatus == null || deviceUpdateStatus == undefined || deviceUpdateStatus.length == 0) {
                deviceUpdateStatus = [];
                deviceUpdateStatus.push(updatingDeviceUpdate);
            }
            else {
                let customerDeviceUpdateIndex = deviceUpdateStatus.findIndex(
                    d => d.deviceUpdateCustomerId == updatingDeviceUpdate.deviceUpdateCustomerId);
                if (customerDeviceUpdateIndex != -1) {
                    deviceUpdateStatus[customerDeviceUpdateIndex] = updatingDeviceUpdate;
                }
                else {
                    deviceUpdateStatus.push(updatingDeviceUpdate);
                }
            }
            return { ...state, customerDeviceUpdates: deviceUpdateStatus };
        }
    }
    return state;
}


// WEBPACK FOOTER //
// ./src/modules/deviceUpdates/reducers/device-update-reducer.ts