import * as React from "react";
import { GridColumn } from "@progress/kendo-react-grid";
import { SortDescriptor } from "@progress/kendo-data-query";
import { localise, contextService } from "../../../shared/services";
import { DataGrid, DateTimeFormatCell, LookupTextCell } from "../../../shared/components/DataGrid";
import { SearchPage, SearchPageContainer } from "../../../shared/components/SearchPage";
import { ReportSubscriptionSearchCriteria } from "../../types/dto";
import { ReportSubscriptionFilterBox } from "./SubscriptionFilterBox";
import { ActiveStatusCell } from "src/modules/shared/components/DataGrid/Cells/ActiveStatusCell";
import { UserNameCell } from "src/modules/shared/components/DataGrid/Cells/UserNameCell";
import { UserEmailCell } from "src/modules/shared/components/DataGrid/Cells/UserEmailCell";
import "../subscriptions.css";
import { BasicUser } from "src/modules/shared/types/dto";
import { SearchPageProps } from "src/modules/shared/components/SearchPage/SearchPage";
import { userService } from "src/modules/users/services/user.service";

const gridName = "ReportSubscriptionGrid";
const apiController = "reportsubscription";

interface State {
    customerId: string;
    users: BasicUser[];
}

class ReportSubscriptionManagement extends SearchPage<ReportSubscriptionSearchCriteria, State>{
    routePath: string = "/reports/reportsubscriptionmanagement";
    defaultSort: SortDescriptor = { field: "updatedOnUtc", dir: "desc" };

    constructor(props: SearchPageProps<ReportSubscriptionSearchCriteria>) {
        super(props);

        this.state = {
            customerId: '',
            users: []
        }
    }

    componentDidUpdate() {
        const { customerId } = this.state;
        const contextCustomerId = contextService.getCurrentCustomerId();

        if (customerId != contextCustomerId) {
            userService.getUsers(contextCustomerId).then((users) => {
                this.setState({
                    ...this.state,
                    customerId: contextCustomerId,
                    users: users
                });
            });
        }
    }

    render() {
        const { users } = this.state;

        return (
            <>
                <ReportSubscriptionFilterBox history={this.props.history} onNewClick={this.goToAddNewPage} />
                <div className="screen-change">
                    <DataGrid history={this.props.history} name={gridName} onRowClick={this.goToDetailPage}>
                        <GridColumn field="reportCode" title={localise("TEXT_REPORT")} cell={LookupTextCell("LIST_SUBSCRIPTION_REPORTS")} />
                        <GridColumn field="userId" title={localise("TEXT_USER")} cell={UserNameCell(users)} sortable={false} headerClassName="unsortable" />
                        <GridColumn field="userId" title={localise("TEXT_EMAIL")} cell={UserEmailCell(users)} sortable={false} headerClassName="unsortable" />
                        <GridColumn field="dataRange" title={localise("TEXT_DATA_RANGE")} cell={LookupTextCell("LIST_REPORT_DATA_RANGES")}
                            sortable={false} headerClassName="unsortable" />
                        <GridColumn field="frequency" title={localise("TEXT_FREQUENCY")} cell={LookupTextCell("LIST_REPORT_FREQUENCIES")}
                            sortable={false} headerClassName="unsortable" />
                        <GridColumn field="isActive" title={localise("TEXT_STATUS")} cell={ActiveStatusCell()} />
                        <GridColumn field="updatedOnUtc" title={localise("TEXT_LAST_UPDATE")} cell={DateTimeFormatCell()} />
                        <GridColumn field="updatedByName" title={localise("TEXT_LAST_UPDATED_BY")} />
                    </DataGrid>
                </div>
            </>
        )
    }
}

export default SearchPageContainer(ReportSubscriptionManagement, gridName, apiController);


// WEBPACK FOOTER //
// ./src/modules/subscriptions/components/SubscriptionManagement/SubscriptionManagement.tsx