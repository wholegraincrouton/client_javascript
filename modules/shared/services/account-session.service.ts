import cookies from "js-cookie";
import { User } from "src/modules/account/types/dto";
import { SignalRInfo } from "../types/dto";

export const accountSessionService = {
    getLoggedInUserDisplayName,
    getLoggedInUserId,
    getLoggedInUserTimeZoneOffsetInMinutues,
    isAuthenticated,
    getAuthenticatedUser,
    startSession,
    clearSession,
    setSignalRCookie,
    getSignalRCookie
};

const userCookieName = "User";
const signalRCookieName = "SignalR";

function getLoggedInUserDisplayName() {
    let userInfo = getAuthenticatedUser();
    if (userInfo)
        return userInfo.firstName + " " + (userInfo.lastName || '');
    return ""
}

function getLoggedInUserId() {
    let userInfo = getAuthenticatedUser();
    if (userInfo)
        return userInfo.id;
    return "";
}

function getLoggedInUserTimeZoneOffsetInMinutues() {
    let userInfo = getAuthenticatedUser();
    if (userInfo)
        return userInfo.timeZoneOffsetInMinutes;
    return 0;
}

function isAuthenticated() {
    return cookies.get(userCookieName) != undefined;
}

function getAuthenticatedUser(): User | undefined {
    let userCookie = cookies.get(userCookieName);
    if (userCookie != undefined) {
        let userInfo = JSON.parse(userCookie);
        return userInfo.user;
    }
    return undefined;
}

function startSession(user: User, rememberMe: boolean) {

    const cookieContent = JSON.stringify({ user: user });

    if (rememberMe)
        cookies.set(userCookieName, cookieContent, { expires: 14 });
    else
        cookies.set(userCookieName, cookieContent);
}

function setSignalRCookie(signalRInfo: SignalRInfo){
    cookies.set(signalRCookieName, signalRInfo);
}

function getSignalRCookie(): SignalRInfo{
    let signalRCookie = cookies.get(signalRCookieName);
    return signalRCookie != undefined ? JSON.parse(signalRCookie) : undefined;
}

function clearSession() {
    cookies.remove(userCookieName);
    cookies.remove(signalRCookieName);
}


// WEBPACK FOOTER //
// ./src/modules/shared/services/account-session.service.ts