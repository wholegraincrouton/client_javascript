import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";
import { lookupService } from "src/modules/shared/services";

export function EventLookupCell() {
    return class extends React.Component<GridCellProps> {
        constructor(props: GridCellProps) {
            super(props);
        }
        render() {
            return (
                <td>
                    {lookupService.getTextFromMultipleLookups(["LIST_CABINET_HIGH_PRIORITY_EVENTS",
                        "LIST_CABINET_LOW_PRIORITY_EVENTS", "LIST_CABINET_ITEM_EVENTS"], this.props.dataItem[this.props.field || ''],
                        this.props.dataItem.customerId, this.props.dataItem.culture, this.props.dataItem.section)}
                </td>
            );
        }
    }
}


// WEBPACK FOOTER //
// ./src/modules/shared/components/DataGrid/Cells/EventLookupCell.tsx