import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";
import { AlarmActivityBar } from "../AlarmActivityBar";

export function AlarmActivityCell() {
    return class extends React.Component<GridCellProps> {
        render() {
            const severityLevel: number = this.props.dataItem["severityLevel"];
            const startTime: Date = this.props.dataItem["startTime"];
            const escalationTimes: Date[] = this.props.dataItem["escalationTimes"];

            return (
                <td>
                    <AlarmActivityBar severityLevel={severityLevel} startTime={startTime}
                        escalationTimes={escalationTimes} />
                </td>
            );
        }
    }
}



// WEBPACK FOOTER //
// ./src/modules/reports/components/shared/GridCells/AlarmActivityCell.tsx