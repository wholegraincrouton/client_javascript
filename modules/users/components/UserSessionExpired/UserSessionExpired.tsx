import * as React from 'react';
import { Col, Label, Row } from 'reactstrap';
import './session-expire.css';
import { localise } from 'src/modules/shared/services';


export class UserSessionExpired extends React.Component {   
    render() {
        return (
            <Row className="session-expire-result">
                <Col>
                    <Row className="content-row">
                        <Col>
                            <Row className="title-row" style={{ color: 'red' }}>
                                <Col>
                                    <Label>{localise('TEXT_SESSION_EXPIRED')}</Label>
                                </Col>
                            </Row>
                            <Row className="remark-row">
                                <Col>
                                    <Label>{localise('TEXT_REFRESH_PAGE')} <a href="/#/account/login">go to login page</a></Label>
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
// ./src/modules/users/components/UserSessionExpired/UserSessionExpired.tsx