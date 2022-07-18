import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";
import { localise } from "src/modules/shared/services";

export function ActiveStatusCell() {
    return class extends React.Component<GridCellProps> {
        render() {
            const { field, dataItem } = this.props;
            const isActive = dataItem[field || ''];
            
            return (
                <td>
                    {localise(isActive ? "TEXT_ACTIVE" : "TEXT_INACTIVE")}
                </td>
            );
        }
    }
}


// WEBPACK FOOTER //
// ./src/modules/shared/components/DataGrid/Cells/ActiveStatusCell.tsx