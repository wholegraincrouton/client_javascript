import * as React from 'react';
import { Switch, Prompt, Redirect, HashRouter } from 'react-router-dom';
import { AuthenticatedLayout, AnonymousLayout } from './layouts';
import { routeService } from './routes/route.service';
import { GlobalSpinner, NotificationAlert, GlobalConfirmDialog } from './modules/shared/components';
import { GuardRoute } from './routes/GuardRoute';
import { globalDirtyService } from './modules/shared/services';
import GlobalNotificationDialog from './modules/shared/components/Notification-dialog/GlobalNotificationDialog';
import { withAITracking } from '@microsoft/applicationinsights-react-js'
import { reactPlugin } from './AppInsights';

class App extends React.Component {
    public render() {
        return (
            <HashRouter getUserConfirmation={globalDirtyService.checkGlobalDirtyConfirmationRouter} >                
                    <React.Fragment>
                        <Switch>
                            {
                                routeService.routes.map((r, key) => {

                                    let layout = r.isPublic ? AnonymousLayout : AuthenticatedLayout;
                                    if (r.layout == "anonymous") layout = AnonymousLayout;
                                    else if (r.layout == "authenticated") layout = AuthenticatedLayout;

                                    return r.redirectTo ?
                                        <Redirect from={r.path} to={r.redirectTo || ""} key={key} /> :
                                        <GuardRoute path={r.path} route={r} isPublic={r.isPublic} component={layout} />
                                })
                            }
                        </Switch>
                        <Prompt message="CONFIRMATION_UNSAVED_CHANGES" />
                        <GlobalSpinner />
                        <NotificationAlert />
                        <GlobalConfirmDialog />
                        <GlobalNotificationDialog />
                    </React.Fragment>
            </HashRouter>
        );
    }
}

export default withAITracking(reactPlugin, App);



// WEBPACK FOOTER //
// ./src/App.tsx