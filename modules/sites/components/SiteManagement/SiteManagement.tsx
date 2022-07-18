import * as React from "react";
import { GridColumn } from "@progress/kendo-react-grid";
import { SortDescriptor } from "@progress/kendo-data-query";
import { SearchPage, SearchPageContainer } from "../../../shared/components/SearchPage";
import { DataGrid, DateTimeFormatCell } from "../../../shared/components/DataGrid";
import { localise, contextService } from "../../../shared/services";
import { SiteSearchCriteria } from "../../types/dto";
import { SiteFilterBox } from "./SiteFilterBox";
import { LocationAddressCell } from "src/modules/shared/components/DataGrid/Cells/LocationAddressCell";
import { SearchPageProps } from "src/modules/shared/components/SearchPage/SearchPage";
import { SiteWizard } from "../SiteWizard/SiteWizard";

const gridName = "SiteGrid";
const apiController = "site";

interface State {
    showWizard: boolean;
}
class SiteManagemnet extends SearchPage<SiteSearchCriteria, State>{
    routePath: string = "/sites/sitemanagement";
    defaultSort: SortDescriptor = { field: "name", dir: "asc" };

    constructor(props: SearchPageProps<SiteSearchCriteria>) {
        super(props);
        this.toggleWizard = this.toggleWizard.bind(this);
        this.state = { 
            showWizard: false,
        };
    }
    NonSortableHeaderCell(headerText: string) {
        return (<span>{localise(headerText)}</span>);
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
                <SiteFilterBox history={this.props.history} onNewClick={this.toggleWizard} customerId={contextService.getCurrentCustomerId()} />

                <div className="largeScreen">
                    <DataGrid history={this.props.history} name={gridName} onRowClick={this.goToDetailPage}>
                        <GridColumn field="name" title={localise("TEXT_SITE_NAME")} />
                        <GridColumn field="address" title={localise("TEXT_ADDRESS")} cell={LocationAddressCell()} sortable={false} />
                        <GridColumn field="cabinetCount" title={localise("TEXT_CABINETS_AT_SITE")} />
                        <GridColumn field="updatedOnUtc" title={localise("TEXT_LAST_UPDATE")} cell={DateTimeFormatCell()} />
                        <GridColumn field="updatedByName" title={localise("TEXT_LAST_UPDATED_BY")} />
                    </DataGrid>
                </div>
                <div className="smallScreen">
                    <DataGrid history={this.props.history} name={gridName} onRowClick={this.goToDetailPage}>
                        <GridColumn field="name" title={localise("TEXT_SITE_NAME")} />
                        <GridColumn field="address" title={localise("TEXT_ADDRESS")} cell={LocationAddressCell()} sortable={false} />
                        <GridColumn field="cabinetCount" title={localise("TEXT_CABINETS_AT_SITE")} />
                    </DataGrid>
                </div>
                {
                    showWizard &&
                    <SiteWizard closeDialog={this.toggleWizard} />
                }
            </>
        )
    }
}

export default SearchPageContainer(SiteManagemnet, gridName, apiController);


// WEBPACK FOOTER //
// ./src/modules/sites/components/SiteManagement/SiteManagement.tsx