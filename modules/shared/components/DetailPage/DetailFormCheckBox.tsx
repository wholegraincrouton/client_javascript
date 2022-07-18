import * as React from 'react';
import { Input, Label } from 'reactstrap';
import { localise } from 'src/modules/shared/services';

export const DetailFormCheckBox = (props: any) => {

    function onChange(event: any) {
        let e = {
            target: {
                value: event.target.checked
            }
        };
        props.onChange && props.onChange(e);
    }

    return (
        <div style={{ marginLeft: 20 }}>
            <Label>
                <Input type="checkbox" onChange={(e: any) => onChange(e)}
                    checked={props.value} disabled={props.isDisabled}/>
                {localise(props.fieldName)}
            </Label>
        </div>
    );
}


// WEBPACK FOOTER //
// ./src/modules/shared/components/DetailPage/DetailFormCheckBox.tsx