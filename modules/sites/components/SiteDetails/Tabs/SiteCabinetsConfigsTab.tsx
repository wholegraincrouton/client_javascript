import * as React from "react";
import { Row, Col, Button } from "reactstrap";
import { store } from "src/redux/store";
import { localise, lookupService, permissionService } from "src/modules/shared/services";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { ConfigurationGrid } from "src/modules/shared/components/ConfigurationGrid/ConfigurationGrid";
import { CabinetConfiguration } from "src/modules/shared/types/dto";

interface State {
    showAdminConfigs: boolean;
    adminConfigs: CabinetConfiguration[];
    nonAdminConfigs: CabinetConfiguration[];
}

export class SiteCabinetsConfigsTab extends React.Component<DetailFormProps, State> {
    constructor(props: DetailFormProps) {
        super(props);
        this.onConfigsChange = this.onConfigsChange.bind(this);
        this.onAdminConfigsChange = this.onAdminConfigsChange.bind(this);
        this.toggleAdminConfigs = this.toggleAdminConfigs.bind(this);

        const excludedConfigs = lookupService.getList('LIST_EXCLUDED_CABINET_CONFIGURATIONS_KEYS');

        const configurations = [...props.item.configurations] as CabinetConfiguration[];

        this.state = {
            showAdminConfigs: false,
            adminConfigs: configurations.filter(c => excludedConfigs.some(ec => ec.value == c.key)),
            nonAdminConfigs: configurations.filter(c => !excludedConfigs.some(ec => ec.value == c.key))
        };
    }

    onConfigsChange(configs: CabinetConfiguration[]) {
        const { adminConfigs } = this.state;
        const configurations = [...configs, ...adminConfigs];
        this.props.change("configurations", JSON.stringify(configurations));
        this.setState({...this.state, nonAdminConfigs: configs});
    }

    onAdminConfigsChange(configs: CabinetConfiguration[]) {
        const { nonAdminConfigs } = this.state;
        const configurations = [...configs, ...nonAdminConfigs];
        this.props.change("configurations", JSON.stringify(configurations));
        this.setState({...this.state, adminConfigs: configs});
    }

    toggleAdminConfigs() {
        this.setState({ ...this.state, showAdminConfigs: !this.state.showAdminConfigs });
    }

    render() {
        const { showAdminConfigs } = this.state;
        const site = store.getState().form.SiteDetailsForm.values as any;
        const hasAdminPermissions = permissionService.isActionPermittedForCustomer("CONFIGURATION");
        const { item } = this.props;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');

        return (
            <>
                <Row className="mb-3">
                    <Col>
                        <small className="text-muted">{localise("REMARK_SITECABINETS_CONFIGURATION")}</small>
                    </Col>
                </Row>
                <ConfigurationGrid configurations={JSON.parse(site.configurations)} onChange={this.onConfigsChange}
                    lookupkey="LIST_CABINET_CONFIGURATION_KEYS" excludedLookupKey="LIST_EXCLUDED_CABINET_CONFIGURATIONS_KEYS" 
                    isPermittedToEdit={isPermittedToEdit}/>
                {
                    hasAdminPermissions &&
                    <>
                        <Row className={`mt-2 ${showAdminConfigs ? 'mb-2' : ''}`}>
                            <Col align="right">
                                <Button color="link" onClick={this.toggleAdminConfigs}>
                                    {localise(showAdminConfigs ? "BUTTON_HIDE_ADMIN_CONFIGURATIONS" : "BUTTON_SHOW_ADMIN_CONFIGURATIONS")}
                                    <i className={"fas " + (showAdminConfigs ? "fa-angle-up" : "fa-angle-down")} style={{ marginLeft: 10 }} />
                                </Button>
                            </Col>
                        </Row>
                        {
                            showAdminConfigs &&
                            <ConfigurationGrid configurations={JSON.parse(site.configurations)} isPermittedToEdit={isPermittedToEdit}
                                onChange={this.onAdminConfigsChange} lookupkey="LIST_EXCLUDED_CABINET_CONFIGURATIONS_KEYS" />
                        }
                    </>
                }
            </>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/sites/components/SiteDetails/Tabs/SiteCabinetsConfigsTab.tsx