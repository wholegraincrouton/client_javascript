import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";
import { BasicUser } from "src/modules/shared/types/dto";

export function UserNameCell(users: BasicUser[]) {
    return class extends React.Component<GridCellProps> {
        render() {
            const { field, dataItem } = this.props;
            let user = users && users.find(u => u.id == dataItem[field || '']);

            return <td>{user && user.name}</td>;
        }
    }
}


// WEBPACK FOOTER //
// ./src/modules/shared/components/DataGrid/Cells/UserNameCell.tsx