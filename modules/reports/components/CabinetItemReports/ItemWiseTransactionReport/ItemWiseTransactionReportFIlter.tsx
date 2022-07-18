import moment from "moment";
import React from "react";
import { Card, CardBody, Col, Label, Row } from "reactstrap";
import CabinetItemNumberFilterList from "src/modules/dashboard/shared/CabinetItemNumberFilterList";
import DashboardCabinetList from "src/modules/dashboard/shared/DashboardCabinetList";
import DashboardSiteList from "src/modules/dashboard/shared/DashboardSiteList";
import { ItemWiseTransactionFilter } from "src/modules/reports/types/dto";
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
import CabinetItemNameFilterList from "src/modules/dashboard/shared/CabinetItemNameFilterList";

export interface Props {
    customerId: string;
    site: string;
    cabinetId: string;
    startDate: Date;
    endDate: Date;
    periodDurationValue?: string;
    itemIndex: number;
    performSearch: (filters: ItemWiseTransactionFilter) => void;
    periodString: string;
    selectedColumns: string[];
    callPath?: string;
}

export interface State {
    filter: ItemWiseTransactionFilter;
    disableItemFilter: boolean,
    toggleFilter: boolean,
    startDate?: Date,
    endDate?: Date,
    isFiltersVisible: boolean;
}

const service = apiConstants.REPORTS;

export class ItemWiseTransactionReportFilter extends React.Component<Props, State>{
    constructor(props: Props) {
        super(props)

        this.state = {
            filter: {
                site: "any",
                cabinetId: "any",
                itemName: "any",
                itemIndex: -1,
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
        this.onItemIndexChange = this.onItemIndexChange.bind(this);
        this.onCabinetItemNameFilterChange = this.onCabinetItemNameFilterChange.bind(this);
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
                itemIndex: -1,
                itemName: "any"
            }
        });
    }

    onCabinetChange(event: any) {
        let cabinetId = event.target.value;
        this.setState({
            ...this.state,
            filter: {
                ...this.state.filter,
                cabinetId: cabinetId,
                itemIndex: -1,
            },
            disableItemFilter: cabinetId == 'any'
        });

    }

    onItemIndexChange(event: any) {
        let itemIndex = event.target.value;
        this.setState({
            ...this.state,
            filter: {
                ...this.state.filter,
                itemIndex: itemIndex
            }
        });
    }

    onCabinetItemNameFilterChange(selectedCabinetItemName: any) {
        let itemName = selectedCabinetItemName.target.value;
        this.setState({ ...this.state, filter: { ...this.state.filter, itemName: itemName } });
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
            itemNumber: this.state.filter.itemIndex,
            itemName: this.state.filter.itemName,
            fromDate: moment(this.state.filter.startDate).format(DefaultDateTimeFormats.DateFormat),
            toDate: moment(this.state.filter.endDate).format(DefaultDateTimeFormats.DateFormat),
            selectedColumns: this.props.selectedColumns
        }

        apiService.post('reports', 'item-wise-transaction', filterState, ["export"], null, false, service)
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
                                                <SearchFilterField titleKey="TEXT_ITEM_NO">
                                                    <CabinetItemNumberFilterList key={customerId} value={filter.itemIndex} customerId={customerId}
                                                        cabinetId={filter.cabinetId} disable={this.state.disableItemFilter} onChange={this.onItemIndexChange} anyAllowed={true} />
                                                </SearchFilterField>
                                            </Col>
                                            <Col md={6} lg={4} xl={3} className={`mt-2 mt-md-0`}>
                                                <SearchFilterField titleKey="TEXT_ITEM_NAME">
                                                    <CabinetItemNameFilterList key={customerId} value={filter.itemName} customerId={customerId}
                                                        cabinetId={filter.cabinetId} disable={false} onChange={this.onCabinetItemNameFilterChange} />
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
// ./src/modules/reports/components/CabinetItemReports/ItemWiseTransactionReport/ItemWiseTransactionReportFIlter.tsx