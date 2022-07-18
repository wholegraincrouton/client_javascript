import React from "react";
import { orderBy, SortDescriptor } from "@progress/kendo-data-query";
import { GridColumn as Column, Grid, GridEvent, GridCellProps, GridSortChangeEvent } from "@progress/kendo-react-grid";
import { ItemWiseTransactionDetail } from "src/modules/reports/types/dto";
import { localise } from "src/modules/shared/services";

interface Props {
    itemTransactionList?: ItemWiseTransactionDetail[];
    selectedColumns: string[];
    onScrollEnd(): void;
}

interface State {
    sort?: SortDescriptor[];
}

export class ItemWiseTransactionReportGrid extends React.Component<Props, State> {
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
        const { itemTransactionList } = this.props;
        const { sort } = this.state;

        return (
            <Grid resizable className="item-transactions-grid" rowRender={this.onRowRender}
                data={orderBy(itemTransactionList || [], sort || [])} onScroll={this.scrollHandler}
                sort={sort} onSortChange={this.onSortChange} sortable={{ allowUnsort: false, mode: 'single' }}>
                {this.isColumnVisible("TEXT_ITEM_NUM") && <Column width={75} field="itemNo" title={localise("TEXT_ITEM_NUM")} />}
                {this.isColumnVisible("TEXT_ITEM_NAME") && <Column field="itemName" title={localise("TEXT_ITEM_NAME")} />}
                {this.isColumnVisible("TEXT_ITEM_TYPE") && <Column field="itemType" title={localise("TEXT_ITEM_TYPE")} />}
                {this.isColumnVisible("TEXT_CABINET_NAME") && <Column field="cabinetName" title={localise("TEXT_CABINET_NAME")} />}
                {this.isColumnVisible("TEXT_SITE") && <Column field="siteName" title={localise("TEXT_SITE")} />}
                {this.isColumnVisible("TEXT_TOTAL_TRANSACTION_COUNT") && <Column field="totalTransactionCount" title={localise("TEXT_TOTAL_TRANSACTION_COUNT")} />}
                {this.isColumnVisible("TEXT_AVERAGE_TIME_OUT_OF_CABINET") && <Column field="averageTransactionDuration" title={localise("TEXT_AVERAGE_TIME_OUT_OF_CABINET")} cell={this.averageTimeCell()} />}
                {this.isColumnVisible("TEXT_OVERDUE_COUNT") && <Column field="overdueCount" title={localise("TEXT_OVERDUE_COUNT")} />}
                {this.isColumnVisible("TEXT_AVERAGE_TIME_OVERDUE") && <Column field="averageOverdueDuration" title={localise("TEXT_AVERAGE_TIME_OVERDUE")} cell={this.averageTimeCell()} />}
            </Grid>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetItemReports/ItemWiseTransactionReport/ItemWiseTransactionReportGrid.tsx