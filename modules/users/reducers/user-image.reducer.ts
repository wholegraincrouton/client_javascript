import { UserAvatarState } from "../../shared/types/store";
import { UserAvatarAction } from "../types/dto";
import * as constants from "../constants/user-image.constants";

export function userAvatar(state: UserAvatarState = { hasImage: false }, action: UserAvatarAction) {
    switch (action.type) {
        case constants.CHANGE_USER_AVATAR:
            return {
                hasImage: action.hasImage,
                imageURL: action.imageURL
            };
    }
    return state;    
}


// WEBPACK FOOTER //
// ./src/modules/users/reducers/user-image.reducer.ts