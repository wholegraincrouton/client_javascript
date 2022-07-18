import { connect } from "react-redux";
import { StoreState } from "src/redux/store";
import { deviceUpdateActions } from "../../actions/device-update-actions";
import { DeviceUpdateStatusIcon } from "./DeviceUpdateStatusIcon";
import { permissionService, localise, contextService } from "src/modules/shared/services";

const mapStateToProps = (store: StoreState) => {
    const { customerDeviceUpdates } = store.deviceUpdateStatus;
    const customerId = contextService.getCurrentCustomerId();
    const adminManifestTypes = ["lookups", "localisations", "firmware"];
    let pendingDeviceUpdates = [...customerDeviceUpdates];

    pendingDeviceUpdates.forEach(d => {
        let hasAdminPermissions = permissionService.isActionPermittedForCustomer(
            "MANIFEST", d.deviceUpdateCustomerId, "DEVICEUPDATE");

        d.cabinetManifests.forEach(c => {
            if (!hasAdminPermissions) {
                c.manifestList = c.manifestList.filter(m => {
                    return !adminManifestTypes.includes(m);
                });
            }
        });

        d.cabinetManifests = d.cabinetManifests.filter(c => {
            return c.manifestList.length > 0;
        });
    });

    pendingDeviceUpdates = pendingDeviceUpdates.filter(d => {
        return d.cabinetManifests.length > 0;
    });

    let cabinetCount = 0;
    let tooltipText = "";

    const customerUpdates = pendingDeviceUpdates.find(d => d.deviceUpdateCustomerId == customerId);

    if (customerUpdates && customerUpdates.cabinetManifests) {
        cabinetCount = customerUpdates.cabinetManifests.length;

        tooltipText = (cabinetCount == 0) ? localise("TOOLTIP_TEXT_NO_DEVICE_UPDATE_REQUIRED") :
            (cabinetCount == 1) ? localise("TOOLTIP_TEXT_DEVICE_UPDATE_REQUIRED_SINGLE_CABINET_NO_AUTOUPDATE") :
                localise("TOOLTIP_TEXT_DEVICE_UPDATE_REQUIRED_MULTIPLE_CABINETS_NO_AUTOUPDATE").replace("#TOTALCOUNT#", cabinetCount.toString());
    }

    return {
        cabinetCount,
        tooltipText
    };
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        getDeviceUpdateStatus: () => dispatch(deviceUpdateActions.getDeviceUpdateStatus())
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DeviceUpdateStatusIcon);


// WEBPACK FOOTER //
// ./src/modules/deviceUpdates/components/DeviceUpdateStatusIcon/DeviceUpdateStatusIconContainer.ts