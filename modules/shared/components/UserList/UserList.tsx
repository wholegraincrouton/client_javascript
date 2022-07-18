import * as React from "react";
import { Input } from "reactstrap";

import { ListItem } from "src/modules/shared/types/dto";
import { userService } from "src/modules/users/services/user.service";
import { localise } from "../../services";

interface Props {
    customerId: string;
    onChange?: (value: string, name: string) => void;
    name?: string;
    disabled?: boolean;
    value?: string;
    additionalEntries?: ListItem[];
    allowBlank?: boolean;
    textBlank?: string;
}

interface State {
    list: ListItem[];
}
export default class UserList extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            list: this.props.additionalEntries != undefined ? this.props.additionalEntries : []
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event: any) {
        var userName = event.target.options[event.target.selectedIndex].text;
        this.props.onChange && this.props.onChange(event.target.value, userName);
    }

    componentDidMount() {
        this.props.customerId && userService.getUsers(this.props.customerId).then((users) => {
            let list = this.state.list;
            users.forEach((user) => {
                list.push({ id: user.id, name: user.name });
            });
            this.setState({ list: list });
        });
    }

    render() {
        const { name, disabled, value, allowBlank, textBlank } = this.props;
        const { list } = this.state;
        const selectedItem = list.find(item => item.id == value);
        return (
            <Input type="select" value={(selectedItem && selectedItem.id) || ''} name={name}
                onChange={this.handleChange} disabled={disabled}>
                {allowBlank ?
                    <option value="">{textBlank && localise(textBlank)}</option> :
                    <option value="" className="d-none">{textBlank && localise(textBlank)}</option>}
                {list.map((l, key) => <option value={l.id} key={key}>{l.name}</option>)}
            </Input>
        )
    }
}



// WEBPACK FOOTER //
// ./src/modules/shared/components/UserList/UserList.tsx