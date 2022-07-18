import * as React from 'react';
import * as qs from "query-string";
import { History } from 'history';
import { contextService } from 'src/modules/shared/services';
import "./../alarms.css";

interface Props {
    history: History;
    canView: boolean;
    tooltipText: string;
    alarmCount: number;
    getActiveAlarms: () => void;
}

class AlarmNotificationIcon extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
        this.onIconClick = this.onIconClick.bind(this);
    }

    componentDidMount() {
        this.props.getActiveAlarms();
    }

    onIconClick() {
        const { history } = this.props;
        const customerId = contextService.getCurrentCustomerId();

        history.push({
            pathname: "/reports/overview/active_alarms_report",
            search: qs.stringify({
                ['contextCustomerId']: customerId
            })
        });
    }

    render() {
        const { tooltipText, alarmCount, canView } = this.props;
        const allowNavigate = canView && alarmCount > 0;

        return (
            <div className="alarm-notification-icon">
                <i className={"far fa-bell alarm-icon" + (allowNavigate ? " active-alarm-icon" : "")}
                    onClick={allowNavigate ? this.onIconClick : () => { return; }} aria-hidden="true"
                    title={tooltipText} />
                {
                    alarmCount > 0 &&
                    <span className={"alarms-count-box" + (allowNavigate ? " active-alarms-count-box" : "")}
                        onClick={allowNavigate ? this.onIconClick : () => { return; }}
                        title={tooltipText}>
                        {alarmCount}
                    </span>
                }
            </div>
        );
    }
}

export default AlarmNotificationIcon;



// WEBPACK FOOTER //
// ./src/modules/eventAlarms/components/Alarms/AlarmNotificationIcon/AlarmNotificationIcon.tsx