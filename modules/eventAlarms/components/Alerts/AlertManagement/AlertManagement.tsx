import * as React from "react";
import { SearchPageContainer, SearchPage } from "src/modules/shared/components/SearchPage";
import { AlertSearchCriteria } from "src/modules/eventAlarms/types/dto";
import { SortDescriptor } from "@progress/kendo-data-query";
import { AlertFilterBox } from "./AlertFilterBox";
import { DataGrid, DateTimeFormatCell } from '../../../../shared/components/DataGrid';
import { GridColumn } from '@progress/kendo-react-grid';
import { localise, contextService } from "src/modules/shared/services";
import { RoleListLookupTextCell } from "src/modules/security/components/RoleLookupTextCell/RoleLookupTextCell";
import { LookupTextCell } from "src/modules/shared/components/DataGrid/Cells/LookupTextCell";
import { EventLookupCell } from "../../shared/EventLookupCell";

const gridName = "AlertGrid";
const apiController = "alert";

class AlertManagement extends SearchPage<AlertSearchCriteria> {
    routePath: string = "/eventalarm/alertmanagement";
    defaultSort: SortDescriptor = { field: "updatedOnUtc", dir: "desc" };

    render() {
        return (
            <>
                <AlertFilterBox history={this.props.history} onNewClick={this.goToAddNewPage}
                    hideIncludeDeleteOption={true} hideNewButton={true} customerId={contextService.getCurrentCustomerId()} />
                <div className="screen-change">
                    <DataGrid name={gridName} history={this.props.history} onRowClick={this.goToDetailPage} >
                        <GridColumn field="userName" title={localise("TEXT_USER")} />
                        <GridColumn field="roles" title={localise("TEXT_ROLES")} cell={RoleListLookupTextCell()} />
                        <GridColumn field="eventSource" title={localise("TEXT_EVENT_SOURCE")} cell={LookupTextCell("LIST_EVENT_SOURCES")} />
                        <GridColumn field="event" title={localise("TEXT_EVENT")} cell={EventLookupCell()} />
                        <GridColumn field="eventTime" title={localise("TEXT_EVENT_TIME")} cell={DateTimeFormatCell()} />
                        <GridColumn field="channel" title={localise("TEXT_ALERT_CHANNEL")} cell={LookupTextCell("LIST_ALERT_CHANNELS")} />
                        <GridColumn field="alertTime" title={localise("TEXT_ALERT_TIME")} cell={DateTimeFormatCell()} />
                    </DataGrid>
                </div>
            </>
        );
    }
}

export default SearchPageContainer(AlertManagement, gridName, apiController);



// WEBPACK FOOTER //
// ./src/modules/eventAlarms/components/Alerts/AlertManagement/AlertManagement.tsx