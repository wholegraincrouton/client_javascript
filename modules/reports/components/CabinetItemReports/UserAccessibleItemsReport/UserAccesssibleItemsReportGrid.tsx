import { orderBy, SortDescriptor } from "@progress/kendo-data-query";
import { GridColumn as Column, Grid, GridEvent, GridSortChangeEvent } from "@progress/kendo-react-grid";
import React from "react";
import { UserAccessibleItems } from "src/modules/reports/types/dto";
import { DateTimeFormatCell } from "src/modules/shared/components/DataGrid";
import { localise } from "src/modules/shared/services";

interface Props {
    detailsList: UserAccessibleItems[];
    selectedColumns: string[];
    onScrollEnd(): void;
}

interface State {
    sort?: SortDescriptor[];
}

export class UserAccessibleItemsReportGrid extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.onSortChange = this.onSortChange.bind(this);

        this.state = {
            sort: [{ field: 'userName', dir: 'asc' }]
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

    render() {
        const { detailsList } = this.props
        const { sort } = this.state;

        return (
            <Grid resizable className="user-accessible-items-grid" rowRender={this.onRowRender}
                data={orderBy(detailsList || [], sort || [])} onScroll={this.scrollHandler}
                sort={sort} onSortChange={this.onSortChange} sortable={{ allowUnsort: false, mode: 'single' }}>
                {this.isColumnVisible("TEXT_USER_NAME") && <Column field="userName" title={localise("TEXT_USER_NAME")} />}
                {this.isColumnVisible("TEXT_ACCESS_GROUP") && <Column field="accessGroupName" title={localise("TEXT_ACCESS_GROUP")} />}
                {this.isColumnVisible("TEXT_ACCESS_BASIS") && <Column field="accessBasis" title={localise("TEXT_ACCESS_BASIS")} />}
                {this.isColumnVisible("TEXT_CABINET_NAME") && <Column field="cabinetName" title={localise("TEXT_CABINET_NAME")} />}
                {this.isColumnVisible("TEXT_ACCESSIBLE_ITEMS") && <Column field="accessibleItems" title={localise("TEXT_ACCESSIBLE_ITEMS")} />}
                {this.isColumnVisible("TEXT_ACCESS_START") && <Column field="accessStart" title={localise("TEXT_ACCESS_START")} />}
                {this.isColumnVisible("TEXT_ACCESS_END") && <Column field="accessEnd" title={localise("TEXT_ACCESS_END")} />}
                {this.isColumnVisible("TEXT_SCHEDULE") && <Column field="schedule" title={localise("TEXT_SCHEDULE")} />}
                {this.isColumnVisible("TEXT_SCHEDULE_FROM_TO") && <Column field="fromTo" title={localise("TEXT_SCHEDULE_FROM_TO")} />}
                {this.isColumnVisible("LAST_UPDATED_DATE_TIME") && <Column field="lastUpdatedDateTime" title={localise("LAST_UPDATED_DATE_TIME")} cell={DateTimeFormatCell()}/>}
                {this.isColumnVisible("TEXT_LAST_UPDATED_BY") && <Column field="lastUpdatedBy" title={localise("TEXT_LAST_UPDATED_BY")} />}
            </Grid>
        );
    }
}


// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetItemReports/UserAccessibleItemsReport/UserAccesssibleItemsReportGrid.tsx