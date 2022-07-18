import * as React from "react";
import { History } from 'history';
import { match } from "react-router";
import { Input, Label, Col, Row } from 'reactstrap';

import { accountService } from "../../services/account.service";
import { SetPasswordDto } from "../../types/dto";
import { localise } from "../../../shared/services";
import { ActionButton } from "../../../shared/components/ActionButtons/ActionButtons";

interface Props {
    onSubmit: () => (void);
    match: match<any>;
    history: History;
}

interface State {
    userId: string;
    userName?: string;
    setPasswordToken?: string;
    isReset?: boolean;
    password?: string;
    confirmPassword?: string;
    isPasswordMismatch: boolean;
    isPasswordInvalid: boolean;
}

export class SetPassword extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            userId: '',
            userName: '',
            setPasswordToken: '',
            password: '',
            confirmPassword: '',
            isReset: false,
            isPasswordMismatch: false,
            isPasswordInvalid: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        const { userId, userName, token, isReset } = this.props.match.params;

        this.setState({
            ...this.state,
            userId: decodeURIComponent(userId),
            userName: decodeURIComponent(userName),
            setPasswordToken: decodeURIComponent(token),
            isReset: isReset == "true" ? true : false
        });
    }

    handleChange(e: any) {
        const { name, value } = e.target;
        this.setState({ ...this.state, [name]: value });
    }

    handleSubmit(e: any) {
        e.preventDefault();
        const { userId, password, confirmPassword, setPasswordToken } = this.state;

        if (!password || password.length < 8 || !/\d/.test(password) || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\W/.test(password)) {
            this.setState({ ...this.state, isPasswordInvalid: true });
            setTimeout(() => { this.setState({ ...this.state, isPasswordInvalid: false }); }, 5000);
        }
        else if (password != confirmPassword) {
            this.setState({ ...this.state, isPasswordMismatch: true });
            setTimeout(() => { this.setState({ ...this.state, isPasswordMismatch: false }); }, 3000);
        }
        else {
            let setPasswordDetails: SetPasswordDto = {
                userId: userId,
                password: password ? password : '',
                confirmPassword: confirmPassword ? confirmPassword : '',
                passwordResetToken: setPasswordToken ? setPasswordToken : ''
            };
            accountService.setPassword(setPasswordDetails)
                .then(() => {
                    this.props.history.push("/account/login");
                });
        }
    }

    render() {
        const { isPasswordInvalid, isPasswordMismatch } = this.state;

        return (
            <div className="set-password-section">
                <div className="text-center">
                    <legend>{this.state.isReset ? localise("TEXT_RESET_PASSWORD") : localise("TEXT_SET_PASSWORD")}</legend>
                </div>
                <form onSubmit={this.handleSubmit}>
                    <fieldset>
                        <Row >
                            <Col >
                                <Label className="system-label">{localise("TEXT_EMAIL")}</Label>
                                <Input type="text" placeholder={localise("TEXT_EMAIL")} name="username"
                                    maxLength={100} value={this.state.userName} autoComplete="username" required disabled />
                                <small className="text-muted remarks"> {localise("REMARK_DISABLED_EMAIL")} </small>
                            </Col>
                        </Row>
                        <br />
                        <Row >
                            <Col >
                                <Label className="system-label">{localise("TEXT_PASSWORD")}</Label>
                                <Input type="password" placeholder={localise("TEXT_PASSWORD")} name="password"
                                    maxLength={100} autoFocus value={this.state.password} onChange={this.handleChange} required />
                                {
                                    isPasswordInvalid ?
                                        <small style={{ float: 'left' }} className="text-danger">
                                            {localise("ERROR_PASSWORD_SET")}
                                        </small>
                                        :
                                        <small className="text-muted remarks">{localise("REMARK_PASSWORD")}</small>
                                }
                            </Col>
                        </Row>
                        <br />
                        <Row >
                            <Col>
                                <Label className="system-label">{localise("TEXT_CONFIRM_PASSWORD")}</Label>
                                <Input type="password" placeholder={localise("TEXT_CONFIRM_PASSWORD")} name="confirmPassword"
                                    maxLength={100} value={this.state.confirmPassword} onChange={this.handleChange} required />
                                {
                                    isPasswordMismatch ?
                                        <small style={{ float: 'left' }} className="text-danger">
                                            {localise("ERROR_PASSWORD_MISMATCH")}
                                        </small>
                                        :
                                        <small className="text-muted remarks">{localise("REMARK_CONFIRM_PASSWORD")}</small>
                                }
                            </Col>
                        </Row>
                    </fieldset>
                    <br />
                    <Row >
                        <Col >
                            <ActionButton type="submit" textKey="BUTTON_SUBMIT" color="primary"
                                disabled={this.state.password == '' || this.state.confirmPassword == ''} />
                        </Col>
                    </Row>
                </form>
            </div>
        );
    }
}


// WEBPACK FOOTER //
// ./src/modules/account/components/SetPassword/SetPassword.tsx