import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";
import { localise } from "src/modules/shared/services";

export function DefaultTypeCell() {
    return class extends React.Component<GridCellProps> {
        constructor(props: GridCellProps) {
            super(props);
        }

        render() {
            let isDefault = this.props.dataItem["isDefault"];

            return (
                <td>
                    {isDefault ? localise("TEXT_DEFAULT") : localise("TEXT_CUSTOM")}
                </td>
            );
        }
    }
}


// WEBPACK FOOTER //
// ./src/modules/shared/components/DataGrid/Cells/DefaultTypeCell.tsx