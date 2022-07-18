import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";

export function PhoneNumberCell() {
    return class extends React.Component<GridCellProps> {
        constructor(props: GridCellProps) {
            super(props);
        }

        getPhoneNumber(){
            const mobileNumber = this.props.dataItem[this.props.field || ''];
            return mobileNumber ? mobileNumber : "";
        }
    
        render() {
            return (
                <td>
                    {this.getPhoneNumber()}                    
                </td>
            );
        }
    }
}



// WEBPACK FOOTER //
// ./src/modules/shared/components/DataGrid/Cells/PhoneNumberCell.tsx