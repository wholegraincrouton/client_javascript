import { store } from "src/redux/store";
import { VirtualCabinetItem, VirtualCabinetItemAssignment, VirtualCabinetTimeConstraint, CabinetSimulationState } from "src/modules/cabinet/types/store";
import { TouchScreenMode, CabinetItemStatus } from "src/modules/cabinet/types/dto";
import { cabinetPermissionService } from "./cabinet-permission-service";
import { dateTimeUtilService } from "src/modules/shared/services/datetime-util.service";
import { cabinetControlCenterService } from "src/modules/cabinet/services/cabinetControlCenter.service";

let loggedInUserId: string | undefined;

export const cabinetItemStatusService =
{
    isItemShownInTouchScreen,
    setItemStatusByScreenMode,
    isItemAccessible
}

//#region Main functions

function isItemShownInTouchScreen(item: VirtualCabinetItem, touchScreenMode?: TouchScreenMode) {
    switch (touchScreenMode) {
        case TouchScreenMode.RETRIEVE_ITEM:
            return canRetrieveItem(item);
        case TouchScreenMode.RETURN_ITEM:
            return canReturnItem(item);
        case TouchScreenMode.RETURN_OVERRIDE:
            return canReturnOverrideItem(item);
        case TouchScreenMode.ITEM_HISTORY:
            return isItemAccessible(item);
        case TouchScreenMode.ITEM_HISTORY_ITEM:
            return canReturnItem(item) || canRetrieveItem(item);
        default:
            return false;
    }
}

function setItemStatusByScreenMode(items: VirtualCabinetItem[], screenMode: TouchScreenMode, userId?: string) {
    let virtualCabinetState: CabinetSimulationState = store.getState().cabinetSimulation;

    loggedInUserId = userId || loggedInUserId;

    items.forEach((item: VirtualCabinetItem, index: number) => {
        switch (screenMode) {
            case TouchScreenMode.MAIN_MENU:
            case TouchScreenMode.ITEM_HISTORY:
            case TouchScreenMode.ITEM_HISTORY_ITEM:
            case TouchScreenMode.EVENT_HISTORY:
            case TouchScreenMode.ABOUT_CABINET:
            case TouchScreenMode.MAINTENANCE:
            case TouchScreenMode.ALARM_MANAGEMENT:
                // If item cannot be retrieved and returned, or is grouped, set disabled status
                items[index].status = ((!canRetrieveItem(item) && !canReturnItem(item)) || (!canReturnItem(item) && isItemLockedForRetrievalByItemGroup(item, items))) ? CabinetItemStatus.Disabled :
                    // If item is in multi-custory state, set multi-custory status
                    isItemInMultiCustodyState(item, virtualCabinetState, screenMode) ? CabinetItemStatus.MultiCustody :
                        // If item is overdue, set overdue status
                        itemOverdue(item) ? CabinetItemStatus.Overdue :
                            // If item is removed, set removed status
                            itemRemoved(item) ? CabinetItemStatus.Removed :
                                // If item is belong to a group, set group status, else set available status
                                (item.itemGroupName) ? CabinetItemStatus.itemGrouped : CabinetItemStatus.Available;
                break;
            case TouchScreenMode.RETRIEVE_ITEM:
                // If item cannot be retrieved or is grouped, set disabled status
                items[index].status = (!canRetrieveItem(item) || isItemLockedForRetrievalByItemGroup(item, items)) ? CabinetItemStatus.Disabled :
                    // If item is in multi-custory state, set multi-custory status 
                    isItemInMultiCustodyState(item, virtualCabinetState, screenMode) ? CabinetItemStatus.MultiCustody :
                        // If item is belong to a group, set group status, else set available status
                        (item.itemGroupName) ? CabinetItemStatus.itemGrouped : CabinetItemStatus.Available;
                break;
            case TouchScreenMode.RETURN_ITEM:
                // If item cannot be returned, set disabled status
                items[index].status = !canReturnItem(item) ? CabinetItemStatus.Disabled :
                    // If item is in multi-custory state, set multi-custory status
                    isItemInMultiCustodyState(item, virtualCabinetState, screenMode) ? CabinetItemStatus.MultiCustody :
                        // If item is overdue, set overdue status, else set removed status
                        itemOverdue(item) ? CabinetItemStatus.Overdue : CabinetItemStatus.Removed;
                break;
            case TouchScreenMode.RETURN_OVERRIDE:
                // If item cannot be return overridden, set disabled status
                items[index].status = !canReturnOverrideItem(item) ? CabinetItemStatus.Disabled :
                    // If item is overdue, set overdue status, else set removed status
                    itemOverdue(item) ? CabinetItemStatus.Overdue : CabinetItemStatus.Removed;
                break;
            default:
                items[index].status = CabinetItemStatus.Disabled;
        }
    });
}

