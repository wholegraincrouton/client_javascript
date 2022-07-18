import * as React from 'react';
import { GridCellProps } from "@progress/kendo-react-grid";

export function deleteCell<T>(deleteHandler: (item: T) => void) {
    return class extends React.Component<GridCellProps> {
        render() {          

            const item = this.props.dataItem;
            return (
            <td onClick={(e: any) => { e.preventDefault(); e.stopPropagation(); deleteHandler(item); }}>
                    <i className="fa fa-times text-danger" aria-hidden="true"></i>
                </td>
            );
        }
    }
}


// WEBPACK FOOTER //
// ./src/modules/shared/components/ChildItemGrid/DeleteCell.tsx