import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form'
import { sharedReducers } from '../modules/shared/reducers';
import { configurationReducers } from "../modules/configuration/reducers";
import { securityReducers } from '../modules/security/reducers';
import { cabinetControlCenterReducers } from '../modules/cabinet/reducers';
import { dashboardReducers } from 'src/modules/dashboard/reducers';
import { userReducers } from "../modules/users/reducers";
import { activeAlarmReducers } from 'src/modules/eventAlarms/reducers';
import { deviceUpdateStatusReducers } from 'src/modules/deviceUpdates/reducers';

const rootReducer = combineReducers({
    ...sharedReducers,
    ...configurationReducers,
    ...securityReducers,
    ...cabinetControlCenterReducers,
    ...dashboardReducers,
    ...userReducers,
    ...activeAlarmReducers,
    ...deviceUpdateStatusReducers,
    form: formReducer
});

export default rootReducer;


// WEBPACK FOOTER //
// ./src/redux/root-reducer.ts