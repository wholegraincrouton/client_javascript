import * as React from 'react';
import { Route, Redirect } from 'react-router';
import { routeService } from './route.service';
import { permissionService } from '../modules/shared/services/permission.service';
import { accountSessionService } from '../modules/shared/services';

export const GuardRoute = (props: any) => {

    const { component: Component, route, section, isPublic, ...rest } = props;

    routeService.setCurrentRoute(route);

    var isAuthenticated = accountSessionService.isAuthenticated();
    var hasPermission = (route.path == "/dashboard/overview" || route.path == "/account/signout"
            || isPublic || permissionService.canActivateRoute(route.section));

    var canActivateRoute = isPublic || (isAuthenticated && hasPermission);

    const guardFailureRedirect = isPublic ? "/dashboard" : "/account/login";

    return <Route {...rest} render={(props) => (
        canActivateRoute
            ? <Component {...props} />
            : <Redirect to={guardFailureRedirect} />)} />
}


// WEBPACK FOOTER //
// ./src/routes/GuardRoute.tsx