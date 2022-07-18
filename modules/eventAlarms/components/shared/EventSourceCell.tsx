import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";
import { lookupService } from "../../../shared/services";
import { EventSources } from "../../types/dto";
import { CabinetBasicDetails } from "src/modules/cabinet/types/dto";
import { Site } from "src/modules/sites/types/dto";

export function EventSourceCell(sites: Site[], cabinets: CabinetBasicDetails[]) {
    return class extends React.Component<GridCellProps> {
        render() {
            const { dataItem, field } = this.props;
            const eventSource = dataItem[field || ''];

            let name;

            if (eventSource.type == EventSources.Site) {
                let site = sites && sites.find(cg => cg.id == eventSource.id);
                name = site && site.name;
            }
            else if (eventSource.type == EventSources.Cabinet) {
                let cabinet = cabinets && cabinets.find(c => c.id == eventSource.id);
                name = cabinet && cabinet.name;
            }

            return (
                <td>
                    {lookupService.getText("LIST_EVENT_SOURCES", eventSource.type || eventSource)}
                    {name && ` (${name})`}
                </td>
            );
        }
    }
}


// WEBPACK FOOTER //
// ./src/modules/eventAlarms/components/shared/EventSourceCell.tsx