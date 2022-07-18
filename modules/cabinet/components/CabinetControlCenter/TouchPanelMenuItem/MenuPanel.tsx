import * as React from "react";
import Row from "reactstrap/lib/Row";
import Button from "reactstrap/lib/Button";
import { connect } from "react-redux";
import { StoreState } from "../../../../../redux/store";
import { cabinetControlCenterActions } from "src/modules/cabinet/actions/cabinet-control-center.actions";
import { localise, navService } from "src/modules/shared/services";
import { TouchScreenMode } from "src/modules/cabinet/types/dto";
import { cabinetPermissionService } from "../shared/cabinet-permission-service";
import { History } from "history"

export interface Props {
    touchScreenMode?: TouchScreenMode;
    loggedInUserAlternateId?: string;
    history: History;
    cabinetId?: string;
    switchTouchScreenMode: (touchScreenMode: TouchScreenMode, callbackFunction: () => void) => void;
    signOut: (callbackFunction: () => any, cabinetId?: string) => void;
}

export class MenuPanel extends React.Component<Props> {

    constructor(props: Props) {
        super(props);
        this.onReturnClick = this.onReturnClick.bind(this);
        this.onRetrieveClick = this.onRetrieveClick.bind(this);
        this.onReturnOverrideClick = this.onReturnOverrideClick.bind(this);
        this.onItemHistoryClick = this.onItemHistoryClick.bind(this);
        this.onEventHistoryClick = this.onEventHistoryClick.bind(this);
        this.onAboutCabinetClick = this.onAboutCabinetClick.bind(this);
        this.onMaintenanceClick = this.onMaintenanceClick.bind(this);
        this.onLogoutClick = this.onLogoutClick.bind(this);
    }

    onReturnClick() {
        this.props.switchTouchScreenMode(TouchScreenMode.RETURN_ITEM, () => this.onDataLoadCallBackFunc());
    }

    onRetrieveClick() {
        this.props && this.props.switchTouchScreenMode(TouchScreenMode.RETRIEVE_ITEM, () => this.onDataLoadCallBackFunc());
    }

    onReturnOverrideClick() {
        this.props && this.props.switchTouchScreenMode(TouchScreenMode.RETURN_OVERRIDE, () => this.onDataLoadCallBackFunc());
    }

    onDataLoadCallBackFunc() {
        navService.goBackToListPage("/cabinet/cabinetmanagement", this.props.history);
    }

    onItemHistoryClick() {
        this.props && this.props.switchTouchScreenMode(TouchScreenMode.ITEM_HISTORY, () => this.onDataLoadCallBackFunc());
    }

    onEventHistoryClick() {
        this.props && this.props.switchTouchScreenMode(TouchScreenMode.EVENT_HISTORY, () => this.onDataLoadCallBackFunc());
    }

    onMaintenanceClick() {
        this.props && this.props.switchTouchScreenMode(TouchScreenMode.MAINTENANCE, () => this.onDataLoadCallBackFunc())
    }

    onAboutCabinetClick() {
        this.props && this.props.switchTouchScreenMode(TouchScreenMode.ABOUT_CABINET, () => this.onDataLoadCallBackFunc());
    }

    onLogoutClick() {
        this.props && this.props.signOut(() => this.onDataLoadCallBackFunc(),
            this.props.cabinetId);
    }

    render() {
        var loggedInUserAlternateId = this.props.loggedInUserAlternateId;
        return <>
            {
                cabinetPermissionService.canPermissionGrant("DEV_CAB_NAV_RETRIEVE", loggedInUserAlternateId) &&
                <Row>
                    <Button name="btnRetrieve" className="menu-button bg-blue border-blue mb-2" onClick={this.onRetrieveClick} value="Retrieve">{localise("BUTTON_RETRIEVE_ITEM_MENU")}</Button>
                </Row>
            }
            {
                cabinetPermissionService.canPermissionGrant("DEV_CAB_NAV_RETURN", loggedInUserAlternateId) &&
                <Row>
                    <Button name="btnReturn" className="menu-button bg-blue border-blue mb-2" onClick={this.onReturnClick} value="Return">{localise("BUTTON_RETURN_ITEM_MENU")}</Button>
                </Row>
            }
            {
                cabinetPermissionService.canPermissionGrant("DEV_CAB_NAV_RETURN_OVERRIDE", loggedInUserAlternateId) &&
                <Row>
                    <Button name="btnReturnOverride" className="menu-button bg-blue border-blue mb-2" onClick={this.onReturnOverrideClick} value="ReturnOverride">{localise("BUTTON_RETURN_OVERRIDE_MENU")}</Button>
                </Row>
            }
            {
                cabinetPermissionService.canPermissionGrant("DEV_CAB_NAV_ITEM_HISTORY", loggedInUserAlternateId) &&
                <Row>
                    <Button name="btnItemHistory" className="menu-button bg-blue border-blue mb-2" onClick={this.onItemHistoryClick} value="ItemHistory">{localise("BUTTON_ITEM_HISTORY_MENU")}</Button>
                </Row>
            }
            {
                cabinetPermissionService.canPermissionGrant("DEV_CAB_NAV_EVENT_HISTORY", loggedInUserAlternateId) &&
                <Row>
                    <Button name="btnEventHistory" className="menu-button bg-blue border-blue mb-2" onClick={this.onEventHistoryClick} value="EventHistory">{localise("BUTTON_EVENT_HISTORY_MENU")}</Button>
                </Row>
            }
            {
                cabinetPermissionService.canPermissionGrant("DEV_CAB_NAV_MAINTENANCE", loggedInUserAlternateId) &&
                <Row>
                    <Button name="btnMaintenance" className="menu-button bg-blue border-blue mb-2" onClick={this.onMaintenanceClick} value="Maintenance">{localise("BUTTON_MAINTENANCE_MENU")}</Button>
                </Row>
            }
            {
                cabinetPermissionService.canEnrolCardAtCabinet(loggedInUserAlternateId) &&
                <Row>
                    <Button name="btnEnrolCard" className="menu-button bg-blue border-blue mb-2" value="EnrolCard">{localise("BUTTON_ENROL_CARD_MENU")}</Button>
                </Row>
            }
            <Row>
                <Button name="btnAboutCabinet" className="menu-button bg-blue border-blue mb-2" onClick={this.onAboutCabinetClick} value="AboutCabinet">{localise("BUTTON_ABOUT_CABINET_MENU")}</Button>
            </Row>
            <Row>
                <Button name="btnLogout" className="logout-button" onClick={this.onLogoutClick} value="Logout">{localise("BUTTON_LOGOUT_MENU")}</Button>
            </Row>
        </>
    }
}


const mapStateToProps = (store: StoreState) => {
    const { touchScreenMode, loggedInUserAlternateId, cabinetId } = store.cabinetSimulation;
    return { touchScreenMode, loggedInUserAlternateId, cabinetId };
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        switchTouchScreenMode: (touchScreenMode: TouchScreenMode, callbackFunction: () => any) => dispatch(cabinetControlCenterActions.switchTouchScreenMode(touchScreenMode, callbackFunction)),
        signOut: (callbackFunction: () => any, cabinetId?: string) => dispatch(cabinetControlCenterActions.signOut(callbackFunction, cabinetId))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MenuPanel)


// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetControlCenter/TouchPanelMenuItem/MenuPanel.tsx