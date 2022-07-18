import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";
import { lookupService } from "../../../shared/services";
import { TemplateChannels } from "src/modules/template/types/dto";

export function KeyLookupTextCell() {
    return class extends React.Component<GridCellProps> {
        constructor(props: GridCellProps) {
            super(props);

        }

        render() {
            let channel = this.props.dataItem.channel;
            let value = this.props.dataItem[this.props.field || ''];
            return (
                <td>
                    {channel == TemplateChannels.Email ? lookupService.getText("LIST_EMAIL_TEMPLATES", value) : lookupService.getText("LIST_SMS_TEMPLATES", value)}
                </td>
            );
        }
    }
}


// WEBPACK FOOTER //
// ./src/modules/template/components/KeyLookupTextCell/KeyLookupTextCell.tsx