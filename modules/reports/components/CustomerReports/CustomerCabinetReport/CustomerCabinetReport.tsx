import * as React from 'react';
import { SearchPage, SearchPageContainer } from 'src/modules/shared/components/SearchPage';
import { DataGrid, DateTimeFormatCell, LookupTextCell } from 'src/modules/shared/components/DataGrid';
import { NullableTextCell } from 'src/modules/shared/components/DataGrid/Cells/NullableTextCell';
import { GridColumn, GridCellProps } from '@progress/kendo-react-grid';
import { localise, contextService } from 'src/modules/shared/services';
import { SortDescriptor } from '@progress/kendo-data-query';
import { ColumnOption, CustomerCabinetFilter } from "../../../types/dto";
import { SearchPageProps } from 'src/modules/shared/components/SearchPage/SearchPage';
import { CustomerCabinetFilterBox } from './CustomerCabinetFilterBox';
import { CabinetProvisioningStatus } from 'src/modules/cabinet/types/dto';
import * as apiConstants from "src/modules/shared/constants/api.constants";
import { Col, Row } from 'reactstrap';
import { CustomColumnMappingsDialog } from 'src/modules/shared/components/CustomColumnMappingsDialog/CustomColumnMappingsDialog';
import { columnConfigurationService } from 'src/modules/shared/services/column-configuration.service';
import { ColumnOptionsToggle } from 'src/modules/shared/components/CustomColumnMappingsDialog/ToggleColumnOptions';

const gridName = "CustomerCabinetReportGrid";
const apiController = "reports";
const actionMethod = "customer-cabinets";
const reportName = "TEXT_CUSTOMER_CABINET_REPORT";

interface State {
    showManageColumns: boolean;
    columnOptions: ColumnOption[];
    exportColumns: string[];
}

class CustomerCabinetReport extends SearchPage<CustomerCabinetFilter, State>{
    routePath: string = "/reports/overview/customer_cabinet_report";
    defaultSort: SortDescriptor = { field: "createdOnUtc", dir: "desc" };

    columns: string[] = ["TEXT_CUSTOMER_NAME", "TEXT_SALESFORCE_ID", "TEXT_CABINET_NAME", "TEXT_SERIAL_NUMBER", "TEXT_PROVISIONING_KEY", "TEXT_CABINET_SIZE", "TEXT_CABINET_MAC_ADDRESS",
        "TEXT_CABINET_CREATION_DATE", "TEXT_CABINET_CREATED_BY", "TEXT_PROVISIONING_KEY_ACTIVATION_DATE", "TEXT_SITE", "TEXT_ADDRESS", "TEXT_TIMEZONE", "TEXT_PROVISIONING_STATUS", "TEXT_FIRMWARE"];

    constructor(props: SearchPageProps<CustomerCabinetFilter>) {
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
                <CustomerCabinetFilterBox history={this.props.history} hideIncludeDeleteOption={true} selectedColumns={exportColumns}
                    recordsExist={this.props.recordsExist} searchPermission={"CUSTOMER_REPORTS_VIEW"} customerId={contextService.getCurrentCustomerId()} />
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
                        {this.isColumnVisible("TEXT_CABINET_NAME") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_CABINET_NAME")} field="cabinetName" sortable={false} cell={NullableTextCell()} />}
                        {this.isColumnVisible("TEXT_SERIAL_NUMBER") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_SERIAL_NUMBER")} field="cabinetSerialNo" sortable={false} cell={NullableTextCell()} />}
                        {this.isColumnVisible("TEXT_PROVISIONING_KEY") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_PROVISIONING_KEY")} field="provisioningKey" sortable={false} cell={NullableTextCell()} />}
                        {this.isColumnVisible("TEXT_CABINET_SIZE") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_CABINET_SIZE")} field="cabinetSize" sortable={false} cell={NullableTextCell()} />}
                        {this.isColumnVisible("TEXT_CABINET_MAC_ADDRESS") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_CABINET_MAC_ADDRESS")} field="cabinetMACAddress" sortable={false} cell={NullableTextCell()} />}
                        {this.isColumnVisible("TEXT_CABINET_CREATION_DATE") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_CABINET_CREATION_DATE")} field="cabinetCreationDate" sortable={false} cell={DateTimeFormatCell(dateFormat, true)} />}
                        {this.isColumnVisible("TEXT_CABINET_CREATED_BY") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_CABINET_CREATED_BY")} field="cabinetCreatedBy" sortable={false} cell={NullableTextCell()} />}
                        {this.isColumnVisible("TEXT_PROVISIONING_KEY_ACTIVATION_DATE") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_PROVISIONING_KEY_ACTIVATION_DATE")}
                            field="provisioningKeyActivationDate" sortable={false} cell={DateTimeFormatCell(dateFormat, true)} />}
                        {this.isColumnVisible("TEXT_SITE") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_SITE")} field="siteName" sortable={false} cell={NullableTextCell()} />}
                        {this.isColumnVisible("TEXT_ADDRESS") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_ADDRESS")} field="address" sortable={false} cell={NullableTextCell()} />}
                        {this.isColumnVisible("TEXT_TIMEZONE") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_TIMEZONE")} field="timeZone" sortable={false} cell={LookupTextCell("LIST_TIMEZONE")} />}
                        {this.isColumnVisible("TEXT_PROVISIONING_STATUS") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_PROVISIONING_STATUS")} field="provisioningStatus" sortable={false} cell={GetProvisioningStatus(this.props)} />}
                        {this.isColumnVisible("TEXT_FIRMWARE") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_FIRMWARE")} field="firmwareVersion" sortable={false} cell={NullableTextCell()} />}
                    </DataGrid>
                </div>
            </div>
        )
    }
}

function GetProvisioningStatus(props: any) {
    return class extends React.Component<GridCellProps> {
        render() {
            let provisioningStatus = this.props.dataItem["provisioningStatus"];
            console.log(provisioningStatus);
            return (
                <td>
                    {(provisioningStatus && provisioningStatus == CabinetProvisioningStatus.Provisioned) ? localise("TEXT_PROVISIONED") : localise("TEXT_NOT_PROVISIONED")}
                </td>
            );
        }
    }
}

export default SearchPageContainer(CustomerCabinetReport, gridName, apiController, actionMethod, false, apiConstants.REPORTS);


// WEBPACK FOOTER //
// ./src/modules/reports/components/CustomerReports/CustomerCabinetReport/CustomerCabinetReport.tsx