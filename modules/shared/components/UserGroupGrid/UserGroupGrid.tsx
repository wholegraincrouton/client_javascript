import * as React from "react";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { Row, Col, Label, Button, CardBody, Card } from "reactstrap";
import { localise } from "../../services";
import { ActionButton } from "../ActionButtons/ActionButtons";
import { Grid, GridColumn, GridHeaderSelectionChangeEvent, GridSortChangeEvent, GridSelectionChangeEvent } from "@progress/kendo-react-grid";
import { UserGroup } from "src/modules/userGroups/types/dto";
import { userGroupService } from "src/modules/userGroups/services/userGroup.service";
import AutoCompleteSearchField from "../AutoCompleteSearchField/AutoCompleteSearchField";

interface Props {
    customerId: string;
    userGroupList: string[];
    onChange: (userGroups: string[]) => void;
    readonly?: boolean;
}

interface State {
    userGroups: GridUserGroup[];
    displayUserGroups: GridUserGroup[];
    filteredUserGroups: GridUserGroup[];
    filter: Filter;
    totalCount: number;
    selectedCount: number;
    sort: SortDescriptor[];
    recordLimit: number;
}

interface Filter {
    userGroupName: string;
}

interface GridUserGroup extends UserGroup {
    rowSelected: boolean;
}

export class UserGroupGrid extends React.Component<Props, State> {
    pageSize: number = 10;
    userGroupNameSuggestions: string[] = [];

    constructor(props: Props) {
        super(props);
        this.refreshGrid = this.refreshGrid.bind(this);
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.onHeaderSelectionChange = this.onHeaderSelectionChange.bind(this);
        this.onSort = this.onSort.bind(this);
        this.onShowMore = this.onShowMore.bind(this);
        this.onUserGroupNameChange = this.onUserGroupNameChange.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.setNameSuggestions = this.setNameSuggestions.bind(this);

        this.state = {
            userGroups: [],
            displayUserGroups: [],
            filteredUserGroups: [],
            filter: {
                userGroupName: ""
            },
            totalCount: 0,
            selectedCount: 0,
            sort: [{ field: "name", dir: "asc" }],
            recordLimit: 0
        }
    }

    componentDidMount() {
        this.refreshGrid();
    }

    refreshGrid() {
        const { customerId, userGroupList } = this.props;

        userGroupService.getUserGroups(customerId).then((result) => {
            let userGroups = result.map(group => {
                return { ...group, rowSelected: userGroupList && userGroupList.some(g => group.id == g) }
            });

            this.setState({
                ...this.state,
                recordLimit: this.pageSize,
                userGroups: userGroups,
                displayUserGroups: userGroups.slice(0, this.pageSize),
                filteredUserGroups: userGroups,
                totalCount: userGroups.length,
                selectedCount: userGroups.filter(u => { return u.rowSelected }).length
            });

            this.setNameSuggestions(userGroups);

        });
    }

    onSelectionChange(event: GridSelectionChangeEvent) {
        const { onChange } = this.props;
        const { userGroups } = this.state;

        const userGroup = userGroups.find(item => item.id == event.dataItem.id);

        if (userGroup)
            userGroup.rowSelected = !userGroup.rowSelected;

        onChange(userGroups.filter(u => u.rowSelected).map(g => g.id || ''));

        this.setState({
            ...this.state,
            userGroups: userGroups,
            selectedCount: userGroups.filter(u => u.rowSelected).length
        })
    }

    onHeaderSelectionChange(event: GridHeaderSelectionChangeEvent) {
        const { onChange } = this.props;
        const { userGroups, totalCount } = this.state;

        const isSelected = event.nativeEvent.target.checked;
        userGroups.forEach(item => item.rowSelected = isSelected);

        onChange(userGroups.filter(u => u.rowSelected).map(g => g.id || ''));

        this.setState({
            ...this.state,
            userGroups: userGroups,
            selectedCount: isSelected ? totalCount : 0
        })
    }

    onSort(e: GridSortChangeEvent) {
        this.setState({
            ...this.state,
            sort: e.sort
        })
    }

