import * as React from 'react';
import { SearchPage, SearchPageContainer } from 'src/modules/shared/components/SearchPage';
import { DataGrid } from 'src/modules/shared/components/DataGrid';
import { NullableTextCell } from 'src/modules/shared/components/DataGrid/Cells/NullableTextCell';
import { GridColumn } from '@progress/kendo-react-grid';
import { localise } from 'src/modules/shared/services';
import { SortDescriptor } from '@progress/kendo-data-query';
import { ColumnOption, CustomerResourceFilter } from "../../../types/dto";
import { SearchPageProps } from 'src/modules/shared/components/SearchPage/SearchPage';
import { CustomerResourceFilterBox } from './CustomerResourceFilterBox';
import * as apiConstants from "src/modules/shared/constants/api.constants";
import { Col, Row } from 'reactstrap';
import { CustomColumnMappingsDialog } from 'src/modules/shared/components/CustomColumnMappingsDialog/CustomColumnMappingsDialog';
import { columnConfigurationService } from 'src/modules/shared/services/column-configuration.service';
import { ColumnOptionsToggle } from 'src/modules/shared/components/CustomColumnMappingsDialog/ToggleColumnOptions';


const gridName = "CustomerDetailsReportGrid";
const apiController = "reports";
const actionMethod = "customer-resources";
const reportName = "TEXT_CUSTOMER_RESOURCE_REPORT";

interface State {
    showManageColumns: boolean;
    columnOptions: ColumnOption[];
    exportColumns: string[];
}

class CustomerResourceReport extends SearchPage<CustomerResourceFilter, State>{
    routePath: string = "/reports/overview/customer_resource_report";
    defaultSort: SortDescriptor = { field: "period", dir: "desc" };

    columns: string[] = ["TEXT_CUSTOMER_NAME", "TEXT_SALESFORCE_ID", "TEXT_YEAR", "TEXT_MONTH", "TEXT_CABINET_COUNT", "TEXT_INTEGRATION_COUNT", "TEXT_SMS_COUNT",
        "TEXT_EMAIL_COUNT"];


    constructor(props: SearchPageProps<CustomerResourceFilter>) {
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
            showManageColumns: false,
            columnOptions: tempColumnData,
            exportColumns: this.columns
        }
        this.manageColumns = this.manageColumns.bind(this);
        this.onColumnChanges = this.onColumnChanges.bind(this);
        this.setColumnsByArray = this.setColumnsByArray.bind(this);
    }

    NonSortableHeaderCell(headerText: string) {
        return (<span>{localise(headerText)}</span>);
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

    render() {
        const { showManageColumns, exportColumns } = this.state;

        return (
            <div className="report customer-resource-report">
                <CustomerResourceFilterBox history={this.props.history} hideIncludeDeleteOption={true} selectedColumns={exportColumns}
                    recordsExist={this.props.recordsExist} searchPermission={"CUSTOMER_REPORTS_VIEW"} />
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
                        {this.isColumnVisible("TEXT_CUSTOMER_NAME") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_CUSTOMER_NAME")} field="customerName" sortable={false} cell={NullableTextCell()} />}
                        {this.isColumnVisible("TEXT_SALESFORCE_ID") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_SALESFORCE_ID")} field="salesForceCustomerId" sortable={false} cell={NullableTextCell()} />}
                        {this.isColumnVisible("TEXT_YEAR") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_YEAR")} field="year" sortable={false} cell={NullableTextCell()} />}
                        {this.isColumnVisible("TEXT_MONTH") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_MONTH")} field="month" sortable={false} cell={NullableTextCell()} />}
                        {this.isColumnVisible("TEXT_CABINET_COUNT") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_CABINET_COUNT")} field="cabinetCount" sortable={false} />}
                        {this.isColumnVisible("TEXT_INTEGRATION_COUNT") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_INTEGRATION_COUNT")} field="integrationCount" sortable={false} />}
                        {this.isColumnVisible("TEXT_SMS_COUNT") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_SMS_COUNT")} field="smsCount" sortable={false} />}
                        {this.isColumnVisible("TEXT_EMAIL_COUNT") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_EMAIL_COUNT")} field="emailCount" sortable={false} />}
                    </DataGrid>
                </div>
            </div>
        )
    }
}

export default SearchPageContainer(CustomerResourceReport, gridName, apiController, actionMethod, false, apiConstants.REPORTS);



// WEBPACK FOOTER //
// ./src/modules/reports/components/CustomerReports/CustomerResourceReport/CustomerResourceReport.tsx