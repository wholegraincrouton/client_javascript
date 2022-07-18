import * as React from "react";
import { Input } from "reactstrap";
import { localise } from "src/modules/shared/services";
import { LookupItem } from "src/modules/shared/types/dto";

interface ItemProps {
    onChange?: (event?: any) => void;
    value: string;
    itemStates: LookupItem[]
}

class CabinetItemStatusFilterList extends React.Component<ItemProps> {

    constructor(props: ItemProps) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event: any) {
        this.props.onChange && this.props.onChange(event);
    }

    render() {
        const { value, itemStates } = this.props;

        return (
            <Input type="select" value={value} name="cabinetItemStatus"
                onChange={this.handleChange} >
                {<option value="any"> {localise("TEXT_ANY")} </option>}
                <option value="" className="d-none"></option>
                {itemStates && itemStates.map((l, key) => <option value={l.value} key={key}>{l.text}</option>)}
            </Input>
        )
    }
}

export default CabinetItemStatusFilterList;





// WEBPACK FOOTER //
// ./src/modules/dashboard/shared/CabinetItemStatusFilterList.tsx