import * as React from 'react';
import { match } from 'react-router';
import { accountService } from '../../services/account.service';
import { History } from 'history';
import { localise } from '../../../shared/services';

interface Props {
    match: match<any>;
    history: History;
}

interface State {
    userId: string,
    confirmEmailToken: string,
    isEmailConfirmed: boolean,
    userName?: string,
    setPasswordToken?: string,
    emailConfirmError?: string
}

export class ActivateUser extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        const { userId, token } = this.props.match.params;

        this.confirmEmail = this.confirmEmail.bind(this);

        this.state = {
            userId: userId,
            confirmEmailToken: decodeURIComponent(token),
            isEmailConfirmed: false,
        };
    }

    componentDidMount() {
        this.confirmEmail();
    }

    confirmEmail() {
        accountService.confirmEmail(this.state.userId, this.state.confirmEmailToken)
            .then(result => {
                if (result.operationResult.isSuccess) {
                    this.setState({
                        ...this.state,
                        userName: result.email,
                        setPasswordToken: result.passwordResetToken,
                        isEmailConfirmed: true
                    });
                    this.props.history.push(
                        `/account/resetpassword/${this.state.userId}/${this.state.userName}/${this.state.setPasswordToken}/${false}`);
                }
                else {
                    this.setState({
                        ...this.state,
                        emailConfirmError: result.operationResult.message,
                        isEmailConfirmed: false
                    });
                }
            })
            .catch();
    }

    render() {
        return (
            <div className="activate-user-section">
                <div className="text-center mb-3">
                    {!this.state.emailConfirmError && <legend>{localise("TEXT_CONFIRM_ACCOUNT")}</legend>}
                    {this.state.emailConfirmError &&
                        <big className="text-danger">
                            {localise(this.state.emailConfirmError)}
                        </big>}
                </div>
            </div>
        );
    }
}


// WEBPACK FOOTER //
// ./src/modules/account/components/ActivateUser/ActivateUser.tsx