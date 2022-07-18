import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";

export function LocationAddressCell(locationFieldName?: string) {
    return class extends React.Component<GridCellProps> {
        constructor(props: GridCellProps) {
            super(props);
        }
        render() {
            return <td>{this.props.dataItem[locationFieldName || "location"] && this.props.dataItem[locationFieldName || "location"]["address"]}</td>;
        }
    };
}


// WEBPACK FOOTER //
// ./src/modules/shared/components/DataGrid/Cells/LocationAddressCell.tsx