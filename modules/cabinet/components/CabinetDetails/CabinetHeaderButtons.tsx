import * as React from "react";
import { Field } from "redux-form";
import { DetailFormProps } from "../../../shared/components/DetailPage";
import { CabinetControlCenterButton } from "../CabinetControlCenter/CabinetControlCenterButton";
import { store } from "src/redux/store";
import { DeprovisionButton } from "./DeprovisionButton";
import { CabinetProvisioningStatus } from "../../types/dto";
import { CabinetLockButton } from "./CabinetLockButton";
import { ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { cabinetService } from "../../services/cabinet.service";
import { alertActions } from "src/modules/shared/actions/alert.actions";
import { permissionService } from "src/modules/shared/services";

const CabinetHeaderButtons = (formProps: DetailFormProps) => {
    let storeObj = store.getState().form.CabinetDetailsForm.values;
    let cabinetId = storeObj && storeObj.id;

    function onLogsButtonClick() {
        cabinetService.triggerCabinetLogUpload(cabinetId).then(() => alertActions.showSuccess('TEXT_LOGS_UPLOAD_INITIATED'));
    }

    return <>
        <span className="virtual-cabinet-button">
            {
                !formProps.isNew && formProps.item.provisioningStatus == CabinetProvisioningStatus.Provisioned &&
                <ActionButton textKey='BUTTON_SYS_LOGS' icon='fa-wrench' color='primary' onClick={onLogsButtonClick}
                    isPermissionAllowed={permissionService.checkIfPermissionExistsForCustomer('CABINET_FIRMWARE_LOGS')} />
            }
            {
                !formProps.isNew &&
                <CabinetLockButton isProvisioned={formProps.item.provisioningStatus == CabinetProvisioningStatus.Provisioned} cabinetId={cabinetId}
                    buttonStatus={formProps.item.lockStatus} />
            }
            {
                !formProps.isNew &&
                <CabinetControlCenterButton isProvisioned={formProps.item.provisioningStatus != CabinetProvisioningStatus.Deprovisioned}
                    isVirtualCabinet={formProps.item.isVirtualCabinet} />
            }
            {
                !formProps.isNew && <Field name="deprovision" component={(props: any) =>
                    <DeprovisionButton customerId={storeObj && storeObj.customerId}
                        cabinetId={cabinetId} provisioningStatus={formProps.item.provisioningStatus} />} />
            }
        </span>
    </>
}

export default CabinetHeaderButtons;


// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetDetails/CabinetHeaderButtons.tsx