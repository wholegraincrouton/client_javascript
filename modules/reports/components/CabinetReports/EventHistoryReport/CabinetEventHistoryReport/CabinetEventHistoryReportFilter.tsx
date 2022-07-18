import * as React from "react";
import { History } from 'history';
import Row from "reactstrap/lib/Row";
import Col from "reactstrap/lib/Col";
import { SearchFilterField } from "src/modules/shared/components/SearchFilterBox";
import { localise } from "src/modules/shared/services";
import DashboardCabinetList from "../../../../../dashboard/shared/DashboardCabinetList";
import CabinetItemNumberFilterList from "../../../../../dashboard/shared/CabinetItemNumberFilterList";
import { ActionButton, BackButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { CustomTimeDurationPicker } from "src/modules/shared/components/CustomTimeDurationPicker/CustomTimeDurationPicker";
import { TimeDurations } from "src/modules/shared/types/dto";
import { dateTimeUtilService } from "src/modules/shared/services/datetime-util.service";
import MultiCustodyFilter from "src/modules/shared/components/MultiCustodyFilter/MultiCustodyFilter";
import UserListByRoles from "src/modules/dashboard/shared/UserList";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import JobTitleFilterList from "src/modules/dashboard/shared/JobTitleFilterList";
import { FilterToggle } from "../../../shared/FilterToggle";
import { Label } from "reactstrap";
import { EventStatusHeaderBar } from "../../../shared/EventStatusHeaderBar";
import DashboardSiteList from "src/modules/dashboard/shared/DashboardSiteList";

export interface Props {
    selectedCustomerId: string;
    selectedSite: string,
    selectedCabinetId: string,
    selectedItemNumber: number,
    selectedMulticustodyState: string,
    selectedUserId: string,
    selectedEvent: string,
    selectedJobTitle: string,
    periodDurationValue?: string;
    customStartDate: Date;
    customEndDate: Date;
    callPath?: string;
    history: History;
    performSearch: (customerId: string, userId: string, selectedSite: string, cabinetId: string, itemNumber: Number,
        eventCode: string, startDate: Date, endDate: Date, jobTitle: string, selectedEvent: string) => void;
    periodString: string;
    selectedColumns: string[];
}

export interface State {
    selectedUserId: string,
    selectedSite: string,
    selectedCabinetId: string,
    selectedEvent: string,
    selectedItemNumber: Number,
    selectedJobTitle: string,
    disableItemFilter: boolean,
    multiCustody: string,
    periodDurationValue?: string;
    startDate: Date,
    endDate: Date,
    isFiltersVisible: boolean
}

class CabinetEventHistoryReportFilter extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.onSiteFilterChange = this.onSiteFilterChange.bind(this);
        this.onCabinetFilterChange = this.onCabinetFilterChange.bind(this);
        this.onCabinetItemNumberFilterChange = this.onCabinetItemNumberFilterChange.bind(this);
        this.onMultiCustodyFilterChange = this.onMultiCustodyFilterChange.bind(this);
        this.toggleFilter = this.toggleFilter.bind(this);
        this.onUserChange = this.onUserChange.bind(this);
        this.onDurationChange = this.onDurationChange.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.onCabinetEventFilterChange = this.onCabinetEventFilterChange.bind(this);
        this.onJobTitleFilterChange = this.onJobTitleFilterChange.bind(this);

        this.toggleFilter = this.toggleFilter.bind(this);

        let { selectedSite, selectedCabinetId,
            periodDurationValue, customStartDate, customEndDate, selectedJobTitle, selectedEvent,
            selectedItemNumber, selectedUserId, selectedMulticustodyState } = this.props;

        this.state = {
            selectedSite: selectedSite == undefined ? 'any' : selectedSite,
            selectedCabinetId: selectedCabinetId == undefined ? 'any' : selectedCabinetId,
            disableItemFilter: (selectedCabinetId == undefined || selectedCabinetId == 'any') ? true : false,
            periodDurationValue: periodDurationValue,
            selectedItemNumber: selectedItemNumber,
            selectedUserId: selectedUserId,
            multiCustody: selectedMulticustodyState,
            startDate: customStartDate,
            endDate: customEndDate,
            selectedJobTitle: selectedJobTitle,
            selectedEvent: selectedEvent,
            isFiltersVisible: true
        };
    }

    onSiteFilterChange(selectedSite: any) {
        let site = selectedSite.target.value;
        this.setState({ ...this.state, selectedSite: site, selectedCabinetId: 'any' });
    }

    onCabinetFilterChange(event: any) {
        let cabinetId = event.target.value;
        if (cabinetId == 'any') {
            this.setState({ ...this.state, selectedCabinetId: cabinetId, selectedItemNumber: -1, disableItemFilter: true });
        }
        else {
            this.setState({ ...this.state, selectedCabinetId: cabinetId, disableItemFilter: false });
        }
    }

    onCabinetItemNumberFilterChange(event: any) {
        let itemNumber = event.target.value;
        this.setState({ ...this.state, selectedItemNumber: itemNumber });
    }

    onMultiCustodyFilterChange(event: any) {
        let multiCustody = event.target.value;
        this.setState({ ...this.state, multiCustody: multiCustody });
    }

    onUserChange(event: any) {
        let userId = event.value;
        this.setState({ ...this.state, selectedUserId: userId });
    }

    toggleFilter() {
        this.setState({ ...this.state, isFiltersVisible: !this.state.isFiltersVisible });
    }

    onDurationChange(startDate: Date, endDate: Date, duration: string) {
        this.setState({ ...this.state, startDate: startDate, endDate: endDate, periodDurationValue: duration });
    }

    onSearch() {
        const { selectedCustomerId } = this.props;
        const { selectedUserId, selectedSite, selectedCabinetId, selectedItemNumber, multiCustody,
            startDate, endDate, periodDurationValue, selectedJobTitle, selectedEvent } = this.state;

        let startDateObj = startDate;
        let endDateObj = endDate;

        if (periodDurationValue != TimeDurations.Custom) {
            startDateObj = dateTimeUtilService.getStartTimeForFilters(periodDurationValue);
            endDateObj = new Date();
        }

        this.props.performSearch(selectedCustomerId, selectedUserId, selectedSite, selectedCabinetId,
            selectedItemNumber, multiCustody, startDateObj, endDateObj, selectedJobTitle, selectedEvent);
    }

    onCabinetEventFilterChange(selectedEvent: any) {
        let eventName = selectedEvent.target.value;
        this.setState({
            ...this.state,
            selectedEvent: eventName
        });
    }

    onJobTitleFilterChange(event: any) {
        let jobTitle = event.target.value;
        this.setState({
            ...this.state,
            selectedJobTitle: jobTitle
        });
    }

    render() {
        const { history, periodString, selectedCustomerId } = this.props;
        const { selectedUserId, selectedSite, selectedCabinetId,
            selectedItemNumber, multiCustody, selectedEvent, selectedJobTitle } = this.state;

        return (
            <Row>
                <Col>
                    <Row className="mb-3">
                        <Col>
                            <BackButton onClick={history.goBack} />
                        </Col>
                    </Row>
                    {
                        this.state.isFiltersVisible &&
                        <Row className="mb-3">
                            <Col>
                                <Row className="report-filter">
                                    <Col md={8} lg={9}>
                                        <Row className="set-width">
                                            <Col md={6} lg={4} xl={3} className={`mt-2 mt-md-0`}>
                                                <SearchFilterField titleKey="TEXT_USER">
                                                    <UserListByRoles key={selectedCustomerId} customerId={selectedCustomerId} role={'any'}
                                                        value={selectedUserId} onChange={this.onUserChange} name="userName" allowAny={true} textAny="TEXT_ANY_USER" />
                                                </SearchFilterField>
                                            </Col>
                                            <Col md={6} lg={4} xl={3} className={`mt-2 mt-lg-0 mt-md-0`}>
                                                <SearchFilterField titleKey="TEXT_SITE">
                                                    <DashboardSiteList key={selectedCustomerId} value={selectedSite} customerId={selectedCustomerId}
                                                        onChange={this.onSiteFilterChange} />
                                                </SearchFilterField>
                                            </Col>
                                            <Col md={6} lg={4} xl={3} className={`mt-2 mt-xl-0 mt-lg-0`}>
                                                <SearchFilterField titleKey="TEXT_CABINET">
                                                    <DashboardCabinetList key={selectedCustomerId} site={selectedSite} value={selectedCabinetId} customerId={selectedCustomerId}
                                                        onChange={this.onCabinetFilterChange} />
                                                </SearchFilterField>
                                            </Col>
                                            <Col md={6} lg={4} xl={3} className={`mt-2 mt-xl-0 mt-lg-0`}>
                                                <SearchFilterField titleKey="TEXT_ITEM_NO">
                                                    <CabinetItemNumberFilterList key={selectedCustomerId} anyAllowed={true} value={selectedItemNumber}
                                                        customerId={selectedCustomerId} cabinetId={selectedCabinetId}
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
                                            <Col md={6} lg={4} xl={3} className="mt-2">
                                                <SearchFilterField titleKey="TEXT_JOB_TITLE">
                                                    <JobTitleFilterList selectedCustomerId={selectedCustomerId} value={selectedJobTitle}
                                                        disable={false} onChange={this.onJobTitleFilterChange} />
                                                </SearchFilterField>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col md={4} lg={3}>
                                        <ActionButton className="float-right mt-3" textKey="BUTTON_SEARCH" color="primary" onClick={this.onSearch} icon="fa-search" disableDefaultMargin={true} />
                                    </Col>
                                </Row>
                                <Row className="mt-2">
                                    <Col>
                                        <CustomTimeDurationPicker displayLabel={true} onChange={this.onDurationChange}
                                            periodDurationValue={this.props.periodDurationValue} callPath={this.props.callPath}
                                            customStartDate={this.props.customStartDate} customEndDate={this.props.customEndDate} />
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
            </Row>
        );
    }
}

export default CabinetEventHistoryReportFilter


// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetReports/EventHistoryReport/CabinetEventHistoryReport/CabinetEventHistoryReportFilter.tsx