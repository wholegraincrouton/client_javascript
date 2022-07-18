import { cabinetControlCenterActions } from "../../actions/cabinet-control-center.actions";
import { connect } from "react-redux";
import CabinetControlCenter from "./CabinetControlCenter";
import { StoreState } from "../../../../redux/store";
import { VirtualCabinetItem } from "../../types/store";
import { TouchScreenMode } from "../../types/dto";

const mapStateToProps = (store: StoreState) => {
    const { cabinetId, hardwareId, linked, provisioningKey, provisioningStatus, powerStatus, networkStatus, userLoggedIn, loggedInUserId,
        simulationMode, doorStatus, itemCount, items, cabinetConfigurations, isMultiCustodyLogin, multiCustodyWitnessCount,
        multiCustodyLoginSuccessCount, cabinetStatus, eventHistory, itemHistory, 
        touchScreenEventHistory, cabinetEventContinuationToken, cabinetItemEventContinuationToken, touchScreenCabinetEventContinuationToken,
        touchScreenMode, item, touchScreenPopupMessage, alarms, timeOffset } = store.cabinetSimulation;
    return {
        cabinetId,
        hardwareId,
        provisioningKey,
        provisioningStatus,
        linked,
        powerStatus,
        networkStatus,
        simulationMode,
        itemCount,
        doorStatus,
        items,
        userLoggedIn,
        loggedInUserId,
        cabinetConfigurations,
        cabinetStatus,
        eventHistory,
        itemHistory,
        touchScreenEventHistory,
        cabinetEventContinuationToken,
        cabinetItemEventContinuationToken,
        touchScreenCabinetEventContinuationToken,
        touchScreenMode,
        isMultiCustodyLogin,
        multiCustodyWitnessCount,
        multiCustodyLoginSuccessCount,
        item, 
        touchScreenPopupMessage,
        alarms,
        timeOffset
    };
}

const mapDispatchToProps = (dispatch: any) => {

    return {
        unloadCabinet: () => dispatch(cabinetControlCenterActions.unloadCabinet()),
        switchTouchScreenMode: (screenMode: TouchScreenMode,callbackFunction: () => any) => dispatch(cabinetControlCenterActions.switchTouchScreenMode(screenMode,callbackFunction)),
        loadData: (cabinetId: string, callbackFunction: () => any) =>
            dispatch(cabinetControlCenterActions.loadCabinet(cabinetId, callbackFunction)),
        autoProvision: (provKey: string, hardwareId: string, itemCount: number, items: VirtualCabinetItem[],
            callbackFunction: () => any) =>
            dispatch(cabinetControlCenterActions.autoProvisionCabinet(provKey, hardwareId, itemCount, items, callbackFunction)),
        loadCabinetEvents: (primaryFilter: string, secondaryFilter: string, cabinetId: string,
            isLoadMore: boolean, pageToken?: string) =>
            dispatch(cabinetControlCenterActions.loadEvents({
                eventFilterText: primaryFilter,
                eventViewDurationFrom: secondaryFilter,
                pageToken: pageToken
            }, cabinetId, isLoadMore)),
        loadCabinetItemEvents: (cabinetId: string, itemIndex: number,
            isLoadMore: boolean, pageToken?: string) =>
            dispatch(cabinetControlCenterActions.loadItemEvents({
                itemIndex: itemIndex,
                pageToken: pageToken
            }, cabinetId, isLoadMore)),
        loadTouchScreenCabinetEvents: (filter: string, cabinetId: string,
            isLoadMore: boolean, pageToken?: string) =>
            dispatch(cabinetControlCenterActions.loadTouchScreenEvents({
                eventFilterText: '',
                eventViewDurationFrom: filter,
                pageToken: pageToken
            }, cabinetId, isLoadMore)),
        clearCabinetEventHistory: () => dispatch(cabinetControlCenterActions.clearEventHistoryData()),
        clearCabinetItemEventHistory: () => dispatch(cabinetControlCenterActions.clearItemEventHistoryData()),
        clearTouchScreenCabinetEventHistory: () => dispatch(cabinetControlCenterActions.clearTouchScreenEventHistoryData())
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CabinetControlCenter); 


// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetControlCenter/CabinetControlCenterContainer.ts