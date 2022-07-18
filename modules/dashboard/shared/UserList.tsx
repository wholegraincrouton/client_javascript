import * as React from "react";
import { userService } from "src/modules/users/services/user.service";
import { BasicUser } from "src/modules/shared/types/dto";
import { AutoComplete } from '@progress/kendo-react-dropdowns';
import { localise } from "src/modules/shared/services";

interface Props {
    onChange?: (event?: any) => void;
    name?: string;
    value: string;
    customerId: string;
    role: string;
    allowAny?: boolean;
    textAny?: string;
    allowSystem?: boolean;
    includeDeletedData?: boolean;
}

interface State {
    users: BasicUser[];
    filteredUsers: BasicUser[];
    value: string;
}

export default class UserListByRoles extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);

        this.state = {
            value: '',
            users: [],
            filteredUsers: []
        };
    }

    handleChange(event: any) {
        this.setState({
            value: event.target.value,
            users: this.state.users,
            filteredUsers: this.filterData(event.target.value)
        });
        if (event.target.value == '') {
            this.props.onChange && this.props.onChange({ name: this.props.name, value: 'any' });
        }
        else if (this.state.users.some(u => u.name == event.target.value)) {
            let user = this.state.users.find(u => u.name == event.target.value)
            if (user) {
                this.props.onChange && this.props.onChange({ name: this.props.name, value: user.id });
            }
        }
    }

    componentDidMount() {
        this.props.customerId != '' && userService.getUsers(this.props.customerId, this.props.includeDeletedData).then((users) => {
            let list: BasicUser[] = [];

            {
                users.forEach((user) => {
                    list.push(user);
                });
            }

            if (this.props.allowSystem) {
                var systemUser: BasicUser = {
                    id: '0',
                    name: localise("TEXT_SYSTEM"),
                    email: '',
                    description: '',
                    designation: '',
                    externalSystemId: '',
                    rolesInCustomer: []
                };
                list.push(systemUser)
            }

            this.setState({ users: list, filteredUsers: list });
        });
    }

    listNoDataRender = (element: any) => {
        const noData = (
            localise("TEXT_NO_DATA_FOUND")
        );

        return React.cloneElement(element, { ...element.props }, noData);
    }

    filterData(value: string) {
        const data = this.state.users;
        let filteredData = data.filter(d => d.name.toLowerCase().includes(value.toLowerCase()));
        return filteredData;
    }

    render() {
        const { role, textAny, allowAny } = this.props;

        let filteredUsers = this.state.filteredUsers;
        let selectedUser;
        if (this.props.value) {
            let user = this.state.users.find(u => u.id == this.props.value)
            selectedUser = user && user.name;
        }

        if (role != 'any') {
            filteredUsers = filteredUsers.filter((user: BasicUser) => {
                return user.rolesInCustomer.indexOf(role) >= 0;
            });
        }

        let showAllowAny = allowAny || false;
        return (
            <AutoComplete data={filteredUsers} required={!showAllowAny} style={{ width: "100%", fontSize: 14 }}
                popupSettings={{ className: "suggestions-container" }}
                value={selectedUser || this.state.value} textField="name" listNoDataRender={this.listNoDataRender}
                onChange={this.handleChange} placeholder={showAllowAny ? localise(textAny || "TEXT_ANY_USER") : ""} />
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/dashboard/shared/UserList.tsx