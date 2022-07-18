import moment from "moment";
import React from "react";
import { Card, CardBody, Col, Label, Row } from "reactstrap";
import DashboardCabinetList from "src/modules/dashboard/shared/DashboardCabinetList";
import DashboardSiteList from "src/modules/dashboard/shared/DashboardSiteList";
import JobTitleFilterList from "src/modules/dashboard/shared/JobTitleFilterList";
import UserListByRoles from "src/modules/dashboard/shared/UserList";
import { UserWiseTransactionFilter } from "src/modules/reports/types/dto";
import { alertActions } from "src/modules/shared/actions/alert.actions";
import { ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { CustomTimeDurationPicker } from "src/modules/shared/components/CustomTimeDurationPicker/CustomTimeDurationPicker";
import { SearchFilterField } from "src/modules/shared/components/SearchFilterBox";
import { DefaultDateTimeFormats } from "src/modules/shared/constants/datetime.constants";
import { apiService, localise } from "src/modules/shared/services";
import { dateTimeUtilService } from "src/modules/shared/services/datetime-util.service";
import { TimeDurations } from "src/modules/shared/types/dto";
import { FilterToggle } from "../../shared/FilterToggle";
import * as apiConstants from "src/modules/shared/constants/api.constants";
import { ConfiguredRoleDropDown } from "src/modules/security/components/ConfiguredRoleDropDown/ConfiguredRoleDropDown";

export interface Props {
    customerId: string;
    site: string;
    cabinetId: string;
    userId: string;
    jobTitle: string;
    role: string;
    startDate: Date;
    endDate: Date;
    periodDurationValue?: string;
    periodString: string;
    performSearch: (filters: UserWiseTransactionFilter) => void;
    selectedColumns: string[];
    callPath?: string;
}

export interface State {
    filter: UserWiseTransactionFilter;
    disableItemFilter: boolean,
    toggleFilter: boolean,
    startDate?: Date,
    endDate?: Date,
    isFiltersVisible: boolean;
}

const service = apiConstants.REPORTS;

export class UserWiseTransactionReportFilter extends React.Component<Props, State>{
    constructor(props: Props) {
        super(props)

        this.state = {
            filter: {
                site: "any",
                cabinetId: "any",
                userId: "any",
                jobTitle: "",
                role: "any",
                startDate: dateTimeUtilService.getStartTimeForFilters(TimeDurations.Weekly),
                endDate: new Date(),
                period: TimeDurations.Weekly
            },
            isFiltersVisible: true,
            disableItemFilter: false,
            toggleFilter: false
        }

        this.onSiteChange = this.onSiteChange.bind(this);
        this.onCabinetChange = this.onCabinetChange.bind(this);
        this.onRoleChange = this.onRoleChange.bind(this);
        this.onUserChange = this.onUserChange.bind(this);
        this.onJobTitleChange = this.onJobTitleChange.bind(this);
        this.toggleFilter = this.toggleFilter.bind(this);
        this.onDurationChange = this.onDurationChange.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.toggleFilter = this.toggleFilter.bind(this);
        this.onExportClick = this.onExportClick.bind(this);
    }

    onSiteChange(event: any) {
        this.setState({
            ...this.state,
            filter: {
                ...this.state.filter,
                site: event.target.value,
                cabinetId: 'any',
            }
        });
    }

    onCabinetChange(event: any) {
        let cabinetId = event.target.value;
        this.setState({
            ...this.state,
            filter: {
                ...this.state.filter,
                cabinetId: cabinetId
            },
            disableItemFilter: cabinetId == 'any'
        });
    }

    onRoleChange(e: any) {
        this.setState({
            ...this.state,
            filter: {
                ...this.state.filter,
                role: e.target.value,
                userId: "any"
            }
        });
    }

    onUserChange(result: any) {
        let userId = result.value;

        this.setState({
            ...this.state,
            filter: {
                ...this.state.filter,
                userId: userId
            }
        });
    }

    onJobTitleChange(event: any) {
        let jobTitle = event.target.value;

        this.setState({
            ...this.state,
            filter: {
                ...this.state.filter,
                jobTitle: jobTitle
            }
        });
    }

    onDurationChange(startDate: Date, endDate: Date, duration: string) {
        this.setState({
            ...this.state,
            filter: {
                ...this.state.filter,
                startDate: startDate,
                endDate: endDate,
                period: duration
            }
        });
    }

    onSearch() {
        this.props.performSearch(this.state.filter);
    }

    onExportClick() {
        var filterState = {
            customerId: this.props.customerId,
            site: this.state.filter.site,
            cabinetId: this.state.filter.cabinetId,
            role: this.state.filter.role,
            userId: this.state.filter.userId,
            jobTitle: this.state.filter.jobTitle,
            fromDate: moment(this.state.filter.startDate).format(DefaultDateTimeFormats.DateFormat),
            toDate: moment(this.state.filter.endDate).format(DefaultDateTimeFormats.DateFormat),
            selectedColumns: this.props.selectedColumns
        }

        apiService.post('reports', 'user-wise-transaction', filterState, ["export"], null, false, service)
            .then(() => {
                alertActions.showSuccess("TEXT_REPORT_EXPORT_SUCCESS");
            });
    }

    toggleFilter() {
        this.setState({ ...this.state, isFiltersVisible: !this.state.isFiltersVisible });
    }

    render() {
        const { periodString, customerId, callPath } = this.props;
        const { filter } = this.state;
        return (
            <Card>
                <CardBody>
                    {
                        this.state.isFiltersVisible &&
                        <Row className="mb-3">
                            <Col>
                                <Row className="report-filter">
                                    <Col md={8} lg={9}>
                                        <Row className="set-width">
                                            <Col md={6} lg={4} xl={3} className={`mt-2 mt-md-0`}>
                                                <SearchFilterField titleKey="TEXT_SITE">
                                                    <DashboardSiteList key={customerId} value={filter.site} customerId={customerId}
                                                        onChange={this.onSiteChange} />
                                                </SearchFilterField>
                                            </Col>
                                            <Col md={6} lg={4} xl={3} className={`mt-2 mt-lg-0 mt-md-0`}>
                                                <SearchFilterField titleKey="TEXT_CABINET">
                                                    <DashboardCabinetList key={customerId} site={filter.site} value={filter.cabinetId}
                                                        customerId={customerId} onChange={this.onCabinetChange} />
                                                </SearchFilterField>
                                            </Col>
                                            <Col md={6} lg={4} xl={3} className={`mt-2 mt-xl-0 mt-lg-0`}>
                                                <SearchFilterField titleKey="TEXT_ROLE">
                                                    <ConfiguredRoleDropDown key={customerId} name="userRole" customerId={customerId} allowAny={true}
                                                        textAny="TEXT_ANY" value={filter.role} onChange={this.onRoleChange} />
                                                </SearchFilterField>
                                            </Col>
                                            <Col md={6} lg={4} xl={3} className="mt-2 mt-md-0">
                                                <SearchFilterField titleKey="TEXT_USER">
                                                    <UserListByRoles key={customerId} customerId={customerId} role={'any'}
                                                        value={filter.userId} onChange={this.onUserChange} name="userName" allowAny={true} textAny="TEXT_ANY_USER" />
                                                </SearchFilterField>
                                            </Col>
                                            <Col md={6} lg={4} xl={3} className="mt-2 mt-md-0">
                                                <SearchFilterField titleKey="TEXT_JOB_TITLE">
                                                    <JobTitleFilterList key={customerId} selectedCustomerId={customerId}
                                                        value={filter.jobTitle} disable={false}
                                                        onChange={this.onJobTitleChange} />
                                                </SearchFilterField>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col md={4} lg={3}>
                                        <Row>
                                            <Col>
                                                <ActionButton className="float-right mt-3" textKey="BUTTON_EXPORT" color="secondary" icon="fa-download"
                                                    disableDefaultMargin={true} onClick={this.onExportClick} disabled={!this.state.filter} />
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <ActionButton className="float-right mt-3" textKey="BUTTON_SEARCH" color="primary" onClick={this.onSearch} icon="fa-search" disableDefaultMargin={true} />
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                                <Row className="mt-2">
                                    <Col>
                                        <CustomTimeDurationPicker displayLabel={true} onChange={this.onDurationChange}
                                            periodDurationValue={this.props.periodDurationValue} callPath={callPath}
                                            customStartDate={filter.startDate} customEndDate={filter.endDate} />
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    }
                    <Row>
                        <Col md={9}>
                            <Label className="mb-0">{localise('TEXT_PERIOD').toUpperCase()}: {periodString}</Label>
                        </Col>
                        <Col md={3}>
                            <FilterToggle toggleFilter={this.toggleFilter} showFilter={this.state.isFiltersVisible} />
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        )
    }
}


// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetItemReports/UserWiseTransactionReport/UserWiseTransactionReportFilter.tsx