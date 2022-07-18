import * as React from "react";
import { Row, Col, Card, CardBody, Button, Label, Input } from "reactstrap";
import { Grid, GridColumn, GridSortChangeEvent, GridSelectionChangeEvent } from "@progress/kendo-react-grid";
import { userService } from "src/modules/users/services/user.service";
import { localise } from "src/modules/shared/services";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { BasicUser } from "../../types/dto";
import { NullableTextCell } from "../DataGrid/Cells/NullableTextCell";
import './user-radio-grid.css';
import { ActionButton } from "../ActionButtons/ActionButtons";

interface Props {
    customerId: string;
    value: string;
    onChange: (userId: string) => void;
    readonly?: boolean;
}

interface State {
    users: GridUser[];
    displayUsers: GridUser[];
    filteredUsers: GridUser[];
    filter: Filter;
    sort: SortDescriptor[];
    recordLimit: number;
}

interface Filter {
    userName: string;
}

interface GridUser extends BasicUser {
    rowSelected: boolean;
}

export class UserRadioGrid extends React.Component<Props, State> {
    pageSize: number = 10;

    constructor(props: Props) {
        super(props);
        this.onSelect = this.onSelect.bind(this);
        this.onSort = this.onSort.bind(this);
        this.onShowMore = this.onShowMore.bind(this);
        this.onUserNameChange = this.onUserNameChange.bind(this);
        this.onSearch = this.onSearch.bind(this);

        this.state = {
            users: [],
            displayUsers: [],
            filteredUsers: [],
            filter: {
                userName: ""
            },
            sort: [{ field: 'name', dir: 'asc' }],
            recordLimit: 0
        }
    }

    componentDidMount() {
        const { value, customerId } = this.props;

        customerId && userService.getUsers(customerId).then((customerUsers) => {
            let users = customerUsers.map(u => {
                let user: GridUser = { ...u, rowSelected: u.id == value };
                return user;
            });

            this.setState({
                ...this.state,
                recordLimit: this.pageSize,
                users: users,
                displayUsers: orderBy(users, [{ field: 'name', dir: 'asc' }]).slice(0, this.pageSize),
                filteredUsers: users
            });
        });
    }

    onSelect(event: GridSelectionChangeEvent) {
        const { onChange } = this.props;
        const { users } = this.state;
        const id = event.dataItem.id;

        users.forEach(u => {
            u.rowSelected = u.id == id;
        });

        onChange(id);

        this.setState({
            ...this.state,
            users: users
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

    render() {
        const { readonly } = this.props;
        const { sort, recordLimit, displayUsers, filteredUsers, filter } = this.state;

        return (
            <>
                <Row>
                    <Col className="mb-3 mt-2 filter-box">
                        <Row>
                            <Col>
                                <Label className="system-label mb-0" style={{fontSize: 14}}>{localise("TEXT_USER") + " " + localise("TEXT_NAME")}</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={6} lg={4}>
                                <Input onChange={this.onUserNameChange} value={filter.userName} />
                            </Col>
                            <Col sm={4} lg={4}>
                                <ActionButton textKey="BUTTON_SEARCH" color="primary" onClick={this.onSearch}
                                    icon="fa-search" disableDefaultMargin={true} />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row className="user-radio-grid">
                    {
                        displayUsers.length > 0 ?
                            <Col>
                                <Row>
                                    <Col>
                                        <Grid data={orderBy(displayUsers, sort)} className={readonly ? "disabled-grid" : ""}
                                            selectedField="rowSelected" onSelectionChange={this.onSelect}
                                            sort={sort} onSortChange={this.onSort} sortable={{ allowUnsort: false, mode: 'single' }} >
                                            <GridColumn field="rowSelected" width={34} />
                                            <GridColumn field="name" title={localise("TEXT_USER") + " " + localise("TEXT_NAME")} />
                                            <GridColumn field="designation" title={localise("TEXT_DESIGNATION")} />
                                            <GridColumn field="email" title={localise("TEXT_EMAIL")} cell={NullableTextCell()} />
                                        </Grid>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        {
                                            (recordLimit < filteredUsers.length) &&
                                            <Button className="show-more" style={{fontSize: 12}} color="link" onClick={this.onShowMore}>{localise('BUTTON_SHOW_MORE')}</Button>
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
            </>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/shared/components/UserRadioGrid/UserRadioGrid.tsx