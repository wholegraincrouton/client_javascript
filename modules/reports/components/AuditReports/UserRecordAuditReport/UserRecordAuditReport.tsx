import * as React from 'react';
import { GridColumn, GridCellProps } from '@progress/kendo-react-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { localise } from 'src/modules/shared/services';
import { SearchPage, SearchPageContainer } from 'src/modules/shared/components/SearchPage';
import { DataGrid, DateTimeFormatCell, LookupTextCell } from 'src/modules/shared/components/DataGrid';
import { NullableTextCell } from 'src/modules/shared/components/DataGrid/Cells/NullableTextCell';
import { UserCustomerRolesCell } from 'src/modules/users/components/UserManagement/UserCustomerRolesCell';
import { ColumnOption, UserAuditFilter } from '../../../types/dto';
import { UserRecordAuditFilterBox } from './UserRecordAuditFilterBox';
import * as apiConstants from "src/modules/shared/constants/api.constants";
import { SearchPageProps } from 'src/modules/shared/components/SearchPage/SearchPage';
import { Col, Row } from 'reactstrap';
import { CustomColumnMappingsDialog } from 'src/modules/shared/components/CustomColumnMappingsDialog/CustomColumnMappingsDialog';
import { columnConfigurationService } from 'src/modules/shared/services/column-configuration.service';
import { ColumnOptionsToggle } from 'src/modules/shared/components/CustomColumnMappingsDialog/ToggleColumnOptions';

const gridName = "UserAuditReportGrid";
const reportName = "TEXT_USER_RECORD_REPORT";

interface State {
    customerId: string;
    showManageColumns: boolean;
    columnOptions: ColumnOption[];
    exportColumns: string[];
}

class UserRecordAuditReport extends SearchPage<UserAuditFilter, State>{
    routePath: string = "/reports/overview/user_audit_report";
    defaultSort: SortDescriptor = { field: "actionTime", dir: "desc" };

    columns: string[] = ["TEXT_ACTION", "TEXT_FIRST_NAME", "TEXT_LAST_NAME", "TEXT_MOBILE_NUMBER", "TEXT_OTP", "TEXT_EMAIL", "TEXT_USERID", "TEXT_PIN", "TEXT_TIMEZONE",
        "TEXT_ACCESS_EXPIRY", "TEXT_CUSTOMER_ROLES", "TEXT_ACTION_TIME", "TEXT_ACTION_BY"];

    constructor(props: SearchPageProps<UserAuditFilter>) {
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

    render() {
        const { showManageColumns, exportColumns } = this.state;

        return (
            <div className="report user-record-report">
                <UserRecordAuditFilterBox history={this.props.history} hideIncludeDeleteOption={true} selectedColumns={exportColumns}
                    recordsExist={this.props.recordsExist} searchPermission={"AUDIT_REPORTS_VIEW"} />
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

                    <DataGrid history={this.props.history} name={gridName} baseService={apiConstants.REPORTS} isAutoScrollEnabled={true}>
                        {this.isColumnVisible("TEXT_ACTION") && <GridColumn field="actionType" title={localise("TEXT_ACTION")} sortable={false}
                            cell={LookupTextCell("LIST_AUDIT_DISPLAY_ACTIONS")} />}
                        {this.isColumnVisible("TEXT_FIRST_NAME") && <GridColumn field="firstName" title={localise("TEXT_FIRST_NAME")} sortable={false}
                            cell={NullableTextCell("hasFirstNameChanged")} />}
                        {this.isColumnVisible("TEXT_LAST_NAME") && <GridColumn field="lastName" title={localise("TEXT_LAST_NAME")} sortable={false}
                            cell={NullableTextCell("hasLastNameChanged")} />}
                        {this.isColumnVisible("TEXT_MOBILE_NUMBER") && <GridColumn field="mobileNumber" title={localise("TEXT_MOBILE_NUMBER")} sortable={false}
                            cell={NullableTextCell("hasMobileNumberChanged")} />}
                        {this.isColumnVisible("TEXT_OTP") && <GridColumn field="otpCheck" title={localise("TEXT_OTP")} cell={this.getOTPCell()} sortable={false} />}
                        {this.isColumnVisible("TEXT_EMAIL") && <GridColumn field="email" title={localise("TEXT_EMAIL")} sortable={false}
                            cell={NullableTextCell("hasEmailChanged")} />}
                        {this.isColumnVisible("TEXT_USERID") && <GridColumn field="alternateId" title={localise("TEXT_USERID")} sortable={false}
                            cell={NullableTextCell("hasAlternateIdChanged")} />}
                        {this.isColumnVisible("TEXT_PIN") && <GridColumn field="hasPIN" title={localise("TEXT_PIN")} cell={this.getPINCell()} sortable={false} />}
                        {this.isColumnVisible("TEXT_TIMEZONE") && <GridColumn field="timeZone" title={localise("TEXT_TIMEZONE")} sortable={false}
                            cell={NullableTextCell("hasTimeZoneChanged")} />}
                        {this.isColumnVisible("TEXT_ACCESS_EXPIRY") && <GridColumn field="accessExpiry" title={localise("TEXT_ACCESS_EXPIRY")} sortable={false}
                            cell={DateTimeFormatCell(undefined, true, undefined, "hasAccessExpiryChanged")} />}
                        {this.isColumnVisible("TEXT_CUSTOMER_ROLES") && <GridColumn field="customerRoles" cell={UserCustomerRolesCell("hasCustomerRolesChanged")}
                            title={localise("TEXT_CUSTOMER_ROLES")} sortable={false} />}
                        {this.isColumnVisible("TEXT_ACTION_TIME") && <GridColumn field="actionTime" title={localise("TEXT_ACTION_TIME")}
                            cell={DateTimeFormatCell()} sortable={false} />}
                        {this.isColumnVisible("TEXT_ACTION_BY") && <GridColumn field="actionByUserName" title={localise("TEXT_ACTION_BY")} sortable={false} />}
                    </DataGrid>
                </div>
            </div>
        )
    }

    getOTPCell() {
        return class extends React.Component<GridCellProps> {
            render() {
                return (
                    <td className={this.props.dataItem["hasOTPCheckChanged"] ? "highlight-cell" : ""}>
                        {this.props.dataItem[this.props.field || ''] ? localise("TEXT_CHECKED") : localise("TEXT_UNCHECKED")}
                    </td>
                );
            }
        }
    }

    getPINCell() {
        return class extends React.Component<GridCellProps> {
            render() {
                const { dataItem, field } = this.props;
                const actionType = dataItem["actionType"];
                const pinChanged = dataItem["hasPINChanged"];
                const pin = dataItem[field || ''];

                return (
                    <td className={pinChanged ? "highlight-cell" : ""}>
                        {pinChanged && actionType == "EDIT_AFTER" ? localise("TEXT_CHANGED") :
                            pin ? "XXXX" : localise("TEXT_NOT_APPLICABLE")}
                    </td>
                );
            }
        }
    }
}

export default SearchPageContainer(UserRecordAuditReport, gridName, "reports", "user-audits", true, apiConstants.REPORTS);



// WEBPACK FOOTER //
// ./src/modules/reports/components/AuditReports/UserRecordAuditReport/UserRecordAuditReport.tsx