import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";
import { lookupService } from "src/modules/shared/services";

export function GetCabinetEventName() {
    return class extends React.Component<GridCellProps> {
        constructor(props: GridCellProps) {
            super(props);
        }

        getStatus() {
            let eventCode = this.props.dataItem['eventCode'];
            let eventCodeText = lookupService.getTextFromMultipleLookups(['LIST_CABINET_HIGH_PRIORITY_EVENTS','LIST_CABINET_LOW_PRIORITY_EVENTS'], eventCode);
            return eventCodeText;
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
// ./src/modules/reports/components/shared/GridCells/GetCabinetEventName.tsx