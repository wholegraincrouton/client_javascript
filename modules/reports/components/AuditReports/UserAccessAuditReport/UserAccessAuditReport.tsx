import * as React from 'react';
import * as qs from "query-string";
import { SearchPage, SearchPageContainer } from 'src/modules/shared/components/SearchPage';
import { DataGrid, DateTimeFormatCell } from 'src/modules/shared/components/DataGrid';
import { GridColumn, GridCellProps } from '@progress/kendo-react-grid';
import { contextService, localise, lookupService } from 'src/modules/shared/services';
import { SortDescriptor } from '@progress/kendo-data-query';
import { UserAccessAuditFilterBox } from './UserAccessAuditFilterBox';
import { ColumnOption, UserAccessAuditFilter } from "../../../types/dto";
import * as apiConstants from "src/modules/shared/constants/api.constants";
import { userGroupService } from 'src/modules/userGroups/services/userGroup.service';
import { UserGroup } from 'src/modules/userGroups/types/dto';
import { SearchPageProps } from 'src/modules/shared/components/SearchPage/SearchPage';
import { Col, Row } from 'reactstrap';
import { CustomColumnMappingsDialog } from 'src/modules/shared/components/CustomColumnMappingsDialog/CustomColumnMappingsDialog';
import { columnConfigurationService } from 'src/modules/shared/services/column-configuration.service';
import { ColumnOptionsToggle } from 'src/modules/shared/components/CustomColumnMappingsDialog/ToggleColumnOptions';

const gridName = "UserCabinetAccessAuditReportGrid";
const apiController = "reports";
const actionMethod = "user-access-audits";
const reportName = "TEXT_USER_ACCESS_REPORT";

interface State {
    customerId: string;
    userGroups: UserGroup[];
    showManageColumns: boolean;
    columnOptions: ColumnOption[];
    exportColumns: string[];
}

class UserAccessAuditReport extends SearchPage<UserAccessAuditFilter, State>{
    routePath: string = "/reports/overview/user_access_report";
    defaultSort: SortDescriptor = { field: "createdOnUtc", dir: "desc" };

    columns: string[] = ["TEXT_USER_NAME", "TEXT_ACCESSGROUP_NAME", "TEXT_ACCESS_BASIS", "TEXT_CABINET_NAME", "TEXT_ACCESSIBLE_ITEMS", "TEXT_GRANTED_ITEMS", "TEXT_REMOVED_ITEMS",
        "TEXT_SCHEDUE_EDIT", "TEXT_ACCESS_START", "TEXT_ACCESS_END", "TEXT_SCHEDULE", "TEXT_SCHEDULE_FROM_TO", "TEXT_ACTION_TIME", "TEXT_ACTION_BY"];

    constructor(props: SearchPageProps<UserAccessAuditFilter>) {
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
            userGroups: [],
            showManageColumns: false,
            columnOptions: tempColumnData,
            exportColumns: this.columns
        }

