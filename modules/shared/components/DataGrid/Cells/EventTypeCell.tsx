import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";
import { CabinetEventNameConst } from "src/modules/cabinet/types/dto";
import "../data-grid.css"

export function EventTypeCell() {
    return class extends React.Component<GridCellProps> {
        constructor(props: GridCellProps) {
            super(props);
        }

        getStatus() {
            switch (this.props.dataItem["eventCode"]) {
                case CabinetEventNameConst.ItemReturnedWithinValidTime:
                case CabinetEventNameConst.ItemReturnedAfterValidTime:
                case CabinetEventNameConst.ItemReturnOverrideWithinValidTime:
                case CabinetEventNameConst.ItemReturnOverrideAfterValidTime:
                case CabinetEventNameConst.MultiCustodyItemReturnWithinValidTime:
                case CabinetEventNameConst.MultiCustodyItemReturnAfterValidTime:
                case CabinetEventNameConst.MulticustodyItemReturnOverrideWithinValidTime:
                case CabinetEventNameConst.MulticustodyItemReturnOverrideAfterValidTime:
                    return <div><span><i className="fas fa-square-full fa-lg color-green"></i></span></div>

                case CabinetEventNameConst.ItemRetrieved:
                case CabinetEventNameConst.MultiCustodyItemRetreived:
                    return <div><span><i className="fas fa-square-full fa-lg color-grey"></i></span></div>

                case CabinetEventNameConst.ItemOverdue:
                    return <div><span><i className="fas fa-square-full fa-lg color-red"></i></span></div>

                default:
                    return <div><span><i className="fas fa-square-full fa-lg color-orange"></i></span></div>
            }
        }

        render() {
            return (<td>
                {this.getStatus()}
            </td>
            );
        }
    }
}


// WEBPACK FOOTER //
// ./src/modules/shared/components/DataGrid/Cells/EventTypeCell.tsx