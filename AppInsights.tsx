import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { createBrowserHistory } from 'history';

const browserHistory = createBrowserHistory({ basename: '' });
const reactPlugin = new ReactPlugin();
 
const appInsights = new ApplicationInsights({
    config: {
        instrumentationKey: appConfig.instrumentationKey,
        extensions: [reactPlugin],
        autoTrackPageVisitTime: true,
        extensionConfig: {
          [reactPlugin.identifier]: { history: browserHistory  }
        }
    }
});
appInsights.loadAppInsights();
appInsights.trackPageView();
export { reactPlugin, appInsights };


// WEBPACK FOOTER //
// ./src/AppInsights.tsx