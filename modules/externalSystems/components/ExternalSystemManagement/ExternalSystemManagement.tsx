import * as React from "react";
import { GridColumn, GridCellProps } from "@progress/kendo-react-grid";
import { SortDescriptor } from "@progress/kendo-data-query";
import { SearchPage, SearchPageContainer } from "src/modules/shared/components/SearchPage";
import { DataGrid, LookupTextCell } from "src/modules/shared/components/DataGrid";
import { localise, lookupService } from "src/modules/shared/services";
import { ExternalSystemSearchCriteria, UserSynchronisationSelection } from "../../types/dto";
import { ExternalSystemFilterBox } from "./ExternalSystemFilterBox";
import * as moment from 'moment';

const gridName = "ExternalSystemGrid";
const apiController = "externalsystem";

class ExternalSystemManagement extends SearchPage<ExternalSystemSearchCriteria>{
    routePath: string = "/externalsystems/externalsystemmanagement";
    defaultSort: SortDescriptor = { field: "integrationSystem", dir: "asc" };

    userSyncIntervalCell() {
        return class extends React.Component<GridCellProps> {
            getText() {
                const { dataItem } = this.props;
                let syncSelection = dataItem["userSynchronisationSelection"];
                let syncInterval = dataItem["syncInterval"];
                let syncScheduleDay = dataItem["scheduleDay"];
                let syncScheduleTime = dataItem["scheduleTime"];

                if (syncSelection == UserSynchronisationSelection.IntervalBased) {
                    return lookupService.getRemark("LIST_USER_SYNCHRONISATION_INTERVALS", syncInterval);
                }
                else if (syncSelection == UserSynchronisationSelection.ScheduleBased) {
                    return `${lookupService.getText("LIST_WEEKDAYS", syncScheduleDay)} ${moment(syncScheduleTime).format("hh:mm A")}`;
                }
                return "";
            }

            render() {
                return <td>{this.getText()}</td>;
            }
        }
    }

    render() {
        return (
            <>
                <ExternalSystemFilterBox history={this.props.history} onNewClick={this.goToAddNewPage} />
                <div className="screen-change">
                    <DataGrid history={this.props.history} name={gridName} onRowClick={this.goToDetailPage}>
                        <GridColumn field="integrationSystem" title={localise("TEXT_INTEGRATION_SYSTEM")}
                            cell={LookupTextCell("LIST_INTEGRATION_SYSTEMS")} />
                        <GridColumn field="description" title={localise("TEXT_DESCRIPTION")} />
                        <GridColumn field="userSyncInterval" title="User Sync Interval" sortable={false}
                            cell={this.userSyncIntervalCell()} />
                        <GridColumn field="integrationStatus" title={localise("TEXT_INTEGRATION_STATUS")}
                            cell={LookupTextCell("LIST_INTEGRATION_STATUS")} />
                    </DataGrid>
                </div>
            </>
        )
    }
}

export default SearchPageContainer(ExternalSystemManagement, gridName, apiController);



// WEBPACK FOOTER //
// ./src/modules/externalSystems/components/ExternalSystemManagement/ExternalSystemManagement.tsx