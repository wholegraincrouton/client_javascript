import * as React from "react";
import * as qs from "query-string";
import { History } from 'history';
import Row from "reactstrap/lib/Row";
import Col from "reactstrap/lib/Col";
import { SearchFilterField } from "src/modules/shared/components/SearchFilterBox";
import { dashboardService } from "../../../../dashboard/services/dashboard.service";
import { apiService, localise } from "src/modules/shared/services";
import DashboardCabinetList from "../../../../dashboard/shared/DashboardCabinetList";
import CabinetItemNumberFilterList from "../../../../dashboard/shared/CabinetItemNumberFilterList";
import CabinetItemNameFilterList from "../../../../dashboard/shared/CabinetItemNameFilterList";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import { BackButton, ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { FilterToggle } from "../../shared/FilterToggle";
import { alertActions } from "src/modules/shared/actions/alert.actions";
import * as apiConstants from "src/modules/shared/constants/api.constants";
import DashboardSiteList from "src/modules/dashboard/shared/DashboardSiteList";

const service = apiConstants.REPORTS;

export interface SearchProps {
    history: History;
    customerId: string;
    performSearch: (site: string, cabinetId: string,
    eventName: string, itemNumber: Number, itemName: string) => void;
    selectedColumns: string[];
}

export interface state {
    selectedCabinetId: string,
    selectedEventName: string,
    selectedItemNumber: number,
    selectedItemName: string,
    toggleFilter: boolean,
    disableItemFilter: boolean,
    selectedSite: string;
}

class TodaysEventsReportFilter extends React.Component<SearchProps, state> {
    constructor(props: SearchProps) {
        super(props);
        this.onCabinetFilterChange = this.onCabinetFilterChange.bind(this);
        this.onCabinetItemNumberFilterChange = this.onCabinetItemNumberFilterChange.bind(this);
        this.onCabinetItemNameFilterChange = this.onCabinetItemNameFilterChange.bind(this);
        this.onCabinetEventFilterChange = this.onCabinetEventFilterChange.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.onExportClick = this.onExportClick.bind(this);
        this.onSiteFilterChange = this.onSiteFilterChange.bind(this);

        this.toggleFilter = this.toggleFilter.bind(this);
        this.state = {
            selectedCabinetId: 'any',
            selectedEventName: "any",
            selectedItemNumber: -1,
            selectedItemName: 'any',
            toggleFilter: true,
            disableItemFilter: false,
            selectedSite: 'any'
        }
    }

    componentDidMount() {
        let selectedCabinetId = dashboardService.getSelectedCabinet();
        let selectedSite = dashboardService.getSelectedSite();

        this.setState({
            ...this.state,
            selectedCabinetId: selectedCabinetId == undefined ? 'any' : selectedCabinetId,
            disableItemFilter: (selectedCabinetId == undefined || selectedCabinetId == 'any') ? true : false,
            selectedSite: selectedSite == undefined ? 'any' : selectedSite
        });
    }

    onSiteFilterChange(selectedSite: any) {
        let site = selectedSite.target.value;
        this.setState({ ...this.state, selectedSite: site, selectedCabinetId: 'any', selectedItemNumber: -1, selectedItemName: "any" });
    }

    onCabinetFilterChange(selectedCabinet: any) {
        let cabinetId = selectedCabinet.target.value;
        if (cabinetId == "any") {
            this.setState({ ...this.state, selectedCabinetId: cabinetId, selectedItemNumber: -1, selectedItemName: "any", disableItemFilter: true });
        }
        else {
            this.setState({ ...this.state, selectedCabinetId: cabinetId, selectedItemNumber: -1, selectedItemName: "any", disableItemFilter: false });
        }
    }

    onCabinetEventFilterChange(selectedEvent: any) {
        let eventName = selectedEvent.target.value;
        this.setState({ ...this.state, selectedEventName: eventName });
    }

    onCabinetItemNumberFilterChange(selectedCabinetItemNumber: any) {
        let itemNumber = selectedCabinetItemNumber.target.value;
        this.setState({ ...this.state, selectedItemNumber: itemNumber });
    }

    onCabinetItemNameFilterChange(selectedCabinetItemName: any) {
        let itemName = selectedCabinetItemName.target.value;
        this.setState({ ...this.state, selectedItemName: itemName });
    }

    toggleFilter() {
        this.setState({ ...this.state, toggleFilter: !this.state.toggleFilter });
    }

    onSearch() {
        this.props.performSearch(this.state.selectedSite, this.state.selectedCabinetId,
            this.state.selectedEventName, this.state.selectedItemNumber, this.state.selectedItemName);
    }

    onExportClick() {
        var filterState = {
            customerId: this.props.customerId,
            site: this.state.selectedSite,
            cabinetId: this.state.selectedCabinetId,
            eventName: this.state.selectedEventName,
            itemNumber: this.state.selectedItemNumber,
            itemName: this.state.selectedItemName,
            selectedColumns: this.props.selectedColumns
        }
        apiService.post('reports', 'todays-events', filterState, ["export"], null, false, service)
            .then(() => {
                alertActions.showSuccess("TEXT_REPORT_EXPORT_SUCCESS");
            });
    }

    render() {
        const { history, customerId } = this.props;
        const { selectedSite, selectedCabinetId, selectedItemNumber,
            selectedItemName, selectedEventName, toggleFilter } = this.state;

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
                        toggleFilter &&
                        <Row className="report-filter mb-3">
                            <Col md={8} lg={9}>
                                <Row className="set-width">                                
                                    <Col md={6} lg={4} xl={3} className={`mt-2 mt-md-0`}>
                                        <SearchFilterField titleKey="TEXT_SITE">
                                            <DashboardSiteList key={customerId} value={selectedSite} customerId={customerId}
                                                onChange={this.onSiteFilterChange} />
                                        </SearchFilterField>
                                    </Col>
                                    <Col md={6} lg={4} xl={3} className={`mt-2 mt-lg-0 mt-md-0`}>
                                        <SearchFilterField titleKey="TEXT_CABINET">
                                            <DashboardCabinetList key={customerId} site={selectedSite} value={selectedCabinetId} customerId={customerId}
                                                onChange={this.onCabinetFilterChange} />
                                        </SearchFilterField>
                                    </Col>
                                    <Col md={6} lg={4} xl={3} className={`mt-2 mt-xl-0 mt-lg-0`}>
                                        <SearchFilterField titleKey="TEXT_ITEM_NO">
                                            <CabinetItemNumberFilterList anyAllowed={true} key={customerId} value={selectedItemNumber} customerId={customerId} cabinetId={selectedCabinetId}
                                                disable={this.state.disableItemFilter} onChange={this.onCabinetItemNumberFilterChange} />
                                        </SearchFilterField>
                                    </Col>
                                    <Col md={6} lg={4} xl={3} className={`mt-2 mt-xl-0 mt-lg-0`}>
                                        <SearchFilterField titleKey="TEXT_ITEM_NAME">
                                            <CabinetItemNameFilterList key={customerId} value={selectedItemName} customerId={customerId} cabinetId={selectedCabinetId}
                                                disable={this.state.disableItemFilter} onChange={this.onCabinetItemNameFilterChange} />
                                        </SearchFilterField>
                                    </Col>
                                    <Col md={6} lg={4} xl={3} className="mt-2">
                                        <SearchFilterField titleKey="TEXT_EVENT">
                                            <LookupDropDown allowAny={true} textAny="TEXT_ALL" name="eventType" customerId={customerId}
                                                lookupKey="LIST_CABINET_HIGH_PRIORITY_EVENTS" value={selectedEventName} onChange={this.onCabinetEventFilterChange}
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
                    }
                    <Row>
                        <Col md={9}>
                            <Row>
                                <Col>
                                    <span className="badge badge-pill badge-light">
                                        <i className="fas fa-square-full fa-lg color-grey" />
                                    &nbsp;&nbsp;{localise("TEXT_ITEM_RETRIEVED")}
                                    </span>
                                </Col>
                                <Col>
                                    <span className="badge badge-pill badge-light">
                                        <i className="fas fa-square-full fa-lg color-green" />
                                    &nbsp;&nbsp;{localise("TEXT_ITEM_RETURNED")}
                                    </span>
                                </Col>
                                <Col>
                                    <span className="badge badge-pill badge-light">
                                        <i className="fas fa-square-full fa-lg color-red" />
                                    &nbsp;&nbsp;{localise("TEXT_ITEM_OVERDUE")}
                                    </span>
                                </Col>
                                <Col>
                                    <span className="badge badge-pill badge-light">
                                        <i className="fas fa-square-full fa-lg color-orange" />
                                    &nbsp;&nbsp;{localise("TEXT_OTHER_EVENTS")}
                                    </span>
                                </Col>
                            </Row>
                        </Col>
                        <Col md={3}>
                            <FilterToggle toggleFilter={this.toggleFilter} showFilter={toggleFilter} />
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}

export default TodaysEventsReportFilter;



// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetReports/TodaysEventsReport/TodaysEventsReportFilter.tsx