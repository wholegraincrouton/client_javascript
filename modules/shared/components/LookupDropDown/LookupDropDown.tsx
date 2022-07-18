import * as React from "react";
import { Input } from "reactstrap";
import { lookupService, localise } from "../../services";
import { LookupItem } from "../../types/dto";

interface LookupDropDownProps {
    onChange?: (event: React.ChangeEvent) => void;
    name?: string;
    customerId?: string;
    culture?: string;
    section?: string;
    lookupKey: string;
    value?: string;
    disabled?: boolean;
    allowAny?: boolean;
    textAny?: string;
    allowBlank?: boolean;
    textBlank?: string;
    allowAll?: boolean;
    textAll?: string;
    parentLookupKey?: string;
    filter?: (item: LookupItem, index?: number, items?: LookupItem[]) => boolean;
    additionalLookups?: string[];
    showRemarks?: boolean;
    tooltip?: string;
}

export class LookupDropDown extends React.Component<LookupDropDownProps> {

    constructor(props: LookupDropDownProps) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e: React.ChangeEvent) {
        this.props.onChange && this.props.onChange(e);
    }

    render() {
        const { allowAll, textAll, allowBlank, textBlank, allowAny, textAny, name, disabled, value,
            lookupKey, customerId, culture, section, parentLookupKey, filter, additionalLookups, showRemarks, tooltip } = this.props;

        let lookupList = lookupService.getList(lookupKey, customerId, culture, section);

        if (additionalLookups) {
            additionalLookups.forEach(key => {
                let list = lookupService.getList(key, customerId, culture, section);
                lookupList = lookupList.concat(list);
            });
            lookupList.sort((a, b) => {
                return (!a.text || !b.text) ? 0 : (a.text == b.text) ? 0 : (a.text < b.text) ? -1 : 1
            });
        }

        if (parentLookupKey)
            lookupList = lookupList.filter(lookup => lookup.value != parentLookupKey);

        if (filter)
            lookupList = lookupList.filter(filter);

        return (
            <Input disabled={disabled} type="select" value={value} name={name} title={tooltip}
                onChange={this.handleChange}>
                {allowBlank ?
                    <option value="">{textBlank && localise(textBlank)}</option> :
                    <option value="" className="d-none">{textBlank && localise(textBlank)}</option>}
                {allowAll && <option value="*">{textAll && localise(textAll)}</option>}
                {allowAny && <option value="any">{textAny && localise(textAny)}</option>}
                {lookupList.map((l, key) =>
                    <option value={l.value} key={key}>{l.text}{showRemarks && l.remark && ` - (${l.remark})`}</option>
                )}
            </Input>
        )
    }
}


// WEBPACK FOOTER //
// ./src/modules/shared/components/LookupDropDown/LookupDropDown.tsx