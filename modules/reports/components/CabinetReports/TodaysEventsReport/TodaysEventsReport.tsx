import * as React from "react";
import { ColumnOption, TodayEventDetails } from "../../../../reports/types/dto";
import { dashboardService } from "../../../../dashboard/services/dashboard.service";
import { Row, Col, Card, CardBody, Button } from "reactstrap";
import TodaysEventsReportFilter from "./TodaysEventsReportFilter";
import { TodaysEventsReportGrid } from "./TodaysEventsReportGrid";
import { History } from 'history';
import { reportService } from "../../../services/report.service";
import { TodaysEventsFilters } from "src/modules/reports/types/dto";
import { contextService, localise } from "src/modules/shared/services";
import { CustomColumnMappingsDialog } from "src/modules/shared/components/CustomColumnMappingsDialog/CustomColumnMappingsDialog";
import { columnConfigurationService } from "src/modules/shared/services/column-configuration.service";
import { ColumnOptionsToggle } from "src/modules/shared/components/CustomColumnMappingsDialog/ToggleColumnOptions";

interface Props {
    history: History;
}

interface State {
    todayEventsDetailsList: TodayEventDetails[],
    continuationToken?: string;
    hasMore: boolean;
    filters: TodaysEventsFilters;
    isSearchInvoked: boolean;
    showManageColumns: boolean;
    columnOptions: ColumnOption[];
    exportColumns: string[];
}

const reportName = "TEXT_TODAYS_EVENTS";

export class TodaysEventsReport extends React.Component<Props, State> {
    columns: string[] = ["TEXT_EVENT_NAME", "TEXT_EVENT_TIME", "TEXT_EVENT_TYPE", "TEXT_ITEM_ID", "TEXT_ITEM_NAME",
        "TEXT_MULTICUSTODY", "TEXT_SITE_NAME", "TEXT_CABINET_NAME", "TEXT_CABINET_ADDRESS", "TEXT_USER_NAME", "TEXT_JOB_TITLE"];
    constructor(props: Props) {
        super(props);
        this.performSearch = this.performSearch.bind(this);
        this.onShowMoreClick = this.onShowMoreClick.bind(this);
        this.onScrollEnd = this.onScrollEnd.bind(this);
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
            todayEventsDetailsList: [],
            hasMore: false,
            filters: {
                selectedSite: '', cabinetId: '',
                eventName: 'any', itemNumber: -1, itemName: 'any'
            },
            isSearchInvoked: false,
            showManageColumns: false,
            columnOptions: tempColumnData,
            exportColumns: this.columns
        }
    }

    componentDidMount() {
        let selectedSite = dashboardService.getSelectedSite();
        let selectedCabinetId = dashboardService.getSelectedCabinet();

        this.performSearch(selectedSite, selectedCabinetId, 'any', -1, 'any');

        columnConfigurationService.getColumnsByReportName(reportName)
            .then((result) => {
                if (result && result.length > 0)
                    this.setColumnsByArray(result);
            });
    }

    performSearch(selectedSite: string, cabinetId: string, eventName: string,
        itemNumber: Number, itemName: string, isShowMore: boolean = false) {
        const { continuationToken } = this.state;
        const customerId = contextService.getCurrentCustomerId();

        reportService.getTodayEventsList(customerId, selectedSite, cabinetId, eventName, itemNumber,
            itemName, isShowMore ? continuationToken : undefined, 10)
            .then((response: any) => {
                this.setState({
                    ...this.state,
                    todayEventsDetailsList: isShowMore ?
                        [...this.state.todayEventsDetailsList, ...response.results] : response.results,
                    continuationToken: response.continuationToken,
                    hasMore: response.continuationToken != null,
                    filters: {
                        selectedSite, cabinetId, eventName, itemNumber, itemName
                    },
                    isSearchInvoked: false
                });
            });
    }

    onShowMoreClick() {
        const { selectedSite, cabinetId, itemNumber, eventName, itemName } = this.state.filters;
        this.performSearch(selectedSite, cabinetId, eventName, itemNumber, itemName, true);
    }

    onScrollEnd() {
        const { selectedSite, cabinetId, itemNumber, eventName, itemName } = this.state.filters;

        if (this.state.hasMore && !this.state.isSearchInvoked) {
            this.performSearch(selectedSite, cabinetId, eventName, itemNumber, itemName, true);
            this.setState({ ...this.state, isSearchInvoked: true });
        }
    }

    manageColumns() {
        const { showManageColumns } = this.state;
        this.setState({ ...this.state, showManageColumns: !showManageColumns })
    }

    onColumnChanges(value: string[]) {
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
        const customerId = contextService.getCurrentCustomerId();
        const { showManageColumns, exportColumns } = this.state;

        return (
            <div className="report todays-events-report">
                <Card>
                    <CardBody>
                        <TodaysEventsReportFilter customerId={customerId} history={this.props.history} performSearch={this.performSearch} selectedColumns={exportColumns} />
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
                                <TodaysEventsReportGrid todayEventsList={this.state.todayEventsDetailsList} onScrollEnd={this.onScrollEnd} selectedColumns={exportColumns} />
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
// ./src/modules/reports/components/CabinetReports/TodaysEventsReport/TodaysEventsReport.tsx