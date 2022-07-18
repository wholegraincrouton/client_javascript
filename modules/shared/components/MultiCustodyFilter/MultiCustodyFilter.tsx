import * as React from "react";
import { Input } from "reactstrap";
import { localise } from "src/modules/shared/services";

interface ItemProps {
    onChange?: (event?: any) => void;
    value: string;
    disable: boolean;
}

class MultiCustodyFilter extends React.Component<ItemProps> {

    constructor(props: ItemProps) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event: any) {
        this.props.onChange && this.props.onChange(event);
    }

    render() {
        const { value, disable } = this.props;

        return (
            <Input disabled={disable} type="select" value={value} name="jobTitles"
                onChange={this.handleChange} >
                {<option value="any"> {localise("TEXT_ANY")} </option>}
                {<option value="yes"> {localise("TEXT_YES")} </option>}
                {<option value="no"> {localise("TEXT_NO")} </option>}
            </Input>
        )
    }
}

export default MultiCustodyFilter;





// WEBPACK FOOTER //
// ./src/modules/shared/components/MultiCustodyFilter/MultiCustodyFilter.tsx