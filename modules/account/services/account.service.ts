import { apiService } from "../../shared/services/api.service";
import { SetPasswordResult, SetPasswordDto, AuthResultDto, UsernameResult } from '../types/dto';
import { contextService, accountSessionService } from "src/modules/shared/services";
import { applicationService } from "../../shared/services/application.service";
import { userService } from "src/modules/users/services/user.service";
import { userImageService } from "src/modules/users/services/user-image.service";
import { cabinetService } from "src/modules/cabinet/services/cabinet.service";
import { signalrService } from "src/modules/shared/services/signalr.service";
import { cabinetGroupService } from "src/modules/cabinetGroups/services/cabinetGroup.service";
import * as apiConstants from "src/modules/shared/constants/api.constants";

export const accountService = {
    checkUsername,
    login,
    loginWithAD,
    validateOtp,
    logout,
    confirmEmail,
    setPassword,
    forgotPassword,
    resendOtp
};

const service = apiConstants.ACCOUNTS;

function checkUsername(username: string): Promise<UsernameResult> {
    return apiService.get<UsernameResult>('account', 'checkUsername', undefined, { username }, false, false, service);
}

function login(username: string, password: string, remember: boolean): Promise<AuthResultDto> {
    const apiPromise = apiService.post<AuthResultDto>('account', 'login',
        { userName: username, password, isRememberMe: remember }, [], null, false, service);
    return processAuthenticationResult(apiPromise, remember);
}

function loginWithAD(userId: string, token: string): Promise<AuthResultDto> {
    const apiPromise = apiService.post<AuthResultDto>('account', 'loginWithAD', { userId, token }, [], null, false, service);
    return processAuthenticationResult(apiPromise, false);
}

function resendOtp(username: string, password: string, remember: boolean) {
    const apiPromise = apiService.post<AuthResultDto>('account', 'resendOtp',
        { userName: username, password, isRememberMe: remember }, [], null, false, service);
    return new Promise<AuthResultDto>((resolve, reject) => {
        apiPromise.then(() => {
        }).catch(error => reject(error));
    })
}

function processAuthenticationResult(apiPromise: Promise<AuthResultDto>, rememberMe: boolean) {
    return new Promise<AuthResultDto>((resolve, reject) => {
        apiPromise.then((authResult: AuthResultDto) => {
            if (authResult.isSucceeded) {
                accountSessionService.startSession(authResult.user, rememberMe);
                contextService.setCurrentCulture(authResult.user.language);
                userImageService.changeUserAvatar(authResult.user.hasProfileImage, authResult.user.profileImageURL);
                applicationService.initializeApplicationData(true)
                    .then(() => {
                        signalrService.connect(authResult.user.id);
                        resolve(authResult)
                    })
                    .catch(error => reject(error));
            }
            else {
                resolve(authResult);
            }
        }).catch(error => reject(error));
    });
}

function validateOtp(otp: string, rememberMe: boolean) {
    const apiPromise = apiService.post<AuthResultDto>('account', 'validateOtp',
        { otpCode: otp, shouldRemember: rememberMe }, [], null, false, service);
    return processAuthenticationResult(apiPromise, rememberMe);
}

function logout() {
    return apiService.post<any>('account', 'signout', null, [], null, false, service)
        .then(() => {
            accountSessionService.clearSession();
            applicationService.clearSensitiveData();
            userService.clearCustomerUserList();
            cabinetService.clearCabinetList();
            cabinetGroupService.clearCabinetGroupList();
        });
}

function confirmEmail(userId: string, token: string) {
    return apiService.post<SetPasswordResult>(
        'account', 'ConfirmUserEmail',
        { userId: userId, emailConfirmationToken: token }, [], null, false, service);
}

function setPassword(resetPasswordDto: SetPasswordDto) {
    return apiService.post<any>('account', 'ResetPassword', resetPasswordDto, [], null, false, service);
}

function forgotPassword(email: string) {
    return apiService.post<any>('account', 'ForgotPassword', { email: email }, [], null, false, service)
}


// WEBPACK FOOTER //
// ./src/modules/account/services/account.service.ts