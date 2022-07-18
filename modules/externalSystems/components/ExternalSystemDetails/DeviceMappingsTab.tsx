import * as React from "react";
import { orderBy, SortDescriptor } from "@progress/kendo-data-query";
import { Grid, GridColumn, GridSortChangeEvent } from "@progress/kendo-react-grid";
import { Col, Input, Row } from "reactstrap";
import { contextService, localise } from "src/modules/shared/services";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { cabinetService } from "src/modules/cabinet/services/cabinet.service";
import { siteService } from "src/modules/sites/services/site.service";
import { ExternalDeviceMapping, ExternalSystem } from "../../types/dto";
import "./external-system-detail.css";

interface State {
    deviceMappings: ExternalDeviceMapping[];
    gridMappings: GridMapping[];
    sort: SortDescriptor[];
}

interface GridMapping {
    id: string;
    cabinet: string;
    size: number;
    site: string;
    device: string;
}

export class DeviceMappingsTab extends React.Component<DetailFormProps, State> {
    constructor(props: DetailFormProps) {
        super(props);
        this.onSortChange = this.onSortChange.bind(this);
        this.onDeviceMappingsChange = this.onDeviceMappingsChange.bind(this);

        const externalSystem = props.item as ExternalSystem;

        this.state = {
            deviceMappings: externalSystem.deviceMappings || [],
            gridMappings: [],
            sort: [{ field: 'cabinet', dir: 'asc' }]
        };
    }

    componentDidMount() {
        const { deviceMappings } = this.state;
        const customerId = contextService.getCurrentCustomerId();

        cabinetService.getCabinets(customerId).then(cabinets => {
            siteService.getSites(customerId).then(sites => {
                let gridMappings: GridMapping[] = [];

                cabinets.forEach(c => {
                    let site = sites.find(s => s.id == c.site);
                    let deviceMapping = deviceMappings.find(dm => dm.cabinet == c.id);

                    gridMappings.push({
                        id: c.id,
                        cabinet: c.name,
                        size: c.itemCount,
                        site: (site && site.name) || '',
                        device: (deviceMapping && deviceMapping.device) || ''
                    });
                });

                this.setState({ ...this.state, gridMappings: gridMappings });
            });
        });
    }

    onSortChange(event: GridSortChangeEvent) {
        this.setState({ ...this.state, sort: event.sort })
    }

    onDeviceMappingsChange(cabinetId: string, device: string) {
        const { deviceMappings, gridMappings } = this.state;

        let deviceMapping = deviceMappings.find(dm => dm.cabinet == cabinetId);

        if (deviceMapping) {
            if (!device) {
                deviceMappings.splice(deviceMappings.indexOf(deviceMapping), 1);
            }
            else {
                deviceMapping.device = device;
            }
        }
        else {
            deviceMappings.push({ cabinet: cabinetId, device: device });
        }

        let gridMapping = gridMappings.find(dm => dm.id == cabinetId);

        if (gridMapping) {
            gridMapping.device = device;
        }

        this.props.change('tempDeviceMappings', deviceMappings);
        this.setState({ ...this.state, deviceMappings: deviceMappings, gridMappings: gridMappings });
    }

    render() {
        const { gridMappings, sort } = this.state;

        return (
            <div className="device-mappings-tab">
                <Row className="mb-3">
                    <Col>
                        <small className="text-muted">{localise('REMARK_DEVICE_MAPPINGS_TAB')}</small>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Row className="mb-2">
                            <Col>
                                <small className="text-muted">{localise('REMARK_DEVICE_MAPPINGS_GRID')}</small>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Grid data={orderBy(gridMappings, sort)}
                                    sort={sort}
                                    sortable={{ allowUnsort: false, mode: 'single' }}
                                    onSortChange={this.onSortChange}>
                                    <GridColumn field="cabinet" title={localise('TEXT_CABINET_NAME')} className="color-blue" />
                                    <GridColumn field="size" title={localise('TEXT_SIZE')} />
                                    <GridColumn field="site" title={localise('TEXT_SITE')} />
                                    <GridColumn field="device" title={localise('TEXT_EXTENAL_SYSTEM_DEVICE')} cell={this.GetDeviceCell} />
                                </Grid>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>
        );
    }

    GetDeviceCell = (props: any) => <DeviceCell {...props} onChange={this.onDeviceMappingsChange} />;
}

class DeviceCell extends React.Component<any> {
    render() {
        const { dataItem } = this.props;
        const cabinetId = dataItem["id"];
        const device = dataItem["device"];

        return (
            <td>
                <Input type="text" key="device" name="device" value={device}
                    onChange={(e: any) => this.props.onChange(cabinetId, e.target.value)} />
            </td>
        )
    }
}



// WEBPACK FOOTER //
// ./src/modules/externalSystems/components/ExternalSystemDetails/DeviceMappingsTab.tsx