import * as React from "react";
import { GridColumn as Column, Grid } from "@progress/kendo-react-grid";
import { localise } from "src/modules/shared/services";
import { DateTimeFormatCell } from "src/modules/shared/components/DataGrid";
import { MultiCustodyCell } from "src/modules/shared/components/DataGrid/Cells/MultiCustodyCell";
import { EventTypeCell } from "src/modules/shared/components/DataGrid/Cells/EventTypeCell";
import { EventDetail } from "../../../../types/dto";
import { ItemNumberCell } from "src/modules/reports/components/shared/GridCells/ItemNumberCell";
import { GetCabinetEventName } from "src/modules/reports/components/shared/GridCells/GetCabinetEventName";
import { ItemNameCell } from "src/modules/reports/components/shared/GridCells/ItemNameCell";
import { GetCabinetAddress } from "src/modules/reports/components/shared/GridCells/GetCabinetAddress";

interface Props {
    eventList?: EventDetail[];
    selectedColumns: string[];
}

export class UserEventHistoryReportGrid extends React.Component<Props> {

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
        const { eventList } = this.props

        return (
            <Grid resizable className="item-status-grid" rowRender={this.onRowRender} data={eventList} >
                {this.isColumnVisible("TEXT_EVENT_DATETIME") && <Column field="eventTime" title={localise("TEXT_EVENT_DATETIME")} cell={DateTimeFormatCell()} />}
                {this.isColumnVisible("TEXT_EVENT_TYPE") && <Column field="eventCode" title={localise("TEXT_EVENT_TYPE")} cell={EventTypeCell()} />}
                {this.isColumnVisible("TEXT_EVENT_NAME") && <Column field="eventCode" title={localise("TEXT_EVENT_NAME")} cell={GetCabinetEventName()} />}
                {this.isColumnVisible("TEXT_ITEM_NUM") && <Column field="itemNumber" title={localise("TEXT_ITEM_NUM")} cell={ItemNumberCell()} />}
                {this.isColumnVisible("TEXT_ITEM_NAME") && <Column field="itemName" title={localise("TEXT_ITEM_NAME")} cell={ItemNameCell()} />}
                {this.isColumnVisible("TEXT_MULTICUSTODY") && <Column field="multiCustody" title={localise("TEXT_MULTICUSTODY")} cell={MultiCustodyCell()} />}
                {this.isColumnVisible("TEXT_SITE_NAME") && <Column field="siteName" title={localise("TEXT_SITE_NAME")} />}
                {this.isColumnVisible("TEXT_CABINET_NAME") && <Column field="cabinetName" title={localise("TEXT_CABINET_NAME")} />}
                {this.isColumnVisible("TEXT_CABINET_ADDRESS") && <Column field="cabinetAddress" title={localise("TEXT_CABINET_ADDRESS")} cell={GetCabinetAddress()} />}
            </Grid>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetReports/EventHistoryReport/UserEventHistoryReport/UserEventHistoryReportGrid.tsx