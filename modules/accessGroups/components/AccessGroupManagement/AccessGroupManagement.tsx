import { SearchPage, SearchPageContainer } from "src/modules/shared/components/SearchPage";
import { GroupSearchCriteria } from "../../types/dto";
import { SortDescriptor } from "@progress/kendo-data-query";
import * as React from "react";
import { DataGrid } from "src/modules/shared/components/DataGrid";
import { GridColumn } from "@progress/kendo-react-grid";
import { localise, contextService } from "src/modules/shared/services";
import { AccessGroupFilterBox } from "./AccessGroupFilterBox";
import { SearchPageProps } from "src/modules/shared/components/SearchPage/SearchPage";
import { AccessGroupWizard } from "../AccessGroupWizard/AccessGroupWizard";

const gridName = "GroupsGrid";
const apiController = "groups";

interface State {
    showWizard: boolean;
}

class AccessGroupManagement extends SearchPage<GroupSearchCriteria, State> {

    defaultSort: SortDescriptor = { field: "groupName", dir: `asc` };
    constructor(props: SearchPageProps<GroupSearchCriteria>) {
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
                <AccessGroupFilterBox history={this.props.history} onNewClick={this.toggleWizard} customerId={contextService.getCurrentCustomerId()} />

                <div className="largeScreen">
                    <DataGrid name={gridName} history={this.props.history} onRowClick={this.goToDetailPage}>
                        <GridColumn field="groupName" title={localise("TEXT_ACCESS_GROUP")} />
                        <GridColumn field="remark" title={localise("TEXT_DESCRIPTION")} />
                        <GridColumn field="cabinetCount" title={localise("TEXT_CABINETS")} />
                        <GridColumn field="itemCount" title={localise("TEXT_ITEMS")} />
                        <GridColumn field="userGroupCount" title={localise("TEXT_USER_GROUPS")} />
                        <GridColumn field="userCount" title={localise("TEXT_USERS")} />
                        <GridColumn field="updatedByName" title={localise("TEXT_LAST_UPDATED_BY")} />
                    </DataGrid>
                </div>
                <div className="smallScreen">
                    <DataGrid name={gridName} history={this.props.history} onRowClick={this.goToDetailPage}>
                        <GridColumn field="groupName" title={localise("TEXT_ACCESS_GROUP")} />
                        <GridColumn field="cabinetCount" title={localise("TEXT_CABINETS")} />
                        <GridColumn field="itemCount" title={localise("TEXT_ITEMS")} />
                        <GridColumn field="userGroupCount" title={localise("TEXT_USER_GROUPS")} />
                        <GridColumn field="userCount" title={localise("TEXT_USERS")} />
                    </DataGrid>
                </div>
                {
                    showWizard &&
                    <AccessGroupWizard closeDialog={this.toggleWizard} />
                }
            </>
        )
    }
}

export default SearchPageContainer(AccessGroupManagement, gridName, apiController);


// WEBPACK FOOTER //
// ./src/modules/accessGroups/components/AccessGroupManagement/AccessGroupManagement.tsx