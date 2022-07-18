import { AppRouteInfo } from "../../routes/types";
import { SignOut } from "./components/SignOut/SignOut";
import { ActivateUser } from "./components/ActivateUser/ActivateUser";
import { Login } from "./components/Login/Login";
import { SetPassword } from "./components/SetPassword/SetPassword";
import { ForgotPassword } from "./components/ForgotPassword/ForgotPassword";
import { UserSessionExpired } from "../users/components/UserSessionExpired/UserSessionExpired";
import { LoginWithAD } from "./components/Login/LoginWithAD";

export const accountRouteGroup: AppRouteInfo = {
    path: "/account",
    redirectTo: "/account/login",
    section: "ACCOUNT",
    children: [
        {
            path: "login",
            component: Login,
            section: "PUBLIC",
            layout: "anonymous",
            isPublic: true
        },
        {
            path: "loginAD&id_token=:token&state=:userId&session_state=:stateId",
            component: LoginWithAD,
            section: "PUBLIC",
            layout: "anonymous",
            isPublic: true
        },
        {
            path: "loginAD&error=:errorCode&error_description=:error",
            component: LoginWithAD,
            section: "PUBLIC",
            layout: "anonymous",
            isPublic: true
        },
        {
            path: "signout",
            component: SignOut,
            layout: "anonymous"
        },
        {
            path: "confirmuseremail/:userId/:token",
            component: ActivateUser,
            section: "PUBLIC",
            layout: "anonymous",
            isPublic: true
        },
        {
            path: "resetpassword/:userId/:userName/:token/:isReset",
            component: SetPassword,
            section: "PUBLIC",
            layout: "anonymous",
            isPublic: true
        },
        {
            path: "forgotpassword",
            component: ForgotPassword,
            section: "PUBLIC",
            layout: "anonymous",
            isPublic: true
        },
        {
            path: "sessionexpired",
            component: UserSessionExpired,
            section: "PUBLIC",
            layout: "anonymous",
            isPublic: true
        }
    ]
}


// WEBPACK FOOTER //
// ./src/modules/account/routes.ts