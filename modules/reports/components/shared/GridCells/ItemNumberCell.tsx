import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";
import { localise } from "src/modules/shared/services";

export function ItemNumberCell() {
    return class extends React.Component<GridCellProps> {
        constructor(props: GridCellProps) {
            super(props);
        }

        format() {
            let itemNumber = this.props.dataItem["itemNumber"]
            switch (itemNumber) {
                case 0:
                    return <div>{localise("TEXT_NA")}</div>
                default:
                    return <div>{itemNumber}</div>
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
// ./src/modules/reports/components/shared/GridCells/ItemNumberCell.tsx