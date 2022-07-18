import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";
import { localise } from "src/modules/shared/services";

export function GetUserName() {
    return class extends React.Component<GridCellProps> {
        constructor(props: GridCellProps) {
            super(props);
        }

        format() {
            let userName = this.props.dataItem["userName"];
            if (userName == undefined || userName == '' || userName == null) {
                return <div>{localise("TEXT_NA")}</div>
            }
            return userName;
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
// ./src/modules/reports/components/shared/GridCells/GetUserName.tsx