import * as React from "react";
import { Input } from "reactstrap";

interface ItemProps {
    selectedCustomerId: string;
    onChange?: (event: any) => void;
    value: string;
    disable: boolean;
}

class JobTitleFilterList extends React.Component<ItemProps> {
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
            <Input type="text" name="jobTitles" onChange={this.handleChange} disabled={disable} value={value} />
        )
    }
}

export default JobTitleFilterList;





// WEBPACK FOOTER //
// ./src/modules/dashboard/shared/JobTitleFilterList.tsx