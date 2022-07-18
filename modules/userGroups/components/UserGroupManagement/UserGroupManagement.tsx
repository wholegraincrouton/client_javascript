import * as React from "react";
import { GridColumn } from "@progress/kendo-react-grid";
import { SortDescriptor } from "@progress/kendo-data-query";
import { UserGroupSearchCriteria } from "../../types/dto";
import { SearchPage, SearchPageContainer } from "../../../shared/components/SearchPage";
import { UserGroupFilterBox } from "./UserGroupFilterBox";
import { DataGrid, DateTimeFormatCell } from "../../../shared/components/DataGrid";
import { localise, contextService } from "../../../shared/services";
import { SearchPageProps } from "src/modules/shared/components/SearchPage/SearchPage";
import { UserGroupWizard } from "../UserGroupWizard/UserGroupWizard";

const gridName = "UserGroupGrid";
const apiController = "usergroup";

interface State {
    showWizard: boolean;
}

class UserGroupManagemnet extends SearchPage<UserGroupSearchCriteria, State>{
    routePath: string = "/usergroups/usergroupmanagement";
    defaultSort: SortDescriptor = { field: "name", dir: "asc" };

    constructor(props: SearchPageProps<UserGroupSearchCriteria>) {
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
                <UserGroupFilterBox history={this.props.history} onNewClick={this.toggleWizard} customerId={contextService.getCurrentCustomerId()} />

                <div className="largeScreen">
                    <DataGrid history={this.props.history} name={gridName} onRowClick={this.goToDetailPage}>
                        <GridColumn field="name" title={localise("TEXT_USER_GROUP")} />
                        <GridColumn field="remark" title={localise("TEXT_REMARK")} />
                        <GridColumn field="userCount" title={localise("TEXT_USERS")} />
                        <GridColumn field="updatedOnUtc" title={localise("TEXT_LAST_UPDATE")} cell={DateTimeFormatCell()} />
                        <GridColumn field="updatedByName" title={localise("TEXT_LAST_UPDATED_BY")} />
                    </DataGrid>
                </div>
                <div className="smallScreen user-group-grid">
                    <DataGrid history={this.props.history} name={gridName} onRowClick={this.goToDetailPage} >
                        <GridColumn field="name" title={localise("TEXT_USER_GROUP")} />
                        <GridColumn field="userCount" title={localise("TEXT_USERS")} />
                    </DataGrid>
                </div>
                {
                    showWizard &&
                    <UserGroupWizard closeDialog={this.toggleWizard} />
                }
            </>
        )
    }
}

export default SearchPageContainer(UserGroupManagemnet, gridName, apiController);




// WEBPACK FOOTER //
// ./src/modules/userGroups/components/UserGroupManagement/UserGroupManagement.tsx