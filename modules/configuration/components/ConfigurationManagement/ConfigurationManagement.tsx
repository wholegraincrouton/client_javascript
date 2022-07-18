import * as React from "react";
import { GridColumn } from "@progress/kendo-react-grid";
import { ConfigurationSearchCriteria } from "../../types/dto";
import { ConfigurationFilterBox } from "../shared/ConfigurationFilterBox";
import { SearchPage, SearchPageContainer } from "../../../shared/components/SearchPage";
import { localise, contextService } from "../../../shared/services";
import { SortDescriptor } from '@progress/kendo-data-query';
import { DataGrid, LookupTextCell, TruncateCell, DateTimeFormatCell } from "../../../shared/components/DataGrid";

const gridName = "ConfigurationGrid";
const apiController = "configuration";

class ConfigurationManagement extends SearchPage<ConfigurationSearchCriteria> {

    defaultSort: SortDescriptor = { field: "key", dir: "asc" };

    render() {
        return (
            <>
                <ConfigurationFilterBox history={this.props.history} onNewClick={this.goToAddNewPage} name={gridName} customerId={contextService.getCurrentCustomerId()} />
                <div className="screen-change">
                    <DataGrid history={this.props.history} name={gridName} onRowClick={this.goToDetailPage}>
                        <GridColumn field="culture" title={localise("TEXT_CULTURE")} cell={LookupTextCell("LIST_CULTURE")} />
                        <GridColumn field="section" title={localise("TEXT_SECTION")} cell={LookupTextCell("LIST_SECTION")} />
                        <GridColumn field="key" title={localise("TEXT_KEY")} />
                        <GridColumn field="value" title={localise("TEXT_VALUE")} cell={TruncateCell(30)} />
                        <GridColumn field="updatedOnUtc" title={localise("TEXT_LAST_UPDATE")} cell={DateTimeFormatCell()} />
                        <GridColumn field="updatedByName" title={localise("TEXT_LAST_UPDATED_BY")} />
                    </DataGrid>
                </div>
            </>
        );
    }
}

export default SearchPageContainer(ConfigurationManagement, gridName, apiController);


// WEBPACK FOOTER //
// ./src/modules/configuration/components/ConfigurationManagement/ConfigurationManagement.tsx