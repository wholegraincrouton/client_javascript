import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";
import { localise } from "src/modules/shared/services";

export function UserStatusCell() {
    return class extends React.Component<GridCellProps> {
        constructor(props: GridCellProps) {
            super(props);
        }

        render() {
            const { dataItem, field } = this.props;
            let color = dataItem[field || ''] ? "green" : "red";
            let key = dataItem[field || ''] ? "TEXT_ACTIVE" : "TEXT_INACTIVE";

            return (
                <td>
                    <i style={{ color: color, margin: 5 }} className="fas fa-circle"></i>
                    <span>{localise(key)}</span>
                </td>
            );
        }
    }
}



// WEBPACK FOOTER //
// ./src/modules/users/components/UserManagement/UserStatusCell.tsx