import * as React from "react";
import { GridColumn as Column, Grid, GridEvent } from "@progress/kendo-react-grid";
import { contextService, localise } from "src/modules/shared/services";
import { DateTimeFormatCell } from "src/modules/shared/components/DataGrid";
import { TodayEventDetails } from "../../../../reports/types/dto";
import { EventTypeCell } from "src/modules/shared/components/DataGrid/Cells/EventTypeCell";
import { GetCabinetAddress } from "src/modules/reports/components/shared/GridCells/GetCabinetAddress";
import { GetUserName } from "src/modules/reports/components/shared/GridCells/GetUserName";
import { GetJobTitle } from "src/modules/reports/components/shared/GridCells/JobTitleCell";
import { ItemNumberCell } from "src/modules/reports/components/shared/GridCells/ItemNumberCell";
import { ItemNameCell } from "src/modules/reports/components/shared/GridCells/ItemNameCell";
import { GetCabinetEventName } from "src/modules/reports/components/shared/GridCells/GetCabinetEventName";
import { MultiCustodyCell } from "src/modules/shared/components/DataGrid/Cells/MultiCustodyCell";

interface Props {
    todayEventsList?: TodayEventDetails[];
    onScrollEnd(): void;
    selectedColumns: string[];

}

export class TodaysEventsReportGrid extends React.Component<Props> {
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
        const { todayEventsList } = this.props;
        const timeFormat = contextService.getCurrentTimeFormat();                

        return (
            <Grid resizable rowRender={this.onRowRender} data={todayEventsList} onScroll={this.scrollHandler}>
                {this.isColumnVisible("TEXT_EVENT_NAME") && <Column field="eventCode" title={localise("TEXT_EVENT_NAME")} cell={GetCabinetEventName()} />}
                {this.isColumnVisible("TEXT_EVENT_TIME") && <Column field="eventTime" title={localise("TEXT_EVENT_TIME")} cell={DateTimeFormatCell(timeFormat || "HH:mm:ss")}/>}
                {this.isColumnVisible("TEXT_EVENT_TYPE") && <Column field="eventType" title={localise("TEXT_EVENT_TYPE")} cell={EventTypeCell()} />}
                {this.isColumnVisible("TEXT_ITEM_ID") && <Column field="itemNumber" title={localise("TEXT_ITEM_ID")} cell={ItemNumberCell()} />}
                {this.isColumnVisible("TEXT_ITEM_NAME") && <Column field="itemName" title={localise("TEXT_ITEM_NAME")} cell={ItemNameCell()} />}
                {this.isColumnVisible("TEXT_MULTICUSTODY") && <Column field="multiCustody" title={localise("TEXT_MULTICUSTODY")} cell={MultiCustodyCell()} />}
                {this.isColumnVisible("TEXT_SITE_NAME") && <Column field="siteName" title={localise("TEXT_SITE_NAME")} />}
                {this.isColumnVisible("TEXT_CABINET_NAME") && <Column field="cabinetName" title={localise("TEXT_CABINET_NAME")} />}
                {this.isColumnVisible("TEXT_CABINET_ADDRESS") && <Column field="cabinetAddress" title={localise("TEXT_CABINET_ADDRESS")} cell={GetCabinetAddress()} />}
                {this.isColumnVisible("TEXT_USER_NAME") && <Column field="userName" title={localise("TEXT_USER_NAME")} cell={GetUserName()} />}
                {this.isColumnVisible("TEXT_JOB_TITLE") && <Column field="jobTitle" title={localise("TEXT_JOB_TITLE")} cell={GetJobTitle('userName')} />}
            </Grid>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetReports/TodaysEventsReport/TodaysEventsReportGrid.tsx