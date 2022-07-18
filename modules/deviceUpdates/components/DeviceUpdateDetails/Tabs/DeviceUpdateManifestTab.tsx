import * as React from "react";
import { Row, Col, Label, Input } from "reactstrap";
import { localise } from "src/modules/shared/services";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { Manifest } from "src/modules/deviceUpdates/types/dto";
import FirmwareVersionList from "src/modules/firmware/shared/FirmwareVersionList";
import { permissionService } from '../../../../shared/services/permission.service';

interface Props {
    manifest: Manifest;
}

interface State {
    manifest: Manifest;
}

export class DeviceUpdateManifestTab extends React.Component<DetailFormProps & Props, State> {
    constructor(props: DetailFormProps & Props) {
        super(props);
        this.toggleConfigurations = this.toggleConfigurations.bind(this);
        this.toggleLookups = this.toggleLookups.bind(this);
        this.toggleAccessDefinitions = this.toggleAccessDefinitions.bind(this);
        this.toggleCabinetEvents = this.toggleCabinetEvents.bind(this);
        this.toggleFirmware = this.toggleFirmware.bind(this);
        this.onFirmwareChange = this.onFirmwareChange.bind(this);

        this.state = {
            manifest: { ...this.props.manifest }
        }
    }

    //#region Change functions

    toggleConfigurations() {
        let manifest: Manifest = {
            ...this.state.manifest,
            includeConfigurations: !this.state.manifest.includeConfigurations
        }
        this.setManifest(manifest);
    }

    toggleLookups() {
        let manifest: Manifest = {
            ...this.state.manifest,
            includeLookups: !this.state.manifest.includeLookups
        }
        this.setManifest(manifest);
    }

    toggleAccessDefinitions() {
        let manifest: Manifest = {
            ...this.state.manifest,
            includeAccessDefinitions: !this.state.manifest.includeAccessDefinitions
        }
        this.setManifest(manifest);
    }

    toggleCabinetEvents() {
        let manifest: Manifest = {
            ...this.state.manifest,
            includeEventRules: !this.state.manifest.includeEventRules
        }
        this.setManifest(manifest);
    }

    toggleFirmware() {
        let manifest: Manifest = {
            ...this.state.manifest,
            includeFirmware: !this.state.manifest.includeFirmware,
            firmware: undefined
        }
        this.setManifest(manifest);
    }

    onFirmwareChange(e: any) {
        let manifest: Manifest = {
            ...this.state.manifest,
            firmware: e.target.value
        }
        this.setManifest(manifest);
    }

    //#endregion

    setManifest(manifest: Manifest) {
        this.setState({
            ...this.state,
            manifest: manifest
        });

        this.props.change("manifest", manifest);
    }

    render() {
        const { manifest } = this.state;
        const { readonly } = this.props;
        const { item } = this.props;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');
        
        return (
            <>
                <Row className="mb-3">
                    <Col>
                        <small className="text-muted">{localise("REMARK_DEVICEUPDATE_MANIFEST")}</small>
                    </Col>
                </Row>
                <Row>
                    <Col className="pl-5">
                        <Row className="form-group">
                            <Col>
                                <Label className="mb-0">
                                    <Input type="checkbox" name="configurations" checked={manifest.includeConfigurations}
                                        onChange={this.toggleConfigurations} disabled={readonly || !isPermittedToEdit} />
                                    {localise("TEXT_CONFIGURATIONS")}
                                </Label>
                                <div><small className="text-muted">{localise('REMARK_MANIFEST_CONFIGS')}</small></div>
                            </Col>
                        </Row>
                        <Row className="form-group">
                            <Col>
                                <Label className="mb-0">
                                    <Input type="checkbox" name="lookups" checked={manifest.includeLookups}
                                        onChange={this.toggleLookups} disabled={readonly || !isPermittedToEdit} />
                                    {localise("TEXT_LOOKUPS")}
                                </Label>
                                <div><small className="text-muted">{localise('REMARK_MANIFEST_LOOKUPS')}</small></div>
                            </Col>
                        </Row>
                        <Row className="form-group">
                            <Col>
                                <Label className="mb-0">
                                    <Input type="checkbox" name="accessDefinitions" checked={manifest.includeAccessDefinitions}
                                        onChange={this.toggleAccessDefinitions} disabled={readonly || !isPermittedToEdit} />
                                    {localise("TEXT_ACCESS_PERMISSIONS")}
                                </Label>
                                <div><small className="text-muted">{localise('REMARK_MANIFEST_ACCESSPERMS')}</small></div>
                            </Col>
                        </Row>
                        <Row className="form-group">
                            <Col>
                                <Label className="mb-0">
                                    <Input type="checkbox" name="cabinetEventRules" checked={manifest.includeEventRules}
                                        onChange={this.toggleCabinetEvents} disabled={readonly || !isPermittedToEdit} />
                                    {localise("TEXT_CABINET_EVENTS")}
                                </Label>
                                <div><small className="text-muted">{localise('REMARK_MANIFEST_EVENT_RULES')}</small></div>
                            </Col>
                        </Row>
                        <Row className="form-group">
                            <Col>
                                <Label className="mb-0">
                                    <Input type="checkbox" name="firmware" checked={manifest.includeFirmware}
                                        onChange={this.toggleFirmware} disabled={readonly || !isPermittedToEdit} />
                                    {localise("TEXT_FIRMWARE")}
                                </Label>
                                {
                                    manifest.includeFirmware
                                    &&
                                    <FirmwareVersionList name="firmware" value={manifest.firmware || ''} onChange={this.onFirmwareChange}
                                        filterActive={true} disabled={readonly || !isPermittedToEdit} />
                                }
                                <div><small className="text-muted">{localise('REMARK_MANIFEST_FIRMWARE')}</small></div>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/deviceUpdates/components/DeviceUpdateDetails/Tabs/DeviceUpdateManifestTab.tsx