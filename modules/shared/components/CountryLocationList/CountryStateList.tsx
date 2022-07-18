import * as React from "react";
import { Input } from "reactstrap";
import { countryService } from "../../services/country.service";
import { localise } from "../../services";

interface Props {
    onChange?: (event: any) => void;
    name?: string;
    value?: string;
    allowAny?: boolean;
    selectedCountry: string;
    disabled?: boolean;
}

export class CountryStateList extends React.Component<Props> {

    constructor(props: Props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e: any) {
        this.props.onChange && this.props.onChange(e);
    }

    render() {
        const { allowAny, value, name, disabled, selectedCountry } = this.props;
        const stateList = countryService.getStateList(selectedCountry).sort((a, b) => a.text > b.text ? 1 : -1);
        const selectedState = stateList.find(s => s.value == value);

        return (
            <Input type="select" name={name} onChange={this.handleChange} disabled={disabled}
                value={(selectedState && selectedState.value) || (allowAny && value == "any" && value) || ""} >
                <option value="" className="d-none"></option>
                {allowAny && <option value="any"> {localise("TEXT_ANY_STATE")} </option>}
                {stateList.map((s, key) => <option value={s.value} key={key}>{s.text}</option>)}
            </Input>
        )
    }
}



// WEBPACK FOOTER //
// ./src/modules/shared/components/CountryLocationList/CountryStateList.tsx