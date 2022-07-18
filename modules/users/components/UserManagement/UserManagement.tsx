import * as React from "react";
import { GridColumn } from "@progress/kendo-react-grid";
import { UserSearchCriteria } from "../../types/dto";
import { UserFilterBox } from "./UserFilterBox";
import { SearchPage, SearchPageContainer } from "../../../shared/components/SearchPage";
import { localise, contextService } from "../../../shared/services";
import { SortDescriptor } from '@progress/kendo-data-query';
import { DataGrid, DateTimeFormatCell } from "../../../shared/components/DataGrid";
import { UserCustomerRolesCell } from "../UserManagement/UserCustomerRolesCell";
import { PhoneNumberCell } from "src/modules/shared/components/DataGrid/Cells/PhoneNumberCell";
import { UserStatusCell } from "./UserStatusCell";
import { UserWizard } from "../UserWizard/UserWizard";
import { SearchPageProps } from "src/modules/shared/components/SearchPage/SearchPage";
import "./user-management.css";

const gridName = "UserGrid";
const apiController = "user";

interface State {
    showWizard: boolean;
}

class UserManagement extends SearchPage<UserSearchCriteria, State> {
    routePath: string = "/users/usermanagement";
    defaultSort: SortDescriptor = { field: "fullName", dir: "asc" };

    constructor(props: SearchPageProps<UserSearchCriteria>) {
        super(props);
        this.toggleWizard = this.toggleWizard.bind(this);
        this.state = { showWizard: false };
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
                <UserFilterBox history={this.props.history} onNewClick={this.toggleWizard} customerId={contextService.getCurrentCustomerId()} />
                <div className="largeScreen">
                    <DataGrid history={this.props.history} name={gridName} onRowClick={this.goToDetailPage}>
                        <GridColumn field="fullName" title={localise("TEXT_NAME")} />
                        <GridColumn field="customerRoleList" sortable={false} title={localise("TEXT_ROLES")} cell={UserCustomerRolesCell()} />
                        <GridColumn field="mobileNumber" title={localise("TEXT_MOBILE")} cell={PhoneNumberCell()} sortable={false} />
                        <GridColumn field="email" title={localise("TEXT_EMAIL")} />
                        <GridColumn field="accessExpiryDate" title={localise("TEXT_ACCESS_EXPIRY")} />
                        <GridColumn field="isEmailConfirmed" title={localise("TEXT_WEB_LOGIN_STATUS")} cell={UserStatusCell()} />
                        <GridColumn field="updatedByName" title={localise("TEXT_LAST_UPDATED_BY")} />
                        <GridColumn field="updatedOnUtc" title={localise("TEXT_LAST_UPDATE")} cell={DateTimeFormatCell()} />
                    </DataGrid>
                </div>
                <div className="smallScreen user-grid">
                    <DataGrid history={this.props.history} name={gridName} onRowClick={this.goToDetailPage}>
                        <GridColumn field="fullName" title={localise("TEXT_NAME")} />
                        <GridColumn field="customerRoleList" sortable={false} title={localise("TEXT_ROLES")} cell={UserCustomerRolesCell()} />
                        <GridColumn field="mobileNumber" title={localise("TEXT_MOBILE")} cell={PhoneNumberCell()} sortable={false} />
                        <GridColumn field="email" title={localise("TEXT_EMAIL")} />
                    </DataGrid>
                </div>
                {
                    showWizard &&
                    <UserWizard customerId={contextService.getCurrentCustomerId()} closeDialog={this.toggleWizard} />
                }
            </>
        );
    }
}

export default SearchPageContainer(UserManagement, gridName, apiController);


// WEBPACK FOOTER //
// ./src/modules/users/components/UserManagement/UserManagement.tsx