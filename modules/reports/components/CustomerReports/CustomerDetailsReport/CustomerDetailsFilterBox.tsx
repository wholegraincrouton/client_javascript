import * as React from "react";
import { SearchFilterBox, SearchFilterBoxProps, SearchFilterField } from "src/modules/shared/components/SearchFilterBox";
import { Col, Row } from "reactstrap";
import { contextService, apiService, customerService } from "src/modules/shared/services";
import 'src/modules/reports/components/reports.css';
import { CustomerDetailsFilter } from "../../../types/dto";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import UserListByRoles from "src/modules/dashboard/shared/UserList";
import { ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { alertActions } from "src/modules/shared/actions/alert.actions";
import { CountryList, CountryStateList } from "src/modules/shared/components/CountryLocationList";
import AutoCompleteSearchField from "src/modules/shared/components/AutoCompleteSearchField/AutoCompleteSearchField";
import { Customer } from "src/modules/customers/types/dto";

import * as apiConstants from "src/modules/shared/constants/api.constants";

const service = apiConstants.REPORTS;

export class CustomerDetailFilterBox extends SearchFilterBox<CustomerDetailsFilter> {
    customerList: Customer[] = [];

    constructor(props: SearchFilterBoxProps) {
        super(props, {
            customerName: '',
            salesForceCustomerId: '',
            firstName: '',
            lastName: '',
            mobileNumber: '',
            country: 'any',
            state: 'any',
            accountCreatedByUserId: 'any',
            anniversaryDate: 'any',
            accountStatus: 'any',
            selectedColumns: props.selectedColumns
        });
        this.handleCountryChange = this.handleCountryChange.bind(this);
        this.handleStateChange = this.handleStateChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleUserChange = this.handleUserChange.bind(this);
        this.onExportClick = this.onExportClick.bind(this);
    }

    componentDidMount() {
        this.getData();
        super.componentDidMount();
    }

    componentDidUpdate() {
        const { selectedColumns } = this.props;
        if (selectedColumns != this.state.selectedColumns) {
            this.setState({ ...this.state, selectedColumns: selectedColumns });
        }
    }

    getData() {
        customerService.getCustomerData().then((customers) => {
            this.customerList = customers;
        });
    }

    getFields(): JSX.Element {
        const { customerName, salesForceCustomerId, firstName, lastName, mobileNumber, country, state, accountCreatedByUserId, anniversaryDate, accountStatus } = this.state;
        const contextCustomerId = contextService.getCurrentCustomerId();

        return (
            <Row className="filter-fields event-filters">
                <Col md={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_CUSTOMER_NAME">
                        <AutoCompleteSearchField name="customerName" value={customerName} onChange={this.handleChange} data={this.customerList.map(c => c.name)} />
                    </SearchFilterField>
                </Col>
                <Col md={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_SALESFORCE_ID">
                        <AutoCompleteSearchField name="salesForceCustomerId" value={salesForceCustomerId} onChange={this.handleChange} data={this.customerList.map(c => c.salesForceCustomerId)} />
                    </SearchFilterField>
                </Col>
                <Col md={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_FIRST_NAME">
                        <AutoCompleteSearchField name="firstName" value={firstName} onChange={this.handleChange} data={this.customerList.map(c => c.firstName)} />
                    </SearchFilterField>
                </Col>
                <Col md={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_LAST_NAME">
                        <AutoCompleteSearchField name="lastName" value={lastName} onChange={this.handleChange} data={this.customerList.map(c => c.lastName)} />
                    </SearchFilterField>
                </Col>
                <Col md={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_MOBILE_NUMBER">
                        <AutoCompleteSearchField name="mobileNumber" value={mobileNumber} onChange={this.handleChange} data={this.customerList.map(c => c.mobileNumber)} />
                    </SearchFilterField>
                </Col>
                <Col md={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_COUNTRY">
                        <CountryList key={contextCustomerId} name={country} allowAny={true} value={country}
                            onChange={(e: any) => this.handleCountryChange(e)} />
                    </SearchFilterField>
                </Col>
                <Col md={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_STATE">
                        <CountryStateList key={contextCustomerId} name={state} allowAny={true} value={state} selectedCountry={country}
                            onChange={(e: any) => this.handleStateChange(e)} />
                    </SearchFilterField>
                </Col>
                <Col md={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_ACCOUNT_CREATED_BY">
                        <UserListByRoles key={contextCustomerId} customerId={contextCustomerId} role='any'
                            value={accountCreatedByUserId} name="accountCreatedByUserId" onChange={this.handleUserChange}
                            allowAny={true} textAny="TEXT_ANY" allowSystem={true} />
                    </SearchFilterField>
                </Col>
                <Col md={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_ANNIVERSARY_DATE">
                        <LookupDropDown name="anniversaryDate" allowAny={true} textAny="TEXT_ANY" customerId={contextCustomerId} lookupKey="LIST_ANNIVERSARY_DATES"
                            value={anniversaryDate} onChange={this.handleChange} />
                    </SearchFilterField>
                </Col>
                <Col md={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_ACCOUNT_STATUS">
                        <LookupDropDown name="accountStatus" allowAny={true} textAny="TEXT_ANY" customerId={contextCustomerId} lookupKey="LIST_ACCOUNT_STATUS"
                            value={accountStatus} onChange={this.handleChange} />
                    </SearchFilterField>
                </Col>
            </Row>
        );
    }

    handleChange(event: any) {
        const { name, value } = event.target;
        this.setState(Object.assign(this.state, { [name]: value }));
    }

    handleUserChange(event: any) {
        const { name, value } = event;
        this.setState(Object.assign(this.state, { [name]: value }));
    }

    handleCountryChange(event: any) {
        let countryValue = event.target.value;
        this.setState({ ...this.state, country: countryValue, state: 'any' });
    }

    handleStateChange(event: any) {
        let stateValue = event.target.value;
        this.setState({ ...this.state, state: stateValue });
    }

    getButtons(): JSX.Element[] {
        let buttons: JSX.Element[] = [];
        buttons.push(<ActionButton textKey="BUTTON_EXPORT" color="secondary" icon="fa-download"
            disableDefaultMargin={true} onClick={this.onExportClick} disabled={!this.props.recordsExist} />)
        return buttons;
    }

    onExportClick() {
        apiService.post('reports', 'customer-details', this.state, ["export"], null, false, service)
            .then(() => {
                alertActions.showSuccess("TEXT_REPORT_EXPORT_SUCCESS");
            });
    }

    validateCriteria() { return true }
}


// WEBPACK FOOTER //
// ./src/modules/reports/components/CustomerReports/CustomerDetailsReport/CustomerDetailsFilterBox.tsx