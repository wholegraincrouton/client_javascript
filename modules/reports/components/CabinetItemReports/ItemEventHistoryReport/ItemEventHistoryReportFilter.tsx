import * as React from "react";
import * as qs from "query-string";
import { History } from 'history';
import Row from "reactstrap/lib/Row";
import Col from "reactstrap/lib/Col";
import { SearchFilterField } from "src/modules/shared/components/SearchFilterBox";
import { apiService, localise } from "src/modules/shared/services";
import DashboardCabinetList from "../../../../dashboard/shared/DashboardCabinetList";
import CabinetItemNumberFilterList from "../../../../dashboard/shared/CabinetItemNumberFilterList";
import { ActionButton, BackButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { CustomTimeDurationPicker } from "src/modules/shared/components/CustomTimeDurationPicker/CustomTimeDurationPicker";
import JobTitleFilterList from "src/modules/dashboard/shared/JobTitleFilterList";
import { ItemEventViewFilters } from "../../../types/dto";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import { FilterToggle } from "../../shared/FilterToggle";
import { Label } from "reactstrap";
import { EventStatusHeaderBar } from "../../shared/EventStatusHeaderBar";
import UserListByRoles from "src/modules/dashboard/shared/UserList";
import DashboardSiteList from "src/modules/dashboard/shared/DashboardSiteList";
import { dateTimeUtilService } from "src/modules/shared/services/datetime-util.service";
import { TimeDurations } from "src/modules/shared/types/dto";
import { alertActions } from "src/modules/shared/actions/alert.actions";
import * as apiConstants from "src/modules/shared/constants/api.constants";
import { DefaultDateTimeFormats } from "src/modules/shared/constants/datetime.constants";
import moment from "moment";

export interface Props {
    selectedCustomerId: string;
    selectedSite: string;
    selectedCabinetId: string;
    selectedUserId: string;
    selectedMulticustodyState: string;
    startDate: Date;
    endDate: Date;
    selectedEvent: string;
    periodDurationValue?: string;
    itemIndex: number;
    callPath?: string;
    history: History;
    performSearch: (filters: ItemEventViewFilters) => void;
    periodString: string;
    selectedColumns: string[];
}

export interface State {
    filters: ItemEventViewFilters;
    disableItemFilter: boolean,
    toggleFilter: boolean,
    startDate?: Date,
    endDate?: Date,
    isFiltersVisible: boolean;
}

const service = apiConstants.REPORTS;

class ItemEventHistoryReportFilter extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.onSiteFilterChange = this.onSiteFilterChange.bind(this);
        this.onCabinetFilterChange = this.onCabinetFilterChange.bind(this);
        this.onCabinetItemNumberFilterChange = this.onCabinetItemNumberFilterChange.bind(this);
        this.toggleFilter = this.toggleFilter.bind(this);
        this.onDurationChange = this.onDurationChange.bind(this);
        this.onUserFilterChange = this.onUserFilterChange.bind(this);
        this.onJobTitleFilterChange = this.onJobTitleFilterChange.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.onEventChange = this.onEventChange.bind(this);
        this.toggleFilter = this.toggleFilter.bind(this);
        this.onExportClick = this.onExportClick.bind(this);

        const { selectedSite, selectedEvent, selectedMulticustodyState,
            selectedCabinetId, itemIndex, selectedUserId, startDate, endDate } = this.props;

        this.state = {
            filters: {
                selectedSite: selectedSite || "any",
                selectedCabinetId: selectedCabinetId || "any",
                selectedItemIndex: itemIndex || -1,
                selectedEvent: selectedEvent || "any",
                multiCustody: selectedMulticustodyState || "any",
                userId: selectedUserId,
                jobTitle: '',
                startDate: startDate || dateTimeUtilService.getStartTimeForFilters(TimeDurations.Weekly),
                endDate: endDate || new Date(),
                period: ''
            },
            isFiltersVisible: true,
            disableItemFilter: false,
            toggleFilter: false
        }
    }

    toggleFilter() {
        this.setState({ ...this.state, isFiltersVisible: !this.state.isFiltersVisible });
    }

    onSiteFilterChange(event: any) {
        this.setState({
            ...this.state,
            filters: {
                ...this.state.filters,
                selectedSite: event.target.value,
                selectedCabinetId: 'any',
            }
        });
    }

    onCabinetFilterChange(event: any) {
        let cabinetId = event.target.value;
        this.setState({
            ...this.state,
            filters: {
                ...this.state.filters,
                selectedCabinetId: cabinetId,
                selectedItemIndex: -1,
            },
            disableItemFilter: cabinetId == 'any'
        });

    }

    onCabinetItemNumberFilterChange(event: any) {
        let itemNumber = event.target.value;
        this.setState({
            ...this.state,
            filters: {
                ...this.state.filters,
                selectedItemIndex: itemNumber
            }
        });
    }

    onUserFilterChange(event: any) {
        let userId = event.value;
        this.setState({
            ...this.state,
            filters: {
                ...this.state.filters,
                userId: userId
            }
        });
    }

    onJobTitleFilterChange(selectedJobTitle: any) {
        let jobTitle = selectedJobTitle.target.value;
        this.setState({
            ...this.state,
            filters: {
                ...this.state.filters,
                jobTitle: jobTitle
            }
        });
    }

    onEventChange(event: any) {
        let eventType = event.target.value;
        this.setState({
            ...this.state,
            filters: {
                ...this.state.filters,
                selectedEvent: eventType
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
                period: duration
            }
        });
    }

    onExportClick() {
        var filterState = {
            customerId: this.props.selectedCustomerId,
            site: this.state.filters.selectedSite,
            cabinetId: this.state.filters.selectedCabinetId,
            fromDate: moment(this.state.filters.startDate).format(DefaultDateTimeFormats.DateFormat),
            toDate: moment(this.state.filters.endDate).format(DefaultDateTimeFormats.DateFormat),
            userId: this.state.filters.userId,
            itemNumber: this.state.filters.selectedItemIndex,
            jobTitle: this.state.filters.jobTitle,
            multiCustody: this.state.filters.multiCustody,
            eventCode: this.state.filters.selectedEvent,
            selectedColumns: this.props.selectedColumns
        }

        apiService.post('reports', 'item-events-history', filterState, ["export"], null, false, service)
            .then(() => {
                alertActions.showSuccess("TEXT_REPORT_EXPORT_SUCCESS");
            });
    }

    onSearch() {
        this.props.performSearch(this.state.filters);
    }

    render() {
        const { history, periodString, selectedCustomerId } = this.props;
        const { filters } = this.state;

        let search = qs.parse(history.location.search);

        return (
            <Row>
                <Col>
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
                                                    <DashboardSiteList key={selectedCustomerId} value={filters.selectedSite} customerId={selectedCustomerId}
                                                        onChange={this.onSiteFilterChange} />
                                                </SearchFilterField>
                                            </Col>
                                            <Col md={6} lg={4} xl={3} className={`mt-2 mt-lg-0 mt-md-0`}>
                                                <SearchFilterField titleKey="TEXT_CABINET">
                                                    <DashboardCabinetList key={selectedCustomerId} site={filters.selectedSite} value={filters.selectedCabinetId}
                                                        customerId={selectedCustomerId} onChange={this.onCabinetFilterChange} />
                                                </SearchFilterField>
                                            </Col>
                                            <Col md={6} lg={4} xl={3} className={`mt-2 mt-xl-0 mt-lg-0`}>
                                                <SearchFilterField titleKey="TEXT_ITEM_NO">
                                                    <CabinetItemNumberFilterList key={selectedCustomerId} value={filters.selectedItemIndex} customerId={selectedCustomerId}
                                                        cabinetId={filters.selectedCabinetId} disable={this.state.disableItemFilter} onChange={this.onCabinetItemNumberFilterChange} anyAllowed={true} />
                                                </SearchFilterField>
                                            </Col>
                                            <Col md={6} lg={4} xl={3} className={`mt-2 mt-xl-0 mt-lg-0`}>
                                                <SearchFilterField titleKey="TEXT_EVENT">
                                                    <LookupDropDown allowAny={true} textAny="TEXT_ALL" name="eventType" customerId={selectedCustomerId}
                                                        lookupKey="LIST_CABINET_ITEM_EVENTS" value={filters.selectedEvent} onChange={this.onEventChange} />
                                                </SearchFilterField>
                                            </Col>
                                            <Col md={6} lg={4} xl={3} className="mt-2">
                                                <SearchFilterField titleKey="TEXT_USER">
                                                    <UserListByRoles key={filters.userId} customerId={selectedCustomerId} role={'any'}
                                                        value={filters.userId} onChange={this.onUserFilterChange} name="userName" allowAny={true} textAny="TEXT_ANY_USER" />
                                                </SearchFilterField>
                                            </Col>
                                            <Col md={6} lg={4} xl={3} className="mt-2">
                                                <SearchFilterField titleKey="TEXT_JOB_TITLE">
                                                    <JobTitleFilterList key={selectedCustomerId} selectedCustomerId={selectedCustomerId} value={filters.jobTitle}
                                                        disable={false} onChange={this.onJobTitleFilterChange} />
                                                </SearchFilterField>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col md={4} lg={3}>
                                        <Row>
                                            <Col>
                                                <ActionButton className="float-right mt-3" textKey="BUTTON_EXPORT" color="secondary" icon="fa-download"
                                                    disableDefaultMargin={true} onClick={this.onExportClick} disabled={!this.state.filters} />
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
                                            periodDurationValue={this.props.periodDurationValue} callPath={this.props.callPath}
                                            customStartDate={filters.startDate} customEndDate={filters.endDate} />
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
                </Col>
            </Row >
        );
    }
}

export default ItemEventHistoryReportFilter;


// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetItemReports/ItemEventHistoryReport/ItemEventHistoryReportFilter.tsx