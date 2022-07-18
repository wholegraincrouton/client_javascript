import * as React from "react";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { complexIntegrations, ExternalSystem, TempExternalSystemConfiguration } from "../../types/dto";
import { Row, Col, Label, Input } from "reactstrap";
import { localise, permissionService, utilityService } from "src/modules/shared/services";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { externalSystemsService } from "../../services/externalSystems.service";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";

interface State {
    externalSystemConfigurations: TempExternalSystemConfiguration[];
}

export class MiddlewareConfiguration extends React.Component<DetailFormProps, State>{
    clientCertRequiredConfigKey: string = 'IS_CLIENT_CERTIFICATE_REQUIRED';
    clientCertThumbprintConfigKey: string = 'CLIENT_CERTIFICATE_THUMBPRINT';
    clientCertThumbprintConfig: any;

    constructor(props: DetailFormProps) {
        super(props);
        this.onConfigurationValueChanges = this.onConfigurationValueChanges.bind(this);

        let intialExternalSystemDetails = props.initialValues as ExternalSystem;
        let configs = externalSystemsService.getProcessedExternalSystemConfigurations(
            intialExternalSystemDetails.integrationSystem, intialExternalSystemDetails.externalSystemConfigurations || []);

        let clientCertRequiredConfig = configs.find(c => c.key == this.clientCertRequiredConfigKey);
        this.clientCertThumbprintConfig = { ...configs.find(c => c.key == this.clientCertThumbprintConfigKey), value: '' };

        if (clientCertRequiredConfig) {
            if (!clientCertRequiredConfig.value) {
                clientCertRequiredConfig.value = 'NO';
            }

            if (clientCertRequiredConfig.value == 'NO') {
                configs.splice(configs.findIndex(c => c.key == this.clientCertThumbprintConfigKey), 1);
            }
        }

        this.state = {
            externalSystemConfigurations: configs
        };
    }

    onConfigurationValueChanges(event: any, key: string) {
        const { change } = this.props;
        let { externalSystemConfigurations } = this.state;

        let config = externalSystemConfigurations.find(c => c.key == key);

        if (config) {
            config.value = event.target.value;

            if (key == this.clientCertRequiredConfigKey) {
                if (config.value == 'YES') {
                    externalSystemConfigurations.push({ ...this.clientCertThumbprintConfig });
                    externalSystemConfigurations = utilityService.getSortedList(externalSystemConfigurations, 'sortOrder');
                }
                else {
                    externalSystemConfigurations.splice(externalSystemConfigurations.findIndex(c => c.key == this.clientCertThumbprintConfigKey), 1);
                }
            }

            this.setState({ ...this.state, externalSystemConfigurations: externalSystemConfigurations })
            change("tempExternalSystemConfigurations", externalSystemConfigurations);
        }
    }

    render() {
        const { item } = this.props;
        const { externalSystemConfigurations } = this.state;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');

        return (
            <div className="middleware-config-tab">
                {
                    complexIntegrations.includes(item.integrationSystem) &&
                    <>
                        <Row className="middleware-config mt-2">
                            <Col>
                                <Row className="mb-2">
                                    <Col>
                                        <Row>
                                            <Col>
                                                <Label className="system-label mb-0">{localise('TEXT_EXCHANGE_CONNECTIVITY_SOFTWARE')}:</Label>
                                            </Col>
                                            <Col>
                                                <span>{item.isMiddlewareConnected ? localise('TEXT_ONLINE') : localise('TEXT_OFFLINE')}</span>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <small className="text-muted">{localise('REMARK_EXCHANGE_WEB_CONNECTIVITY')}</small>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Row>
                                            <Col>
                                                <Label className="system-label mb-0">{localise('TEXT_EXCHANGE_CONNECTIVITY_EXTERNAL_SYSTEM')}:</Label>
                                            </Col>
                                            <Col>
                                                <span>{item.isMiddlewareConnected ? item.isExternalSystemConnected ? localise('TEXT_ONLINE') : localise('TEXT_OFFLINE') : localise('TEXT_UNKNOWN')}</span>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <small className="text-muted">{localise('REMARK_EXCHANGE_EXTERNAL_CONNECTIVITY')}</small>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <hr />
                    </>
                }
                <Row className="external-system-config">
                    <Col>
                        <Row>
                            <Col>
                                <Label className="system-label mb-0">{localise('TEXT_EXTERNAL_SYSTEM_CONFIGURATION')}*</Label>
                            </Col>
                        </Row>
                        <Row className="mb-2">
                            <Col>
                                <small className="text-muted">{localise('REMARK_INTEGRATION_SETTINGS')}</small>
                            </Col>
                        </Row>
                        <Row className="pl-4">
                            <Col className="middleware-config">
                                <Grid data={externalSystemConfigurations} className={isPermittedToEdit ? "non-sortable" : "disabled-grid"}>
                                    <GridColumn field="text" title={localise('TEXT_CONFIG_KEY')} />
                                    <GridColumn field="remark" title={localise('TEXT_DESCRIPTION')} />
                                    <GridColumn field="value" title={localise('TEXT_VALUE')} cell={this.ConfigValueCell} />
                                </Grid>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>
        );
    }

    ConfigValueCell = (props: any) => <ConfigValueCell {...props} onChange={this.onConfigurationValueChanges} />
}

class ConfigValueCell extends React.Component<any> {
    render() {
        const { dataItem, onChange } = this.props;
        const key = dataItem["key"];
        const value = dataItem["value"];
        const childLookupKey = dataItem["childLookup"];

        return (
            <td>
                {
                    childLookupKey ?
                        <LookupDropDown lookupKey={childLookupKey} value={value} onChange={(e) => onChange(e, key)} />
                        :
                        <Input type={key == 'PASSWORD' ? 'password' : 'text'} value={value} onChange={(e) => onChange(e, key)} autoComplete="off" />
                }
            </td>
        );
    }
}


// WEBPACK FOOTER //
// ./src/modules/externalSystems/components/ExternalSystemDetails/MiddlewareConfiguration.tsx