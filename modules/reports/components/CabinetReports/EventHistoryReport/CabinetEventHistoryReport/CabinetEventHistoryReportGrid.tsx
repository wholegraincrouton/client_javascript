import * as React from "react";
import { GridColumn as Column, Grid } from "@progress/kendo-react-grid";
import { localise } from "src/modules/shared/services";
import { DateTimeFormatCell } from "src/modules/shared/components/DataGrid";
import { MultiCustodyCell } from "src/modules/shared/components/DataGrid/Cells/MultiCustodyCell";
import { EventTypeCell } from "src/modules/shared/components/DataGrid/Cells/EventTypeCell";
import { EventDetail } from "../../../../types/dto";
import { GetJobTitle } from "src/modules/reports/components/shared/GridCells/JobTitleCell";
import { ItemNumberCell } from "src/modules/reports/components/shared/GridCells/ItemNumberCell";
import { ItemNameCell } from "src/modules/reports/components/shared/GridCells/ItemNameCell";
import { GetUserName } from "../../../shared/GridCells/GetUserName";
import { GetCabinetEventName } from "../../../shared/GridCells/GetCabinetEventName";


interface Props {
    eventList?: EventDetail[];
    selectedColumns: string[];
}

export class CabinetEventHistoryReportGrid extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    onRowRender(tr: any) {
        var component = tr;
        component = React.cloneElement(tr, { ...tr.props, className: tr.props.className + ' non-selectable-row' }, tr.props.children);
        return component;
    }

    isColumnVisible(columnName: string) {
        const { selectedColumns } = this.props;
        return selectedColumns.some(s => s == columnName);
    }

    render() {
        const { eventList } = this.props;

        return (

            <Grid resizable className="item-status-grid" rowRender={this.onRowRender} data={eventList} >
                {this.isColumnVisible("TEXT_EVENT_DATETIME") && <Column field="eventTime" title={localise("TEXT_EVENT_DATETIME")} cell={DateTimeFormatCell()} />}
                {this.isColumnVisible("TEXT_EVENT_TYPE") && <Column field="eventCode" title={localise("TEXT_EVENT_TYPE")} cell={EventTypeCell()} />}
                {this.isColumnVisible("TEXT_EVENT_NAME") && <Column field="eventCode" title={localise("TEXT_EVENT_NAME")} cell={GetCabinetEventName()} />}
                {this.isColumnVisible("TEXT_ITEM_NUM") && <Column field="itemNumber" title={localise("TEXT_ITEM_NUM")} cell={ItemNumberCell()} />}
                {this.isColumnVisible("TEXT_ITEM_NAME") && <Column field="itemName" title={localise("TEXT_ITEM_NAME")} cell={ItemNameCell()} />}
                {this.isColumnVisible("TEXT_MULTICUSTODY") && <Column field="multiCustody" title={localise("TEXT_MULTICUSTODY")} cell={MultiCustodyCell()} />}
                {this.isColumnVisible("TEXT_USER_NAME") && <Column field="userName" title={localise("TEXT_USER_NAME")} cell={GetUserName()} />}
                {this.isColumnVisible("TEXT_JOB_TITLE") && <Column field="jobTitle" title={localise("TEXT_JOB_TITLE")} cell={GetJobTitle('userName')} />}
            </Grid>

        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetReports/EventHistoryReport/CabinetEventHistoryReport/CabinetEventHistoryReportGrid.tsx