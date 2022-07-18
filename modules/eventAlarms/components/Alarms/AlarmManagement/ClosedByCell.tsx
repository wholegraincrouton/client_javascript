import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";
import { localise } from "src/modules/shared/services";
import { AlarmStatus } from "src/modules/eventAlarms/types/dto";
import { alarmsService } from "src/modules/eventAlarms/services/alarms.service";

export function ClosedByCell() {
    return class extends React.Component<GridCellProps> {
        constructor(props: GridCellProps) {
            super(props);
        }

        render() {
            let value = this.props.dataItem[this.props.field || ''];
            let status = this.props.dataItem["status"];

            return (
                <td>
                    {!value || status == AlarmStatus.Active ? localise("TEXT_NA") :
                        status == AlarmStatus.ClosedByCabinetEvent ?
                            alarmsService.getClosedByEventText(value) : value}
                </td>
            );
        }
    }
}


// WEBPACK FOOTER //
// ./src/modules/eventAlarms/components/Alarms/AlarmManagement/ClosedByCell.tsx