    onShowMore() {
        const { filteredUserGroups, recordLimit } = this.state;
        let newRecordLimit = recordLimit + this.pageSize;

        this.setState({
            ...this.state,
            displayUserGroups: filteredUserGroups.slice(0, newRecordLimit),
            recordLimit: newRecordLimit
        })
    }

    onUserGroupNameChange(e: any) {
        this.setState({ ...this.state, filter: { userGroupName: e.target.value } });
    }

    onSearch() {
        const { filter, userGroups } = this.state;
        let filteredUserGroups = userGroups.filter(u =>
            !filter.userGroupName || u.name && u.name.trim().toLowerCase().includes(filter.userGroupName.trim().toLowerCase()));

        this.setState({
            ...this.state,
            filteredUserGroups: filteredUserGroups,
            displayUserGroups: filteredUserGroups.slice(0, this.pageSize),
            recordLimit: this.pageSize
        });
    }

    setNameSuggestions(userGroups: GridUserGroup[]) {
        userGroups.forEach(u => {
            this.userGroupNameSuggestions.push(u.name)
        });
    }

    render() {
        const { readonly } = this.props;
        const { displayUserGroups, filteredUserGroups, filter, selectedCount, totalCount, recordLimit, sort } = this.state;
        const allItemsSelected = displayUserGroups.every(item => item.rowSelected);

        return (
            <div>
                <Row>
                    <Col>
                        <Row>
                            <Col className="mb-2 mt-2 filter-box">
                                <Row>
                                    <Col>
                                        <Label className="system-label mb-0">{localise("TEXT_USER_GROUP") + " " + localise("TEXT_NAME")}</Label>
                                    </Col>
                                </Row>
                                <Row className="mb-2 w-100 search-input-row">
                                    <Col sm={6} lg={4}>
                                        <div className="user-usergroup-search">
                                            <AutoCompleteSearchField name="name"
                                                value={filter.userGroupName}
                                                onChange={this.onUserGroupNameChange}
                                                data={this.userGroupNameSuggestions || []}
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
                                displayUserGroups.length > 0 ?
                                    <Col>
                                        <Row>
                                            <Col>
                                                <small className="grid-selection-count">({selectedCount}/{totalCount} {localise("TEXT_SELECTED")})</small>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <Grid data={orderBy(displayUserGroups, sort)}
                                                    className={readonly ? "disabled-grid" : ""}
                                                    sort={this.state.sort}
                                                    sortable={{ allowUnsort: false, mode: 'single' }}
                                                    onSortChange={this.onSort}
                                                    selectedField="rowSelected"
                                                    onSelectionChange={this.onSelectionChange}
                                                    onHeaderSelectionChange={this.onHeaderSelectionChange}>
                                                    {
                                                        !readonly &&
                                                        <GridColumn field="rowSelected" width="auto" className="checkbox-grid-column"
                                                            headerClassName="checkbox-grid-column" headerSelectionValue={allItemsSelected} />
                                                    }
                                                    <GridColumn field="name" title={localise('TEXT_USER_GROUP')} />
                                                    <GridColumn field="userCount" title={localise('TEXT_USER_COUNT')} />
                                                    <GridColumn field="remark" title={localise('TEXT_DESCRIPTION')} />
                                                </Grid>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                {
                                                    (recordLimit < filteredUserGroups.length) &&
                                                    <Button className="show-more" color="link" onClick={this.onShowMore}>{localise('BUTTON_SHOW_MORE')}</Button>
                                                }

                                            </Col>
                                        </Row>
                                    </Col>
                                    :
                                    <Col>
                                        <Card>
                                            <CardBody>
                                                <div className="text-muted text-center">{localise("ERROR_SEARCH_RESULT_USERGROUPS")}</div>
                                            </CardBody>
                                        </Card>
                                    </Col>
                            }
                        </Row>
                    </Col>
                </Row>
            </div>
        );
    }
}


// WEBPACK FOOTER //
// ./src/modules/shared/components/UserGroupGrid/UserGroupGrid.tsx