import * as React from 'react';
import * as qs from "query-string";
import { Label, Row, Col, Alert } from 'reactstrap';
import { SubmissionError } from 'redux-form';
import { TabStrip, TabStripTab } from '@progress/kendo-react-layout';
import { store } from 'src/redux/store';
import { DetailPage, DetailFormBodyComponent, DetailPageContainer } from '../../../shared/components/DetailPage';
import { DetailFormHeaderComponent, DetailFormProps } from '../../../shared/components/DetailPage/DetailForm';
import { contextService, localise, permissionService } from '../../../shared/services';
import { DeviceUpdate, DeviceUpdateStates, Manifest, DeviceUpdatePlaceholders } from '../../types/dto';
import DeviceUpdateHeaderButtons from './DeviceUpdateHeaderButtons';
import { DeviceUpdateDetailsTab } from './Tabs/DeviceUpdateDetailsTab';
import { DeviceUpdateManifestTab } from './Tabs/DeviceUpdateManifestTab';
import { DeviceUpdateCabinetsTab } from './Tabs/DeviceUpdateCabinetsTab';
import "./../device-updates.css";
import { DefaultDateTimeFormats } from 'src/modules/shared/constants/datetime.constants';
import * as moment from 'moment';

class DeviceUpdateDetails extends DetailPage<DeviceUpdate> {
    detailFormBody: DetailFormBodyComponent = FormBody;
    detailFormHeader: DetailFormHeaderComponent = DeviceUpdateHeaderButtons;
    listPagePath: string = "/cabinet/deviceupdatemanagement";
    isRouteFromIcon: boolean = false;

    validateItem(item: DeviceUpdate) {
        return {};
    }

    objectToFormValues(deviceUpdate: DeviceUpdate): any {
        let obj = { ...deviceUpdate };
        obj.manifest = obj.manifest || {};
        obj.cabinetIds = obj.cabinetIds || [];
        
        if (deviceUpdate.id == "") {
            obj.updateLabel = `${DeviceUpdatePlaceholders.UpdateLabelPrefix}${moment.utc().format("DD-MM-YYYY/hh:mm[:00]A")}(UTC)`;
            obj.remark = DeviceUpdatePlaceholders.Remark;

            const criteria = qs.parse(this.props.history.location.search);
            this.isRouteFromIcon = criteria.contextCustomerId != undefined;

            if (this.isRouteFromIcon) {
                obj.customerId = criteria.contextCustomerId as string;
                let hasAdminPermissions = permissionService.isActionPermittedForCustomer("MANIFEST", obj.customerId);
                let pendingDeviceUpdates = store.getState().deviceUpdateStatus.customerDeviceUpdates;
                let pendingDeviceUpdate = pendingDeviceUpdates.find(d => d.deviceUpdateCustomerId == obj.customerId);

                if (pendingDeviceUpdate) {
                    let manifestTypes = pendingDeviceUpdate.cabinetManifests.map(c => { return c.manifestList; }).reduce((a, b) => a.concat(b));

                    obj.manifest.includeConfigurations = manifestTypes.some(m => m == "configurations");
                    obj.manifest.includeAccessDefinitions = manifestTypes.some(m => m == "accessdefinitions");
                    obj.manifest.includeEventRules = manifestTypes.some(m => m == "eventsalarms");

                    if (hasAdminPermissions) {
                        obj.manifest.includeLookups = manifestTypes.some(m => m == "lookups");
                    }

                    obj.cabinetIds = pendingDeviceUpdate.cabinetManifests.map(c => { return c.cabinetId; });
                }
            }
        }
        
        return obj;
    }

    formValuesToObject(values: any) {
        let localTime = values.localTime as Date;
        let localTimeString = moment(localTime).format(DefaultDateTimeFormats.DateTimeFormat);
        let hasAdminPermissions = permissionService.isActionPermittedForCustomer("MANIFEST");

        let manifest: Manifest = values.id == '' && !this.isRouteFromIcon ?
            {
                includeConfigurations: true,
                includeAccessDefinitions: true,
                includeEventRules: true,
                includeLookups: hasAdminPermissions
            } : values.manifest;

        return { ...values, localTime: localTimeString, manifest: manifest };
    }

    beforeSave(item: DeviceUpdate, isNew: boolean): boolean {
        let error = this.validate(item, isNew);

        if (error) {
            throw new SubmissionError({
                _error: error
            });
        }
        return true;
    }

