import * as React from "react";
import { Input, InputProps } from 'reactstrap';

export const NumericInput = (props: InputProps) =>
    <Input {...props} onKeyPress={checkNumericInput}/>


export function checkNumericInput(event: any) {
    if (!(event.which <= 57 && event.which >= 48)) {
        event.preventDefault();
    }
}


// WEBPACK FOOTER //
// ./src/modules/shared/components/NumericInput/NumericInput.tsx