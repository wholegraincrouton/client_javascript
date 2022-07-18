import { MapPopover } from "src/modules/shared/components/MapPopover/MapPopover";
import { Location } from "src/modules/shared/types/dto";
import { GridCellProps } from "@progress/kendo-react-grid";
import * as React from "react";
import { localise } from "src/modules/shared/services";

export function CabinetLocationCell() {
    return class extends React.Component<GridCellProps> {
        constructor(props: GridCellProps) {
            super(props);
        }

        render() {
            let cabinetLocation: Location = this.props.dataItem["cabinetLocation"]
            return (
                <td>
                    {
                        cabinetLocation.latitude && cabinetLocation.longitude ?
                            <MapPopover imageURL="/images/cabinetLocationIcon.png"
                                location={[cabinetLocation.longitude, cabinetLocation.latitude]} />
                                :
                                <span>{localise("TEXT_NO_ADDRESS_FOUND")}</span>
                    }
                </td>
            );
        }
    }
}


// WEBPACK FOOTER //
// ./src/modules/reports/components/shared/GridCells/CabinetLocationCell.tsx