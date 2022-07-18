import { SortDescriptor } from "@progress/kendo-data-query";
import { GridColumn } from "@progress/kendo-react-grid";
import React from "react";
import { ReactNode } from "react";
import { Col, Row } from "reactstrap";
import { ColumnOption, ItemRecordReportFilter } from "src/modules/reports/types/dto";
import { CustomColumnMappingsDialog } from "src/modules/shared/components/CustomColumnMappingsDialog/CustomColumnMappingsDialog";
import { ColumnOptionsToggle } from "src/modules/shared/components/CustomColumnMappingsDialog/ToggleColumnOptions";
import { DataGrid, DateTimeFormatCell } from "src/modules/shared/components/DataGrid";
import { NullableTextCell } from "src/modules/shared/components/DataGrid/Cells/NullableTextCell";
import { SearchPage, SearchPageContainer } from "src/modules/shared/components/SearchPage";
import { SearchPageProps } from "src/modules/shared/components/SearchPage/SearchPage";
import * as apiConstants from "src/modules/shared/constants/api.constants";
import { contextService, localise } from "src/modules/shared/services";
import { columnConfigurationService } from "src/modules/shared/services/column-configuration.service";
import { ItemRecordAuditFilterBox } from "./ItemRecordReportFilterBox";

const gridName = "ItemRecordReportGrid";
const apiController = "reports";
const actionMethod = "item-records";
const reportName = "TEXT_ITEM_RECORDS";

interface State {
    customerId: string;
    showManageColumns: boolean;
    columnOptions: ColumnOption[];
    exportColumns: string[];
}
class ItemRecordReport extends SearchPage<ItemRecordReportFilter, State>{
    routePath: string = "/reports/overview/item-record-report";
    defaultSort: SortDescriptor = { field: "createdOnUtc", dir: "desc" };
    columns: string[] = ["TEXT_ITEM", "TEXT_ITEM_NAME", "TEXT_OTHER_DETAILS", "TEXT_ACTION_BY", "TEXT_DATE_TIME", "TEXT_ROLES", "TEXT_SITE_NAME", "TEXT_CABINET_NAME"];

    constructor(props: SearchPageProps<ItemRecordReportFilter>) {
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
            customerId: '',
            showManageColumns: false,
            columnOptions: tempColumnData,
            exportColumns: this.columns
        }
        this.manageColumns = this.manageColumns.bind(this);
        this.onColumnChanges = this.onColumnChanges.bind(this);
        this.setColumnsByArray = this.setColumnsByArray.bind(this);
    }

    componentDidMount() {
        super.componentDidMount();
        columnConfigurationService.getColumnsByReportName(reportName)
            .then((result) => {
                if (result && result.length > 0)
                    this.setColumnsByArray(result);
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
        const dateTimeFormat = contextService.getCurrentDateTimeFormat();
        const { showManageColumns, exportColumns } = this.state;

        return (
            <div className="report item-record-report">
                <ItemRecordAuditFilterBox history={this.props.history} hideIncludeDeleteOption={true} selectedColumns={exportColumns}
                    recordsExist={this.props.recordsExist} searchPermission={"AUDIT_REPORTS_VIEW"} customerId={contextService.getCurrentCustomerId()} />

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

                    <DataGrid history={this.props.history} name={gridName} action={actionMethod} baseService={apiConstants.REPORTS} isAutoScrollEnabled={true}>
                        {this.isColumnVisible("TEXT_ITEM") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_ITEM")} field="itemNo" sortable={true} cell={NullableTextCell()} />}
                        {this.isColumnVisible("TEXT_ITEM_NAME") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_ITEM_NAME")} field="itemName" sortable={false} cell={NullableTextCell()} />}
                        {this.isColumnVisible("TEXT_OTHER_DETAILS") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_OTHER_DETAILS")} field="otherDetails" sortable={false} cell={NullableTextCell()} />}
                        {this.isColumnVisible("TEXT_ACTION_BY") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_ACTION_BY")} field="actionByUserName" sortable={false} cell={NullableTextCell()} />}
                        {this.isColumnVisible("TEXT_DATE_TIME") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_DATE_TIME")} field="actionTime" sortable={false} cell={DateTimeFormatCell(dateTimeFormat, true)} />}
                        {this.isColumnVisible("TEXT_ROLES") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_ROLES")} field="role" sortable={false} cell={NullableTextCell()} />}
                        {this.isColumnVisible("TEXT_SITE_NAME") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_SITE_NAME")} field="siteName" sortable={false} cell={NullableTextCell()} />}
                        {this.isColumnVisible("TEXT_CABINET_NAME") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_CABINET_NAME")} field="cabinetName" sortable={false} cell={NullableTextCell()} />}
                    </DataGrid>
                </div>
            </div>
        )
    }

    NonSortableHeaderCell(headerText: string) {
        return (<span>{localise(headerText)}</span>);
    }
}

export default SearchPageContainer(ItemRecordReport, gridName, apiController, actionMethod, false, apiConstants.REPORTS);


// WEBPACK FOOTER //
// ./src/modules/reports/components/AuditReports/ItemRecordReport/ItemRecordReport.tsx