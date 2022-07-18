import * as React from 'react';
import { History } from 'history';
import { Link } from 'react-router-dom';
import { Input, Label, Form, FormGroup, Row, Col } from 'reactstrap';
import { localise, configService } from '../../../shared/services';
import { NumericInput } from 'src/modules/shared/components/NumericInput/NumericInput';
import { ActionButton } from '../../../shared/components/ActionButtons/ActionButtons';
import { accountService } from '../../services/account.service';

interface Props {
    history: History;
}

interface State {
    username: string;
    password: string;
    rememberMe: boolean;
    otp: string;
    isPasswordPending: boolean;
    isTwoFactorAuthPending: boolean;
    labelKey: string;
    remarkKey: string;
    buttonKey: string;
    errorKey: string;
    showError: boolean;
    showOTPResend: boolean;
}

export class Login extends React.Component<Props, State> {
    otpTimer: any = undefined;

    constructor(props: Props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.onCheck = this.onCheck.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onBack = this.onBack.bind(this);
        this.onOtpResend = this.onOtpResend.bind(this);

        this.state = {
            username: '',
            password: '',
            rememberMe: false,
            otp: '',
            showError: false,
            isPasswordPending: false,
            isTwoFactorAuthPending: false,
            labelKey: 'TEXT_EMAIL',
            remarkKey: 'REMARK_EMAIL',
            errorKey: '',
            buttonKey: 'BUTTON_NEXT',
            showOTPResend: false
        };
    }

    onChange(e: any) {
        const { name, value } = e.target;
        this.setState({ ...this.state, [name]: value, showError: false, errorKey: '' });
    }

    onCheck(e: any) {
        const { name, checked } = e.target;
        this.setState({ ...this.state, [name]: checked, showError: false, errorKey: '' });
    }

    onSubmit(e: any) {
        e.preventDefault();
        const { username, password, rememberMe, otp, isPasswordPending, isTwoFactorAuthPending } = this.state;

        if (isTwoFactorAuthPending) {
            if (otp) {
                accountService.validateOtp(otp.trim(), rememberMe || false)
                    .then((authResult) => {
                        if (authResult.isSucceeded) {
                            this.props.history.push("/dashboard/overview");
                        }
                        else {
                            this.setState({ ...this.state, showError: true, errorKey: authResult.errorCode })
                        }
                    })
                    .catch(err => this.setState({ ...this.state, showError: true, errorKey: err }));
            }
        }
        else if (isPasswordPending) {
            if (password) {
                accountService.login(username, password, rememberMe)
                    .then((authResult) => {
                        if (authResult.isSucceeded) {
                            this.props.history.push("/dashboard/overview");
                        }
                        else if (authResult.isTwoFactorAuthPending) {
                            this.setState({
                                ...this.state,
                                isPasswordPending: false,
                                isTwoFactorAuthPending: true,
                                showOTPResend: true,
                                labelKey: 'TEXT_ENTER_PIN',
                                remarkKey: 'REMARK_OTP',
                                buttonKey: 'BUTTON_VERIFY',
                                errorKey: '',
                                showError: false
                            });
                        }
                        else {
                            this.setState({ ...this.state, showError: true, errorKey: authResult.errorCode })
                        }
                    })
                    .catch(err => this.setState({ ...this.state, showError: true, errorKey: err }));
            }
        }
        else {
            if (username) {
                accountService.checkUsername(username)
                    .then((result) => {
                        if (result.isSuccess) {
                            if (result.isActiveDirectoryUser) {
                                if (result.activeDirectoryURL) {
                                    window.location.href = result.activeDirectoryURL;
                                }
                                else {
                                    this.setState({ ...this.state, showError: true, errorKey: result.errorCode });
                                }
                            }
                            else {
                                this.setState({
                                    ...this.state,
                                    isPasswordPending: true,
                                    labelKey: 'TEXT_PASSWORD',
                                    remarkKey: 'REMARK_PASSWORD',
                                    buttonKey: 'BUTTON_LOGIN',
                                    errorKey: '',
                                    showError: false
                                });
                            }
                        }
                        else {
                            this.setState({ ...this.state, showError: true, errorKey: result.errorCode });
                        }
                    })
                    .catch(err => this.setState({ ...this.state, showError: true, errorKey: 'ERROR_USERNAME' }));
            }
        }
    }

