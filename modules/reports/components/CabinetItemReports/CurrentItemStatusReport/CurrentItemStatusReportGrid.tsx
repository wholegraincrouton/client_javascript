import * as React from "react";
import { GridColumn as Column, Grid, GridCellProps, GridEvent } from "@progress/kendo-react-grid";
import { localise } from "src/modules/shared/services";
import { CurrentItemStatus } from "../../../../reports/types/dto";
import { DateTimeFormatCell } from "src/modules/shared/components/DataGrid";
import { ItemStatus } from "src/modules/cabinet/types/dto";
import { GetCabinetAddress } from "src/modules/reports/components/shared/GridCells/GetCabinetAddress";
import { GetJobTitle } from "src/modules/reports/components/shared/GridCells/JobTitleCell";
import { GetUserName } from "src/modules/reports/components/shared/GridCells/GetUserName";
import { MultiCustodyCell } from "src/modules/shared/components/DataGrid/Cells/MultiCustodyCell";

interface Props {
    currentItemStatusList?: CurrentItemStatus[];
    onScrollEnd(): void;
    selectedColumns: string[];
}

export class CurrentItemStatusReportGrid extends React.Component<Props> {
    onRowRender(tr: any) {
        var component = tr;
        component = React.cloneElement(tr, { ...tr.props, className: tr.props.className + ' non-selectable-row' }, tr.props.children);
        return component;
    }

    scrollHandler = (event: GridEvent) => {
        const e = event.nativeEvent;
        if (e.target.scrollTop + 10 >= e.target.scrollHeight - e.target.clientHeight) {
            this.props.onScrollEnd();
        }
    };

    isColumnVisible(columnName: string){
        const { selectedColumns } = this.props;
        return selectedColumns.some(s => s == columnName);
    }

    render() {
        const { currentItemStatusList } = this.props

        return (
            <Grid resizable className="item-status-grid" rowRender={this.onRowRender} data={currentItemStatusList}
                onScroll={this.scrollHandler}>
                {this.isColumnVisible("TEXT_ITEM_NO") && <Column field="itemNumber" title={localise("TEXT_ITEM_NO")} />}
                {this.isColumnVisible("TEXT_ITEM_NAME") && <Column field="itemName" title={localise("TEXT_ITEM_NAME")} />}
                {this.isColumnVisible("TEXT_STATUS") && <Column field="itemStatus" title={localise("TEXT_STATUS")} cell={this.getItemStatusCell()} />}
                {this.isColumnVisible("TEXT_LAST_ACTIVITY") && <Column field="lastActivity" title={localise("TEXT_LAST_ACTIVITY")} cell={DateTimeFormatCell(undefined, true)} />}
                {this.isColumnVisible("TEXT_MULTICUSTODY") && <Column field="multiCustody" title={localise("TEXT_MULTICUSTODY")} cell={MultiCustodyCell()} />}
                {this.isColumnVisible("TEXT_SITE_NAME") && <Column field="siteName" title={localise("TEXT_SITE_NAME")} />}
                {this.isColumnVisible("TEXT_CABINET_NAME") && <Column field="cabinetName" title={localise("TEXT_CABINET_NAME")} />}
                {this.isColumnVisible("TEXT_CABINET_ADDRESS") && <Column field="cabinetAddress" title={localise("TEXT_CABINET_ADDRESS")} cell={GetCabinetAddress()} />}
                {this.isColumnVisible("TEXT_USER_NAME") && <Column field="userName" title={localise("TEXT_USER_NAME")} cell={GetUserName()} />}
                {this.isColumnVisible("TEXT_JOB_TITLE") && <Column field="jobTitle" title={localise("TEXT_JOB_TITLE")} cell={GetJobTitle('userName')} />}
                {this.isColumnVisible("TEXT_RETRIEVAL_TIME") && <Column field="retrievalTime" title={localise("TEXT_RETRIEVAL_TIME")} cell={DateTimeFormatCell(undefined, true)} />}
                {this.isColumnVisible("TEXT_OVERDUE_ELAPSED_TIME") && <Column field="overdueElapseTime" title={localise("TEXT_OVERDUE_ELAPSED_TIME")} cell={this.getElapsedTime()} />}
            </Grid>
        );
    }

    getItemStatusCell() {
        return class extends React.Component<GridCellProps> {
            constructor(props: GridCellProps) {
                super(props);
            }

            getStatus() {
                switch (this.props.dataItem["itemStatus"]) {
                    case ItemStatus.InCabinet:
                        return <div title={localise("TEXT_IN_CABINET_CAPTION")}><span><i className="fas fa-square-full fa-lg color-green"></i></span></div>
                    case ItemStatus.OutOfCabinetScheduled:
                        return <div title={localise("TEXT_OUT_OF_CABINET_SCHEDULED_CAPTION")}><span><i className="fas fa-square-full fa-lg color-grey"></i></span></div>
                    case ItemStatus.OutOfCabinetOverdue:
                        return <div title={localise("TEXT_OUT_OF_CABINET_OVERDUE_CAPTION")}><span><i className="fas fa-square-full fa-lg color-red"></i></span></div>
                    default:
                        return <div> </div>
                }
            }

            render() {
                return (<td>
                    {this.getStatus()}
                </td>
                );
            }
        }
    }

    getElapsedTime() {
        return class extends React.Component<GridCellProps> {
            constructor(props: GridCellProps) {
                super(props);
            }

            format() {
                let itemStatus = this.props.dataItem["itemStatus"]
                let value = this.props.dataItem["overdueElapseTime"]
                switch (itemStatus) {
                    case ItemStatus.OutOfCabinetOverdue:
                        return <div>{value}</div>
                    default:
                        return <div>{localise("TEXT_NA")}</div>
                }
            }

            render() {
                return (<td>
                    {this.format()}
                </td>
                );
            }
        }
    }
}



// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetItemReports/CurrentItemStatusReport/CurrentItemStatusReportGrid.tsx