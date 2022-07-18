import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";
import { lookupService } from "../../../shared/services";
import { User } from "../../types/dto";

export function UserCustomerRolesCell(highlightField?: string) {
    return class extends React.Component<GridCellProps> {
        getRolesText() {
            const { customerRoles } = this.props.dataItem as User;

            if (customerRoles && customerRoles.length > 0) {
                const roles = customerRoles.map(cr => lookupService.getText("LIST_ROLES", cr.role));
                return roles.join('\n');
            }
            return '';
        }

        render() {
            return (
                <td className={highlightField && this.props.dataItem[highlightField] ? "highlight-cell" : ""}>
                    {this.getRolesText()}
                </td>
            );
        }
    }
}



// WEBPACK FOOTER //
// ./src/modules/users/components/UserManagement/UserCustomerRolesCell.tsx