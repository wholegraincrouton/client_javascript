import * as React from "react";
import { SearchPageContainer, SearchPage } from "src/modules/shared/components/SearchPage";
import { AlarmSearchCriteria, AlarmStatus } from "src/modules/eventAlarms/types/dto";
import { SortDescriptor } from "@progress/kendo-data-query";
import { AlarmFilterBox } from "./AlarmFilterBox";
import { DataGrid, DateTimeFormatCell, LookupTextCell } from "src/modules/shared/components/DataGrid";
import { GridColumn, GridRowProps } from "@progress/kendo-react-grid";
import { localise } from "src/modules/shared/services";
import { ClosedByCell } from "./ClosedByCell";
import { NameCell } from "src/modules/shared/components/DataGrid/Cells/NameCell";
import "./../alarms.css";
import * as apiConstants from "src/modules/shared/constants/api.constants";

const gridName = "AlarmGrid";
const apiController = "alarms";

class AlarmManagement extends SearchPage<AlarmSearchCriteria> {
    routePath: string = "/eventalarm/alarmmanagement";
    defaultSort: SortDescriptor = { field: "status", dir: "asc" };

    rowRender(row: React.ReactElement<HTMLTableRowElement>, props: GridRowProps) {
        return (props.dataItem.status == AlarmStatus.Active) ?
            React.cloneElement(row, { ...row.props, className: row.props.className + ' active-alarm' }, row.props.children) : row;
    }

    render() {
        return (
            <>
                <AlarmFilterBox history={this.props.history} onNewClick={this.goToAddNewPage}
                    hideIncludeDeleteOption={true} hideNewButton={true} />
                <div className="screen-change">
                    <DataGrid baseService={apiConstants.DEVICES} history={this.props.history} name={gridName} onRowClick={this.goToDetailPage} rowRender={this.rowRender}>
                        <GridColumn field="cabinetName" title={localise("TEXT_CABINET")} />
                        <GridColumn field="alarmCode" title={localise("TEXT_ALARM")} cell={LookupTextCell("LIST_ALARMS")} />
                        <GridColumn field="startedUserName" title={localise("TEXT_USER")} cell={NameCell()} />
                        <GridColumn field="startTime" title={localise("TEXT_START_DATETIME")} cell={DateTimeFormatCell()} />
                        <GridColumn field="endTime" title={localise("TEXT_END_DATETIME")} cell={DateTimeFormatCell(undefined, true)} />
                        <GridColumn field="status" title={localise("TEXT_STATUS")} cell={LookupTextCell("LIST_ALARM_STATUS")} />
                        <GridColumn field="updatedOnUtc" title={localise("TEXT_LAST_UPDATE")} cell={DateTimeFormatCell()} />
                        <GridColumn field="closedByName" title={localise("TEXT_CLOSED_BY")} cell={ClosedByCell()} />
                    </DataGrid>
                </div>
            </>
        );
    }
}

export default SearchPageContainer(AlarmManagement, gridName, apiController, undefined, false, apiConstants.DEVICES);



// WEBPACK FOOTER //
// ./src/modules/eventAlarms/components/Alarms/AlarmManagement/AlarmManagement.tsx