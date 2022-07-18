import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";

export function MultiCustodyCell() {
    return class extends React.Component<GridCellProps> {
        constructor(props: GridCellProps) {
            super(props);
        }

        render() {
            let isMultiCustody = this.props.dataItem["multiCustody"];
            return (
                <td>
                    {
                        isMultiCustody && <div className="ml-2"><i className="far fa-check-circle fa-lg color-green"></i></div>
                    }
                </td>
            );
        }
    }
}


// WEBPACK FOOTER //
// ./src/modules/shared/components/DataGrid/Cells/MultiCustodyCell.tsx