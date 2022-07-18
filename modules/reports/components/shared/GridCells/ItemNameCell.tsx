import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";
import { localise } from "src/modules/shared/services";

export function ItemNameCell() {
    return class extends React.Component<GridCellProps> {
        constructor(props: GridCellProps) {
            super(props);
        }

        format() {
            let itemName = this.props.dataItem["itemName"]
            switch (itemName) {
                case '':
                case undefined:
                case null:
                    return <div>{localise("TEXT_NA")}</div>
                default:
                    return <div>{itemName}</div>
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
// ./src/modules/reports/components/shared/GridCells/ItemNameCell.tsx