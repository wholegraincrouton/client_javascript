import * as React from 'react';
import { Col, Row, Card, CardBody, Button, Label, Input } from 'reactstrap';
import { localise, permissionService, lookupService } from 'src/modules/shared/services';
import { Grid, GridColumn, GridSelectionChangeEvent, GridHeaderSelectionChangeEvent, GridSortChangeEvent } from '@progress/kendo-react-grid';
import { LookupTextCell } from 'src/modules/shared/components/DataGrid';
import { SortDescriptor, orderBy } from '@progress/kendo-data-query';
import { PermissionConfig } from 'src/modules/security/types/dto';
import "./role-grid.css";
import { ActionButton } from '../ActionButtons/ActionButtons';

interface Props {
    customerId: string;
    roleList: string[];
    onChange: (roles: string[]) => void;
    readonly?: boolean;
}

interface State {
    roles: GridRole[];
    displayRoles: GridRole[];
    filteredRoles: GridRole[];
    filter: Filter;
    totalCount: number;
    selectedCount: number;
    sort: SortDescriptor[];
    recordLimit: number;
}

interface Filter {
    roleName: string;
}
interface RoleIdMapping {
    id: string;
    roleName: string;    
}

interface GridRole extends PermissionConfig {
    rowSelected: boolean;
}

export class RoleGrid extends React.Component<Props, State> {
    pageSize: number = 10;
    roleIdMappingList: RoleIdMapping[] = [];

    constructor(props: Props) {
        super(props);
        this.refreshGrid = this.refreshGrid.bind(this);
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.onHeaderSelectionChange = this.onHeaderSelectionChange.bind(this);
        this.onSort = this.onSort.bind(this);
        this.onShowMore = this.onShowMore.bind(this);
        this.onRoleNameChange = this.onRoleNameChange.bind(this);
        this.onSearch = this.onSearch.bind(this);

        this.state = {
            roles: [],
            displayRoles: [],
            filteredRoles: [],
            filter: {
                roleName: ""
            },
            totalCount: 0,
            selectedCount: 0,
            sort: [{ field: 'role', dir: 'asc' }],
            recordLimit: 0
        }
    }

    componentDidMount() {
        this.refreshGrid();
    }

    componentDidUpdate() {
        //NEED TO REFACTOR
        // const { roleList } = this.props;
        // const { roles } = this.state;

        // if (roles.filter(u => u.rowSelected).length != roleList.length)
        //     this.refreshGrid();
    }

    refreshGrid() {
        const { customerId, roleList } = this.props;

        permissionService.getConfiguredRoles(customerId).then((customerRoles) => {
            let roles = customerRoles.map(role => {
                return { ...role, rowSelected: roleList && roleList.some(r => role.role == r) };
            });
            
            this.setState({
                ...this.state,
                recordLimit: this.pageSize,
                roles: roles,
                displayRoles: orderBy(roles, [{ field: 'role', dir: 'asc' }]).slice(0, this.pageSize),
                filteredRoles: roles,
                totalCount: roles.length,
                selectedCount: roles.filter(u => { return u.rowSelected }).length
            });

            roles.forEach(r => {
                let roleName = lookupService.getText('LIST_ROLES', r.role || '', r.customerId);
                this.roleIdMappingList.push({
                    roleName: roleName || '',
                    id: r.id
                });
            });

        });
    }

    onSelectionChange(event: GridSelectionChangeEvent) {
        const { onChange } = this.props;
        const { roles } = this.state;

        const role = roles.find(item => item.id == event.dataItem.id);

        if (role)
            role.rowSelected = !role.rowSelected;

        onChange(roles.filter(r => r.rowSelected).map(r => r.role || ''));

        this.setState({
            ...this.state,
            roles: roles,
            selectedCount: roles.filter(r => r.rowSelected).length
        })
    }

