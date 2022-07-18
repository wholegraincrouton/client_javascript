import * as React from "react";
import * as moment from "moment";
import { Col, Row, Input } from "reactstrap";
import { DateTimePicker } from "@progress/kendo-react-dateinputs";
import { contextService, apiService } from "src/modules/shared/services";
import { DefaultDateTimeFormats } from "src/modules/shared/constants/datetime.constants";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import { SearchFilterBox, SearchFilterBoxProps, SearchFilterField } from "src/modules/shared/components/SearchFilterBox";
import UserListByRoles from "src/modules/dashboard/shared/UserList";
import { UserAuditFilter } from "../../../types/dto";
import 'src/modules/reports/components/reports.css';
import { ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { alertActions } from "src/modules/shared/actions/alert.actions";
import * as apiConstants from "src/modules/shared/constants/api.constants";
import { dateTimeUtilService } from "src/modules/shared/services/datetime-util.service";

const service = apiConstants.REPORTS;

export class UserRecordAuditFilterBox extends SearchFilterBox<UserAuditFilter> {
    constructor(props: SearchFilterBoxProps) {
        let endTime = new Date();
        let startTime = new Date();
        startTime.setHours(startTime.getHours() - 24);

        const initialState = {
            actionByUserId: 'any',
            actionType: 'any',
            name: '',
            mobileNumber: '',
            email: '',
            userId: '',
            from: startTime.toISOString(),
            to: endTime.toISOString()
        }

        super(props, initialState);

        this.onDateChange = this.onDateChange.bind(this);
        this.onExportClick = this.onExportClick.bind(this);
        this.handleUserChange = this.handleUserChange.bind(this);
    }

    componentDidUpdate() {
        const { selectedColumns } = this.props;
        if (selectedColumns != this.state.selectedColumns) {
            this.setState({ ...this.state, selectedColumns: selectedColumns });
        }
    }

    onDateChange(event: any, name: string) {
        let value = event.target.value;

        let e = {
            target: {
                name: name,
                value: value ? moment(value as Date).format(DefaultDateTimeFormats.DateTimeFormat) : undefined
            }
        };

        this.setState({
            ...this.state,
            [name]: value
        }, () => super.handleChange(e));
    }

    handleUserChange(event: any) {
        const { name, value } = event;
        this.setState(Object.assign(this.state, { [name]: value }));
    }

    getFields(): JSX.Element {
        const { actionByUserId, actionType, name, mobileNumber, email, userId, from, to } = this.state;
        const contextCustomerId = contextService.getCurrentCustomerId();
        const dateTimeFormat = dateTimeUtilService.getKendoDateTimeFormat();

        let fromValid = from && moment(from).isValid();
        let toValid = to && moment(to).isValid();

        return (
            <Row className="filter-fields event-filters">
                <Col md={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_ACTION_BY">
                        <UserListByRoles key={contextCustomerId} customerId={contextCustomerId} role='any'
                            value={actionByUserId} name="actionByUserId" allowAny={true} onChange={this.handleUserChange}
                            textAny="TEXT_ANY" allowSystem={true} />
                    </SearchFilterField>
                </Col>
                <Col md={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_ACTION">
                        <LookupDropDown name="actionType" customerId={contextCustomerId} lookupKey="LIST_AUDIT_ACTIONS"
                            value={actionType} onChange={this.handleChange} allowAny={true} textAny="TEXT_ANY" />
                    </SearchFilterField>
                </Col>
                <Col md={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_USER_NAME">
                        <Input name="name" maxLength={100} value={name} onChange={this.handleChange} />
                    </SearchFilterField>
                </Col>
                <Col md={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_MOBILE_NUMBER">
                        <Input name="mobileNumber" maxLength={100} value={mobileNumber} onChange={this.handleChange} />
                    </SearchFilterField>
                </Col>
                <Col md={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_EMAIL">
                        <Input name="email" maxLength={100} value={email} onChange={this.handleChange} />
                    </SearchFilterField>
                </Col>
                <Col md={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_USERID">
                        <Input name="userId" maxLength={100} value={userId} onChange={this.handleChange} />
                    </SearchFilterField>
                </Col>
                <Col lg={6} className="date-filter">
                    <SearchFilterField titleKey="TEXT_START_DATETIME">
                        <DateTimePicker name="from" value={fromValid ? new Date(from) : undefined} format={dateTimeFormat}
                            onChange={(e: any) => this.onDateChange(e, 'from')} max={toValid ? new Date(to) : undefined} />
                    </SearchFilterField>
                </Col>
                <Col lg={6} className="date-filter">
                    <SearchFilterField titleKey="TEXT_END_DATETIME" >
                        <DateTimePicker name="to" value={toValid ? new Date(to) : undefined} format={dateTimeFormat}
                            onChange={(e: any) => this.onDateChange(e, 'to')} min={fromValid ? new Date(from) : new Date()} />
                    </SearchFilterField>
                </Col>
            </Row>
        );
    }

    getButtons(): JSX.Element[] {
        let buttons: JSX.Element[] = [];
        buttons.push(<ActionButton textKey="BUTTON_EXPORT" color="secondary" icon="fa-download"
            disableDefaultMargin={true} onClick={this.onExportClick} disabled={!this.props.recordsExist} />)
        return buttons;
    }

    onExportClick() {
        apiService.post('reports', 'user-audits', this.state, ["export"], null, false, service)
            .then(() => {
                alertActions.showSuccess("TEXT_REPORT_EXPORT_SUCCESS");
            });
    }

    validateCriteria(criteria: UserAuditFilter): boolean {
        return criteria.actionByUserId.length > 0;
    }
}



// WEBPACK FOOTER //
// ./src/modules/reports/components/AuditReports/UserRecordAuditReport/UserRecordAuditFilterBox.tsx