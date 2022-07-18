import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";
import { lookupService, localise } from "../../../shared/services";

export function RoleLookupTextCell() {
    return class extends React.Component<GridCellProps> {
        constructor(props: GridCellProps) {
            super(props);
        }

        render() {

            let value = this.props.dataItem[this.props.field || ''];
            return (
                <td>
                    {value == "*" ? localise("TEXT_ALLROLE") : lookupService.getText("LIST_ROLES", value)}
                </td>
            );
        }
    }
}


export function RoleListLookupTextCell() {
    return class extends React.Component<GridCellProps> {
        constructor(props: GridCellProps) {
            super(props);
        }

        render() {

            let roles = this.props.dataItem[this.props.field || ''] as string[];
            return (
                <td>
                    {roles.map(item => lookupService.getText("LIST_ROLES", item)).join(", ")}
                </td>
            );
        }
    }
}


// WEBPACK FOOTER //
// ./src/modules/security/components/RoleLookupTextCell/RoleLookupTextCell.tsx