    validate(item: DeviceUpdate, isNew: boolean) {
        if (!item.updateLabel || !item.remark || !item.localTime) {
            return "DETAILS:ERROR_REQUIRED_FIELD";
        }

        const criteria = qs.parse(this.props.history.location.search);
        let isRouteFromIcon = criteria.customerId != undefined;

        if (!isNew || isRouteFromIcon) {
            if (!item.manifest ||
                (!item.manifest.includeAccessDefinitions && !item.manifest.includeConfigurations &&
                    !item.manifest.includeEventRules && !item.manifest.includeLookups &&
                    !item.manifest.includeFirmware)) {
                return "UPDATES:ERROR_DEVICEUPDATE_MANIFEST_REQUIRED";
            }

            if (item.manifest.includeFirmware && !item.manifest.firmware) {
                return "UPDATES:ERROR_DEVICEUPDATE_MANIFEST_FIRMWARE_REQUIRED";
            }

            if (!item.cabinetIds || item.cabinetIds.length == 0) {
                return "CABINETS:ERROR_DEVICEUPDATE_DEVICES_REQUIRED";
            }
        }
        return null;
    }

    isReadOnly(item: DeviceUpdate) {
        return item.status != undefined && item.status != DeviceUpdateStates.Draft;
    }

    hideDescriptionHeader() {
        return true;
    }

    backButtonOverride() {
        if (this.isRouteFromIcon) {
            this.props.history.goBack();
            return true;
        }
        return false;
    }
}

interface LocalState {
    selectedTab: number;
}

class FormBody extends React.Component<DetailFormProps, LocalState> {
    constructor(props: DetailFormProps) {
        super(props);
        this.onSelectTab = this.onSelectTab.bind(this);

        this.state = {
            selectedTab: 0
        };
    }

    onSelectTab(e: any) {
        this.setState({ ...this.state, selectedTab: e.selected });
    }

    getTabHeader(titleKey: string, hasError: boolean = false, isDisabled: boolean = false) {
        return (
            <>
                <Label className="mt-1 mb-1" title={hasError ? localise("TEXT_ERROR_VERIFY_DATA_TAB") :
                    isDisabled ? localise("TEXT_PLEASE_SAVE_TO_PROCEED") : ""}>
                    {localise(titleKey)} {hasError && <i className="fas fa-exclamation-circle error-tab-icon"></i>}
                </Label>
            </>
        );
    }

    getErrorAlertRow(errorMsg: string) {
        return (
            <Row className="mt-2 mb-2">
                <Col>
                    <Alert className="mb-0" color="danger">
                        <small className="text-danger">{localise(errorMsg)}</small>
                    </Alert>
                </Col>
            </Row>
        );
    }

    render() {
        const { props } = this;
        const { selectedTab } = this.state;
        const errorTab = props.error && props.error.split(":")[0];
        const errorMsg = props.error && props.error.split(":")[1];

        const criteria = qs.parse(this.props.history.location.search);
        let isRouteFromIcon = criteria.contextCustomerId != undefined;
        const deviceUpdate = props.initialValues as DeviceUpdate;

        let hasAdminPermissions = permissionService.isActionPermittedForCustomer("MANIFEST");

        return (
            <div className="device-update-tabs">
                <TabStrip selected={selectedTab} onSelect={this.onSelectTab} keepTabsMounted={true}>
                    <TabStripTab title={this.getTabHeader("TEXT_DETAILS", errorTab == "DETAILS")}
                        contentClassName="device-update-details-tab">
                        {errorTab == "DETAILS" && this.getErrorAlertRow(errorMsg)}
                        <DeviceUpdateDetailsTab {...props} />
                    </TabStripTab>
                    {
                        hasAdminPermissions &&
                        <TabStripTab title={this.getTabHeader("TEXT_UPDATES", errorTab == "UPDATES")}
                            contentClassName="device-update-manifest-tab" disabled={props.isNew && !isRouteFromIcon}>
                            {errorTab == "UPDATES" && this.getErrorAlertRow(errorMsg)}
                            <DeviceUpdateManifestTab {...props} manifest={deviceUpdate.manifest} />
                        </TabStripTab>
                    }
                    <TabStripTab title={this.getTabHeader("TEXT_CABINETS", errorTab == "CABINETS")}
                        contentClassName="device-update-cabinets-tab" disabled={props.isNew && !isRouteFromIcon}>
                        {errorTab == "CABINETS" && this.getErrorAlertRow(errorMsg)}
                        <DeviceUpdateCabinetsTab {...props} customerId={deviceUpdate.customerId || ''}
                            cabinetIds={deviceUpdate.cabinetIds} />
                    </TabStripTab>
                </TabStrip>
            </div>
        );
    }
}

export default DetailPageContainer(DeviceUpdateDetails, 'DeviceUpdateDetails', 'deviceupdate', () => {
    //Code to return a new empty object.
    return { id: "", customerId: contextService.getCurrentCustomerId() }
});


// WEBPACK FOOTER //
// ./src/modules/deviceUpdates/components/DeviceUpdateDetails/DeviceUpdateDetails.tsx