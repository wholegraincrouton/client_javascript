import * as React from "react";
import { Row, Col, CardBody, Card, Button } from "reactstrap";
import { History } from 'history';
import { EventHistoryReportGrid } from "./EventHistoryReportGrid";
import * as qs from "query-string";
import { dateTimeUtilService } from "src/modules/shared/services/datetime-util.service";
import { reportService } from "../../../services/report.service";
import { ColumnOption, EventDetail, EventHistoryFilters } from "../../../types/dto";
import EventHistoryReportFilter from "./EventHistoryReportFilter";
import * as moment from 'moment';
import { TimeDurations } from "src/modules/shared/types/dto";
import { DefaultDateTimeFormats } from "src/modules/shared/constants/datetime.constants";
import { dashboardService } from "src/modules/dashboard/services/dashboard.service";
import { contextService, localise } from "src/modules/shared/services";
import { CustomColumnMappingsDialog } from "src/modules/shared/components/CustomColumnMappingsDialog/CustomColumnMappingsDialog";
import { columnConfigurationService } from "src/modules/shared/services/column-configuration.service";
import { ColumnOptionsToggle } from "src/modules/shared/components/CustomColumnMappingsDialog/ToggleColumnOptions";

interface Props {
    history: History;
}

interface State {
    filters: EventHistoryFilters;
    eventDetails?: EventDetail[];
    selectedPeriod: string;
    periodString: string;
    continuationToken?: string;
    hasMore: boolean;
    isSearchInvoked: boolean;
    showManageColumns: boolean;
    columnOptions: ColumnOption[];
    exportColumns: string[];
}

const reportName = "TEXT_EVENT_HISTORY";

export class EventHistoryReport extends React.Component<Props, State> {
    columns: string[] = ["TEXT_EVENT_DATETIME", "TEXT_EVENT_TYPE", "TEXT_EVENT_NAME", "TEXT_ITEM_NUM", "TEXT_ITEM_NAME", "TEXT_MULTICUSTODY", "TEXT_SITE_NAME", "TEXT_CABINET_NAME",
        "TEXT_CABINET_ADDRESS", "TEXT_USER_NAME", "TEXT_JOB_TITLE"];
    constructor(props: Props) {
        super(props);
        this.onSearch = this.onSearch.bind(this);
        this.onScrollEnd = this.onScrollEnd.bind(this);
        this.onShowMoreClick = this.onShowMoreClick.bind(this);
        this.manageColumns = this.manageColumns.bind(this);
        this.onColumnChanges = this.onColumnChanges.bind(this);
        this.setColumnsByArray = this.setColumnsByArray.bind(this);

        let tempColumnData: ColumnOption[] = [];
        this.columns.forEach(column => {
            let data: ColumnOption = {
                isHidden: false,
                columnName: column
            }
            tempColumnData.push(data);
        });

        this.state = {
            filters: this.getSearchFilters(),
            eventDetails: [],
            selectedPeriod: TimeDurations.Weekly,
            periodString: '',
            hasMore: false,
            isSearchInvoked: false,
            showManageColumns: false,
            columnOptions: tempColumnData,
            exportColumns: this.columns
        }
    }

    componentDidMount() {
        var filters = this.getSearchFilters();
        this.onSearch(filters);

        columnConfigurationService.getColumnsByReportName(reportName)
            .then((result) => {
                if (result && result.length > 0)
                    this.setColumnsByArray(result);
            });
    }

    getSearchFilters() {
        const criteria = qs.parse(this.props.history.location.search);
        let selectedSite = dashboardService.getSelectedSite();
        let selectedCabinetId = dashboardService.getSelectedCabinet();
        let selectedPeriod = criteria.period as string || TimeDurations.Weekly;
        let multiCustody = criteria.multiCustody as string;
        let role = criteria.role as string;
        let userId = criteria.userId as string;
        let itemNumber = criteria.itemNo as string || '';
        let event = criteria.event as string || '';
        let selectedCustomStartDateString = criteria.startDate as string || undefined;
        let selectedCustomEndDateString = criteria.endDate as string || undefined;

        let selectedCustomStartDate = new Date();
        let selectedCustomEndDate = new Date();

        if (selectedPeriod == TimeDurations.Custom && selectedCustomStartDateString && selectedCustomEndDateString) {
            selectedCustomStartDate = new Date(selectedCustomStartDateString);
            selectedCustomEndDate = new Date(selectedCustomEndDateString);
        }
        else {
            selectedCustomStartDate = dateTimeUtilService.getStartTimeForFilters(selectedPeriod);
            selectedCustomEndDate = new Date();
        }

        var filters = {
            selectedSite: selectedSite || 'any',
            selectedCabinetId: selectedCabinetId || 'any',
            selectedRole: role || "any",
            selectedUserId: userId || 'any',
            startDate: selectedCustomStartDate,
            endDate: selectedCustomEndDate,
            selectedItemNumber: itemNumber != '' ? parseInt(itemNumber, 10) : -1,
            multiCustody: multiCustody || 'any',
            selectedEvent: event || 'any',
            selectedPeriod: selectedPeriod
        };

        return filters;
    }

