import * as React from "react";
import * as qs from "query-string";
import { History } from 'history';
import Row from "reactstrap/lib/Row";
import Col from "reactstrap/lib/Col";
import { SearchFilterField } from "src/modules/shared/components/SearchFilterBox";
import { dashboardService } from "../../../../dashboard/services/dashboard.service";
import { lookupService, apiService, localise } from "src/modules/shared/services";
import DashboardCabinetList from "../../../../dashboard/shared/DashboardCabinetList";
import { LookupItem, BasicUser } from "src/modules/shared/types/dto";
import JobTitleFilterList from "../../../../dashboard/shared/JobTitleFilterList";
import CabinetItemNumberFilterList from "../../../../dashboard/shared/CabinetItemNumberFilterList";
import CabinetItemNameFilterList from "../../../../dashboard/shared/CabinetItemNameFilterList";
import CabinetItemStatusFilterList from "../../../../dashboard/shared/CabinetItemStatusFilterList";
import { BackButton, ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { ItemStatus } from "src/modules/cabinet/types/dto";
import { FilterToggle } from "../../shared/FilterToggle";
import { alertActions } from "src/modules/shared/actions/alert.actions";
import UserListByRoles from "src/modules/dashboard/shared/UserList";
import * as apiConstants from "src/modules/shared/constants/api.constants";
import DashboardSiteList from "src/modules/dashboard/shared/DashboardSiteList";

const service = apiConstants.REPORTS;

export interface SearchProps {
    history: History;
    customerId: string;
    performSearch: (cabinetGroupId: string, cabinetId: string, itemNumber: Number,
        itemName: string, itemStatus: string, user: string, jobTitle: string) => void;
    selectedColumns: string[];
}

export interface state {
    selectedSite: string,
    selectedCabinetId: string,
    selectedItemNumber: Number,
    selectedItemName: string,
    selectedItemStatus: string,
    selectedUser: string,
    selectedJobTitle: string,
    toggleFilter: boolean,
    itemStatusList: LookupItem[],
    usersList: BasicUser[],
    disableFilter: boolean,
    disableItemFilter: boolean
}

class CurrentItemStatusReportFilter extends React.Component<SearchProps, state> {
    constructor(props: SearchProps) {
        super(props);
        this.onSiteFilterChange = this.onSiteFilterChange.bind(this);
        this.onCabinetFilterChange = this.onCabinetFilterChange.bind(this);
        this.onCabinetItemNumberFilterChange = this.onCabinetItemNumberFilterChange.bind(this);
        this.onCabinetItemNameFilterChange = this.onCabinetItemNameFilterChange.bind(this);
        this.onCabinetItemStatusFilterChange = this.onCabinetItemStatusFilterChange.bind(this);
        this.onUserFilterChange = this.onUserFilterChange.bind(this);
        this.onJobTitleFilterChange = this.onJobTitleFilterChange.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.onExportClick = this.onExportClick.bind(this);

        this.getCabinetItemStatusList = this.getCabinetItemStatusList.bind(this);
        this.toggleFilter = this.toggleFilter.bind(this);
        this.state = {
            selectedSite: 'any',
            selectedCabinetId: 'any',
            selectedItemNumber: -1,
            selectedItemName: 'any',
            selectedItemStatus: 'any',
            selectedUser: 'any',
            selectedJobTitle: '',
            toggleFilter: true,
            itemStatusList: [],
            usersList: [],
            disableFilter: false,
            disableItemFilter: false

        }
    }

    componentDidMount() {
        let selectedSite = dashboardService.getSelectedSite();
        let selectedCabinetId = dashboardService.getSelectedCabinet();
        let itemStateList = this.getCabinetItemStatusList();

        this.setState({
            ...this.state,
            selectedSite: selectedSite == undefined ? 'any' : selectedSite,
            selectedCabinetId: selectedCabinetId == undefined ? 'any' : selectedCabinetId,
            itemStatusList: itemStateList,
            disableItemFilter: (selectedCabinetId == undefined || selectedCabinetId == 'any') ? true : false
        });
    }

    getCabinetItemStatusList() {
        var stateList = lookupService.getList('LIST_ITEM_STATES');
        return stateList;
    }

    onSiteFilterChange(selectedSite: any) {
        let site = selectedSite.target.value;
        this.setState({ ...this.state, selectedSite: site, selectedCabinetId: 'any', selectedItemNumber: -1, selectedItemName: "any" });
    }

    onCabinetFilterChange(selectedCabinet: any) {
        let cabinetId = selectedCabinet.target.value;
        if (cabinetId == 'any') {
            this.setState({ ...this.state, selectedCabinetId: cabinetId, selectedItemNumber: -1, selectedItemName: "any", disableItemFilter: true });
        }
        else {
            this.setState({ ...this.state, selectedCabinetId: cabinetId, disableItemFilter: false });
        }
    }

    onCabinetItemNumberFilterChange(selectedCabinetItemNumber: any) {
        let itemNumber = selectedCabinetItemNumber.target.value;
        this.setState({ ...this.state, selectedItemNumber: itemNumber });
    }

    onCabinetItemNameFilterChange(selectedCabinetItemName: any) {
        let itemName = selectedCabinetItemName.target.value;
        this.setState({ ...this.state, selectedItemName: itemName });
    }

    onCabinetItemStatusFilterChange(selectedCabinetItemStatus: any) {
        let itemStatus = selectedCabinetItemStatus.target.value;

        if (itemStatus == ItemStatus.InCabinet) {
            this.setState({ ...this.state, selectedItemStatus: itemStatus, disableFilter: true, selectedUser: 'any', selectedJobTitle: '' });
        }
        else {
            this.setState({ ...this.state, disableFilter: false, selectedItemStatus: itemStatus });
        }
    }

    onUserFilterChange(selectedUser: any) {
        let user = selectedUser.value;
        this.setState({ ...this.state, selectedUser: user });
    }

    onJobTitleFilterChange(selectedJobTitle: any) {
        let jobTitle = selectedJobTitle.target.value;
        this.setState({ ...this.state, selectedJobTitle: jobTitle });
    }

    toggleFilter() {
        this.setState({ ...this.state, toggleFilter: !this.state.toggleFilter });
    }

    onSearch() {
        this.props.performSearch(this.state.selectedSite, this.state.selectedCabinetId, this.state.selectedItemNumber,
            this.state.selectedItemName, this.state.selectedItemStatus, this.state.selectedUser, this.state.selectedJobTitle);
    }

    onExportClick() {
        var filterState = {
            customerId: this.props.customerId,
            site: this.state.selectedSite,
            cabinetId: this.state.selectedCabinetId,
            itemNumber: this.state.selectedItemNumber,
            itemName: this.state.selectedItemName,
            itemStatus: this.state.selectedItemStatus,
            user: this.state.selectedUser,
            jobTitle: this.state.selectedJobTitle,
            selectedColumns: this.props.selectedColumns
        }
        apiService.post('reports', 'item-status', filterState, ["export"], null, false, service)
            .then(() => {
                alertActions.showSuccess("TEXT_REPORT_EXPORT_SUCCESS");
            });
    }

    render() {
        const { history, customerId } = this.props;
        const { selectedSite, selectedCabinetId, selectedItemNumber, selectedItemName, selectedItemStatus,
            itemStatusList, selectedUser, selectedJobTitle, toggleFilter } = this.state;

        let search = qs.parse(history.location.search);

        return (
            <Row>
                <Col>
                    {
                        search.showBackButton &&
                        <Row className="mb-3">
                            <Col lg={3}>
                                <BackButton onClick={history.goBack} />
                            </Col>
                        </Row>
                    }
                    {
                        toggleFilter &&
                        <Row className="report-filter mb-3">
                            <Col md={8} lg={9}>
                                <Row>                               
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
                                            <CabinetItemNameFilterList key={customerId} value={selectedItemName} customerId={customerId}
                                                cabinetId={selectedCabinetId} disable={this.state.disableItemFilter} onChange={this.onCabinetItemNameFilterChange} />
                                        </SearchFilterField>
                                    </Col>
                                    <Col md={6} lg={4} xl={3} className="mt-2">
                                        <SearchFilterField titleKey="TEXT_ITEM_STATUS">
                                            <CabinetItemStatusFilterList key={customerId} itemStates={itemStatusList} value={selectedItemStatus}
                                                onChange={this.onCabinetItemStatusFilterChange} />
                                        </SearchFilterField>
                                    </Col>
                                    <Col md={6} lg={4} xl={3} className="mt-2">
                                        <SearchFilterField titleKey="TEXT_USER">
                                            <UserListByRoles key={customerId} customerId={customerId} role={'any'}
                                                value={selectedUser} onChange={this.onUserFilterChange} name="userName" allowAny={true} textAny="TEXT_ANY_USER" />
                                        </SearchFilterField>
                                    </Col>
                                    <Col md={6} lg={4} xl={3} className="mt-2">
                                        <SearchFilterField titleKey="TEXT_JOB_TITLE">
                                            <JobTitleFilterList key={customerId} selectedCustomerId={customerId}
                                                value={selectedJobTitle}
                                                disable={this.state.disableFilter} onChange={this.onJobTitleFilterChange} />
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
                                    &nbsp;&nbsp;{localise("TEXT_OUT_OF_CABINET_SCHEDULED")}
                                    </span>
                                </Col>
                                <Col>
                                    <span className="badge badge-pill badge-light">
                                        <i className="fas fa-square-full fa-lg color-red" />
                                    &nbsp;&nbsp;{localise("TEXT_OUT_OF_CABINET_OVERDUE")}
                                    </span>
                                </Col>
                                <Col>
                                    <span className="badge badge-pill badge-light">
                                        <i className="fas fa-square-full fa-lg color-green" />
                                    &nbsp;&nbsp;{localise("TEXT_IN_CABINET")}
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

export default CurrentItemStatusReportFilter


// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetItemReports/CurrentItemStatusReport/CurrentItemStatusReportFilter.tsx