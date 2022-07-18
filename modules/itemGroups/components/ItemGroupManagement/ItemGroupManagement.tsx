import * as React from "react";
import { GridColumn } from "@progress/kendo-react-grid";
import { SortDescriptor } from "@progress/kendo-data-query";
import { ItemGroupSearchCriteria } from "../../types/dto";
import { SearchPage, SearchPageContainer } from "../../../shared/components/SearchPage";
import { ItemGroupFilterBox } from "./ItemGroupFilterBox";
import { DataGrid, DateTimeFormatCell, LookupTextCell } from "../../../shared/components/DataGrid";
import { localise, contextService } from "../../../shared/services";
import { SearchPageProps } from "src/modules/shared/components/SearchPage/SearchPage";
import { ItemGroupWizard } from "../ItemGroupWizard/ItemGroupWizard";

const gridName = "ItemGroupGrid";
const apiController = "itemgroup";

interface State {
    showWizard: boolean;
}

class ItemGroupManagemnet extends SearchPage<ItemGroupSearchCriteria, State>{
    routePath: string = "/itemgroups/itemgroupmanagement";
    defaultSort: SortDescriptor = { field: "name", dir: "asc" };

    constructor(props: SearchPageProps<ItemGroupSearchCriteria>) {
        super(props);
        this.toggleWizard = this.toggleWizard.bind(this);
        this.state = { 
            showWizard: false,
        };
    }

    toggleWizard() {
        const { showWizard } = this.state;
        this.setState({ 
            ...this.state,
            showWizard: !this.state.showWizard
        });
        if(showWizard) {
            this.refreshData();
        }
    }

    render() {
        const { showWizard } = this.state;

        return (
            <>
                <ItemGroupFilterBox history={this.props.history} onNewClick={this.toggleWizard} customerId={contextService.getCurrentCustomerId()} />

                <div className="largeScreen">
                    <DataGrid history={this.props.history} name={gridName} onRowClick={this.goToDetailPage}>
                        <GridColumn field="name" title={localise("TEXT_ITEM_GROUP_NAME")} />
                        <GridColumn field="remark" title={localise("TEXT_REMARK")} />
                        <GridColumn field="maxItemsPerUser" title={localise("TEXT_MAX_ITEMS_PER_USER")} cell={LookupTextCell("LIST_MAXIMUM_KEYS_PER_USER")} />
                        <GridColumn field="itemCount" title={localise("TEXT_ITEM_COUNT")} />
                        <GridColumn field="updatedOnUtc" title={localise("TEXT_LAST_UPDATE")} cell={DateTimeFormatCell()} />
                        <GridColumn field="updatedByName" title={localise("TEXT_LAST_UPDATED_BY")} />
                    </DataGrid>
                </div>
                <div className="smallScreen item-group-grid">
                    <DataGrid history={this.props.history} name={gridName} onRowClick={this.goToDetailPage}>
                        <GridColumn field="name" title={localise("TEXT_ITEM_GROUP_NAME")} />
                        <GridColumn field="maxItemsPerUser" title={localise("TEXT_MAX_ITEMS_PER_USER")} cell={LookupTextCell("LIST_MAXIMUM_KEYS_PER_USER")} />
                        <GridColumn field="itemCount" title={localise("TEXT_ITEM_COUNT")} />
                    </DataGrid>
                </div>
                {
                    showWizard &&
                    <ItemGroupWizard closeDialog={this.toggleWizard} />
                }
            </>
        )
    }
}

export default SearchPageContainer(ItemGroupManagemnet, gridName, apiController);


// WEBPACK FOOTER //
// ./src/modules/itemGroups/components/ItemGroupManagement/ItemGroupManagement.tsx