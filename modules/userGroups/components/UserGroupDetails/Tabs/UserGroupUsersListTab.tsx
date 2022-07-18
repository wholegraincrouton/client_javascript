import * as React from "react";
import { Row, Col, Card, CardBody, Label } from "reactstrap";
import { GridSortChangeEvent, Grid, GridColumn, GridCellProps, GridSelectionChangeEvent } from "@progress/kendo-react-grid";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { localise, lookupService } from "src/modules/shared/services";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { DateTimeFormatCell } from "src/modules/shared/components/DataGrid";
import { ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { BasicUser } from "src/modules/shared/types/dto";
import { userService } from "src/modules/users/services/user.service";
import { UserGroup } from "src/modules/userGroups/types/dto";
import { NumericInput } from "src/modules/shared/components/NumericInput/NumericInput";
import { AutoComplete } from "@progress/kendo-react-dropdowns";
import { permissionService } from '../../../../shared/services/permission.service';
import { RoleDropDown } from "src/modules/security/components/RoleDropDown/RoleDropDown";

interface State {
    users: GridUser[];
    filteredItems: GridUser[];
    selectedUsers: string[];
    sort: SortDescriptor[];
    filter: Filter;
}

interface Filter {
    name: string;
    role: string;
    email: string;
    mobileNumber: string;
}

interface GridUser extends BasicUser {
    rowSelected: boolean;
    rowDisabled: boolean;
}

export class UserGroupUsersListTab extends React.Component<DetailFormProps, State> {
    constructor(props: DetailFormProps) {
        super(props);

        this.onSort = this.onSort.bind(this);
        this.onRowRender = this.onRowRender.bind(this);
        this.onUserNameChange = this.onUserNameChange.bind(this);
        this.onRoleFilterChange = this.onRoleFilterChange.bind(this);
        this.onUserEmailChange = this.onUserEmailChange.bind(this);
        this.onMobileNumberChange = this.onMobileNumberChange.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.onHeaderSelectionChange = this.onHeaderSelectionChange.bind(this);
        this.onUserChange = this.onUserChange.bind(this);

        this.state = {
            users: [],
            filteredItems: [],
            selectedUsers: [],
            sort: [{ field: "name", dir: "asc" }],
            filter: {
                name: "",
                role: "any",
                email: "",
                mobileNumber: ""
            }
        }
    }

    componentDidMount() {
        const userGroup: UserGroup = this.props.item;
        userService.getUsers(userGroup.customerId, false).then(data => {
            const gridUsers = data.map(user => {
                return {
                    ...user,
                    rowSelected: userGroup.userList && userGroup.userList.includes(user.id),
                    rowDisabled: user.externalSystemId != undefined
                }
            });

            this.setState({
                users: gridUsers,
                filteredItems: gridUsers,
                selectedUsers: userGroup.userList
            });
        });
    }

    onSelectionChange(event: GridSelectionChangeEvent) {

        const { users, selectedUsers } = this.state;
        const user = users.find(c => c.id == event.dataItem.id);

        var selectedList: string[] = selectedUsers.map(u => { return u });

        if (user) {
            user.rowSelected = !user.rowSelected;

            if (user.rowSelected) {
                selectedList.push(user.id);
            }
            else {
                let index = selectedList.indexOf(user.id);
                selectedList.splice(index, 1);
            }

            this.onUserChange(selectedList);

            this.setState({
                ...this.state,
                selectedUsers: selectedList,
                users
            });
        }
    }

    onHeaderSelectionChange(event: any) {
        const isSelected = event.nativeEvent.target.checked;
        const { users } = this.state;
        users.forEach(u => u.rowSelected = isSelected);
        var selectedList: string[] = [];
        if (isSelected) {
            users.forEach(u => selectedList.push(u.id));
        } else {
            selectedList = [];
        }
        this.onUserChange(selectedList);
        this.setState({ users, selectedUsers: selectedList });
    }

    onUserChange(userList: string[]) {
        this.props.change('userList', userList);
    }

    //#region Filter changes

    onUserNameChange(e: any) {
        this.setState({ ...this.state, filter: { ...this.state.filter, name: e.target.value } });
    }

    onRoleFilterChange(e: any) {
        this.setState({ ...this.state, filter: { ...this.state.filter, role: e.target.value } });
    }

    onUserEmailChange(e: any) {
        this.setState({ ...this.state, filter: { ...this.state.filter, email: e.target.value } });
    }

    onMobileNumberChange(e: any) {
        this.setState({ ...this.state, filter: { ...this.state.filter, mobileNumber: e.target.value } });
    }

    onSearch() {
        const { filter, users } = this.state;

        let filteredItems = users.filter(i =>
            (!filter.name || i.name.trim().toLowerCase().includes(filter.name.trim().toLowerCase())) &&
            (!filter.email || i.email && i.email.trim().toLowerCase().includes(filter.email.trim().toLowerCase())) &&
            (!filter.mobileNumber || i.mobileNumber && i.mobileNumber.trim().includes(filter.mobileNumber.trim())) &&
            (filter.role == 'any' || i.rolesInCustomer.includes(filter.role)));

        this.setState({ ...this.state, filteredItems: filteredItems });
    }

    //#endregion

    onSort(e: GridSortChangeEvent) {
        this.setState({
            ...this.state,
            sort: e.sort
        })
    }

    onRowRender(tr: any) {
        return React.cloneElement(tr, {
            ...tr.props,
            className: tr.props.className + ' non-selectable-row'
        }, tr.props.children);
    }

    render() {
        const { item } = this.props;
        const { sort, filter, filteredItems, users } = this.state;
        const filteredNames = users.filter(u => u.name.toLowerCase().includes(filter.name.toLowerCase())).map(u => u.name);
        const filteredEmails = users.filter(u => u.email && u.email.toLowerCase().includes(filter.email.toLowerCase())).map(u => u.email);
        const allItemsSelected = users.every(user => user.rowSelected);
        const selectedUserCount = users.filter(user => user.rowSelected).length;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');

        return (
            <>
                <Row className="mb-2">
                    <Col>
                        <small className="text-muted">{localise("REMARK_USER_LIST")}</small>
                    </Col>
                </Row>
                <Row className="mb-3 filter-box">
                    <Col sm={8} md={7} lg={9} xl={10}>
                        <Row>
                            <Col sm={6} lg={4} xl={3} className="filter-column">
                                <Row>
                                    <Col>
                                        <Label className="system-label mb-0">{localise("TEXT_NAME")}</Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <AutoComplete data={filteredNames} value={filter.name} className="user-group-name-suggest"
                                            popupSettings={{ className: 'user-group-name-suggest-popover' }} onChange={this.onUserNameChange} />
                                    </Col>
                                </Row>
                            </Col>
                            <Col sm={6} lg={4} xl={3} className="filter-column">
                                <Row>
                                    <Col>
                                        <Label className="system-label mb-0">{localise("TEXT_ROLE")}</Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <RoleDropDown allowAny={true} textAny="TEXT_ANY"
                                            value={filter.role} onChange={this.onRoleFilterChange} />
                                    </Col>
                                </Row>
                            </Col>
                            <Col sm={6} lg={4} xl={3} className="filter-column">
                                <Row>
                                    <Col>
                                        <Label className="system-label mb-0">{localise("TEXT_EMAIL")}</Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <AutoComplete data={filteredEmails} value={filter.email} className="user-group-email-suggest"
                                            popupSettings={{ className: 'user-group-email-suggest-popover' }} onChange={this.onUserEmailChange} />
                                    </Col>
                                </Row>
                            </Col>
                            <Col sm={6} lg={4} xl={3} className="filter-column">
                                <Row>
                                    <Col>
                                        <Label className="system-label mb-0">{localise("TEXT_MOBILE")}</Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <NumericInput onChange={this.onMobileNumberChange} value={filter.mobileNumber} />
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Col>
                    <Col sm={4} md={5} lg={3} xl={2} className="text-right pl-0">
                        <ActionButton textKey="BUTTON_SEARCH" color="primary" onClick={this.onSearch}
                            icon="fa-search" disableDefaultMargin={true} />
                    </Col>
                </Row>
                <hr />
                {
                    filteredItems.length > 0 ?
                        <>
                            <Row>
                                <Col>
                                    <small className="grid-selection-count">({selectedUserCount}/{users.length} {localise("TEXT_SELECTED")})</small>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <div className="largeScreen">
                                        <Grid
                                            className={!isPermittedToEdit ? "disabled-grid" : ""}
                                            data={orderBy(filteredItems, sort)}
                                            sort={this.state.sort}
                                            sortable={{ allowUnsort: false, mode: 'single' }}
                                            onSortChange={this.onSort}
                                            rowRender={this.onRowRender}
                                            selectedField="rowSelected"
                                            onSelectionChange={this.onSelectionChange}
                                            onHeaderSelectionChange={this.onHeaderSelectionChange}>
                                            <GridColumn field="rowSelected" width="auto" className="checkbox-grid-column"
                                                headerClassName="checkbox-grid-column" headerSelectionValue={allItemsSelected} />
                                            <GridColumn field="name" title={localise("TEXT_NAME")} />
                                            <GridColumn field="rolesInCustomer" sortable={false} title={localise("TEXT_ROLES")} cell={BasicUserCustomerRolesCell()} />
                                            <GridColumn field="designation" title={localise("TEXT_DESIGNATION")} />
                                            <GridColumn field="mobileNumber" title={localise("TEXT_MOBILE")} />
                                            <GridColumn field="email" title={localise("TEXT_EMAIL")} />
                                            <GridColumn field="updatedOnUtc" title={localise("TEXT_LAST_UPDATE")} cell={DateTimeFormatCell()} />
                                            <GridColumn field="updatedByName" title={localise("TEXT_LAST_UPDATED_BY")} />
                                        </Grid>
                                    </div>
                                    <div className="smallScreen">
                                        <Grid
                                            className={!isPermittedToEdit ? "disabled-grid" : ""}
                                            data={orderBy(filteredItems, sort)}
                                            sort={this.state.sort}
                                            sortable={{ allowUnsort: false, mode: 'single' }}
                                            onSortChange={this.onSort}
                                            rowRender={this.onRowRender}
                                            selectedField="rowSelected"
                                            onSelectionChange={this.onSelectionChange}
                                            onHeaderSelectionChange={this.onHeaderSelectionChange}>
                                            <GridColumn field="rowSelected" width="auto" className="checkbox-grid-column"
                                                headerClassName="checkbox-grid-column" headerSelectionValue={allItemsSelected} />
                                            <GridColumn field="name" title={localise("TEXT_NAME")} />
                                            <GridColumn field="rolesInCustomer" sortable={false} title={localise("TEXT_ROLES")} cell={BasicUserCustomerRolesCell()} />
                                            <GridColumn field="designation" title={localise("TEXT_DESIGNATION")} />
                                        </Grid>
                                    </div>
                                </Col>
                            </Row>
                        </>
                        :
                        <Card className="text-muted text-center mb-0">
                            <CardBody>
                                <span>{localise("ERROR_SEARCH_RESULT")}</span>
                            </CardBody>
                        </Card>
                }
            </>
        );
    }
}

export function BasicUserCustomerRolesCell(highlightField?: string) {
    return class extends React.Component<GridCellProps> {
        getRolesText() {
            const { rolesInCustomer } = this.props.dataItem as BasicUser;

            if (rolesInCustomer && rolesInCustomer.length > 0) {
                const roles = rolesInCustomer.map(cr => lookupService.getText("LIST_ROLES", cr));
                return roles.join('\n');
            }
            return '';
        }

        render() {
            return (
                <td className={highlightField && this.props.dataItem[highlightField] ? "highlight-cell" : ""}>
                    {this.getRolesText()}
                </td>
            );
        }
    }
}


// WEBPACK FOOTER //
// ./src/modules/userGroups/components/UserGroupDetails/Tabs/UserGroupUsersListTab.tsx