    onSearch(eventHistoryFilters: EventHistoryFilters, isShowMore: boolean = false) {
        const { selectedSite, selectedCabinetId, selectedItemNumber,
            selectedUserId, multiCustody, selectedEvent, selectedRole, startDate, endDate, selectedPeriod } = eventHistoryFilters;
        const { continuationToken } = this.state;
        const selectedCustomerId = contextService.getCurrentCustomerId();

        let periodString = `${moment(startDate).format('dddd Do MMMM YYYY').toUpperCase()} - ${moment(endDate).format('dddd Do MMMM YYYY').toUpperCase()}`;
        let startDateString = moment(startDate).format(DefaultDateTimeFormats.DateFormat);
        let endDateString = moment(endDate).format(DefaultDateTimeFormats.DateFormat);

        reportService.getEventHistory(selectedCustomerId, selectedSite, selectedCabinetId,
            selectedItemNumber, selectedUserId, multiCustody, selectedEvent,
            startDateString, endDateString, selectedRole, isShowMore ? continuationToken : undefined, 10)
            .then((response: any) => {
                this.setState({
                    filters: {
                        ...this.state.filters,
                        selectedSite: selectedSite,
                        selectedCabinetId: selectedCabinetId,
                        selectedUserId: selectedUserId,
                        multiCustody: multiCustody,
                        selectedItemNumber: selectedItemNumber,
                        selectedEvent: selectedEvent,
                        startDate: startDate,
                        endDate: endDate
                    },
                    eventDetails: isShowMore ?
                        [...this.state.eventDetails || [], ...response.results] : response.results,
                    continuationToken: response.continuationToken,
                    hasMore: response.continuationToken != null,
                    selectedPeriod: selectedPeriod,
                    periodString: periodString,
                    isSearchInvoked: false
                });
            });
    }

    onScrollEnd() {
        if (this.state.hasMore && !this.state.isSearchInvoked) {
            this.onSearch(this.state.filters, true);
            this.setState({ ...this.state, isSearchInvoked: true });
        }
    }

    onShowMoreClick() {
        this.onSearch(this.state.filters, true);
    }

    manageColumns() {
        const { showManageColumns } = this.state;
        this.setState({ ...this.state, showManageColumns: !showManageColumns })
    }

    onColumnChanges(value: any) {
        this.setColumnsByArray(value);
    }

    setColumnsByArray(columns: string[]) {
        let options: ColumnOption[] = this.state.columnOptions;
        let selectedColumnsArray: string[] = [];

        if (columns && columns.length > 0) {
            options.forEach(column => column.isHidden = !columns.some(val => val == column.columnName));
        }
        selectedColumnsArray = options.filter(data => !data.isHidden).map(c => c.columnName);

        this.setState({ ...this.state, exportColumns: selectedColumnsArray, columnOptions: options, showManageColumns: false });
    }

    render() {
        let callPath = qs.parse(this.props.history.location.search).callPath as string;
        const { selectedSite, selectedCabinetId, selectedUserId,
            startDate, endDate, selectedEvent, selectedItemNumber, multiCustody, selectedRole, selectedPeriod } = this.state.filters;
        const { showManageColumns, exportColumns } = this.state;
        const selectedCustomerId = contextService.getCurrentCustomerId();

        return (
            <div className="report event-history-report">
                <Card>
                    <CardBody>
                        <EventHistoryReportFilter selectedRole={selectedRole} selectedUserId={selectedUserId}
                            selectedPeriod={selectedPeriod} periodString={this.state.periodString}
                            selectedMulticustodyState={multiCustody} selectedEvent={selectedEvent}
                            selectedItemNo={selectedItemNumber} selectedCustomerId={selectedCustomerId}
                            selectedSite={selectedSite} selectedCabinetId={selectedCabinetId}
                            history={this.props.history} performSearch={this.onSearch} periodDurationValue={this.state.selectedPeriod}
                            startDate={startDate} endDate={endDate} callPath={callPath} selectedColumns={exportColumns} />
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        {
                            !showManageColumns &&
                            <Row>
                                <Col><ColumnOptionsToggle toggleColumnOptions={this.manageColumns} /></Col>
                            </Row>
                        }
                        {
                            showManageColumns &&
                            <CustomColumnMappingsDialog titleKey={reportName} columns={this.columns} selectedColumns={exportColumns} onColumnChanges={this.onColumnChanges} closeDialog={this.manageColumns}></CustomColumnMappingsDialog>
                        }
                        <Row>
                            <Col>
                                <EventHistoryReportGrid selectedMultiCustodyState={multiCustody} selectedItemNumber={selectedItemNumber}
                                    selectedEventCode={selectedEvent} selectedPeriod={this.state.selectedPeriod} startDate={startDate} endDate={endDate}
                                    selectedCustomerId={selectedCustomerId} selectedSite={selectedSite}
                                    selectedCabinetId={selectedCabinetId} selectedUserId={selectedUserId} eventList={this.state.eventDetails}
                                    callPath={callPath} onScrollEnd={this.onScrollEnd} selectedColumns={exportColumns} />
                            </Col>
                        </Row>
                        {
                            this.state.hasMore &&
                            <Row>
                                <Col>
                                    <Button color="link" className="show-more" onClick={this.onShowMoreClick}>
                                        {localise("BUTTON_SHOW_MORE")}
                                    </Button>
                                </Col>
                            </Row>
                        }
                    </CardBody>
                </Card>
            </div>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetReports/EventHistoryReport/EventHistoryReport.tsx