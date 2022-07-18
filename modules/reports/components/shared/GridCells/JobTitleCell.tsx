import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";
import { localise } from "src/modules/shared/services";

export function GetJobTitle(userField : string) {
    return class extends React.Component<GridCellProps> {
        constructor(props: GridCellProps) {
            super(props);
        }

        format() {
            let jobTitle = this.props.dataItem["jobTitle"];
            let value = this.props.dataItem[userField];
            if ((value == undefined || value == '') || (jobTitle == undefined || jobTitle == '')) {
                return <div>{localise("TEXT_NA")}</div>
            }
            return jobTitle;
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
// ./src/modules/reports/components/shared/GridCells/JobTitleCell.tsx