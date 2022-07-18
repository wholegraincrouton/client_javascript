import * as React from "react";
import { Row, Col, Label } from "reactstrap";
import { History } from 'history';
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
import { FilterToggle } from "../../../shared/FilterToggle";
import { EventStatusHeaderBar } from "../../../shared/EventStatusHeaderBar";
import DashboardSiteList from "src/modules/dashboard/shared/DashboardSiteList";

export interface Props {
    selectedCustomerId: string;
    selectedSite: string,
    selectedCabinetId: string,
    selectedUserId: string,
    selectedItemNumber: number,
    selectedMulticustodyState: string,
    periodDurationValue?: string;
    selectedEvent: string;
    customStartDate: Date;
    customEndDate: Date;
    callPath?: string;
    history: History;
    performSearch: (customerId: string, userId: string, cabinetGroupId: string, cabinetId: string, itemNumber: Number,
        multiCustody: string, startDate: Date, endDate: Date, eventCode: string) => void;
    periodString: string;
}

export interface State {
    selectedUserId: string;
    selectedSite: string;
    selectedCabinetId: string;
    selectedItemNumber: number;
    disableItemFilter: boolean;
    multiCustody: string;
    periodDurationValue?: string;
    startDate: Date;
    endDate: Date;
    isFiltersVisible: boolean;
    selectedEvent: string;
}

class UserEventHistoryReportFilter extends React.Component<Props, State> {
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
        this.onEventChange = this.onEventChange.bind(this);

        let { selectedSite, selectedCabinetId,
            periodDurationValue, customStartDate, customEndDate } = this.props;

        this.toggleFilter = this.toggleFilter.bind(this);
        this.state = {
            selectedSite: selectedSite == undefined ? 'any' : selectedSite,
            selectedCabinetId: selectedCabinetId == undefined ? 'any' : selectedCabinetId,
            disableItemFilter: (selectedCabinetId == undefined || selectedCabinetId == 'any') ? true : false,
            periodDurationValue: periodDurationValue,
            startDate: customStartDate,
            endDate: customEndDate,
            selectedUserId: this.props.selectedUserId,
            selectedItemNumber: this.props.selectedItemNumber,
            multiCustody: this.props.selectedMulticustodyState,
            isFiltersVisible: true,
            selectedEvent: this.props.selectedEvent
        }
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
        this.setState({ ...this.state, multiCustody });
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

    onEventChange(selectedEvent: any) {
        let eventName = selectedEvent.target.value;
        this.setState({
            ...this.state,
            selectedEvent: eventName
        });
    }

    onSearch() {
        const { selectedCustomerId } = this.props;
        const { selectedUserId, selectedSite, selectedCabinetId, selectedEvent,
            selectedItemNumber, multiCustody, startDate, endDate, periodDurationValue } = this.state;

        let startDateObj = startDate;
        let endDateObj = endDate;

        // When filters changed and duration component is not touched and no duration values are passed from the parent
        // Until duartion value changed
        if (periodDurationValue != TimeDurations.Custom) {
            startDateObj = dateTimeUtilService.getStartTimeForFilters(periodDurationValue);
            endDateObj = new Date();
        }

        this.props.performSearch(selectedCustomerId, selectedUserId, selectedSite, selectedCabinetId,
            selectedItemNumber, multiCustody, startDateObj, endDateObj, selectedEvent);
    }

    render() {
        const { history, periodString, selectedCustomerId } = this.props;
        const { selectedUserId, selectedSite, selectedCabinetId,
            selectedItemNumber, multiCustody, selectedEvent } = this.state;

        let isValid = selectedUserId == 'any';

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
                                                        value={selectedUserId} onChange={this.onUserChange} name="userName" allowAny={false} textAny="TEXT_ANY_USER" />
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
                                                        lookupKey="LIST_CABINET_HIGH_PRIORITY_EVENTS" value={selectedEvent} onChange={this.onEventChange}
                                                        additionalLookups={["LIST_CABINET_LOW_PRIORITY_EVENTS"]} />
                                                </SearchFilterField>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col md={4} lg={3}>
                                        <ActionButton className="float-right mt-3" textKey="BUTTON_SEARCH" color="primary" disabled={isValid} onClick={this.onSearch} icon="fa-search" disableDefaultMargin={true} />
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

export default UserEventHistoryReportFilter


// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetReports/EventHistoryReport/UserEventHistoryReport/UserEventHistoryReportFilter.tsx