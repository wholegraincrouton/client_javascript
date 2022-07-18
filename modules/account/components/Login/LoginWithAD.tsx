import * as React from 'react';
import { match } from "react-router";
import { History } from 'history';
import { localise } from '../../../shared/services';
import { accountService } from '../../services/account.service';
import { Col, Row } from 'reactstrap';

interface Props {
    history: History;
    match: match<any>;
}

interface State {
    errorCode?: string;
}

export class LoginWithAD extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        const { token, userId, errorCode, error } = this.props.match.params;

        if (token && userId) {
            accountService.loginWithAD(userId, token)
                .then((authResult) => {
                    if (authResult.isSucceeded) {
                        this.props.history.push("/dashboard/overview");
                    }
                    else {
                        this.setState({ ...this.state, errorCode: authResult.errorCode });
                    }
                })
                .catch(() => this.setState({ ...this.state, errorCode: 'ERROR_ACTIVE_DIRECTORY_LOGIN' }));
        }
        else {
            this.setState({ ...this.state, errorCode: `${errorCode}: ${error}` });
        }
    }

    render() {
        const { errorCode } = this.state;

        return (
            <Row>
                <Col className="text-center">
                    {
                        errorCode ?
                            <>
                                <Row className="text-danger mb-3">
                                    <Col>
                                        <b>{localise(errorCode)}</b>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <a href="/#/account/login">Go to login page</a>
                                    </Col>
                                </Row>
                            </>
                            :
                            <legend>{localise("TEXT_SIGNING_IN")}</legend>
                    }
                </Col>
            </Row>
        );
    }
}


// WEBPACK FOOTER //
// ./src/modules/account/components/Login/LoginWithAD.tsx