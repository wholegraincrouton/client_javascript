import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";
import { lookupService } from "src/modules/shared/services";

export function GetItemEventName() {
    return class extends React.Component<GridCellProps> {
        constructor(props: GridCellProps) {
            super(props);
        }

        getStatus() {
            let eventCode = this.props.dataItem['eventCode'];
            return lookupService.getText("LIST_CABINET_ITEM_EVENTS", eventCode)
        }

        render() {
            return (<td>
                {this.getStatus()}
            </td>
            );
        }
    }
}


// WEBPACK FOOTER //
// ./src/modules/reports/components/shared/GridCells/GetItemEventName.tsx