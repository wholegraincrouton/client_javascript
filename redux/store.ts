import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import rootReducer from './root-reducer'
import { Alert, GlobalSpinnerState, ConfirmDialogState, NotificationDialogState, UserAvatarState } from '../modules/shared/types/store';
import { CabinetSimulationState } from '../modules/cabinet/types/store';
import { DashboardState } from 'src/modules/dashboard/types/dto';
import { ActiveAlarmStoreStatus } from 'src/modules/eventAlarms/types/dto';
import { DeviceUpdateStatus } from 'src/modules/deviceUpdates/types/dto';

export const store = createStore(
    rootReducer,
    applyMiddleware(thunkMiddleware)
);

export interface StoreState {
    customer: string;
    alert: Alert;
    spinner: GlobalSpinnerState;
    confirmDialog: ConfirmDialogState;
    notificationDialog: NotificationDialogState;
    cabinetSimulation: CabinetSimulationState;
    dashboard: DashboardState;
    userAvatar: UserAvatarState;
    activeAlarm: ActiveAlarmStoreStatus;
    deviceUpdateStatus: DeviceUpdateStatus;
}



// WEBPACK FOOTER //
// ./src/redux/store.ts