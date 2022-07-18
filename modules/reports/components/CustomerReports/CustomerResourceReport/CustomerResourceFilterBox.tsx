import * as React from "react";
import { Col, Row } from "reactstrap";
import { apiService, contextService } from "src/modules/shared/services";
import { ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import { SearchFilterBox, SearchFilterBoxProps, SearchFilterField } from "src/modules/shared/components/SearchFilterBox";
import { alertActions } from "src/modules/shared/actions/alert.actions";
import { CustomerResourceFilter } from "../../../types/dto";
import 'src/modules/reports/components/reports.css';
import * as apiConstants from "src/modules/shared/constants/api.constants";

const service = apiConstants.REPORTS;

export class CustomerResourceFilterBox extends SearchFilterBox<CustomerResourceFilter> {
    constructor(props: SearchFilterBoxProps) {
        super(props, { year: 'any', month: 'any', selectedColumns: props.selectedColumns });

        this.handleChange = this.handleChange.bind(this);
        this.onExportClick = this.onExportClick.bind(this);
    }

    componentDidUpdate() {
        const { selectedColumns } = this.props;
        if (selectedColumns != this.state.selectedColumns) {
            this.setState({ ...this.state, selectedColumns: selectedColumns });
        }
    }

    getFields(): JSX.Element {
        const { year, month } = this.state;
        const contextCustomerId = contextService.getCurrentCustomerId();

        return (
            <Row className="filter-fields event-filters">
                <Col md={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_YEAR">
                        <LookupDropDown name="year" value={year} customerId={contextCustomerId} onChange={this.handleChange}
                            allowAny={true} textAny="TEXT_ANY" lookupKey="LIST_YEARS" />
                    </SearchFilterField>
                </Col>
                <Col md={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_MONTH">
                        <LookupDropDown name="month" value={month} customerId={contextCustomerId} onChange={this.handleChange}
                            allowAny={true} textAny="TEXT_ANY" lookupKey="LIST_MONTHS" />
                    </SearchFilterField>
                </Col>
            </Row>
        );
    }

    handleChange(event: any) {
        const { name, value } = event.target;
        this.setState({ ...this.state, [name]: value });
    }

    getButtons(): JSX.Element[] {
        let buttons: JSX.Element[] = [];
        buttons.push(<ActionButton textKey="BUTTON_EXPORT" color="secondary" icon="fa-download"
            disableDefaultMargin={true} onClick={this.onExportClick} disabled={!this.props.recordsExist} />)
        return buttons;
    }

    onExportClick() {
        apiService.post('reports', 'customer-resources', this.state, ["export"], null, false, service)
            .then(() => {
                alertActions.showSuccess("TEXT_REPORT_EXPORT_SUCCESS");
            });
    }

    validateCriteria() { return true }
}


// WEBPACK FOOTER //
// ./src/modules/reports/components/CustomerReports/CustomerResourceReport/CustomerResourceFilterBox.tsx