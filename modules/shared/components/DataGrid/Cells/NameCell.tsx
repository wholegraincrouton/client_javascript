import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";
import "../data-grid.css"
import { localise } from "src/modules/shared/services";

export function NameCell() {
    return class extends React.Component<GridCellProps> {
        constructor(props: GridCellProps) {
            super(props);
        }

        format() {
            let value = this.props.dataItem[this.props.field || '']
            switch (value) {
                case null:
                case '':
                    return localise("TEXT_NA")
                default:
                    return <div>{value}</div>
            }
        }
        
        render() {
            return (<td>
                {this.format()}
            </td>
            );
        }
    }
}


// WEBPACK FOOTER //
// ./src/modules/shared/components/DataGrid/Cells/NameCell.tsx