import * as React from "react";
import { SearchFilterBox, SearchFilterBoxProps, SearchFilterField } from "src/modules/shared/components/SearchFilterBox";
import { Col, Row } from "reactstrap";
import CabinetList from "src/modules/cabinet/shared/Cabinet/CabinetList";
import { contextService, apiService } from "src/modules/shared/services";
import { DateTimePicker } from "@progress/kendo-react-dateinputs";
import { UserAccessAuditFilter } from "../../../types/dto";
import CabinetItemNumberFilterList from "src/modules/dashboard/shared/CabinetItemNumberFilterList";
import * as moment from "moment";
import { DefaultDateTimeFormats } from "src/modules/shared/constants/datetime.constants";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import UserListByRoles from "src/modules/dashboard/shared/UserList";
import AccessGroupList from "src/modules/shared/components/AccessGroupList/AccessGroupList";
import { ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { alertActions } from "src/modules/shared/actions/alert.actions";
import * as apiConstants from "src/modules/shared/constants/api.constants";
import { dateTimeUtilService } from "src/modules/shared/services/datetime-util.service";

const service = apiConstants.REPORTS;

export class UserAccessAuditFilterBox extends SearchFilterBox<UserAccessAuditFilter> {
    constructor(props: SearchFilterBoxProps) {
        const initialState = {
            cabinetId: 'any',
            itemNo: -1,
            fromDate: '',
            toDate: '',
            disableItemFilter: false,
            accessBasis: 'any',
            userId: 'any',
            actionByUserId: 'any',
            accessGroupId: 'any',
            selectedColumns: props.selectedColumns
        }

        super(props, initialState);
        this.onDateChange = this.onDateChange.bind(this);
        this.handleCabinetChange = this.handleCabinetChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleUserChange = this.handleUserChange.bind(this);
        this.onExportClick = this.onExportClick.bind(this);
    }

    componentDidUpdate() {
        const { selectedColumns } = this.props;
        if (selectedColumns != this.state.selectedColumns) {
            this.setState({ ...this.state, selectedColumns: selectedColumns });
        }
    }

    getFields(): JSX.Element {
        const { cabinetId, itemNo, fromDate, toDate, accessBasis, userId, actionByUserId, accessGroupId } = this.state;
        const contextCustomerId = contextService.getCurrentCustomerId();
        const dateTimeFormat = dateTimeUtilService.getKendoDateTimeFormat();

        return (
            <Row className="filter-fields event-filters">
                <Col md={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_USER">
                        <UserListByRoles key={contextCustomerId} customerId={contextCustomerId} role='any'
                            value={userId} includeDeletedData={true} name="userId" allowAny={true} textAny="TEXT_ANY" onChange={this.handleUserChange} />
                    </SearchFilterField>
                </Col>
                <Col md={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_ACCESS_GROUP">
                        <AccessGroupList key={contextCustomerId} allowAny={true} name="accessGroupId" includeDeletedData={true} value={accessGroupId} onChange={this.handleChange} />
                    </SearchFilterField>
                </Col>
                <Col md={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_ACCESS_BASIS">
                        <LookupDropDown name="accessBasis" allowAny={true} textAny="TEXT_ANY" customerId={contextCustomerId} lookupKey="LIST_ACCESS_BASIS"
                            value={accessBasis} onChange={this.handleChange} />
                    </SearchFilterField>
                </Col>
                <Col md={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_CABINET">
                        <CabinetList key={contextCustomerId} customerId={contextCustomerId} cabinetGroupId='any'
                            name="cabinetId" includeDeletedData={true} allowAny={true} value={cabinetId} onChange={this.handleCabinetChange} />
                    </SearchFilterField>
                </Col>
                <Col md={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_ITEM_NO">
                        <CabinetItemNumberFilterList name="itemNo" anyAllowed={true} key={contextCustomerId} value={itemNo} customerId={contextCustomerId} cabinetId={cabinetId}
                            disable={false} onChange={this.handleChange} />
                    </SearchFilterField>
                </Col>
                <Col md={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_ACTION_BY">
                        <UserListByRoles key={contextCustomerId} customerId={contextCustomerId} role='any'
                            value={actionByUserId} name="actionByUserId" onChange={this.handleUserChange}
                            allowAny={true} textAny="TEXT_ANY" allowSystem={true} />
                    </SearchFilterField>
                </Col>
                <Col lg={6} className="date-filter">
                    <SearchFilterField titleKey="TEXT_START_DATETIME">
                        <DateTimePicker name="fromDate" value={new Date(fromDate)} format={dateTimeFormat}
                            onChange={(e: any) => this.onDateChange(e, 'fromDate')} />
                    </SearchFilterField>
                </Col>
                <Col lg={6} className="date-filter">
                    <SearchFilterField titleKey="TEXT_END_DATETIME" >
                        <DateTimePicker name="toDate" value={new Date(toDate)} format={dateTimeFormat}
                            onChange={(e: any) => this.onDateChange(e, 'toDate')} />
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

    handleCabinetChange(event: any) {
        let e = {
            target: {
                value: event.target.value,
                name: event.target.name
            }
        }
        this.setState({ ...this.state, itemNo: -1 }, () => super.handleChange(e));
    }

    getButtons(): JSX.Element[] {
        let buttons: JSX.Element[] = [];
        buttons.push(<ActionButton textKey="BUTTON_EXPORT" color="secondary" icon="fa-download"
            disableDefaultMargin={true} onClick={this.onExportClick} disabled={!this.props.recordsExist} />)
        return buttons;
    }

    onExportClick() {
        apiService.post('reports', 'user-access-audits', this.state, ["export"], null, false, service)
            .then(() => {
                alertActions.showSuccess("TEXT_REPORT_EXPORT_SUCCESS");
            });
    }

    validateCriteria() { return true }

    onDateChange(event: any, name: string) {
        let time = moment(new Date()).format(DefaultDateTimeFormats.DateTimeFormat);
        if (event.target.value)
            time = moment(event.target.value).format(DefaultDateTimeFormats.DateTimeFormat);
        let e = {
            target: {
                value: time,
                name: name
            }
        }
        this.setState(Object.assign(this.state, { [name]: time }), () => super.handleChange(e));
    }
}


// WEBPACK FOOTER //
// ./src/modules/reports/components/AuditReports/UserAccessAuditReport/UserAccessAuditFilterBox.tsx