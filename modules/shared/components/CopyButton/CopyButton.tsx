import React, { useState } from 'react';
import { Button } from "reactstrap";
import { localise } from '../../services';

export function CopyButton(props: any) {
    const [isCopied, toggleCopy] = useState(false);

    function onClick() {
        navigator.clipboard.writeText(props.value);
        toggleCopy(true);
        setTimeout(() => { toggleCopy(false) }, 3000);
    }

    return (
        <Button {...props} color={"secondary"} title={localise(isCopied ? 'Copied' : 'Copy')} onClick={onClick}>
            <i className={`fas fa-${isCopied ? 'check' : 'copy'}`} />
        </Button>
    );
}


// WEBPACK FOOTER //
// ./src/modules/shared/components/CopyButton/CopyButton.tsx