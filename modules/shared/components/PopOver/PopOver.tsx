import * as React from 'react';
import { Popover, PopoverHeader, PopoverBody } from "reactstrap";

export const PopOver = (props: any) => {
    const [popoverOpen, setPopoverOpen] = React.useState(false);
    const toggle = () => setPopoverOpen(!popoverOpen);

    return (
        <Popover {...props} isOpen={popoverOpen} toggle={toggle}>
            {props.header && <PopoverHeader>{props.header}</PopoverHeader>}
            {props.body && <PopoverBody>{props.body}</PopoverBody>}
        </Popover>
    );
}



// WEBPACK FOOTER //
// ./src/modules/shared/components/PopOver/PopOver.tsx