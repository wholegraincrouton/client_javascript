import * as React from 'react';
import { Alert } from 'reactstrap';
import { StoreState } from "src/redux/store"
import { connect } from 'react-redux';
import './notification-alert.css';

export interface AlertProps {
    alertType?: string,
    message?: string
}

function NotificationAlert({ alertType, message }: AlertProps) {
    if (!alertType)
        return null;
    return (
        <div className="aldo-alert">
            <Alert color={alertType}> {message} </Alert >
        </div>
    );
}

const mapStateToProps = (state: StoreState) => ({ ...state.alert });

export default connect(mapStateToProps)(NotificationAlert)


// WEBPACK FOOTER //
// ./src/modules/shared/components/NotificationAlert/NotificationAlert.tsx