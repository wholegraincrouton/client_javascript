import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";
import { lookupService } from "../../../services";

export function LookupTextArrayCell(lookupKey: string) {
    return class extends React.Component<GridCellProps> {
        render() {
            const data = this.props.dataItem[this.props.field || ''] as string[];

            return (
                <td>
                    {data.map(d => lookupService.getText(lookupKey, d)).join(', ')}
                </td>
            );
        }
    }
}


// WEBPACK FOOTER //
// ./src/modules/shared/components/DataGrid/Cells/LookupTextArrayCell.tsx