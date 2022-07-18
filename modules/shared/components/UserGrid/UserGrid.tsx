import * as React from "react";
import { Row, Col, Card, CardBody, Button, Label } from "reactstrap";
import { Grid, GridColumn, GridSortChangeEvent, GridSelectionChangeEvent, GridHeaderSelectionChangeEvent } from "@progress/kendo-react-grid";
import { userService } from "src/modules/users/services/user.service";
import { localise, permissionService } from "src/modules/shared/services";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { BasicUser } from "../../types/dto";
import { ActionButton } from "../ActionButtons/ActionButtons";
import { LookupTextArrayCell } from "../DataGrid/Cells/LookupTextArrayCell";
import AutoCompleteSearchField from "../AutoCompleteSearchField/AutoCompleteSearchField";

interface Props {
    customerId: string;
    userList: string[];
    onChange: (users: string[]) => void;
    showContextUser?: boolean;
    readonly?: boolean;
    columns: string[];
    webOnly?: boolean;
    title?: string;
    remark?: string;
    required?: boolean;
}

interface State {
    users: GridUser[];
    displayUsers: GridUser[];
    filteredUsers: GridUser[];
    filter: Filter;
    totalCount: number;
    selectedCount: number;
    sort: SortDescriptor[];
    recordLimit: number;
}

interface Filter {
    userName: string;
}

interface GridUser extends BasicUser {
    rowSelected: boolean;
}

export class UserGrid extends React.Component<Props, State> {
    pageSize: number = 10;
    userNameSuggestions: string[] = [];

    constructor(props: Props) {
        super(props);
        this.refreshGrid = this.refreshGrid.bind(this);
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.onHeaderSelectionChange = this.onHeaderSelectionChange.bind(this);
        this.onSort = this.onSort.bind(this);
        this.onShowMore = this.onShowMore.bind(this);
        this.onUserNameChange = this.onUserNameChange.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.setNameSuggestions = this.setNameSuggestions.bind(this);

        this.state = {
            users: [],
            displayUsers: [],
            filteredUsers: [],
            filter: {
                userName: ""
            },
            totalCount: 0,
            selectedCount: 0,
            sort: [{ field: 'name', dir: 'asc' }],
            recordLimit: 0
        }
    }

    componentDidMount() {
        this.refreshGrid();
    }

    componentDidUpdate() {
        //NEED TO REFACTOR
        // const { userList } = this.props;
        // const { users } = this.state;

        // if (users.filter(u => u.rowSelected).length != userList.length)
        //     this.refreshGrid();
    }

    refreshGrid() {
        const { userList, showContextUser, webOnly } = this.props;

        userService.getUsers(this.props.customerId).then((customerUsers) => {
            let users = customerUsers.map(u => {
                let user: GridUser = { ...u, rowSelected: userList && userList.some(id => u.id == id) };
                return user;
            });

            if (showContextUser) {
                let contextUser: GridUser = {
                    id: "KEY_HOLDER", name: localise("TEXT_KEY_HOLDER"),
                    rowSelected: userList.some(id => id == "KEY_HOLDER"),
                    email: '', designation: '', description: '',
                    externalSystemId: '', rolesInCustomer: []
                }
                users.unshift(contextUser);
            }

            if (webOnly) {
                users = users.filter(u => u.rolesInCustomer.some(r => permissionService.webRoles.includes(r)));
                users.forEach(u => u.rolesInCustomer = u.rolesInCustomer.filter(r => permissionService.webRoles.includes(r)));
            }

            this.setState({
                ...this.state,
                recordLimit: this.pageSize,
                users: users,
                displayUsers: orderBy(users, [{ field: 'name', dir: 'asc' }]).slice(0, this.pageSize),
                filteredUsers: users,
                totalCount: users.length,
                selectedCount: users.filter(u => { return u.rowSelected }).length
            });

            this.setNameSuggestions(users);
        });
    }

    onSelectionChange(event: GridSelectionChangeEvent) {
        const { onChange } = this.props;
        const { users } = this.state;

        const user = users.find(u => u.id == event.dataItem.id);

        if (user)
            user.rowSelected = !user.rowSelected;

        onChange(users.filter(u => u.rowSelected).map(u => u.id));

        this.setState({
            ...this.state,
            users: users,
            selectedCount: users.filter(u => u.rowSelected).length
        });
    }

    onHeaderSelectionChange(event: GridHeaderSelectionChangeEvent) {
        const { onChange } = this.props;
        const { users, totalCount } = this.state;

        const isSelected = event.nativeEvent.target.checked;
        users.forEach(u => u.rowSelected = isSelected);

        onChange(users.filter(u => u.rowSelected).map(u => u.id));

        this.setState({
            ...this.state,
            users: users,
            selectedCount: isSelected ? totalCount : 0
        });
    }

