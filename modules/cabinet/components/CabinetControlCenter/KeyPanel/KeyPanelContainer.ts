import { StoreState } from "../../../../../redux/store";
import { cabinetControlCenterActions } from "../../../actions/cabinet-control-center.actions";
import { CabinetDoorStatus, CabinetPowerStatus, CabinetNetworkStatus, CabinetItemStatus } from "../../../types/dto";
import { connect } from "react-redux";
import { KeyPanel } from "./KeyPanel";
import { VirtualCabinetItem } from "src/modules/cabinet/types/store";


const mapStateToProps = (store: StoreState) => {
    const { doorStatus, networkStatus, simulationMode, powerStatus, userLoggedIn,
        loggedInUserId, items, relays, blinkItemIndex, loggedInUserName, touchScreenMode } = store.cabinetSimulation;
    return {
        doorStatus,
        simulationMode,
        powerStatus,
        networkStatus,
        userLoggedIn,
        loggedInUserId,
        loggedInUserName,
        items,
        relays,
        blinkItemIndex,
        touchScreenMode
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        toggleDoor: (status: CabinetDoorStatus, callbackFunction: () => any, userId?: string) => dispatch(cabinetControlCenterActions.toggleDoor(status, callbackFunction, userId)),
        togglePower: (status: CabinetPowerStatus, userId?: string) => dispatch(cabinetControlCenterActions.togglePower(status, userId)),
        toggleNetwork: (status: CabinetNetworkStatus, userId?: string) => dispatch(cabinetControlCenterActions.toggleNetwork(status, userId)),
        toggleItem: (item: VirtualCabinetItem, status: CabinetItemStatus, userId?: string, userName?: string) => dispatch(cabinetControlCenterActions.toggleItem(item, status, userId, userName))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(KeyPanel)


// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetControlCenter/KeyPanel/KeyPanelContainer.ts