import * as React from "react";
import { Input } from "reactstrap";
import { lookupService, localise } from "../../../shared/services";
import { RoleFilter } from "src/modules/shared/components/RoleFilter/RoleFilter";

interface RoleDropDownProps {
    onChange?: (event: React.ChangeEvent) => void;
    name?: string;
    value?: string;
    section?: string;
    disabled?: boolean;
    allowAny?: boolean;
    textAny?: string;
    customerId?: string;
}

export class RoleDropDown extends React.Component<RoleDropDownProps> {

    constructor(props: RoleDropDownProps) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e: React.ChangeEvent) {
        this.props.onChange && this.props.onChange(e);
    }

    render() {
        const { allowAny, textAny, name, disabled, value, section, customerId } = this.props;        

        let lookupList = lookupService.getList("LIST_ROLES", customerId, undefined, section).filter(RoleFilter);
        
        return (
            <Input disabled={disabled} type="select" value={value} name={name}
                onChange={this.handleChange}>
                <option value="" className="d-none"></option>
                {allowAny && <option value="any">{textAny && localise(textAny)}</option>}
                {lookupList.map((l, key) => <option value={l.value} key={key}>{l.text}</option>)}
            </Input>
        )
    }
}


// WEBPACK FOOTER //
// ./src/modules/security/components/RoleDropDown/RoleDropDown.tsx