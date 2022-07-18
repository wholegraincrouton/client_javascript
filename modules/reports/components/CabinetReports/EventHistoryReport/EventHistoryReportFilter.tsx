import * as React from "react";
import * as qs from "query-string";
import { History } from 'history';
import Row from "reactstrap/lib/Row";
import Col from "reactstrap/lib/Col";
import { SearchFilterField } from "src/modules/shared/components/SearchFilterBox";
import { apiService, localise } from "src/modules/shared/services";
import DashboardCabinetList from "../../../../dashboard/shared/DashboardCabinetList";
import { ActionButton, BackButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { CustomTimeDurationPicker } from "src/modules/shared/components/CustomTimeDurationPicker/CustomTimeDurationPicker";
import { EventHistoryFilters } from "../../../types/dto";
import UserListByRoles from "src/modules/dashboard/shared/UserList";
import { ConfiguredRoleDropDown } from "src/modules/security/components/ConfiguredRoleDropDown/ConfiguredRoleDropDown";
import MultiCustodyFilter from "src/modules/shared/components/MultiCustodyFilter/MultiCustodyFilter";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import CabinetItemNumberFilterList from "src/modules/dashboard/shared/CabinetItemNumberFilterList";
import { TimeDurations } from "src/modules/shared/types/dto";
import { alertActions } from "src/modules/shared/actions/alert.actions";
import * as moment from "moment";
import { DefaultDateTimeFormats } from "src/modules/shared/constants/datetime.constants";
import { FilterToggle } from "../../shared/FilterToggle";
import { Label } from "reactstrap";
import { EventStatusHeaderBar } from "../../shared/EventStatusHeaderBar";
import * as apiConstants from "src/modules/shared/constants/api.constants";
import DashboardSiteList from "src/modules/dashboard/shared/DashboardSiteList";

const service = apiConstants.REPORTS;

export interface Props {
    selectedCustomerId: string;
    selectedSite: string,
    selectedCabinetId: string,
    selectedItemNo: number,
    selectedMulticustodyState: string,
    selectedUserId: string,
    selectedEvent: string,
    selectedRole: string,
    selectedPeriod: string,
    periodDurationValue?: string;
    startDate: Date;
    endDate: Date;
    callPath?: string;
    history: History;
    performSearch: (eventHistoryFilters: EventHistoryFilters) => void;
    periodString: string;
    selectedColumns: string[];
}

export interface State {
    filters: EventHistoryFilters;
    disableItemFilter: boolean;
    periodSelection: string;
    isFiltersVisible: boolean;
}

class EventHistoryReportFilter extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.onSiteFilterChange = this.onSiteFilterChange.bind(this);
        this.onCabinetFilterChange = this.onCabinetFilterChange.bind(this);
        this.onSiteChange = this.onSiteChange.bind(this);
        this.onCabinetItemNumberFilterChange = this.onCabinetItemNumberFilterChange.bind(this);
        this.onMultiCustodyFilterChange = this.onMultiCustodyFilterChange.bind(this);
        this.onRoleChange = this.onRoleChange.bind(this);
        this.onUserChange = this.onUserChange.bind(this);
        this.onDurationChange = this.onDurationChange.bind(this);
        this.onCabinetEventFilterChange = this.onCabinetEventFilterChange.bind(this);
        this.toggleFilter = this.toggleFilter.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.onExportClick = this.onExportClick.bind(this);

        const { selectedPeriod, selectedSite, selectedCabinetId, selectedItemNo, selectedEvent,
            selectedMulticustodyState, selectedUserId, selectedRole, startDate, endDate } = this.props

        this.onDurationChange = this.onDurationChange.bind(this);

        this.state = {
            filters: {
                selectedSite: selectedSite,
                selectedCabinetId: selectedCabinetId,
                selectedItemNumber: selectedItemNo,
                selectedEvent: selectedEvent,
                multiCustody: selectedMulticustodyState,
                selectedUserId: selectedUserId,
                selectedRole: selectedRole,
                startDate: startDate,
                endDate: endDate,
                selectedPeriod: selectedPeriod,
            },
            disableItemFilter: (selectedCabinetId == undefined || selectedCabinetId == 'any'),
            periodSelection: TimeDurations.Weekly,
            isFiltersVisible: true
        }
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

    onCabinetFilterChange(selectedCabinet: any) {
        let cabinetId = selectedCabinet.target.value;
        this.setState({
            ...this.state, filters: {
                ...this.state.filters,
                selectedCabinetId: cabinetId,
                selectedItemNumber: -1,

            }, disableItemFilter: cabinetId == "any"
        });
    }

    onCabinetItemNumberFilterChange(e: any) {
        this.setState({
            ...this.state,
            filters: {
                ...this.state.filters,
                selectedItemNumber: e.target.value,
            }
        });
    }

    onMultiCustodyFilterChange(event: any) {
        this.setState({
            ...this.state,
            filters: {
                ...this.state.filters,
                multiCustody: event.target.value,
            }
        });
    }

    onCabinetEventFilterChange(selectedEvent: any) {
        let eventName = selectedEvent.target.value;
        this.setState({
            ...this.state,
            filters: {
                ...this.state.filters,
                selectedEvent: eventName
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

    onSearch() {
        this.props.performSearch(this.state.filters);
    }

    onRoleChange(e: any) {
        this.setState({
            ...this.state,
            filters: {
                ...this.state.filters,
                selectedRole: e.target.value,
                selectedUserId: "any"
            }
        });
    }

    onUserChange(e: any) {
        this.setState({
            ...this.state,
            filters: {
                ...this.state.filters,
                selectedUserId: e.value
            }
        });
    }

    onSiteChange(e: any) {
        this.setState({
            ...this.state,
            filters: {
                ...this.state.filters,
                selectedSite: e.target.value,
                selectedCabinetId: 'any',
            }
        });
    }

    onDurationChange(startDate: Date, endDate: Date, duration: string) {
        this.setState({
            ...this.state,
            filters: {
                ...this.state.filters,
                startDate: startDate,
                endDate: endDate,
                selectedPeriod: duration
            }
        });
    }

    toggleFilter() {
        this.setState({ ...this.state, isFiltersVisible: !this.state.isFiltersVisible });
    }

    onExportClick() {
        const { selectedColumns } = this.props;
        var filterState = {
            customerId: this.props.selectedCustomerId,
            site: this.state.filters.selectedSite,
            cabinetId: this.state.filters.selectedCabinetId,
            fromDate: moment(this.state.filters.startDate).format(DefaultDateTimeFormats.DateFormat),
            toDate: moment(this.state.filters.endDate).format(DefaultDateTimeFormats.DateFormat),
            userId: this.state.filters.selectedUserId,
            itemNumber: this.state.filters.selectedItemNumber,
            role: this.state.filters.selectedRole,
            multiCustody: this.state.filters.multiCustody,
            eventCode: this.state.filters.selectedEvent,
            selectedColumns: selectedColumns
        }

        apiService.post('reports', 'event-history', filterState, ["export"], null, false, service)
            .then(() => {
                alertActions.showSuccess("TEXT_REPORT_EXPORT_SUCCESS");
            });
    }

    render() {
        const { history, periodString, selectedCustomerId } = this.props;
        const { selectedUserId, selectedSite, selectedCabinetId, selectedRole,
            selectedItemNumber, multiCustody, selectedEvent } = this.state.filters;

        let search = qs.parse(history.location.search);

        return (
            <>
                {
                    search.showBackButton &&
                    <Row className="mb-3">
                        <Col>
                            <BackButton onClick={history.goBack} />
                        </Col>
                    </Row>
                }
                {
                    this.state.isFiltersVisible &&
                    <Row className="mb-3">
                        <Col>
                            <Row className="report-filter">
                                <Col md={8} lg={9}>
                                    <Row className="set-width">
                                        <Col md={6} lg={4} xl={3} className={`mt-2 mt-md-0`}>
                                            <SearchFilterField titleKey="TEXT_SITE">
                                                <DashboardSiteList key={selectedCustomerId} value={selectedSite} customerId={selectedCustomerId}
                                                    onChange={this.onSiteFilterChange} />
                                            </SearchFilterField>
                                        </Col>
                                        <Col md={6} lg={4} xl={3} className={`mt-2 mt-lg-0 mt-md-0`}>
                                            <SearchFilterField titleKey="TEXT_CABINET">
                                                <DashboardCabinetList key={selectedCustomerId} site={selectedSite}
                                                    value={selectedCabinetId} customerId={selectedCustomerId} onChange={this.onCabinetFilterChange} />
                                            </SearchFilterField>
                                        </Col>
                                        <Col md={6} lg={4} xl={3} className={`mt-2 mt-xl-0 mt-lg-0`}>
                                            <SearchFilterField titleKey="TEXT_ROLE">
                                                <ConfiguredRoleDropDown key={selectedCustomerId} name="userRole" customerId={selectedCustomerId} allowAny={true}
                                                    textAny="TEXT_ANY" value={selectedRole} onChange={this.onRoleChange} />
                                            </SearchFilterField>
                                        </Col>
                                        <Col md={6} lg={4} xl={3} className={`mt-2 mt-xl-0 mt-lg-0`}>
                                            <SearchFilterField titleKey="TEXT_USER">
                                                <UserListByRoles key={selectedCustomerId} customerId={selectedCustomerId} role={selectedRole}
                                                    value={selectedUserId} onChange={this.onUserChange} name="userName" allowAny={true} textAny="TEXT_ANY" />
                                            </SearchFilterField>
                                        </Col>
                                        <Col md={6} lg={4} xl={3} className="mt-2">
                                            <SearchFilterField titleKey="TEXT_ITEM_NO">
                                                <CabinetItemNumberFilterList anyAllowed={true} key={selectedCustomerId} value={selectedItemNumber} customerId={selectedCustomerId} cabinetId={selectedCabinetId}
                                                    disable={this.state.disableItemFilter} onChange={this.onCabinetItemNumberFilterChange} />
                                            </SearchFilterField>
                                        </Col>
                                        <Col md={6} lg={4} xl={3} className="mt-2">
                                            <SearchFilterField titleKey="TEXT_MULTICUSTODY">
                                                <MultiCustodyFilter key={selectedCustomerId} disable={false} value={multiCustody} onChange={this.onMultiCustodyFilterChange} />
                                            </SearchFilterField>
                                        </Col>
                                        <Col md={6} lg={4} xl={3} className="mt-2">
                                            <SearchFilterField titleKey="TEXT_EVENT">
                                                <LookupDropDown allowAny={true} textAny="TEXT_ALL" name="eventType" customerId={selectedCustomerId}
                                                    lookupKey="LIST_CABINET_HIGH_PRIORITY_EVENTS" value={selectedEvent} onChange={this.onCabinetEventFilterChange}
                                                    additionalLookups={["LIST_CABINET_LOW_PRIORITY_EVENTS"]} />
                                            </SearchFilterField>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col md={4} lg={3}>
                                    <Row>
                                        <Col>
                                            <ActionButton className="float-right mt-3" textKey="BUTTON_EXPORT" color="secondary"
                                                onClick={this.onExportClick} icon="fa-download" disableDefaultMargin={true} />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <ActionButton className="float-right mt-4" textKey="BUTTON_SEARCH" color="primary"
                                                onClick={this.onSearch} icon="fa-search" disableDefaultMargin={true} />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row className="mt-2">
                                <Col>
                                    <CustomTimeDurationPicker displayLabel={true} onChange={this.onDurationChange}
                                        periodDurationValue={this.props.periodDurationValue}
                                        customStartDate={this.state.filters.startDate} customEndDate={this.state.filters.endDate}
                                        callPath={this.props.callPath} />
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
                <hr />
                <EventStatusHeaderBar />
            </>
        );
    }
}

export default EventHistoryReportFilter;



// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetReports/EventHistoryReport/EventHistoryReportFilter.tsx