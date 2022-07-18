import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";
import { lookupService } from "../../../shared/services";
import { EventSources } from "src/modules/eventAlarms/types/dto";

export function EventLookupCell() {
    return class extends React.Component<GridCellProps> {
        render() {
            let eventSource = this.props.dataItem.eventSource;
            let value = this.props.dataItem[this.props.field || ''] as string;
            return (
                <td>
                    {eventSource.type == EventSources.Web || eventSource == EventSources.Web ?
                        lookupService.getText("LIST_PORTAL_EVENTS", value) :
                        eventSource.item != undefined ?
                            lookupService.getText("LIST_CABINET_ITEM_EVENTS", value) :
                            lookupService.getTextFromMultipleLookups(["LIST_CABINET_HIGH_PRIORITY_EVENTS",
                                "LIST_CABINET_LOW_PRIORITY_EVENTS"], value)}
                </td>
            );
        }
    }
}


// WEBPACK FOOTER //
// ./src/modules/eventAlarms/components/shared/EventLookupCell.tsx