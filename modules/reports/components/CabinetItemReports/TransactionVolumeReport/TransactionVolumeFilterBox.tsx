import * as React from "react";
import * as moment from 'moment';
import { Col, Row } from "reactstrap";
import { dashboardService } from "src/modules/dashboard/services/dashboard.service";
import { SearchFilterField } from "src/modules/shared/components/SearchFilterBox";
import { TimeDurations } from "src/modules/shared/types/dto";
import { ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import UserListByRoles from "../../../../dashboard/shared/UserList";
import { ConfiguredRoleDropDown } from "src/modules/security/components/ConfiguredRoleDropDown/ConfiguredRoleDropDown";
import { CustomTimeDurationPicker } from "src/modules/shared/components/CustomTimeDurationPicker/CustomTimeDurationPicker";
import DashboardCabinetList from "../../../../dashboard/shared/DashboardCabinetList";
import { TransactionVolumeFilters } from "../../../../reports/types/dto";
import DashboardSiteList from "src/modules/dashboard/shared/DashboardSiteList";

export interface Props {
    onSearch: (filters: TransactionVolumeFilters) => void;
    periodDurationValue?: string;
    selectedCustomerId: string;
    selectedSite: string,
    selectedCabinetId: string,
}

export interface State {
    filters: TransactionVolumeFilters;
    showCustomPeriod: boolean;
    periodSelection: string;
}

export class TransactionVolumeFilterBox extends React.Component<Props, State>{
    maxEndDate = moment(new Date()).add(1, 'days').toDate();
    minEndDate = moment(new Date()).subtract(119, 'days').toDate();
    maxStartDate = moment(new Date()).subtract(1, 'days').toDate();
    minStartDate = moment(new Date()).subtract(120, 'days').toDate();

    constructor(props: Props) {
        super(props);
        this.onSiteFilterChange = this.onSiteFilterChange.bind(this);
        this.onCabinetChange = this.onCabinetChange.bind(this);
        this.onRoleChange = this.onRoleChange.bind(this);
        this.onUserChange = this.onUserChange.bind(this);
        this.onDurationChange = this.onDurationChange.bind(this);
        this.onCustomPeriodToggle = this.onCustomPeriodToggle.bind(this);
        this.onSearchClick = this.onSearchClick.bind(this);
        this.onStartDateChange = this.onStartDateChange.bind(this);
        this.onEndDateChange = this.onEndDateChange.bind(this);

        let startDate = new Date;
        startDate.setDate(startDate.getDate() - 6);
        let endDate = new Date;

        this.state = {
            filters: {
                selectedSite: dashboardService.getSelectedSite(),
                selectedCabinetId: dashboardService.getSelectedCabinet(),
                selectedRole: "any",
                selectedUser: "any",
                startDate: startDate,
                endDate: endDate
            },
            showCustomPeriod: false,
            periodSelection: TimeDurations.Weekly
        }
    }

    onCustomPeriodToggle(e: any) {
        const { showCustomPeriod } = this.state;
        this.setState({ ...this.state, showCustomPeriod: !showCustomPeriod });
    }

    onSearchClick() {
        this.props.onSearch(this.state.filters);
    }

    //#region Filter Changes

    onDurationChange(startDate: Date, endDate: Date) {
        this.setState({
            ...this.state,
            filters: {
                ...this.state.filters,
                startDate: startDate,
                endDate: endDate
            }
        });
    }

    onSiteFilterChange(e: any) {
        this.setState({
            ...this.state,
            filters: {
                ...this.state.filters,
                selectedSite: e.target.value,
                selectedCabinetId: 'any',
            }
        });
    }

    onCabinetChange(e: any) {
        this.setState({
            ...this.state,
            filters: {
                ...this.state.filters,
                selectedCabinetId: e.target.value,
            }
        });
    }

    onRoleChange(e: any) {
        this.setState({
            ...this.state,
            filters: {
                ...this.state.filters,
                selectedRole: e.target.value,
                selectedUser: "any"
            }
        });
    }

    onUserChange(e: any) {
        this.setState({
            ...this.state,
            filters: {
                ...this.state.filters,
                selectedUser: e.value
            }
        });
    }

    onStartDateChange(e: any) {
        this.setState({
            ...this.state,
            filters: {
                ...this.state.filters,
                startDate: e.target.value
            }
        });
    }

    onEndDateChange(e: any) {
        this.setState({
            ...this.state,
            filters: {
                ...this.state.filters,
                endDate: e.target.value
            }
        });
    }

    //#endregion

    render() {
        const { selectedCustomerId } = this.props;
        const { filters } = this.state;
        
        return (
            <Row className="mb-3">
                <Col>
                    <Row className="report-filter">
                        <Col md={8} lg={9}>
                            <Row className="set-width">
                                <Col md={6} lg={4} xl={3} className={`mt-2 mt-md-0`}>
                                    <SearchFilterField titleKey="TEXT_SITE">
                                        <DashboardSiteList key={selectedCustomerId} value={filters.selectedSite} customerId={selectedCustomerId}
                                                onChange={this.onSiteFilterChange} />
                                    </SearchFilterField>
                                </Col>
                                <Col md={6} lg={4} xl={3} className={`mt-2 mt-lg-0 mt-md-0`}>
                                    <SearchFilterField titleKey="TEXT_CABINET">
                                        <DashboardCabinetList key={selectedCustomerId} site={filters.selectedSite}
                                            value={filters.selectedCabinetId} customerId={selectedCustomerId} onChange={this.onCabinetChange} />
                                    </SearchFilterField>
                                </Col>
                                <Col md={6} lg={4} xl={3} className={`mt-2 mt-xl-0 mt-lg-0`}>
                                    <SearchFilterField titleKey="TEXT_ROLE">
                                        <ConfiguredRoleDropDown key={selectedCustomerId} name="userRole" customerId={selectedCustomerId} allowAny={true}
                                            textAny="TEXT_ANY" value={filters.selectedRole} onChange={this.onRoleChange} />
                                    </SearchFilterField>
                                </Col>
                                <Col md={6} lg={4} xl={3} className={`mt-2 mt-xl-0 mt-lg-0`}>
                                    <SearchFilterField titleKey="TEXT_USER">
                                        <UserListByRoles key={selectedCustomerId} customerId={selectedCustomerId} role={filters.selectedRole}
                                            value={filters.selectedUser} onChange={this.onUserChange} name="userName" allowAny={true} textAny="TEXT_ANY" />
                                    </SearchFilterField>
                                </Col>
                            </Row>
                        </Col>
                        <Col md={4} lg={3}>
                            <ActionButton className="float-right mt-3" textKey="BUTTON_SEARCH" color="primary"
                                onClick={this.onSearchClick} icon="fa-search" disableDefaultMargin={true} />
                        </Col>
                    </Row>
                    <Row className="mt-2">
                        <Col>
                            <CustomTimeDurationPicker displayLabel={true} onChange={this.onDurationChange}
                                periodDurationValue={this.props.periodDurationValue}
                                customStartDate={this.state.filters.startDate} customEndDate={this.state.filters.endDate} />
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetItemReports/TransactionVolumeReport/TransactionVolumeFilterBox.tsx