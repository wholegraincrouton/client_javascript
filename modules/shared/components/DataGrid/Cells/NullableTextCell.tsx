import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";
import { localise } from "src/modules/shared/services";

export function NullableTextCell(highlightField?: string) {
    return class extends React.Component<GridCellProps> {
        constructor(props: GridCellProps) {
            super(props);
        }

        render() {
            return (
                <td className={highlightField && this.props.dataItem[highlightField] ? "highlight-cell" : ""}>
                    {this.props.dataItem[this.props.field || ''] || localise("TEXT_NOT_APPLICABLE")}
                </td>
            );
        }
    }
}


// WEBPACK FOOTER //
// ./src/modules/shared/components/DataGrid/Cells/NullableTextCell.tsx