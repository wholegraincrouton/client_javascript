import React from "react";
import moment from "moment";
import { ColumnOption, ItemWiseTransactionDetail, ItemWiseTransactionFilter } from "src/modules/reports/types/dto";
import { TimeDurations } from "src/modules/shared/types/dto";
import { dateTimeUtilService } from "src/modules/shared/services/datetime-util.service";
import { DefaultDateTimeFormats } from "src/modules/shared/constants/datetime.constants";
import { contextService, localise } from "src/modules/shared/services";
import { reportService } from "src/modules/reports/services/report.service";
import { columnConfigurationService } from "src/modules/shared/services/column-configuration.service";
import { Button, Card, CardBody, Col, Row } from "reactstrap";
import { ColumnOptionsToggle } from "src/modules/shared/components/CustomColumnMappingsDialog/ToggleColumnOptions";
import { CustomColumnMappingsDialog } from "src/modules/shared/components/CustomColumnMappingsDialog/CustomColumnMappingsDialog";
import { ItemWiseTransactionReportGrid } from "./ItemWiseTransactionReportGrid";
import { ItemWiseTransactionReportFilter } from "./ItemWiseTransactionReportFIlter";
import { History } from 'history';

interface Props {
    history: History
}

interface State {
    transactionsList: ItemWiseTransactionDetail[];
    filter: ItemWiseTransactionFilter;
    periodString?: string;
    continuationToken?: string;
    isSearchInvoked: boolean;
    showManageColumns: boolean;
    columnOptions: ColumnOption[];
    exportColumns: string[];
    remark?: string;
}

const reportName = "TEXT_ITEM_WISE_TRANSACTION_REPORT";
const callPath = "/reports/overview";

export class ItemWiseTransactionReport extends React.Component<Props, State>{

    columns: string[] = [
        "TEXT_ITEM_NUM", "TEXT_ITEM_NAME", "TEXT_ITEM_TYPE",
        "TEXT_CABINET_NAME", "TEXT_SITE",
        "TEXT_TOTAL_TRANSACTION_COUNT",
        "TEXT_AVERAGE_TIME_OUT_OF_CABINET",
        "TEXT_OVERDUE_COUNT",
        "TEXT_AVERAGE_TIME_OVERDUE"
    ];

    constructor(props: Props) {
        super(props);

        let tempColumnData: ColumnOption[] = [];
        this.columns.forEach(column => {
            let data: ColumnOption = {
                isHidden: false,
                columnName: column
            }
            tempColumnData.push(data);
        });

        this.state = {
            transactionsList: [],
            filter: {
                site: "any",
                cabinetId: "any",
                itemName: "any",
                itemIndex: -1,
                startDate: dateTimeUtilService.getStartTimeForFilters(TimeDurations.Weekly),
                endDate: new Date(),
                period: TimeDurations.Weekly
            },
            isSearchInvoked: false,
            showManageColumns: false,
            columnOptions: tempColumnData,
            exportColumns: this.columns
        }

        this.performSearch = this.performSearch.bind(this);
        this.manageColumns = this.manageColumns.bind(this);
        this.onColumnChanges = this.onColumnChanges.bind(this);
        this.onScrollEnd = this.onScrollEnd.bind(this);
        this.onShowMoreClick = this.onShowMoreClick.bind(this);
        this.setColumnsByArray = this.setColumnsByArray.bind(this);
    }

    componentDidMount() {
        this.performSearch(this.state.filter);

        columnConfigurationService.getColumnsByReportName(reportName)
            .then((result) => {
                if (result && result.length > 0)
                    this.setColumnsByArray(result);
            });
    }

    performSearch(filters: ItemWiseTransactionFilter, isShowMore: boolean = false) {
        let startDate = moment(filters.startDate).format(DefaultDateTimeFormats.DateFormat);
        let endDate = moment(filters.endDate).format(DefaultDateTimeFormats.DateFormat);
        let periodString = `${moment(filters.startDate).format('dddd Do MMMM YYYY').toUpperCase()} - ${moment(filters.endDate).format('dddd Do MMMM YYYY').toUpperCase()}`;
        const selectedCustomerId = contextService.getCurrentCustomerId();
        const limit: number = 10;
        const { continuationToken } = this.state;

        reportService.getItemWiseTransactionList(selectedCustomerId, filters.site,
            filters.cabinetId, filters.itemIndex, filters.itemName, startDate, endDate, isShowMore ? continuationToken : undefined, limit)
            .then((response: any) => {
                this.setState({
                    ...this.state,
                    transactionsList: isShowMore ?
                        [...this.state.transactionsList || [], ...response.itemTransactions.results] : response.itemTransactions.results,
                    continuationToken: response.itemTransactions.continuationToken,
                    isSearchInvoked: false,
                    periodString: periodString,
                    remark: response.remark
                });
            });
    }

    manageColumns() {
        const { showManageColumns } = this.state;
        this.setState({ ...this.state, showManageColumns: !showManageColumns })
    }

    onColumnChanges(value: any) {
        this.setColumnsByArray(value);
    }

    isColumnVisible(columnName: string) {
        const { exportColumns } = this.state;
        return exportColumns.some(s => s == columnName);
    }

    onScrollEnd() {
        if (this.state.continuationToken && !this.state.isSearchInvoked) {
            this.performSearch(this.state.filter, true);
            this.setState({ ...this.state, isSearchInvoked: true });
        }
    }

    onShowMoreClick() {
        this.performSearch(this.state.filter, true);
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
        const { showManageColumns, exportColumns, filter, periodString, transactionsList, remark } = this.state;
        const customerId = contextService.getCurrentCustomerId();

        return (
            <div className="report">
                <ItemWiseTransactionReportFilter customerId={customerId} site={filter.site} cabinetId={filter.cabinetId} startDate={filter.startDate}
                    endDate={filter.endDate} periodDurationValue={filter.period} itemIndex={filter.itemIndex} periodString={periodString || ''}
                    performSearch={this.performSearch} selectedColumns={exportColumns} callPath={callPath} />
                <Card>
                    <CardBody>
                        <Row>
                            <Col className="text-right">
                                <small><i>{remark}</i></small>
                            </Col>
                        </Row>
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
                                <ItemWiseTransactionReportGrid itemTransactionList={transactionsList} selectedColumns={exportColumns} onScrollEnd={this.onScrollEnd} />
                            </Col>
                        </Row>
                        {
                            this.state.continuationToken &&
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
        )
    }
}



// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetItemReports/ItemWiseTransactionReport/ItemWiseTransactionReport.tsx