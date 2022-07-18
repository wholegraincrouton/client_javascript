import * as React from "react";
import { GridColumn as Column, Grid } from "@progress/kendo-react-grid";
import { localise } from "src/modules/shared/services";
import { ItemEventHistoryDetail } from "../../../types/dto";
import { EventTypeCell } from "src/modules/shared/components/DataGrid/Cells/EventTypeCell";
import { DateTimeFormatCell } from "src/modules/shared/components/DataGrid/Cells/DateTimeFormatCell";
import { NameCell } from "src/modules/shared/components/DataGrid/Cells/NameCell";
import { GetItemEventName } from "src/modules/reports/components/shared/GridCells/GetItemEventName";
import { GetJobTitle } from "../../shared/GridCells/JobTitleCell";

interface Props {
    ItemEventsList?: ItemEventHistoryDetail[];
    selectedColumns: string[];
}

export class ItemEventHistoryReportGrid extends React.Component<Props> {
    onRowRender(tr: any) {
        var component = tr;
        component = React.cloneElement(tr, { ...tr.props, className: tr.props.className + ' non-selectable-row' }, tr.props.children);
        return component;
    }

    isColumnVisible(columnName: string){
        const { selectedColumns } = this.props;
        return selectedColumns.some(s => s == columnName);
    }

    render() {
        const { ItemEventsList } = this.props

        return (
            <Grid resizable className="item-status-grid" rowRender={this.onRowRender} data={ItemEventsList} >
                {this.isColumnVisible("TEXT_EVENT_DATETIME") && <Column field="eventTime" title={localise("TEXT_EVENT_DATETIME")} cell={DateTimeFormatCell()} />}
                {this.isColumnVisible("TEXT_ITEM_NUM") && <Column field="itemIndex" title={localise("TEXT_ITEM_NUM")} />}
                {this.isColumnVisible("TEXT_CABINET_NAME") && <Column field="cabinetName" title={localise("TEXT_CABINET_NAME")} />}
                {this.isColumnVisible("TEXT_EVENT_TYPE") && <Column field="eventCode" title={localise("TEXT_EVENT_TYPE")} cell={EventTypeCell()} />}
                {this.isColumnVisible("TEXT_EVENT_NAME") && <Column field="eventCode" title={localise("TEXT_EVENT_NAME")} cell={GetItemEventName()} />}
                {this.isColumnVisible("TEXT_USER_NAME") && <Column field="userName" title={localise("TEXT_USER_NAME")} cell={NameCell()} />}
                {this.isColumnVisible("TEXT_JOB_TITLE") && <Column field="jobTitle" title={localise("TEXT_JOB_TITLE")} cell={GetJobTitle('userName')} />}
            </Grid>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetItemReports/ItemEventHistoryReport/ItemEventHistoryReportGrid.tsx