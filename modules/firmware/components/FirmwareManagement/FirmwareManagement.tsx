import * as React from "react";
import { GridColumn } from "@progress/kendo-react-grid";
import { SortDescriptor } from "@progress/kendo-data-query";
import { localise } from "../../../shared/services";
import { DataGrid, DateTimeFormatCell } from "../../../shared/components/DataGrid";
import { SearchPage, SearchPageContainer } from "../../../shared/components/SearchPage";
import { FirmwareSearchCriteria } from "../../types/dto";
import { FirmwareFilterBox } from "./FirmwareFilterBox";
import * as apiConstants from "src/modules/shared/constants/api.constants";

const gridName = "FirmwareGrid";
const apiController = "firmware";

class FirmwareManagemnet extends SearchPage<FirmwareSearchCriteria>{
    routePath: string = "/configuration/firmwaremanagement";
    defaultSort: SortDescriptor = { field: "version", dir: "asc" };

    render() {
        return (
            <>
                <FirmwareFilterBox history={this.props.history} onNewClick={this.goToAddNewPage} />
                <div className="screen-change">
                    <DataGrid baseService={apiConstants.DEVICES} history={this.props.history} name={gridName} onRowClick={this.goToDetailPage}>
                        <GridColumn field="version" title={localise("TEXT_FIRMWARE_VERSION")} />
                        <GridColumn field="fileName" title={localise("TEXT_FILE_NAME")} />
                        <GridColumn field="fileSize" title={`${localise("TEXT_FILE_SIZE")} (MB)`} />
                        <GridColumn field="remark" title={localise("TEXT_DESCRIPTION")} />
                        <GridColumn field="releaseTimeUTC" title={localise("TEXT_RELEASE_DATETIME")} cell={DateTimeFormatCell()} />
                        <GridColumn field="updatedOnUtc" title={localise("TEXT_LAST_UPDATE")} cell={DateTimeFormatCell()} />
                        <GridColumn field="updatedByName" title={localise("TEXT_LAST_UPDATED_BY")} />
                    </DataGrid>
                </div>
            </>
        )
    }
}

export default SearchPageContainer(FirmwareManagemnet, gridName, apiController, undefined, false, apiConstants.DEVICES);


// WEBPACK FOOTER //
// ./src/modules/firmware/components/FirmwareManagement/FirmwareManagement.tsx