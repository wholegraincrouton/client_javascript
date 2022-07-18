import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";
import { localise } from "src/modules/shared/services";

export function GetCabinetAddress() {
    return class extends React.Component<GridCellProps> {
        constructor(props: GridCellProps) {
            super(props);
        }

        format() {
            let value = this.props.dataItem["cabinetAddress"]
            if (value == null || value == '') {
                return <div>{localise("TEXT_NOT_FOUND")}</div>
            }
            return value;
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
// ./src/modules/reports/components/shared/GridCells/GetCabinetAddress.tsx