    onHeaderSelectionChange(event: GridHeaderSelectionChangeEvent) {
        const { onChange } = this.props;
        const { roles, totalCount } = this.state;

        const isSelected = event.nativeEvent.target.checked;
        roles.forEach(item => item.rowSelected = isSelected);

        onChange(roles.filter(r => r.rowSelected).map(r => r.role || ''));

        this.setState({
            ...this.state,
            roles: roles,
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
        const { filteredRoles, recordLimit, sort } = this.state;
        let newRecordLimit = recordLimit + this.pageSize;

        this.setState({
            ...this.state,
            displayRoles: orderBy(filteredRoles, sort).slice(0, newRecordLimit),
            recordLimit: newRecordLimit
        })
    }

    onRoleNameChange(e: any) {
        this.setState({ ...this.state, filter: { roleName: e.target.value } });
    }

    onSearch() {
        const { filter, sort, roles} = this.state;
        let filteredIdList : string[]  = [];

        this.roleIdMappingList.filter(r => 
            !filter.roleName || r.roleName.trim().toLowerCase().includes(filter.roleName.trim().toLowerCase()))
            .forEach(item => filteredIdList.push(item.id));

        let filteredRoles = roles.filter(r => filteredIdList.includes(r.id));

        this.setState({
            ...this.state,
            filteredRoles: filteredRoles,
            displayRoles: orderBy(filteredRoles, sort).slice(0, this.pageSize),
            recordLimit: this.pageSize
        });
    }

    render() {
        const { readonly } = this.props;
        const { displayRoles, filteredRoles, selectedCount: selectedRoleCount, totalCount: totalRoleCount, recordLimit, filter } = this.state;
        const allItemsSelected = displayRoles.every(item => item.rowSelected);

        return (
            <div>
                <Row>
                    <Col className="mb-2 mt-2 filter-box">
                        <Row>
                            <Col>
                                <Label className="system-label mb-0">{localise("TEXT_ROLE") + " " + localise("TEXT_NAME")}</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={6} lg={4}>
                                <Input onChange={this.onRoleNameChange} value={filter.roleName} />
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
                        displayRoles.length > 0 ?
                            <Col>
                                <Row>
                                    <Col>
                                        <small className="grid-selection-count">({selectedRoleCount}/{totalRoleCount} {localise("TEXT_SELECTED")})</small>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Grid data={displayRoles}
                                            className={readonly ? "disabled-grid" : ""}
                                            sort={this.state.sort}
                                            sortable={{ allowUnsort: false, mode: 'single' }}
                                            onSortChange={this.onSort}
                                            selectedField="rowSelected"
                                            onSelectionChange={this.onSelectionChange}
                                            onHeaderSelectionChange={this.onHeaderSelectionChange}>
                                            <GridColumn field="rowSelected" width="auto" className="checkbox-grid-column"
                                                headerClassName="checkbox-grid-column" headerSelectionValue={allItemsSelected} />
                                            <GridColumn field="role" title={localise('TEXT_ROLE')} cell={LookupTextCell('LIST_ROLES')} />
                                            <GridColumn field="userCount" title={localise('TEXT_USER_COUNT')} />
                                            <GridColumn title={localise('TEXT_DESCRIPTION')} cell={LookupTextCell("LIST_ROLES", "remark", "role")}
                                                sortable={false} headerClassName="non-clickable" />
                                        </Grid>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        {
                                            (recordLimit < filteredRoles.length) &&
                                            <Button className="show-more" color="link" onClick={this.onShowMore}>{localise('BUTTON_SHOW_MORE')}</Button>
                                        }

                                    </Col>
                                </Row>
                            </Col>
                            :
                            <Col>
                                <Card>
                                    <CardBody>
                                        <div className="text-muted text-center">{localise("ERROR_SEARCH_RESULT_ROLES")}</div>
                                    </CardBody>
                                </Card>
                            </Col>
                    }
                </Row>
            </div>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/shared/components/RoleGrid/RoleGrid.tsx