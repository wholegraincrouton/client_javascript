import * as React from "react";
import { GridColumn } from "@progress/kendo-react-grid";
import { SortDescriptor } from "@progress/kendo-data-query";
import { EventAlarmSearchCriteria } from "../../../types/dto";
import { SearchPage, SearchPageContainer } from "../../../../shared/components/SearchPage";
import { EventAlarmFilterBox } from "./EventAlarmFilterBox";
import { DataGrid, DateTimeFormatCell } from "../../../../shared/components/DataGrid";
import { localise, contextService } from "../../../../shared/services";
import { EventLookupCell } from '../../shared/EventLookupCell';
import { EventSourceCell } from "../../shared/EventSourceCell";
import { DefaultTypeCell } from "src/modules/shared/components/DataGrid/Cells/DefaultTypeCell";
import { SearchPageProps } from "src/modules/shared/components/SearchPage/SearchPage";
import { cabinetService } from "src/modules/cabinet/services/cabinet.service";
import { CabinetBasicDetails } from "src/modules/cabinet/types/dto";
import { siteService } from "src/modules/sites/services/site.service";
import { Site } from "src/modules/sites/types/dto";

const gridName = "EventAlarmConfigGrid";
const apiController = "eventAlarmConfiguration";

interface State {
    customerId: string;
    sites: Site[];
    cabinets: CabinetBasicDetails[];
}

class EventAlarmManagement extends SearchPage<EventAlarmSearchCriteria, State> {
    routePath: string = "/eventalarms/eventalarmmanagement";
    defaultSort: SortDescriptor = { field: "updatedOnUtc", dir: "desc" };

    constructor(props: SearchPageProps<EventAlarmSearchCriteria>) {
        super(props);

        this.state = {
            customerId: '',
            sites: [],
            cabinets: []
        }
    }

    componentDidUpdate() {
        const { customerId } = this.state;
        const contextCustomerId = contextService.getCurrentCustomerId();

        if (customerId != contextCustomerId) {
            siteService.getSites(contextCustomerId).then((sites: Site[]) => {
                cabinetService.getCabinets(contextCustomerId).then((cabinets: CabinetBasicDetails[]) => {
                    this.setState({
                        ...this.state,
                        customerId: contextCustomerId,
                        sites: sites,
                        cabinets: cabinets
                    });
                });
            });
        }
    }

    render() {
        const { sites, cabinets } = this.state;

        return (
            <>
                <EventAlarmFilterBox history={this.props.history} onNewClick={this.goToAddNewPage} />
                <div className="screen-change">
                    <DataGrid history={this.props.history} name={gridName} onRowClick={this.goToDetailPage} >
                        <GridColumn field="eventSource" title={localise("TEXT_EVENT_SOURCE")}
                            cell={EventSourceCell(sites, cabinets)} sortable={false} headerClassName="unsortable" />
                        <GridColumn field="eventCode" title={localise("TEXT_EVENT")} cell={EventLookupCell()} />
                        <GridColumn field="isDefault" title={localise("TEXT_TYPE")} cell={DefaultTypeCell()} />
                        <GridColumn field="updatedOnUtc" title={localise("TEXT_LAST_UPDATE")} cell={DateTimeFormatCell()} />
                        <GridColumn field="updatedByName" title={localise("TEXT_LAST_UPDATED_BY")} />
                    </DataGrid>
                </div>
            </>
        );
    }
}

export default SearchPageContainer(EventAlarmManagement, gridName, apiController);



// WEBPACK FOOTER //
// ./src/modules/eventAlarms/components/RuleEngine/EventAlarmManagement/EventAlarmManagement.tsx