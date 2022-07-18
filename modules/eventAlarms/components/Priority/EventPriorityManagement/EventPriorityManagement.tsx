import * as React from "react";
import { SearchPageContainer, SearchPage } from "src/modules/shared/components/SearchPage";
import { SortDescriptor } from "@progress/kendo-data-query";
import { EventPrioritySearchCriteria, EventPriority } from "src/modules/eventAlarms/types/dto";
import { DataGrid, LookupTextCell } from "src/modules/shared/components/DataGrid";
import { GridColumn } from "@progress/kendo-react-grid";
import { localise, permissionService, contextService } from "src/modules/shared/services";
import { EventLookupCell } from "src/modules/shared/components/DataGrid/Cells/EventLookupCell";
import { EventPriorityFilterBox } from "./EventPriorityFilterBox";
import { SearchPageProps } from "src/modules/shared/components/SearchPage/SearchPage";
import { EventPriorityDetails } from "../EventPriorityDetails/EventPriorityDetails";

const gridName = "EventPriorityGrid";
const apiController = "eventPriority";

interface State {
    showDetail: boolean;
    selectedItem?: EventPriority;
}

class EventPriorityManagement extends SearchPage<EventPrioritySearchCriteria, State> {
    routePath: string = "/eventalarms/eventprioritymanagement";
    defaultSort: SortDescriptor = { field: "event", dir: "asc" };

    constructor(props: SearchPageProps<EventPrioritySearchCriteria>) {
        super(props);
        this.onRowSelect = this.onRowSelect.bind(this);
        this.hideDetail = this.hideDetail.bind(this);

        this.state = {
            showDetail: false
        }
    }

    onRowSelect(dataItem: EventPriority) {
        if (permissionService.isActionPermittedForCustomer('UPDATE')) {
            this.setState({
                ...this.state,
                showDetail: true,
                selectedItem: dataItem
            });
        }
    }

    hideDetail() {
        const { history } = this.props;
        let pathname = history.location.pathname;
        let search = history.location.search;

        this.props.history.push({
            pathname: pathname,
            search: search
        });

        this.setState({
            ...this.state,
            showDetail: false,
            selectedItem: undefined
        });
    }

    render() {
        const { showDetail, selectedItem } = this.state;

        return (
            !showDetail ?
                <>
                    <EventPriorityFilterBox history={this.props.history} onNewClick={this.goToAddNewPage}
                        hideIncludeDeleteOption={true} hideNewButton={true} customerId={contextService.getCurrentCustomerId()} />
                    <div className="screen-change">
                        <DataGrid history={this.props.history} name={gridName} onRowClick={this.onRowSelect} >
                            <GridColumn field="event" title={localise("TEXT_EVENT")} cell={EventLookupCell()} />
                            <GridColumn field="priority" title={localise("TEXT_PRIORITY")} cell={LookupTextCell("LIST_EVENT_PRIORITIES")} />
                            <GridColumn field="remark" title={localise("TEXT_REMARK")} />
                        </DataGrid>
                    </div>
                </>
                :
                selectedItem &&
                <>
                    <EventPriorityDetails item={selectedItem} onBackClick={this.hideDetail} />
                </>
        );
    }
}

export default SearchPageContainer(EventPriorityManagement, gridName, apiController);


// WEBPACK FOOTER //
// ./src/modules/eventAlarms/components/Priority/EventPriorityManagement/EventPriorityManagement.tsx