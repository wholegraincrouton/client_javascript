import * as React from "react";
import { ActionButton } from "../../../shared/components/ActionButtons/ActionButtons";
import { permissionService, localise } from "../../../shared/services";
import { CabinetProvisioningStatus, SimulationMode } from "../../types/dto";

export interface Props {
    onHeaderButtonClick: (view: string) => void;
    onDisConnectClick: () => void;
    onDeprovisionClick: (cabinetId: string) => void;
    isUserLoggedIn?: boolean;
    isProvisioned?: boolean;
    cabinetId?: string;
    provisioningStatus?: CabinetProvisioningStatus;
    simulationMode?: SimulationMode;
}

export class CabinetControlCenterHeader extends React.Component<Props> {

    constructor(props: Props) {
        super(props);
    }

    changeView(view: string) {
        this.props.onHeaderButtonClick(view);
    }

    render() {
        let canViewConfigurations = permissionService.isActionPermittedForCustomer("CONFIGURATION", undefined, "VIRTUALCABINET");
        let canViewStates = permissionService.isActionPermittedForCustomer("STATES", undefined, "VIRTUALCABINET");
        let canViewEvents = permissionService.isActionPermittedForCustomer("EVENTS", undefined, "VIRTUALCABINET");
        let canViewItems = permissionService.isActionPermittedForCustomer("ITEMS", undefined, "VIRTUALCABINET");
        let canPerformDeprovision = permissionService.isActionPermittedForCustomer("DEPROVISION", undefined, "CABINET");
        let isDeprovisioningInProgress = (this.props.provisioningStatus == CabinetProvisioningStatus.DeprovisionInProgress)
        let isVirtualCabinet = (this.props.simulationMode == SimulationMode.VirtualCabinet)
        return (
            <>
                {this.props.isUserLoggedIn && canViewConfigurations &&
                    <ActionButton textKey="BUTTON_CONFIGURATION" color="secondary" icon="fa-wrench" onClick={() => this.changeView('configuration')} />}
                {this.props.isUserLoggedIn && canViewStates &&
                    <ActionButton textKey="BUTTON_STATES" color="secondary" icon="fa-exchange-alt" onClick={() => this.changeView('states')} />}
                {this.props.isUserLoggedIn && canViewEvents &&
                    <ActionButton textKey="BUTTON_EVENTS" color="secondary" icon="fa-clock" onClick={() => this.changeView('events')} />}
                {this.props.isUserLoggedIn && canViewItems &&
                    <ActionButton textKey="BUTTON_ITEMS" color="secondary" icon="fa-key" onClick={() => this.changeView('items')} />}
                {this.props.isProvisioned &&
                    <ActionButton textKey="BUTTON_DISCONNECT" color="secondary" icon="fa-minus-circle" onClick={() => { this.props.onDisConnectClick() }} />}
                {isDeprovisioningInProgress && isVirtualCabinet && canPerformDeprovision &&
                    <ActionButton textKey="BUTTON_COMPLETE_DEPROVISION" title={localise("TEXT_TOOLTIP_DEPROVISION")} color="secondary" icon="fa-ban" onClick={() => { this.props.cabinetId && this.props.onDeprovisionClick(this.props.cabinetId) }} />}
            </>
        );
    }
}

export default CabinetControlCenterHeader;


// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetControlCenter/CabinetControlCenterHeader.tsx