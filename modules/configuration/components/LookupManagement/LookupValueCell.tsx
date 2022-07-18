import * as React from 'react';
import { GridCellProps } from '@progress/kendo-react-grid';

export class LookupValueCell extends React.Component<GridCellProps> {

    constructor(props: GridCellProps) {
        super(props);
        this.createChildren = this.createChildren.bind(this);
    }

    createChildren() {
        const { props } = this;
        const truncateLength: number = 25;

        let children = (props.dataItem[props.field || ''] as string[]).join(", ");

        if (children.length <= truncateLength)
            return children;

        children = children.substring(0, truncateLength).trim();
        const lastChar = children[children.length - 1];

        if (lastChar == "," || lastChar == "_")
            children = children.slice(0, -1);

        return `${children}...`;
    }

    render() {
        return (
            <td>
                {this.createChildren()}
            </td>
        );
    }
}


// WEBPACK FOOTER //
// ./src/modules/configuration/components/LookupManagement/LookupValueCell.tsx