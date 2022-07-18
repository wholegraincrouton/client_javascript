import * as React from 'react';
import { accountSessionService, localise } from '../../../shared/services';
import { History } from 'history';
import { appInsights } from 'src/AppInsights';
import { accountService } from '../../services/account.service';
import { USER_SIGNED_OUT } from 'src/modules/shared/constants/custom-events.constants';

interface Props {
    history: History;
}

export class SignOut extends React.Component<Props> {
    constructor(props: Props) {
        super(props);

        this.signOut = this.signOut.bind(this);
    }

    componentDidMount() {
        this.signOut();
    }

    signOut() {
        var userName = accountSessionService.getLoggedInUserDisplayName();
        accountService.logout()
            .then(() => {
                this.props.history.push(`/account/login`);
                appInsights.trackEvent({ name: USER_SIGNED_OUT, properties: { userName } })
            })
            .catch();
    }

    render() {
        return (
            <div className="signout-section">
                <div className="text-center mb-3">
                    <legend>{localise("TEXT_SIGNING_OUT")}</legend>
                </div>
            </div>
        )
    }
}


// WEBPACK FOOTER //
// ./src/modules/account/components/SignOut/SignOut.tsx