    onBack() {
        this.setState({
            ...this.state,
            username: '',
            password: '',
            otp: '',
            isPasswordPending: false,
            isTwoFactorAuthPending: false,
            labelKey: 'TEXT_EMAIL',
            remarkKey: 'REMARK_EMAIL',
            buttonKey: 'BUTTON_NEXT',
            errorKey: '',
            showError: false
        });
    }

    onOtpResend(e: any) {
        e.preventDefault();
        const { username, password, rememberMe } = this.state;
        this.setState({ ...this.state, showOTPResend: false });
        this.otpTimer = undefined;
        this.registerOtpTimer();

        if (username && password) {
            accountService.resendOtp(username, password, rememberMe || false)
                .then(() => {
                    this.setState({ ...this.state, showOTPResend: false })
                })
                .catch(err => this.setState({ ...this.state, showOTPResend: false, errorKey: err }));
        }
    }

    registerOtpTimer() {
        if (this.otpTimer == undefined) {
            this.otpTimer = setTimeout(() => {
                this.setState({ ...this.state, showError: true })
            },
                parseInt(configService.getConfigurationValue('OTP_RESEND_INTERVAL_IN_SECONDS')) * 1000);
        }
    }

    render() {
        const { username, password, rememberMe, otp, isTwoFactorAuthPending, isPasswordPending,
            labelKey, remarkKey, buttonKey, errorKey, showError, showOTPResend } = this.state;

        window.document.title = `Login | ${configService.getConfigurationValue("PRODUCT_NAME")}`;

        return (
            <Form className="login-section" onSubmit={this.onSubmit}>
                <FormGroup>
                    <Row>
                        <Col>
                            <Label className="system-label">{localise(labelKey)}</Label>
                        </Col>
                        {
                            isTwoFactorAuthPending && showOTPResend &&
                            <Col style={{ fontSize: 13 }} className="text-right pt-2">
                                <span className="clickable" onClick={this.onOtpResend}>
                                    <i className="fas fa-redo mr-1"></i>{localise("TEXT_RESEND_PIN")}
                                </span>
                            </Col>
                        }
                    </Row>
                    {
                        isTwoFactorAuthPending ?
                            <NumericInput type="text" name="otp" value={otp} placeholder={localise(labelKey)} autoComplete="otp"
                                onChange={this.onChange} maxLength={10} autoFocus required />
                            : isPasswordPending ?
                                <>
                                    <Input className="d-none" type="email" name="username" value={username} autoComplete="username" />
                                    <Input type="password" name="password" value={password} placeholder={localise(labelKey)} autoComplete="current-password"
                                        onChange={this.onChange} maxLength={100} required />
                                </>
                                :
                                <>
                                    <Input type="email" name="username" value={username} placeholder={localise(labelKey)} autoComplete="username"
                                        onChange={this.onChange} maxLength={100} autoFocus required />
                                    <Input className="d-none" type="password" name="password" autoComplete="current-password" />
                                </>
                    }
                    <small className={showError ? 'text-danger' : 'text-muted'}>
                        {localise(showError ? errorKey : remarkKey)}
                    </small>
                </FormGroup>
                {
                    isPasswordPending &&
                    <FormGroup className="remember-me-row">
                        <Row>
                            <Col>
                                <Label check>
                                    <Input type="checkbox" name="rememberMe" checked={rememberMe} onChange={this.onCheck} />
                                    {localise('TEXT_REMEMBERME')}
                                </Label>
                            </Col>
                            <Col className="text-right">
                                <Label>
                                    <Link to="/account/forgotpassword">{localise("TEXT_FORGOTPASSWORD")}?</Link>
                                </Label>
                            </Col>
                        </Row>
                    </FormGroup>
                }
                <FormGroup className="mb-0">
                    <Row>
                        {
                            (isPasswordPending || isTwoFactorAuthPending) &&
                            <Col>
                                <ActionButton color="secondary" textKey="BUTTON_BACK" onClick={this.onBack} />
                            </Col>
                        }
                        <Col className='text-right'>
                            <ActionButton color="primary" textKey={buttonKey} type="submit" />
                        </Col>
                    </Row>
                </FormGroup>
            </Form>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/account/components/Login/Login.tsx