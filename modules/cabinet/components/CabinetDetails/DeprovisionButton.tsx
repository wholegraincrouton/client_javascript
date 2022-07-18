import * as React from "react";
import { ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { CabinetProvisioningStatus } from "../../types/dto";
import { cabinetService } from "../../services/cabinet.service";
import { permissionService, confirmDialogService } from "src/modules/shared/services";

interface Props {
    customerId: string;
    cabinetId: string;
    provisioningStatus: CabinetProvisioningStatus;
}

interface State {
    provisionStatus?: CabinetProvisioningStatus;
}

export class DeprovisionButton extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.onCabinetDeprovision = this.onCabinetDeprovision.bind(this);
        this.state = {
            provisionStatus: this.props.provisioningStatus
        }
    }

    onCabinetDeprovision(cabinetId: string) {
        confirmDialogService.showDialog("CONFIRMATION_DEPROVISION",
            () => {
                this.setState({ provisionStatus: CabinetProvisioningStatus.DeprovisionInProgress })
                cabinetService.initiateCabinetDeprovision(cabinetId);
            })
    }

    render() {
        const { cabinetId } = this.props;
        const { provisionStatus } = this.state;
        let canDeprovision = permissionService.isActionPermittedForCustomer("DEPROVISION", undefined, "CABINET");
        
        return (
            <>
                {
                    canDeprovision && (provisionStatus != CabinetProvisioningStatus.Deprovisioned) &&
                    <ActionButton color="secondary" onClick={() => this.onCabinetDeprovision(cabinetId)}
                        textKey={provisionStatus == CabinetProvisioningStatus.Provisioned ?
                            "BUTTON_DEPROVISION" : "BUTTON_WAIT_FOR_DEPROVISIONING"}
                        icon={provisionStatus == CabinetProvisioningStatus.Provisioned ? "fa-ban" : "fa-hourglass-half"}
                        disabled={provisionStatus == CabinetProvisioningStatus.DeprovisionInProgress} />
                }
            </>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetDetails/DeprovisionButton.tsx