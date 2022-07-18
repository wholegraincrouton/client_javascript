import * as React from 'react';
import { SearchPage, SearchPageContainer } from 'src/modules/shared/components/SearchPage';
import { DataGrid, DateTimeFormatCell, LookupTextCell } from 'src/modules/shared/components/DataGrid';
import { NullableTextCell } from 'src/modules/shared/components/DataGrid/Cells/NullableTextCell';
import { GridColumn, GridCellProps } from '@progress/kendo-react-grid';
import { contextService, localise } from 'src/modules/shared/services';
import { SortDescriptor } from '@progress/kendo-data-query';
import { ColumnOption, CustomerDetailsFilter } from "../../../types/dto";
import { SearchPageProps } from 'src/modules/shared/components/SearchPage/SearchPage';
import { CustomerDetailFilterBox } from './CustomerDetailsFilterBox';
import { countryService } from 'src/modules/shared/services/country.service';
import * as apiConstants from "src/modules/shared/constants/api.constants";
import { Col, Row } from 'reactstrap';
import { CustomColumnMappingsDialog } from 'src/modules/shared/components/CustomColumnMappingsDialog/CustomColumnMappingsDialog';
import { columnConfigurationService } from 'src/modules/shared/services/column-configuration.service';
import { ColumnOptionsToggle } from 'src/modules/shared/components/CustomColumnMappingsDialog/ToggleColumnOptions';

const gridName = "CustomerDetailsReportGrid";
const apiController = "reports";
const actionMethod = "customer-details";
const reportName = "TEXT_CUSTOMER_DETAILS_REPORT";

interface State {
    showManageColumns: boolean;
    columnOptions: ColumnOption[];
    exportColumns: string[];
}

class CustomerDetailsReport extends SearchPage<CustomerDetailsFilter, State>{
    routePath: string = "/reports/overview/customer_details_report";
    defaultSort: SortDescriptor = { field: "createdOnUtc", dir: "desc" };

    columns: string[] = ["TEXT_CUSTOMER_NAME", "TEXT_SALESFORCE_ID", "TEXT_FIRST_NAME", "TEXT_LAST_NAME", "TEXT_MOBILE_NUMBER", "TEXT_EMAIL", "TEXT_COUNTRY",
        "TEXT_BILLING_CURRENCY", "TEXT_TOTAL_CABINETS", "TEXT_TOTAL_USERS", "TEXT_ACCOUNT_CREATION_DATE", "TEXT_ACCOUNT_CREATED_BY", "TEXT_LAST_UPDATED_DATE", "TEXT_LAST_UPDATED_BY",
        "TEXT_ANNIVERSARY_DATE", "TEXT_ACCOUNT_STATUS"];


    constructor(props: SearchPageProps<CustomerDetailsFilter>) {
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
        const dateFormat = contextService.getCurrentDateFormat();
        const { showManageColumns, exportColumns } = this.state;

        return (
            <div className="report user-access-report">
                <CustomerDetailFilterBox history={this.props.history} hideIncludeDeleteOption={true} selectedColumns={exportColumns}
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
                        {this.isColumnVisible("TEXT_FIRST_NAME") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_FIRST_NAME")} field="firstName" sortable={false} cell={NullableTextCell()} />}
                        {this.isColumnVisible("TEXT_LAST_NAME") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_LAST_NAME")} field="lastName" sortable={false} cell={NullableTextCell()} />}
                        {this.isColumnVisible("TEXT_MOBILE_NUMBER") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_MOBILE_NUMBER")} field="mobileNumber" sortable={false} cell={NullableTextCell()} />}
                        {this.isColumnVisible("TEXT_EMAIL") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_EMAIL")} field="email" sortable={false} cell={NullableTextCell()} />}
                        {this.isColumnVisible("TEXT_COUNTRY") && <GridColumn headerCell={() => <span>{localise("TEXT_COUNTRY")}/{localise("TEXT_STATE")}</span>} field="country" sortable={false}
                            cell={GetCustomerLocation(this.props)} />}
                        {this.isColumnVisible("TEXT_BILLING_CURRENCY") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_BILLING_CURRENCY")} field="billingCurrency" sortable={false} cell={LookupTextCell("LIST_CURRENCIES")} />}
                        {this.isColumnVisible("TEXT_TOTAL_CABINETS") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_TOTAL_CABINETS")} field="totalCabinets" sortable={false} />}
                        {this.isColumnVisible("TEXT_TOTAL_USERS") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_TOTAL_USERS")} field="totalUsers" sortable={false} />}
                        {this.isColumnVisible("TEXT_ACCOUNT_CREATION_DATE") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_ACCOUNT_CREATION_DATE")} field="accountCreationDate" sortable={false} cell={DateTimeFormatCell(dateFormat, true)} />}
                        {this.isColumnVisible("TEXT_ACCOUNT_CREATED_BY") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_ACCOUNT_CREATED_BY")} field="accountCreatedBy" sortable={false} cell={NullableTextCell()} />}
                        {this.isColumnVisible("TEXT_LAST_UPDATED_DATE") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_LAST_UPDATED_DATE")} field="lastUpdatedDate" sortable={false} cell={DateTimeFormatCell(dateFormat, true)} />}
                        {this.isColumnVisible("TEXT_LAST_UPDATED_BY") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_LAST_UPDATED_BY")} field="lastUpdatedBy" sortable={false} cell={NullableTextCell()} />}
                        {this.isColumnVisible("TEXT_ANNIVERSARY_DATE") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_ANNIVERSARY_DATE")} field="anniversaryDate" sortable={false} cell={NullableTextCell()} />}
                        {this.isColumnVisible("TEXT_ACCOUNT_STATUS") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_ACCOUNT_STATUS")} field="accountStatus" sortable={false} cell={LookupTextCell("LIST_ACCOUNT_STATUS")} />}
                    </DataGrid>
                </div>
            </div>
        )
    }
}

function GetCustomerLocation(props: any) {
    return class extends React.Component<GridCellProps> {
        render() {
            let country = this.props.dataItem["country"];
            let state = this.props.dataItem["state"];

            return (
                <td>
                    {country ? countryService.getCountryName(country) : localise("TEXT_NOT_APPLICABLE")} -  {state ? countryService.getStateName(country, state) : localise("TEXT_NOT_APPLICABLE")}
                </td>
            );
        }
    }
}

export default SearchPageContainer(CustomerDetailsReport, gridName, apiController, actionMethod, false, apiConstants.REPORTS);




// WEBPACK FOOTER //
// ./src/modules/reports/components/CustomerReports/CustomerDetailsReport/CustomerDetailsReport.tsx