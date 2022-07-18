import { orderBy, SortDescriptor } from "@progress/kendo-data-query";
import { GridColumn as Column, Grid, GridEvent, GridCellProps, GridSortChangeEvent } from "@progress/kendo-react-grid";
import React from "react";
import { UserWiseTransactionDetail } from "src/modules/reports/types/dto";
import { localise, lookupService } from "src/modules/shared/services";

interface Props {
    transactionList?: UserWiseTransactionDetail[];
    selectedColumns: string[];
    onScrollEnd(): void;
}

interface State {
    sort?: SortDescriptor[];
}

export class UserWiseTransactionReportGrid extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.onSortChange = this.onSortChange.bind(this);

        this.state = {
            sort: [{ field: 'totalTransactionCount', dir: 'desc' }]
        }
    }

    onRowRender(tr: any) {
        var component = tr;
        component = React.cloneElement(tr, { ...tr.props, className: tr.props.className + ' non-selectable-row' }, tr.props.children);
        return component;
    }

    onSortChange(event: GridSortChangeEvent) {
        this.setState({ ...this.state, sort: event.sort });
    }

    isColumnVisible(columnName: string) {
        const { selectedColumns } = this.props;
        return selectedColumns.some(s => s == columnName);
    }

    scrollHandler = (event: GridEvent) => {
        const e = event.nativeEvent;
        if (e.target.scrollTop + 10 >= e.target.scrollHeight - e.target.clientHeight) {
            this.props.onScrollEnd();
        }
    }

    userRolesCell() {
        return class extends React.Component<GridCellProps> {
            render() {
                let roles = this.props.dataItem["roles"];
                return <td>{roles ? roles.map((r: any) => lookupService.getText("LIST_ROLES", r)).join('\n') : ''}</td>;
            }
        }
    }

    averageTimeCell() {
        return class extends React.Component<GridCellProps> {
            render() {
                const average = this.props.dataItem[this.props.field || ''];
                let seconds = average % 60;
                let minutes = Math.trunc(average / 60);
                let hours = Math.trunc(minutes / 60);
                minutes = minutes % 60;

                return <td>{(`${hours > 0 ? `${hours}h` : ''} ${minutes > 0 || hours > 0 ? `${minutes}m` : ''} ${seconds}s`).trim()}</td>;
            }
        }
    }

    render() {
        const { transactionList } = this.props
        const { sort } = this.state;

        return (
            <Grid resizable className="user-transactions-grid" rowRender={this.onRowRender}
                data={orderBy(transactionList || [], sort || [])} onScroll={this.scrollHandler}
                sort={sort} onSortChange={this.onSortChange} sortable={{ allowUnsort: false, mode: 'single' }}>
                {this.isColumnVisible("TEXT_USER_NAME") && <Column field="userName" title={localise("TEXT_USER_NAME")} />}
                {this.isColumnVisible("TEXT_DESIGNATION") && <Column field="jobTitle" title={localise("TEXT_DESIGNATION")} />}
                {this.isColumnVisible("TEXT_ROLE") && <Column field="role" title={localise("TEXT_ROLE")} cell={this.userRolesCell()} sortable={false} />}
                {this.isColumnVisible("TEXT_TOTAL_TRANSACTION_COUNT") && <Column field="totalTransactionCount" title={localise("TEXT_TOTAL_TRANSACTION_COUNT")} />}
                {this.isColumnVisible("TEXT_AVERAGE_KEY_TRANSACTION_HOLD_TIME") && <Column field="averageTransactionDuration" title={localise("TEXT_AVERAGE_KEY_TRANSACTION_HOLD_TIME")} cell={this.averageTimeCell()} />}
                {this.isColumnVisible("TEXT_RETURN_OVERRIDE_COUNT") && <Column field="returnOverrideCount" title={localise("TEXT_RETURN_OVERRIDE_COUNT")} />}
                {this.isColumnVisible("TEXT_OVERDUE_RETURN_COUNT") && <Column field="overdueReturnCount" title={localise("TEXT_OVERDUE_RETURN_COUNT")} />}
                {this.isColumnVisible("TEXT_CABINET_NAME") && <Column field="cabinetName" title={localise("TEXT_CABINET_NAME")} />}
                {this.isColumnVisible("TEXT_SITE") && <Column field="siteName" title={localise("TEXT_SITE")} />}
            </Grid>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetItemReports/UserWiseTransactionReport/UserWiseTransactionReportGrid.tsx