    onSort(e: GridSortChangeEvent) {
        this.setState({
            ...this.state,
            sort: e.sort
        })
    }

    onShowMore() {
        const { filteredUsers, recordLimit, sort } = this.state;
        let newRecordLimit = recordLimit + this.pageSize;

        this.setState({
            ...this.state,
            displayUsers: orderBy(filteredUsers, sort).slice(0, newRecordLimit),
            recordLimit: newRecordLimit
        })
    }

    onUserNameChange(e: any) {
        this.setState({ ...this.state, filter: { userName: e.target.value } });
    }

    onSearch() {
        const { filter, sort, users } = this.state;

        let filteredUsers = users.filter(u =>
            !filter.userName || u.name && u.name.trim().toLowerCase().includes(filter.userName.trim().toLowerCase()));

        this.setState({
            ...this.state,
            filteredUsers: filteredUsers,
            displayUsers: orderBy(filteredUsers, sort).slice(0, this.pageSize),
            recordLimit: this.pageSize
        });
    }

    setNameSuggestions(users: GridUser[]) {
        users.forEach(u => {
            this.userNameSuggestions.push(u.name)
        });
    }

    render() {
        const { readonly, columns, title, remark, required } = this.props;
        const { totalCount, selectedCount, sort, recordLimit, displayUsers, filteredUsers, filter } = this.state;
        const allItemsSelected = displayUsers.every(item => item.rowSelected);
        let cols = columns || [];

        return (
            <Row>
                <Col>
                    <Row>
                        <Col className="mb-2 mt-2 filter-bo">
                            <Row>
                                <Col>
                                    <Label className="system-label mb-0">{title || (localise("TEXT_USER") + " " + localise("TEXT_NAME"))} {required && '*'}</Label>
                                </Col>
                            </Row>
                            {
                                remark &&
                                <Row className="mb-2">
                                    <Col>
                                        <small className="text-muted">{remark}</small>
                                    </Col>
                                </Row>
                            }
                            <Row className="mb-2 w-100 search-input-row">
                                <Col sm={6} lg={4} className='pr-0'>
                                    <div className="user-usergroup-search">
                                        <AutoCompleteSearchField name="name"
                                            value={filter.userName}
                                            onChange={this.onUserNameChange}
                                            data={this.userNameSuggestions || []}
                                        />
                                    </div>
                                </Col>
                                <Col sm={4} lg={4}>
                                    <ActionButton textKey="BUTTON_SEARCH" color="primary" onClick={this.onSearch}
                                        icon="fa-search" disableDefaultMargin={true} />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        {
                            displayUsers.length > 0 ?
                                <Col>
                                    <Row>
                                        <Col>
                                            <small className="grid-selection-count">({selectedCount}/{totalCount} {localise("TEXT_SELECTED")})</small>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <div className="user-access-grid">
                                                <Grid data={orderBy(displayUsers, sort)}
                                                    className={readonly ? "disabled-grid" : ""}
                                                    selectedField="rowSelected"
                                                    onSelectionChange={this.onSelectionChange}
                                                    onHeaderSelectionChange={this.onHeaderSelectionChange}
                                                    sort={sort}
                                                    sortable={{ allowUnsort: false, mode: 'single' }}
                                                    onSortChange={this.onSort}>
                                                    {
                                                        !readonly &&
                                                        <GridColumn field="rowSelected" width="auto" className="checkbox-grid-column"
                                                            headerClassName="checkbox-grid-column" headerSelectionValue={allItemsSelected} />
                                                    }
                                                    <GridColumn field="name" title={localise("TEXT_USER") + " " + localise("TEXT_NAME")} />
                                                    {
                                                        cols.includes("designation") &&
                                                        <GridColumn field="designation" title={localise("TEXT_DESIGNATION")} />
                                                    }
                                                    {
                                                        cols.includes("roles") &&
                                                        <GridColumn field="rolesInCustomer" title={localise("TEXT_ROLES")} cell={LookupTextArrayCell('LIST_ROLES')} />
                                                    }
                                                    {
                                                        cols.includes("description") &&
                                                        <GridColumn field="description" title={localise("TEXT_DESCRIPTION")} />
                                                    }
                                                </Grid>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            {
                                                (recordLimit < filteredUsers.length) &&
                                                <Button className="show-more" color="link" onClick={this.onShowMore}>{localise('BUTTON_SHOW_MORE')}</Button>
                                            }
                                        </Col>
                                    </Row>
                                </Col>
                                :
                                <Col>
                                    <Card>
                                        <CardBody>
                                            <div className="text-muted text-center">{localise("ERROR_SEARCH_RESULT_USERS")}</div>
                                        </CardBody>
                                    </Card>
                                </Col>
                        }
                    </Row>
                </Col>
            </Row>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/shared/components/UserGrid/UserGrid.tsx