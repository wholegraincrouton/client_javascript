import * as React from "react";
import { SearchFilterBox, SearchFilterBoxProps, SearchFilterField } from "src/modules/shared/components/SearchFilterBox";
import { Col, Row } from "reactstrap";
import { contextService, apiService, customerService } from "src/modules/shared/services";
import 'src/modules/reports/components/reports.css';
import { CustomerCabinetFilter } from "../../../types/dto";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import { ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { alertActions } from "src/modules/shared/actions/alert.actions";
import AutoCompleteSearchField from "src/modules/shared/components/AutoCompleteSearchField/AutoCompleteSearchField";
import { CabinetBasicDetails } from "src/modules/cabinet/types/dto";
import { cabinetService } from "src/modules/cabinet/services/cabinet.service";
import * as apiConstants from "src/modules/shared/constants/api.constants";
import { Customer } from "src/modules/customers/types/dto";
import FirmwareVersionList from "src/modules/firmware/shared/FirmwareVersionList";
import { Site } from "src/modules/sites/types/dto";
import { siteService } from "src/modules/sites/services/site.service";

const service = apiConstants.REPORTS;

export class CustomerCabinetFilterBox extends SearchFilterBox<CustomerCabinetFilter> {
    customerList: Customer[] = [];
    cabinetList: CabinetBasicDetails[] = [];
    siteList: Site[] = [];

    constructor(props: SearchFilterBoxProps) {
        super(props, {
            customerName: '',
            cabinetName: '',
            cabinetSerialNo: '',
            provisioningKey: '',
            cabinetSize: 0,
            site: '',
            firmwareVersion: 'any',
            selectedColumns: props.selectedColumns
        });
        this.handleChange = this.handleChange.bind(this);
        this.handleItemCountChange = this.handleItemCountChange.bind(this);
        this.onExportClick = this.onExportClick.bind(this);
    }

    componentDidMount() {
        this.getData();
        super.componentDidMount();
    }

    componentDidUpdate(previousProps: any) {
        const previousCustomerId = previousProps.customerId;
        let customerId = contextService.getCurrentCustomerId();
        if (customerId != previousCustomerId) {
            this.getData();
        }

        const { selectedColumns } = this.props;
        if (selectedColumns != this.state.selectedColumns) {
            this.setState({ ...this.state, selectedColumns: selectedColumns });
        }
    }

    getData() {
        let customerId = contextService.getCurrentCustomerId();
        this.cabinetList = [];

        cabinetService.getCabinets(customerId).then(cabinets => {
            {
                this.cabinetList = cabinets;
            }
        });

        customerService.getCustomerData().then((customers) => {
            this.customerList = customers;
        });

        siteService.getSites(customerId).then((allSites) => {
            this.siteList = allSites;
        });
    }

    getFields(): JSX.Element {
        const { customerName,site, cabinetName, cabinetSerialNo, provisioningKey, cabinetSize, firmwareVersion } = this.state;

        return (
            <Row className="filter-fields event-filters">
                <Col md={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_CUSTOMER_NAME">
                        <AutoCompleteSearchField name="customerName" value={customerName} onChange={this.handleChange} data={this.customerList.map(c => c.name)} />
                    </SearchFilterField>
                </Col>
                <Col md={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_SITE_NAME">
                        <AutoCompleteSearchField name="site" value={site} onChange={this.handleChange} data={this.siteList.map(s => s.name)} />
                    </SearchFilterField>
                </Col>
                <Col md={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_CABINET_NAME">
                        <AutoCompleteSearchField name="cabinetName" value={cabinetName} onChange={this.handleChange} data={this.cabinetList.map(c => c.name)} />
                    </SearchFilterField>
                </Col>
                <Col md={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_SERIAL_NUMBER">
                        <AutoCompleteSearchField name="cabinetSerialNo" value={cabinetSerialNo} onChange={this.handleChange} data={this.cabinetList.map(c => c.cabinetSerialNo)} />
                    </SearchFilterField>
                </Col>
                <Col md={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_PROVISIONING_KEY">
                        <AutoCompleteSearchField name="provisioningKey" value={provisioningKey} onChange={this.handleChange} data={this.cabinetList.map(c => c.provisioningKey)} />
                    </SearchFilterField>
                </Col>
                <Col md={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_CABINET_SIZE">
                        <LookupDropDown allowAny={true} textAny="TEXT_ANY" name="cabinetSize" lookupKey="LIST_CABINET_ITEMCOUNTS"
                            value={cabinetSize == 0 ? 'any' : cabinetSize.toString()} onChange={this.handleItemCountChange} />
                    </SearchFilterField>
                </Col>
                <Col md={6} xl={3}>
                <SearchFilterField titleKey="TEXT_FIRMWARE_VERSION">
                    <FirmwareVersionList name="firmwareVersion" value={firmwareVersion} onChange={this.handleChange}
                        allowAny={true} allowVC={true} filterActive={true} />
                </SearchFilterField>
            </Col>
            </Row>
        );
    }

    handleChange(event: any) {
        const { name, value } = event.target;
        this.setState(Object.assign(this.state, { [name]: value }));
    }

    handleItemCountChange(event: any) {
        let { name, value } = event.target;
        if (value == 'any') {
            value = 0;
        }
        this.setState({ ...this.state, [name]: value });
    }

    getButtons(): JSX.Element[] {
        let buttons: JSX.Element[] = [];
        buttons.push(<ActionButton textKey="BUTTON_EXPORT" color="secondary" icon="fa-download"
            disableDefaultMargin={true} onClick={this.onExportClick} disabled={!this.props.recordsExist} />)
        return buttons;
    }

    onExportClick() {
        apiService.post('reports', 'customer-cabinets', this.state, ["export"], null, false, service)
            .then(() => {
                alertActions.showSuccess("TEXT_REPORT_EXPORT_SUCCESS");
            });
    }

    validateCriteria() { return true }
}


// WEBPACK FOOTER //
// ./src/modules/reports/components/CustomerReports/CustomerCabinetReport/CustomerCabinetFilterBox.tsx