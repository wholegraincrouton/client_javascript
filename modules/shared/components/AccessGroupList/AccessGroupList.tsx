import { accessGroupService } from "./access-group-list-service";
import * as React from "react";
import { localise } from "../../services";
import { Input } from "reactstrap";
import { ListItem } from "../../types/dto";

interface AccessGroupProps {
    value: string;
    name?: string;
    allowAny: boolean;
    onChange?: (event: any) => void;
    includeDeletedData?: boolean;
}

interface LocalState {
    accessGroups: ListItem[]
}

export default class AccessGroupList extends React.Component<AccessGroupProps, LocalState> {

    constructor(props: AccessGroupProps) {
        super(props);
        this.state = { accessGroups: [] }
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event: any) {
        // this.setState({ ...this.state, selectedAccessGroup: event.target.value });
        this.props.onChange && this.props.onChange(event);
    }

    componentDidMount() {
        var scope = this;
        accessGroupService.getAccessGroups(this.props.includeDeletedData).then(((data: ListItem[]) => {
            scope.setState({ accessGroups: data });
        }));
    }

    render() {
        const { accessGroups } = this.state;
        const { value, allowAny, name } = this.props;
        const selectedItem = allowAny && value == 'any' ? { id: 'any' } : this.state.accessGroups.find(item => item.id == value);

        return (
            <Input type="select" value={selectedItem && selectedItem.id} name={name}
                onChange={this.handleChange} >
                {allowAny && <option value="any">{localise("TEXT_ANY")}</option>}
                <option value="" className="d-none"></option>
                {accessGroups.map((l, key) => <option value={l.id} key={key}>{l.name}</option>)}
            </Input>
        )
    }
}


// WEBPACK FOOTER //
// ./src/modules/shared/components/AccessGroupList/AccessGroupList.tsx