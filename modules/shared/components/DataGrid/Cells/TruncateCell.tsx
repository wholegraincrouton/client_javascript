import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";

export function TruncateCell(maxLength: number) {
    return class extends React.Component<GridCellProps> {
        constructor(props: GridCellProps) {
            super(props);
        }

        render() {

            let text = this.props.dataItem[this.props.field || ''] as string;
            text = (text && text.trim()) || "";
            if (text.length > maxLength + 3)
                text = text.substring(0, maxLength) + "...";

            return <td>{text}</td>
        }
    }
}


// WEBPACK FOOTER //
// ./src/modules/shared/components/DataGrid/Cells/TruncateCell.tsx