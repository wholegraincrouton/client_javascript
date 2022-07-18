import * as React from "react";
import { GridColumn } from "@progress/kendo-react-grid";
import { SortDescriptor } from "@progress/kendo-data-query";
import { TemplateSearchCriteria } from "../../types/dto";
import { SearchPage, SearchPageContainer } from "../../../shared/components/SearchPage";
import { TemplateFilterBox } from "./TemplateFilterBox";
import { DataGrid, DateTimeFormatCell, LookupTextCell } from "../../../shared/components/DataGrid";
import { localise, contextService } from "../../../shared/services";
import { KeyLookupTextCell } from "../KeyLookupTextCell/KeyLookupTextCell";

const gridName = "TemplateGrid";
const apiController = "alertTemplate";

class TemplateManagement extends SearchPage<TemplateSearchCriteria> {
  routePath: string = "/template/templatemanagement";
  defaultSort: SortDescriptor = { field: "updatedOnUtc", dir: "desc" };

  render() {
    return (
      <>
        <TemplateFilterBox history={this.props.history} onNewClick={this.goToAddNewPage} customerId={contextService.getCurrentCustomerId()} />
        <div className="screen-change">
          <DataGrid history={this.props.history} name={gridName} onRowClick={this.goToDetailPage} >
            <GridColumn field="culture" title={localise("TEXT_CULTURE")} cell={LookupTextCell("LIST_CULTURE")} />
            <GridColumn field="section" title={localise("TEXT_SECTION")} cell={LookupTextCell("LIST_SECTION")} />
            <GridColumn field="key" title={localise("TEXT_KEY")} cell={KeyLookupTextCell()} />
            <GridColumn field="channel" title={localise("TEXT_CHANNEL")} cell={LookupTextCell("LIST_ALERT_CHANNELS")} />
            <GridColumn field="updatedOnUtc" title={localise("TEXT_LAST_UPDATE")} cell={DateTimeFormatCell()} />
            <GridColumn field="updatedByName" title={localise("TEXT_LAST_UPDATED_BY")} />
          </DataGrid>
        </div>
      </>
    );
  }
}

export default SearchPageContainer(TemplateManagement, gridName, apiController);



// WEBPACK FOOTER //
// ./src/modules/template/components/TemplateManagement/TemplateManagement.tsx