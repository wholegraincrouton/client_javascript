import * as React from "react";
import { ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { CabinetLockState } from "../../types/dto";
import { cabinetService } from "../../services/cabinet.service";
import { accountSessionService, confirmDialogService, localise, permissionService } from "src/modules/shared/services";

interface Props {
    cabinetId: string;
    buttonStatus: string;
    isProvisioned: boolean;
}

interface State {
    buttonStatus: string;
}

export class CabinetLockButton extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.changeCabinetLockState = this.changeCabinetLockState.bind(this);
        this.getButtonTooltip = this.getButtonTooltip.bind(this);
        this.state = {
            buttonStatus: this.props.buttonStatus
        }
    }

    changeCabinetLockState(cabinetId: string) {
        confirmDialogService.showDialog(this.state.buttonStatus == CabinetLockState.Locked ? "CONFIRMATION_CABINET_UNLOCK" : "CONFIRMATION_CABINET_LOCK",
            () => {
                let newState = this.state.buttonStatus == CabinetLockState.Locked ? CabinetLockState.UnLocked : CabinetLockState.Locked;
                this.setState({ buttonStatus:  newState})
                cabinetService.changeCabinetLockState(cabinetId, newState, accountSessionService.getLoggedInUserId());                
            })
    }

    getButtonTooltip(isProvisioned: boolean, lockState: string){
        let tooltip = "";
        tooltip = isProvisioned ? (lockState == CabinetLockState.Locked ? localise("CABINET_UNLOCK_TOOLTIP") : localise("CABINET_LOCK_TOOLTIP")) : localise("CABINET_LOCK_NOT_PROVISIONED_TOOLTIP");
        return tooltip;
    }

    render() {
        const { cabinetId, isProvisioned } = this.props;
        const { buttonStatus } = this.state;
        const canViewButton = permissionService.checkIfPermissionExists("CABINET_LOCK");

        return (
            <>
                {      
                    canViewButton  &&     
                    <ActionButton color={ isProvisioned ? ( buttonStatus == CabinetLockState.Locked  ? "success" : "danger") : "secondary"} onClick={() => this.changeCabinetLockState(cabinetId)}
                        textKey={buttonStatus ==  CabinetLockState.Locked?
                            "TEXT_UNLOCK_CABINET" : "TEXT_LOCK_CABINET"}
                        icon={buttonStatus == CabinetLockState.Locked ? "fa-unlock" : "fa-lock"}
                        disabled={!isProvisioned} 
                        title={this.getButtonTooltip(isProvisioned, buttonStatus)}
                        />
                }
            </>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetDetails/CabinetLockButton.tsx