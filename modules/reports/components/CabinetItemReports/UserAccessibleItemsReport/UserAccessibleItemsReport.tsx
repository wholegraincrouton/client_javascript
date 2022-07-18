import { SortDescriptor } from "@progress/kendo-data-query";
import React from "react";
import { ReactNode } from "react";
import { Col, Row } from "reactstrap";
import { ColumnOption, UserAccessibleItems, UserAccessibleItemsFilter } from "src/modules/reports/types/dto";
import { CustomColumnMappingsDialog } from "src/modules/shared/components/CustomColumnMappingsDialog/CustomColumnMappingsDialog";
import { ColumnOptionsToggle } from "src/modules/shared/components/CustomColumnMappingsDialog/ToggleColumnOptions";
import { contextService, localise } from "src/modules/shared/services";
import { columnConfigurationService } from "src/modules/shared/services/column-configuration.service";
import { UserAccessibleItemsFilterBox } from "./UserAccessibleItemsReportFilterBox";
import { reportService } from "src/modules/reports/services/report.service";
import { UserAccessibleItemsReportGrid } from "./UserAccesssibleItemsReportGrid";

interface Props {
    history: History
}

interface State {
    detailsList: UserAccessibleItems[];
    filter: UserAccessibleItemsFilter;
    periodString?: string;
    continuationToken?: string;
    isSearchInvoked: boolean;
    showManageColumns: boolean;
    columnOptions: ColumnOption[];
    exportColumns: string[];
}

const reportName = "TEXT_USER_ACCESSIBLE_ITEMS";
const callPath = "/reports/overview";

export class UserAccessibleItemsReport extends React.Component<Props, State>{
    routePath: string = "/reports/overview/item-record-report";
    defaultSort: SortDescriptor = { field: "createdOnUtc", dir: "desc" };
    columns: string[] = [
        "TEXT_USER_NAME", "TEXT_ACCESS_GROUP",
        "TEXT_ACCESS_BASIS", "TEXT_CABINET_NAME",
        "TEXT_ACCESSIBLE_ITEMS", "TEXT_ACCESS_START",
        "TEXT_ACCESS_END", "TEXT_SCHEDULE",
        "TEXT_SCHEDULE_FROM_TO", "LAST_UPDATED_DATE_TIME",
        "TEXT_LAST_UPDATED_BY"
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
            detailsList: [],
            filter: {
                site: 'any',
                cabinetId: 'any',
                itemIndex: -1,
                accessGroupName: '',
                userId: 'any',
                lastUpdatedUserId: 'any'
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

    performSearch(filter: UserAccessibleItemsFilter, isShowMore: boolean = false) {
        const { continuationToken } = this.state;

        reportService.getUserAccessibleItemsList(filter.site,
            filter.cabinetId, filter.itemIndex, filter.accessGroupName, filter.userId, filter.lastUpdatedUserId,
            isShowMore ? continuationToken : undefined)
            .then((response: any) => {
                this.setState({
                    ...this.state,
                    detailsList: isShowMore ?
                        [...this.state.detailsList || [], ...response.results] : response.results,
                    continuationToken: response.continuationToken,
                    isSearchInvoked: false,
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

    render(): ReactNode {
        const { filter, showManageColumns, exportColumns, detailsList } = this.state;
        const customerId = contextService.getCurrentCustomerId();

        return (
            <div className="report item-record-report">
                <UserAccessibleItemsFilterBox customerId={customerId} site={filter.site} cabinetId={filter.cabinetId} itemIndex={filter.itemIndex}
                    accessGroupName={filter.accessGroupName} userId={filter.userId} lastUpdateduserId={filter.lastUpdatedUserId}
                    performSearch={this.performSearch} selectedColumns={exportColumns} callPath={callPath}
                />

                <div className="screen-change">
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
                            <UserAccessibleItemsReportGrid detailsList={detailsList} selectedColumns={exportColumns} onScrollEnd={this.onScrollEnd} />
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }

    NonSortableHeaderCell(headerText: string) {
        return (<span>{localise(headerText)}</span>);
    }
}


// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetItemReports/UserAccessibleItemsReport/UserAccessibleItemsReport.tsx