        this.manageColumns = this.manageColumns.bind(this);
        this.onColumnChanges = this.onColumnChanges.bind(this);
        this.setColumnsByArray = this.setColumnsByArray.bind(this);
    }

    componentDidUpdate() {
        const { customerId } = this.state;
        const contextCustomerId = contextService.getCurrentCustomerId();

        if (customerId != contextCustomerId) {
            userGroupService.getUserGroups(contextCustomerId).then(userGroups => {
                this.setState({
                    ...this.state,
                    customerId: contextCustomerId,
                    userGroups: userGroups
                });
            });
        }
    }

    componentDidMount() {
        super.componentDidMount();
        columnConfigurationService.getColumnsByReportName(reportName)
            .then((result) => {
                if (result && result.length > 0)
                    this.setColumnsByArray(result);

            });
    }

    NonSortableHeaderCell(headerText: string) {
        return (<span>{localise(headerText)}</span>);
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
        const { userGroups, showManageColumns, exportColumns } = this.state;

        return (
            <div className="report user-access-report">
                <UserAccessAuditFilterBox history={this.props.history} hideIncludeDeleteOption={true} selectedColumns={exportColumns}
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
                    <DataGrid history={this.props.history} name={gridName} action={actionMethod} baseService={apiConstants.REPORTS} isAutoScrollEnabled={true}>
                        {this.isColumnVisible("TEXT_USER_NAME") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_USER_NAME")} field="userDisplayName" sortable={false} />}
                        {this.isColumnVisible("TEXT_ACCESSGROUP_NAME") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_ACCESSGROUP_NAME")} field="accessGroup" sortable={false} />}
                        {this.isColumnVisible("TEXT_ACCESS_BASIS") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_ACCESS_BASIS")} field="accessBasis" sortable={false} cell={AccessBasisComponent(this.props, userGroups)} />}
                        {this.isColumnVisible("TEXT_CABINET_NAME") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_CABINET_NAME")} field="cabinetName" sortable={false} />}
                        {this.isColumnVisible("TEXT_ACCESSIBLE_ITEMS") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_ACCESSIBLE_ITEMS")} field="accessibleItems" sortable={false} cell={BuildItemNumberTextComponent(this.props)} />}
                        {this.isColumnVisible("TEXT_GRANTED_ITEMS") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_GRANTED_ITEMS")} field="grantedItems" sortable={false} cell={BuildItemNumberTextComponent(this.props)} />}
                        {this.isColumnVisible("TEXT_REMOVED_ITEMS") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_REMOVED_ITEMS")} field="removedItems" sortable={false} cell={BuildItemNumberTextComponent(this.props)} />}
                        {this.isColumnVisible("TEXT_SCHEDUE_EDIT") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_SCHEDUE_EDIT")} field="scheduleEdit" sortable={false} cell={ScheduleEditComponent(this.props)} />}
                        {this.isColumnVisible("TEXT_ACCESS_START") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_ACCESS_START")} field="accessValidFrom" sortable={false} />}
                        {this.isColumnVisible("TEXT_ACCESS_END") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_ACCESS_END")} field="accessValidTo" sortable={false} />}
                        {this.isColumnVisible("TEXT_SCHEDULE") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_SCHEDULE")} field="scheduleList" sortable={false} cell={ScheduleListComponent(this.props)} />}
                        {this.isColumnVisible("TEXT_SCHEDULE_FROM_TO") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_SCHEDULE_FROM_TO")} field="timeSchedule" sortable={false} />}
                        {this.isColumnVisible("TEXT_ACTION_TIME") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_ACTION_TIME")} field="actionTime" sortable={false} cell={DateTimeFormatCell()} />}
                        {this.isColumnVisible("TEXT_ACTION_BY") && <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_ACTION_BY")} field="actionByUserName" sortable={false} />}
                    </DataGrid>
                </div>
            </div>
        )
    }
}

function ScheduleListComponent(props: any) {
    return class extends React.Component<GridCellProps> {
        render() {
            let scheduleList = this.props.dataItem["scheduleList"];
            let scheduleArray = scheduleList && scheduleList.map((schedule: string) => {
                return lookupService.getText('LIST_WEEKDAYS', schedule);
            });

            return (
                <td>
                    {scheduleArray && scheduleArray.join()}
                </td>
            );
        }
    }
}

function BuildItemNumberTextComponent(props: any) {
    return class extends React.Component<GridCellProps> {
        render() {

            const hashParts = window.location.hash.split("?");
            const params = qs.parse(hashParts && hashParts[1]);
            let itemNo = params.itemNo as string || -1;
            let itemNos = this.props.dataItem[this.props.field || ''];
            let itemNosLit = itemNos && itemNos.map((currentItemNo: string) => {
                if (currentItemNo == itemNo)
                    return '<mark>' + currentItemNo + '</mark>';
                else
                    return currentItemNo
            });
            let formattedItemNumberLit = itemNosLit && itemNosLit.join()
            return (
                <td>
                    <div
                        dangerouslySetInnerHTML={{ __html: formattedItemNumberLit }}></div></td>
            );
        }
    }
}

function ScheduleEditComponent(props: any) {
    return class extends React.Component<GridCellProps> {
        render() {
            let scheduleEdit = this.props.dataItem["scheduleEdit"];
            return (
                <td>
                    {scheduleEdit ? localise('TEXT_YES') : localise('TEXT_NO')}
                </td>
            );
        }
    }
}

function AccessBasisComponent(props: any, userGroups: UserGroup[]) {
    return class extends React.Component<GridCellProps> {
        render() {
            let userGroupId = this.props.dataItem["accessBasis"];
            let userGroupName = '';

            if (userGroupId) {
                let userGroup = userGroups.find(ug => ug.id == userGroupId);

                if (userGroup) {
                    userGroupName = userGroup.name;
                }
            }

            return (
                <td>
                    {
                        userGroupId == null ?
                            lookupService.getText('LIST_ACCESS_BASIS', 'IND') :
                            `${lookupService.getText('LIST_ACCESS_BASIS', 'USERGROUP')} (${userGroupName})`
                    }
                </td>
            );
        }
    }
}

export default SearchPageContainer(UserAccessAuditReport, gridName, apiController, actionMethod, false, apiConstants.REPORTS);


// WEBPACK FOOTER //
// ./src/modules/reports/components/AuditReports/UserAccessAuditReport/UserAccessAuditReport.tsx