import * as React from "react";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { DeviceUpdateStates, DeviceUpdate } from "../../types/dto";
import { ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { permissionService, confirmDialogService } from "src/modules/shared/services";
import { deviceUpdateService } from "../../services/deviceUpdate.service";
import { alertActions } from "src/modules/shared/actions/alert.actions";

const DeviceUpdateHeaderButtons = (formProps: DetailFormProps) => {
    var canPublish = permissionService.canPermissionGrant('PUBLISH');

    function publishDeviceUpdate() {
        let deviceUpdate: DeviceUpdate = formProps.item;

        confirmDialogService.showDialog('CONFIRMATION_PUBLISH',
            () => {
                if (!deviceUpdate.manifest ||
                    (!deviceUpdate.manifest.includeAccessDefinitions &&
                        !deviceUpdate.manifest.includeConfigurations &&
                        !deviceUpdate.manifest.includeEventRules &&
                        !deviceUpdate.manifest.includeLookups &&
                        (!deviceUpdate.manifest.includeFirmware || !deviceUpdate.manifest.firmware))) {
                    alertActions.showError("ERROR_DEVICEUPDATE_MANIFEST_REQUIRED");
                    return;
                }
                else if (!deviceUpdate.cabinetIds || deviceUpdate.cabinetIds.length == 0) {
                    alertActions.showError("ERROR_DEVICEUPDATE_DEVICES_REQUIRED");
                    return;
                }

                deviceUpdateService.publish(deviceUpdate.id)
                    .then(() => {
                        formProps.reload();
                        alertActions.showSuccess('TEXT_PUBLISH_INITIATED');
                    });
            });
    }

    return <>
        {
            !formProps.isNew && formProps.item.status == DeviceUpdateStates.Draft
            &&
            <ActionButton isPermissionAllowed={canPublish} textKey="BUTTON_PUBLISH"
                onClick={publishDeviceUpdate} color="secondary" icon="fa-key"
                disabled={formProps.dirty} />
        }
    </>
}

export default DeviceUpdateHeaderButtons;


// WEBPACK FOOTER //
// ./src/modules/deviceUpdates/components/DeviceUpdateDetails/DeviceUpdateHeaderButtons.tsx