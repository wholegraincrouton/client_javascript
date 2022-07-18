import '@fortawesome/fontawesome-free/css/all.css'
import '@progress/kendo-theme-bootstrap/dist/all.css';
import '@coreui/coreui/dist/css/coreui-standalone.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/fonts.css';
import './assets/scss/site.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import App from './App';
import { routeService } from './routes/route.service';
import { localise, contextService, applicationService, accountSessionService, configService } from './modules/shared/services';
import { uiDomService } from './modules/shared/services/ui-dom.service';
import { signalrService } from './modules/shared/services/signalr.service';
//import registerServiceWorker from './registerServiceWorker';

//Because we use KendoUI controls in the system.
require("@progress/kendo-ui/js/kendo.datetimepicker.js");
require("@progress/kendo-ui/js/kendo.upload.js");

const rootElement = document.getElementById('root') as HTMLElement;

//Set default culture based on browser.
contextService.setCurrentCulture(window.navigator.language.toUpperCase())

//Check user login session, and set user culture (if available).
let isAuthenticated = accountSessionService.isAuthenticated();
if (isAuthenticated) {
  let user = accountSessionService.getAuthenticatedUser();
  user && user.language && contextService.setCurrentCulture(user.language);
}

//Load everything else after loading application UI data.
applicationService.initializeApplicationData(isAuthenticated)
  .then(() => {
    window.document.title =
      `${configService.getConfigurationValue("PRODUCT_NAME")} ${localise("TEXT_WEB_PORTAL")}`;
    routeService.initializeRoutes();

    ReactDOM.render(
      <Provider store={store}>
        <App />
      </Provider>,
      rootElement
    );

    signalrService.reconnectOnPageReload();

  }, () => {
    rootElement.innerHTML = "Oops! something went wrong on the way! Please try again.";
  });


window.onresize = uiDomService.adjustDynamicPageContentSizes;

//registerServiceWorker();



// WEBPACK FOOTER //
// ./src/index.tsx