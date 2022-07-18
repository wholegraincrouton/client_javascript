import * as React from 'react';
import { match } from 'react-router';
import { History } from 'history';
import { userService } from '../../services/user.service';
import { Col, Label, Row } from 'reactstrap';
import { localise } from 'src/modules/shared/services';
import './user-access.css';

interface Props {
    match: match<any>;
    history: History;
}

interface State {
    isGranted: boolean;
    text: string;
    remark: string;
}

export class UserAccess extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isGranted: false,
            text: '',
            remark: ''
        };
    }

    componentDidMount() {
        const { userId, adminId, isGrant } = this.props.match.params;
        
        userService.processAccessRequest(userId, adminId, isGrant)
            .then(result => {
                let isGranted = result.isGranted;
                let text = '';
                let remark = '';

                if (result.errorCode) {
                    if (result.errorCode == 'ERROR_USER_ACCESS_ALREADY_GIVEN') {
                        text = localise('REMARK_USER_ACCESS_ALREADY_GIVEN');

                        if (result.lastAccessRequestActionUser && result.accessRequestUser) {
                            remark = localise('REMARK_USER_ACCESS_ALREADY_GIVEN_2');
                            remark = remark.replace('#ACTION_USER#', result.lastAccessRequestActionUser);
                            remark = remark.replace('#ACTION#', result.lastAccessRequestGranted ? 'granted access' : 'denied access');
                            remark = remark.replace('#REQUEST_USER#', result.accessRequestUser);
                        }
                    }
                    else if (result.errorCode == 'ERROR_USER_ACCESS_REQUEST_EXPIRED') {
                        text = localise('REMARK_USER_ACCESS_EXPIRED');
                        remark = localise('REMARK_USER_ACCESS_EXPIRED_2');
                    }
                    else if (result.errorCode == 'ERROR_USER_ACCESS_CHECKED_OUT') {
                        text = localise('REMARK_USER_ACCESS_CHECKED_OUT');
                        remark = localise('REMARK_USER_ACCESS_CHECKED_OUT_2');
                    }
                }
                else {
                    text = isGranted ? localise('REMARK_USER_ACCESS_GRANTED') : localise('REMARK_USER_ACCESS_DENIED');
                    remark = localise('REMARK_USER_NOTIFIED_SMS_EMAIL');
                }

                this.setState({ ...this.state, isGranted, text: text, remark: remark });
            });
    }

    render() {
        const { isGranted, text: text, remark: remark } = this.state;

        return (
            <Row className="user-access-result">
                <Col>
                    <Row className="content-row">
                        <Col>
                            <Row className="title-row" style={{ color: isGranted ? 'green' : 'red' }}>
                                <Col>
                                    <Label>{text}</Label>
                                </Col>
                            </Row>
                            <Row className="remark-row">
                                <Col>
                                    <Label>{remark}</Label>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}


// WEBPACK FOOTER //
// ./src/modules/users/components/UserAccess/UserAccess.tsx