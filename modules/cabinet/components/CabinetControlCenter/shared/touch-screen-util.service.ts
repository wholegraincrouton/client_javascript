import { CabinetItemStatus, CabinetItemStatusColor, TouchScreenMode } from "src/modules/cabinet/types/dto";
import { localise } from "src/modules/shared/services";
import { VirtualCabinetItem } from "src/modules/cabinet/types/store";

export const touchScreenCommonService = {
    getItemButtonColor,
    getScreenTitle,
    getScreenSubtitle
}

function getScreenTitle(touchScreenMode?: TouchScreenMode) {
    switch (touchScreenMode) {
        case TouchScreenMode.MAIN_MENU:
            return localise('TEXT_MAIN_MENU');
        case TouchScreenMode.RETURN_ITEM:
            return localise('TEXT_RETURN_ITEM');
        case TouchScreenMode.RETRIEVE_ITEM:
            return localise('TEXT_RETRIEVE_ITEM');
        case TouchScreenMode.RETURN_OVERRIDE:
            return localise('TEXT_RETURN_OVERRIDE');
        case TouchScreenMode.ITEM_HISTORY:
        case TouchScreenMode.ITEM_HISTORY_ITEM:
            return localise('TEXT_ITEM_HISTORY');
        case TouchScreenMode.EVENT_HISTORY:
            return localise('TEXT_EVENT_HISTORY');
        case TouchScreenMode.LOGIN_SCREEN:
            return localise('TEXT_LOGIN');
        case TouchScreenMode.MULTI_CUSTODY_LOGIN_SCREEN:
            return localise('TEXT_MULTI_CUSTODY_LOGIN');        
        case TouchScreenMode.ABOUT_CABINET:
            return localise('TEXT_ABOUT_CABINET');
        case TouchScreenMode.MAINTENANCE:
            return localise('TEXT_MAINTENANCE');
        case TouchScreenMode.ALARM_MANAGEMENT:
            return localise('ALARM_MANAGEMENT_MENU');
        default:
            return '';
    }
}

function getItemButtonColor(item: VirtualCabinetItem) {
    switch (item.status) {
        case CabinetItemStatus.Available:
            return CabinetItemStatusColor.Available;
        case CabinetItemStatus.Removed:
            return CabinetItemStatusColor.Unavailable;
        case CabinetItemStatus.Disabled:
            return CabinetItemStatusColor.Disabled;
        case CabinetItemStatus.MultiCustody:
            return CabinetItemStatusColor.MultiCustody;
        case CabinetItemStatus.Overdue:
            return CabinetItemStatusColor.Overdue;
        case CabinetItemStatus.itemGrouped:
            return CabinetItemStatusColor.ItemGrouped;
    }
    return CabinetItemStatusColor.Available;
}

function getScreenSubtitle(touchScreenMode?: TouchScreenMode) {
    switch (touchScreenMode) {        
        case TouchScreenMode.ITEM_HISTORY:
            return localise('REMARK_ITEM_HISTORY');        
        default:
            return undefined;
    }
}



// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetControlCenter/shared/touch-screen-util.service.ts