import { connect } from 'react-redux';
import AlarmNotificationIcon from './AlarmNotificationIcon';
import { contextService, localise } from 'src/modules/shared/services';
import { alarmActions } from '../../../actions/alarm-actions';
import { StoreState } from 'src/redux/store';

const mapStateToProps = (store: StoreState) => {
    const { activeAlarms } = store.activeAlarm;
    const customerId = contextService.getCurrentCustomerId();

    let alarmCount = 0;
    let tooltipText = '';

    const customerActiveAlarms = activeAlarms.find(a => a.alarmCustomerId == customerId);

    if (customerActiveAlarms && customerActiveAlarms.cabinetAlarms) {
        customerActiveAlarms.cabinetAlarms.forEach(c => {
            alarmCount += c.alarmIdList.length;
        });

        tooltipText = (alarmCount == 0) ? localise("REMARK_ALARM_TOOLTIP_NO_ACTIVE_ALARMS") :
            (customerActiveAlarms.cabinetAlarms.length == 1) ? `${alarmCount} ${localise("REMARK_ALARM_TOOLTIP_ACTIVE_ALARMS_SINGLE_CABINET")}` :
                `${alarmCount} ${localise("REMARK_ALARM_TOOLTIP_NO_ACTIVE_ALARMS_MULTIPLE_CABINETS")}`;
    }

    return {
        alarmCount,
        tooltipText
    };
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        getActiveAlarms: () => dispatch(alarmActions.getActiveAlarms())
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AlarmNotificationIcon);



// WEBPACK FOOTER //
// ./src/modules/eventAlarms/components/Alarms/AlarmNotificationIcon/AlarmNotificationIconContainer.ts