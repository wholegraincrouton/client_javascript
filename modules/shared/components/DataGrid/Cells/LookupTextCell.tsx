import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";
import { lookupService } from "../../../services";

export function LookupTextCell(lookupKey: string, referenceType?: string, alternateField?: string, nullValue?: string) {
    return class extends React.Component<GridCellProps> {
        constructor(props: GridCellProps) {
            super(props);
        }
        render() {
            const field = alternateField || this.props.field || '';
            return (
                <td>
                    {
                        this.props.dataItem[field] == '' || this.props.dataItem[field] == null ? nullValue || '' :
                            referenceType == undefined ?
                                lookupService.getText(lookupKey, this.props.dataItem[field], this.props.dataItem.customerId,
                                    this.props.dataItem.culture, this.props.dataItem.section) :
                                referenceType == 'remark' ?
                                    lookupService.getRemark(lookupKey, this.props.dataItem[field], this.props.dataItem.customerId,
                                        this.props.dataItem.culture, this.props.dataItem.section) : ''
                    }
                </td>
            );
        }
    }
}


// WEBPACK FOOTER //
// ./src/modules/shared/components/DataGrid/Cells/LookupTextCell.tsx