function isItemAccessible(item: VirtualCabinetItem) {
    let isAccessible = false;
    let currentDateTime = cabinetControlCenterService.getCurrentCabinetTime();
    var accessDefinitionSnapshot = store.getState().cabinetSimulation.accessDefinitionSnapshot;
    let itemAssignment = accessDefinitionSnapshot.itemAssignments.find(
        (ia: VirtualCabinetItemAssignment) => ia.itemIndex == item.itemIndex && ia.userId == loggedInUserId);

    if (itemAssignment) {
        for (let tid of itemAssignment.timeConstraintIds) {
            let constraint = accessDefinitionSnapshot.timeConstraints.find((tc: VirtualCabinetTimeConstraint) => tc.id == tid);

            if (isWithinTimeConstraint(constraint, currentDateTime)) {
                isAccessible = true;
                break;
            }
        }
    }
    
    return isAccessible;
}

//#endregion

//#region Support functions

function hasRetrievePermission() {
    return cabinetPermissionService.canPermissionGrant("DEV_CAB_NAV_RETRIEVE");
}

function hasReturnPermission() {
    return cabinetPermissionService.canPermissionGrant("DEV_CAB_NAV_RETURN");
}

function hasReturnOverridePermission() {
    return cabinetPermissionService.canPermissionGrant("DEV_CAB_NAV_RETURN_OVERRIDE");
}

function itemAvailable(item: VirtualCabinetItem) {
    return item.currentStatus == CabinetItemStatus.Available;
}

function itemRemoved(item: VirtualCabinetItem) {
    return item.currentStatus == CabinetItemStatus.Removed;
}

function itemOverdue(item: VirtualCabinetItem) {
    return item.currentStatus == CabinetItemStatus.Overdue;
}

function itemLastAccessedByCurrentUser(item: VirtualCabinetItem) {
    return item.lastAccessedByUserId == loggedInUserId;
}

function canRetrieveItem(item: VirtualCabinetItem) {
    return isItemAccessible(item) && hasRetrievePermission() && itemAvailable(item);
}

function canReturnItem(item: VirtualCabinetItem) {
    return isItemAccessible(item) && hasReturnPermission() && (itemRemoved(item) || itemOverdue(item)) && itemLastAccessedByCurrentUser(item);
}

function canReturnOverrideItem(item: VirtualCabinetItem) {
    return hasReturnOverridePermission() && (itemRemoved(item) || itemOverdue(item)) && !itemLastAccessedByCurrentUser(item);
}

function isItemLockedForRetrievalByItemGroup(item: VirtualCabinetItem, items: VirtualCabinetItem[]) {
    if (!item.itemGroupName || !item.maxItemsCanTakenFromGroup)
        return false;

    let removedGroupItemCount = 0;

    items.forEach(function (i) {
        if (i.itemGroupName == item.itemGroupName && (itemRemoved(i) || itemOverdue(i)) &&
            itemLastAccessedByCurrentUser(i) && i.itemIndex != item.itemIndex) {
            removedGroupItemCount++;
        }
    });

    return removedGroupItemCount >= item.maxItemsCanTakenFromGroup;
}

function isItemInMultiCustodyState(item: VirtualCabinetItem, virtualCabinetState: CabinetSimulationState, touchScreenMode: TouchScreenMode) {
    return (
        // Multi-custody has been defined for the item
        (item.multiCustodyWitnessCount && item.multiCustodyWitnessCount != 0) &&
        // Multi-custody successful login count has not reached multi-custody witness count
        !(virtualCabinetState.multiCustodyLoginSuccessCount && virtualCabinetState.multiCustodyLoginSuccessCount >= item.multiCustodyWitnessCount) &&
        // 'Return without witness' flag has not been set
        !(touchScreenMode != TouchScreenMode.RETRIEVE_ITEM && (itemRemoved(item) || itemOverdue(item)) && item.canReturnWithoutWitness)
    );
}

function isWithinTimeConstraint(constraint: VirtualCabinetTimeConstraint, currentDateTime: Date) {
    if (constraint && (constraint.validFromUtc == null || new Date(constraint.validFromUtc) <= currentDateTime)) {
        if (constraint.validToUtc == null || new Date(constraint.validToUtc) >= currentDateTime) {
            if (constraint.scheduleValues && (constraint.scheduleValues.some((v: string) =>
                v.toUpperCase() == currentDateTime.toLocaleString('en-us', { weekday: 'long' }).toUpperCase()))) {

                let currentTimeLocal = new Date(1, 1, 1, currentDateTime.getHours(), currentDateTime.getMinutes());

                if (constraint.accessAllowedFromTimeUtc.toString() == "00:00:00" ||
                    dateTimeUtilService.convertToLocalTime(constraint.accessAllowedFromTimeUtc) <= currentTimeLocal) {
                    if (constraint.accessAllowedToTimeUtc.toString() == "00:00:00" ||
                        dateTimeUtilService.convertToLocalTime(constraint.accessAllowedToTimeUtc) >= currentTimeLocal) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

//#endregion



// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetControlCenter/shared/cabinet-item-status.service.ts