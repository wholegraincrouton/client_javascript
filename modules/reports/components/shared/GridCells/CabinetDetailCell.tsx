import { Location } from "src/modules/shared/types/dto";
import { GridCellProps } from "@progress/kendo-react-grid";
import * as React from "react";

export function CabinetDetailCell() {
    return class extends React.Component<GridCellProps> {
        render() {
            const cabinetName: string = this.props.dataItem["cabinetName"];
            const cabinetLocation: Location = this.props.dataItem["cabinetLocation"];

            return (
                <td>
                    <b>{cabinetName}</b>
                    {
                        cabinetLocation && cabinetLocation.address &&
                        <div>{cabinetLocation.address}</div>
                    }
                </td>
            );
        }
    }
}


// WEBPACK FOOTER //
// ./src/modules/reports/components/shared/GridCells/CabinetDetailCell.tsx