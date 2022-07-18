import React from "react";
import { Card, CardBody, Col, Row } from "reactstrap";
import { cabinetService } from "src/modules/cabinet/services/cabinet.service";
import { CabinetBasicDetails } from "src/modules/cabinet/types/dto";
import CabinetItemNumberFilterList from "src/modules/dashboard/shared/CabinetItemNumberFilterList";
import DashboardCabinetList from "src/modules/dashboard/shared/DashboardCabinetList";
import DashboardSiteList from "src/modules/dashboard/shared/DashboardSiteList";
import UserListByRoles from "src/modules/dashboard/shared/UserList";
import { alertActions } from "src/modules/shared/actions/alert.actions";
import { accessGroupService } from "src/modules/shared/components/AccessGroupList/access-group-list-service";
import AutoCompleteSearchField from "src/modules/shared/components/AutoCompleteSearchField/AutoCompleteSearchField";
import { apiService, contextService } from "src/modules/shared/services";
import { siteService } from "src/modules/sites/services/site.service";
import { Site } from "src/modules/sites/types/dto";
import * as apiConstants from "src/modules/shared/constants/api.constants";
import { UserAccessibleItemsFilter } from "src/modules/reports/types/dto";
import { SearchFilterField } from "src/modules/shared/components/SearchFilterBox";
import { ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { FilterToggle } from "../../shared/FilterToggle";

export interface Props {
    customerId: string;
    site: string;
    cabinetId: string;
    itemIndex: number,
    accessGroupName: string;
    userId: string;
    lastUpdateduserId: string;
    performSearch: (filters: UserAccessibleItemsFilter) => void;
    selectedColumns: string[];
    callPath?: string;
}

export interface State {
    filter: UserAccessibleItemsFilter;
    disableItemFilter: boolean,
    toggleFilter: boolean,
    isFiltersVisible: boolean;
}
const service = apiConstants.REPORTS;

export class UserAccessibleItemsFilterBox extends React.Component<Props, State>{
    accessGroupNameList: string[] = [];
    cabinetList: CabinetBasicDetails[] = [];
    siteList: Site[] = [];

    constructor(props: Props) {
        super(props);

        this.state = {
            filter: {
                site: 'any',
                cabinetId: 'any',
                itemIndex: -1,
                accessGroupName: '',
                userId: 'any',
                lastUpdatedUserId: 'any'
            },
            isFiltersVisible: true,
            disableItemFilter: false,
            toggleFilter: false
        };

        this.onSiteChange = this.onSiteChange.bind(this);
        this.onCabinetChange = this.onCabinetChange.bind(this);
        this.onCabinetItemNumberChange = this.onCabinetItemNumberChange.bind(this);
        this.onAccessGroupChange = this.onAccessGroupChange.bind(this);
        this.onUserChange = this.onUserChange.bind(this);
        this.onLastUpdatedUserChange = this.onLastUpdatedUserChange.bind(this);
        this.onExportClick = this.onExportClick.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.toggleFilter = this.toggleFilter.bind(this);
        this.onExportClick = this.onExportClick.bind(this);
    }

    componentDidMount(): void {
        this.getData();
    }

    getData() {
        let customerId = contextService.getCurrentCustomerId();
        this.cabinetList = [];

        cabinetService.getCabinets(customerId).then(cabinets => {
            this.cabinetList = cabinets;
        });

        siteService.getSites(customerId).then(sites => {
            this.siteList = sites;
        });

        accessGroupService.getAccessGroups().then(accessGroups => {
            {
                var list: string[] = [];
                accessGroups.forEach((accessGroup) => {
                    list.push(accessGroup.name);
                });
                this.accessGroupNameList = list;
            }
        });
    }

    onSearch() {
        this.props.performSearch(this.state.filter);
    }

    toggleFilter() {
        this.setState({ ...this.state, isFiltersVisible: !this.state.isFiltersVisible });
    }

    render(): React.ReactNode {
        const { filter } = this.state;
        const customerId = contextService.getCurrentCustomerId();

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
                                            <Col md={6} lg={4} xl={3} className={`mt-2 mt-md-0`}>
                                                <SearchFilterField titleKey="TEXT_CABINET">
                                                    <DashboardCabinetList key={customerId} site={filter.site} value={filter.cabinetId} customerId={customerId}
                                                        onChange={this.onCabinetChange} />
                                                </SearchFilterField>
                                            </Col>
                                            <Col md={6} lg={4} xl={3} className={`mt-2 mt-md-0`}>
                                                <SearchFilterField titleKey="TEXT_ITEM_NO">
                                                    <CabinetItemNumberFilterList anyAllowed={true} key={customerId} value={filter.itemIndex} customerId={customerId} cabinetId={filter.cabinetId}
                                                        disable={false} onChange={this.onCabinetItemNumberChange} />
                                                </SearchFilterField>
                                            </Col>
                                            <Col md={6} lg={4} xl={3} className={`mt-2 mt-md-0`}>
                                                <SearchFilterField titleKey="TEXT_ACCESSGROUP_NAME">
                                                    <AutoCompleteSearchField name="groupName" value={filter.accessGroupName} onChange={this.onAccessGroupChange} data={this.accessGroupNameList} />
                                                </SearchFilterField>
                                            </Col>
                                            <Col md={6} lg={4} xl={3} className={`mt-2 mt-md-0`}>
                                                <SearchFilterField titleKey="TEXT_USER">
                                                    <UserListByRoles key={customerId} customerId={customerId} role={'any'}
                                                        value={filter.userId} onChange={this.onUserChange} name="userName" allowAny={true} textAny="TEXT_ANY_USER" />                    </SearchFilterField>
                                            </Col>
                                            <Col md={6} lg={4} xl={3} className={`mt-2 mt-md-0`}>
                                                <SearchFilterField titleKey="TEXT_LAST_UPDATED_BY">
                                                    <UserListByRoles key={customerId} customerId={customerId} role={'any'}
                                                        value={filter.lastUpdatedUserId} onChange={this.onLastUpdatedUserChange} name="userName" allowAny={true} textAny="TEXT_ANY_USER" />                    </SearchFilterField>
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
                            </Col>
                        </Row>
                    }
                    <Row>
                        <Col className="float-right">
                            <FilterToggle toggleFilter={this.toggleFilter} showFilter={this.state.isFiltersVisible} />
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        )
    }

    onSiteChange(selectedSite: any) {
        let site = selectedSite.target.value;
        this.setState({ ...this.state, filter: { ...this.state.filter, site: site, cabinetId: 'any', itemIndex: -1 } });
    }

    onCabinetChange(selectedCabinet: any) {
        let cabinetId = selectedCabinet.target.value;
        if (cabinetId == 'any') {
            this.setState({ ...this.state, filter: { ...this.state.filter, cabinetId: cabinetId, itemIndex: -1 } });
        }
        else {
            this.setState({ ...this.state, filter: { ...this.state.filter, cabinetId: cabinetId, itemIndex: -1 } });
        }
    }

    onCabinetItemNumberChange(selectedCabinetItemNumber: any) {
        let itemNumber = selectedCabinetItemNumber.target.value;
        this.setState({ ...this.state, filter: { ...this.state.filter, itemIndex: itemNumber } });
    }

    onAccessGroupChange(selectedAccessGroup: any) {
        let name = selectedAccessGroup.target.value;
        this.setState({ ...this.state, filter: { ...this.state.filter, accessGroupName: name } });
    }

    onUserChange(selectedUser: any) {
        let user = selectedUser.value;
        this.setState({ ...this.state, filter: { ...this.state.filter, userId: user } });
    }

    onLastUpdatedUserChange(selectedUser: any) {
        let user = selectedUser.value;
        this.setState({ ...this.state, filter: { ...this.state.filter, lastUpdatedUserId: user } });
    }

    onExportClick() {
        var filterState = {
            site: this.state.filter.site,
            cabinetId: this.state.filter.cabinetId,
            itemIndex: this.state.filter.itemIndex,
            accessGroupName: this.state.filter.accessGroupName,
            userId: this.state.filter.userId,
            lastUpdatedUserId: this.state.filter.lastUpdatedUserId,
            selectedColumns: this.props.selectedColumns
        }

        apiService.post('reports', 'user-accessible-items', filterState, ["export"], null, false, service)
            .then(() => {
                alertActions.showSuccess("TEXT_REPORT_EXPORT_SUCCESS");
            });
    }
}


// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetItemReports/UserAccessibleItemsReport/UserAccessibleItemsReportFilterBox.tsx