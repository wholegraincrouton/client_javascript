import { blobApiService } from "src/modules/shared/services/blob-api.service";
import { store } from "src/redux/store";
import * as constants from "../constants/user-image.constants";
import cookies from "js-cookie";

const cookieName = "User";
let userImage: any;

export const userImageService = {
    setUserImage,
    removeUserImage,
    uploadUserImageFile,
    deleteUserImageFile,
    changeUserAvatar
};

function setUserImage(file: any) {
    userImage = file;
}

function removeUserImage() {
    userImage = undefined;
}

function uploadUserImageFile(url: string) {
    return blobApiService.putBlob(url, userImage.size, userImage);
}

function deleteUserImageFile(url: string) {
    return blobApiService.deleteBlob(url);
}

function changeUserAvatar(hasImage: boolean, imageURL?: string, hasChanged: boolean = false) {
    if (hasChanged) {
        let userCookie = cookies.get(cookieName);
        if (userCookie != undefined) {
            let userInfo = JSON.parse(userCookie);
            userInfo.user.hasProfileImage = hasImage;
            userInfo.user.profileImageURL = imageURL;
            const cookieContent = JSON.stringify({ user: userInfo.user });
            cookies.set(cookieName, cookieContent);
        }
    }

    store.dispatch({
        type: constants.CHANGE_USER_AVATAR,
        hasImage,
        imageURL
    });
}



// WEBPACK FOOTER //
// ./src/modules/users/services/user-image.service.ts