import * as React from "react";
import { Input } from "reactstrap";
import { countryService } from "../../services/country.service";
import { localise } from "../../services";

interface Props {
    onChange?: (event: any) => void;
    name?: string;
    value?: string;
    allowAny?: boolean;
    permissionSuffix?: string;
    disabled?: boolean;
}

export class CountryList extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e: any) {
        this.props.onChange && this.props.onChange(e);
    }

    render() {
        const { allowAny, value, name, disabled } = this.props;

        const countryList = countryService.getCountryList().sort((a, b) => a.text > b.text ? 1 : -1);
        const selectedCountry = countryList.find(c => c.value == value);

        return (
            <Input type="select" value={(selectedCountry && selectedCountry.value) || (allowAny && value == "any" && value) || ""} name={name}
                onChange={this.handleChange} disabled={disabled}>
                <option value="" className="d-none"></option>
                {allowAny && <option value="any"> {localise("TEXT_ANY_COUNTRY")} </option>}
                {countryList.map((c, key) => <option value={c.value} key={key}>{c.text}</option>)}
            </Input>
        )
    }
}



// WEBPACK FOOTER //
// ./src/modules/shared/components/CountryLocationList/CountryList.tsx