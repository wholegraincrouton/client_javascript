import * as React from "react";
import { GridColumn } from "@progress/kendo-react-grid";
import { CustomerSearchCriteria } from "../../types/dto";
import { CustomerFilterBox } from "./CustomerFilterBox";
import { SearchPage, SearchPageContainer } from "../../../shared/components/SearchPage";
import { localise } from "../../../shared/services";
import { SortDescriptor } from '@progress/kendo-data-query';
import { DataGrid, DateTimeFormatCell } from "../../../shared/components/DataGrid";
import { PhoneNumberCell } from "../../../shared/components/DataGrid/Cells/PhoneNumberCell";

const gridName = "CustomerGrid";
const apiController = "customer";

class CustomerManagement extends SearchPage<CustomerSearchCriteria> {

    routePath: string = "/customers/customermanagement";
    defaultSort: SortDescriptor = { field: "name", dir: "asc" };

    render() {
        return (
            <>
                <CustomerFilterBox history={this.props.history} onNewClick={this.goToAddNewPage} />
                <div className="screen-change">
                    <DataGrid history={this.props.history} name={gridName} onRowClick={this.goToDetailPage}>
                        <GridColumn field="name" title={localise("TEXT_CUSTOMER")} />
                        <GridColumn field="fullName" title={localise("TEXT_PRIMARYCONTACT")} />
                        <GridColumn field="email" title={localise("TEXT_EMAIL")} />
                        <GridColumn field="mobileNumber" sortable={false} title={localise("TEXT_PHONE")} cell={PhoneNumberCell()} />
                        <GridColumn field="updatedOnUtc" title={localise("TEXT_LAST_UPDATE")} cell={DateTimeFormatCell()} />
                        <GridColumn field="updatedByName" title={localise("TEXT_LAST_UPDATED_BY")} />
                    </DataGrid>
                </div>
            </>
        );
    }
}

export default SearchPageContainer(CustomerManagement, gridName, apiController);


// WEBPACK FOOTER //
// ./src/modules/customers/components/CustomerManagement/CustomerManagement.tsx