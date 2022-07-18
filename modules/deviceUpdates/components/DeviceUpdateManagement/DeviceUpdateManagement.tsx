import * as React from "react";
import { GridColumn, GridCellProps } from "@progress/kendo-react-grid";
import { SortDescriptor } from "@progress/kendo-data-query";
import { DeviceUpdateSearchCriteria } from "../../types/dto";
import { SearchPage, SearchPageContainer } from "../../../shared/components/SearchPage";
import { DeviceUpdateFilterBox } from "./DeviceUpdateFilterBox";
import { DataGrid, DateTimeFormatCell, LookupTextCell } from "../../../shared/components/DataGrid";
import { localise, lookupService } from "../../../shared/services";

const gridName = "DeviceUpdateGrid";
const apiController = "deviceupdate";

class DeviceUpdateManagemnet extends SearchPage<DeviceUpdateSearchCriteria>{
    routePath: string = "/deviceupdates/deviceupdatemanagement";
    defaultSort: SortDescriptor = { field: "updatedOnUtc", dir: "desc" };

    render() {
        return (
            <>
                <DeviceUpdateFilterBox history={this.props.history} onNewClick={this.goToAddNewPage} />


                <div className="largeScreen">
                    <DataGrid history={this.props.history} name={gridName} onRowClick={this.goToDetailPage}>
                        <GridColumn field="updateLabel" title={localise("TEXT_UPDATELABEL")} width={300} />
                        <GridColumn field="remark" title={localise("TEXT_REMARK")} />
                        <GridColumn field="status" title={localise("TEXT_STATUS")} cell={LookupTextCell("LIST_DEVICEUPDATE_STATUS")} />
                        <GridColumn field="updateType" title={localise("TEXT_UPDATETYPE")} cell={DeviceUpdateTypeCell()} />
                        <GridColumn field="updatedOnUtc" title={localise("TEXT_LAST_UPDATE")} cell={DateTimeFormatCell()} />
                        <GridColumn field="createdByName" title={localise("TEXT_CREATED_BY")} />
                    </DataGrid>
                </div>
                <div className="smallScreen device-update-grid">
                    <DataGrid history={this.props.history} name={gridName} onRowClick={this.goToDetailPage}>
                        <GridColumn field="updateLabel" title={localise("TEXT_UPDATELABEL")} width={300} />
                        <GridColumn field="status" title={localise("TEXT_STATUS")} cell={LookupTextCell("LIST_DEVICEUPDATE_STATUS")} />
                        <GridColumn field="createdByName" title={localise("TEXT_CREATED_BY")} />
                    </DataGrid>
                </div>
            </>
        )
    }
}

function DeviceUpdateTypeCell() {
    return class extends React.Component<GridCellProps> {
        render() {
            let field = this.props.field || '';
            let value = this.props.dataItem[field];

            return (
                <td>
                    {
                        lookupService.getText("LIST_DEVICEUPDATE_TYPES", value)
                    }
                </td>
            );
        }
    }
}

export default SearchPageContainer(DeviceUpdateManagemnet, gridName, apiController);


// WEBPACK FOOTER //
// ./src/modules/deviceUpdates/components/DeviceUpdateManagement/DeviceUpdateManagement.tsx