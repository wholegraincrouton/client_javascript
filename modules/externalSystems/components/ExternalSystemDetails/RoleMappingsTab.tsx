import * as React from "react";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { Row, Col, Label, Input, Card, CardBody } from "reactstrap";
import { localise, configService, lookupService, permissionService } from "src/modules/shared/services";
import { Grid, GridColumn, GridSortChangeEvent, GridCellProps } from "@progress/kendo-react-grid";
import { orderBy, SortDescriptor } from "@progress/kendo-data-query";
import { ExternalSystem, ExternalUserGroup, IntegrationStatus } from "../../types/dto";
import { ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { externalSystemsService } from "../../services/externalSystems.service";
import { RoleDropDown } from "src/modules/security/components/RoleDropDown/RoleDropDown";
import { alertActions } from "src/modules/shared/actions/alert.actions";
import "./external-system-detail.css";
import { AutoComplete } from "@progress/kendo-react-dropdowns";

interface State {
    userGroups: GridUserGroup[];
    filteredUserGroups: GridUserGroup[];
    filterText: string;
    isAutoSyncEnabled: boolean;
    isButtonDisabled: boolean;
    sort: SortDescriptor[];
}

interface GridUserGroup {
    id: string;
    name: string;
    description: string;
    role?: string;
    isSelected: boolean;
}

export class RoleMappingsTab extends React.Component<DetailFormProps, State> {
    constructor(props: DetailFormProps) {
        super(props);
        this.toggleConfigurations = this.toggleConfigurations.bind(this);
        this.onSortChange = this.onSortChange.bind(this);
        this.onFieldSelectionChange = this.onFieldSelectionChange.bind(this);
        this.onAllFieldSelectionChange = this.onAllFieldSelectionChange.bind(this);
        this.onRoleChange = this.onRoleChange.bind(this);
        this.onSyncButtonClick = this.onSyncButtonClick.bind(this);
        this.onSearchFilterChange = this.onSearchFilterChange.bind(this);
        this.onSearch = this.onSearch.bind(this);

        let externalSystem = props.item as ExternalSystem;

        let userGroups = (externalSystem.userGroups && externalSystem.userGroups.map((r) => {
            return {
                id: r.id,
                name: r.name,
                description: r.description,
                role: r.role,
                isSelected: externalSystem.selectedUserGroups.some(sr => sr == r.id)
            };
        }));

        this.state = {
            userGroups: userGroups || [],
            filteredUserGroups: userGroups || [],
            filterText: '',
            isAutoSyncEnabled: externalSystem.isAutoSyncEnabled,
            isButtonDisabled: false,
            sort: [{ field: 'name', dir: 'asc' }]
        };
    }

    componentDidUpdate(prevProps: DetailFormProps) {
        let userGroups = prevProps.item.userGroups as ExternalUserGroup[];
        let selectedUserGroups = prevProps.item.selectedUserGroups;

        if (JSON.stringify(userGroups.map(r => r.id)) != JSON.stringify(this.state.userGroups.map(r => r.id))) {
            let groups = (userGroups && userGroups.map((r: any) => {
                return {
                    id: r.id,
                    name: r.name,
                    description: r.description,
                    role: r.role,
                    isSelected: selectedUserGroups.some((sr: any) => sr == r.id)
                };
            }));

            this.setState({
                ...this.state,
                userGroups: groups || [],
                filteredUserGroups: groups || [],
                filterText: ''
            });
        }
    }

    toggleConfigurations() {
        this.props.change("isAutoSyncEnabled", !this.state.isAutoSyncEnabled);

        this.setState({
            ...this.state,
            isAutoSyncEnabled: !this.state.isAutoSyncEnabled
        });
    }

    onSyncButtonClick(event: any) {
        event.preventDefault();
        this.setState({
            isButtonDisabled: true
        });

        setTimeout(() => this.setState({ ...this.state, isButtonDisabled: false }), 10000);

        externalSystemsService.syncExternalData(this.props.item.id)
            .then(() => {
                alertActions.showSuccess('REMARK_DATA_SYNC_SUCCESS')
                this.props.reload();
            });
    }

    onSortChange(event: GridSortChangeEvent) {
        this.setState({ ...this.state, sort: event.sort })
    }

    onFieldSelectionChange(event: any) {
        let { filteredUserGroups } = this.state;
        var dataItem = event.dataItem as GridUserGroup;
        let selected = event.syntheticEvent.target.checked

        let selectedMapping = filteredUserGroups.find(m => m.id == dataItem.id);

        if (selectedMapping) {
            selectedMapping.isSelected = selected;

            if (!selected) {
                selectedMapping.role = undefined;
            }
            this.setState({
                ...this.state,
                filteredUserGroups: filteredUserGroups
            });
            this.props.change("userGroups", filteredUserGroups);
            this.props.change("selectedUserGroups", filteredUserGroups.filter(r => r.isSelected).map(r => r.id));
        }
    }

    onAllFieldSelectionChange(event: any) {
        let { filteredUserGroups } = this.state;
        let selected = event.syntheticEvent.target.checked
        filteredUserGroups.forEach(mapping => {
            mapping.isSelected = selected;

            if (!selected) {
                mapping.role = undefined;
            }
        });
        this.setState({
            ...this.state,
            filteredUserGroups: filteredUserGroups
        });
        this.props.change("userGroups", filteredUserGroups);
        this.props.change("selectedUserGroups", filteredUserGroups.filter(r => r.isSelected).map(r => r.id));
    }

    onRoleChange(event: any, id: string) {
        let { userGroups } = this.state;
        let selectedField = userGroups.find(m => m.id == id);

        if (selectedField) {
            selectedField.role = event.target.value;
            this.setState({
                ...this.state,
                userGroups: userGroups
            });
        }
        this.props.change("userGroups", userGroups);
    }

    RoleCell(onRoleChange: (event: any, systemField: string) => void) {
        return class extends React.Component<GridCellProps> {
            render() {
                return (
                    <td>
                        <RoleDropDown value={this.props.dataItem.role} disabled={!this.props.dataItem.isSelected}
                            onChange={(e) => onRoleChange(e, this.props.dataItem.id)} />
                    </td>
                );
            }
        }
    }

    RoleDescriptionCell() {
        return class extends React.Component<GridCellProps> {
            render() {
                const role = this.props.dataItem['role' || ''];

                return (
                    <td>
                        {
                            role && lookupService.getRemark('LIST_ROLES', role)
                        }
                    </td>
                );
            }
        }
    }

    onSearchFilterChange(e: any) {
        this.setState({ ...this.state, filterText: e.target.value });
    }

    onSearch() {
        const { filterText, userGroups } = this.state;
        let filteredUserGroups = userGroups.filter(
            i => !filterText || i.name.trim().toLowerCase().includes(filterText.trim().toLowerCase()));
        this.setState({ ...this.state, filteredUserGroups: filteredUserGroups });
    }

    render() {
        const { dirty, item } = this.props;
        const { userGroups, filteredUserGroups, filterText, sort, isAutoSyncEnabled, isButtonDisabled } = this.state;
        const filteredNames = userGroups.filter(u => u.name.toLowerCase().includes(filterText.toLowerCase())).map(u => u.name);
        const isAllSelected = filteredUserGroups && filteredUserGroups.length != 0 && filteredUserGroups.every(i => i.isSelected);
        const isSyncButtonDisabled = dirty || item.integrationStatus == IntegrationStatus.Inactive || isButtonDisabled;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');

        return (
            <div className="role-mappings-tab">
                <Row className="form-group pt-2 mb-0">
                    <Col lg={8} className="pt-2">
                        <Row>
                            <Col className="ml-4">
                                <Label className="mb-0">
                                    <Input type="checkbox" name="isAutoSyncEnabled" checked={isAutoSyncEnabled}
                                        onChange={this.toggleConfigurations} disabled={!isPermittedToEdit} />
                                    {localise("TEXT_ENABLE_AUTO_SYNC")}
                                </Label>
                            </Col>
                        </Row>
                        <Row className="mt-1">
                            <Col className="ml-1">
                                <small className="text-muted">{localise('REMARK_ENABLE_AUTO_SYNC')}</small>
                            </Col>
                        </Row>
                    </Col>
                    <Col lg={4} className="sync-data">
                        <Row>
                            <Col>
                                <ActionButton key="importbtn" textKey="BUTTON_SYNC_DATA" color="primary" icon="fas fa-redo-alt fa-flip-horizontal"
                                    onClick={this.onSyncButtonClick} disabled={isSyncButtonDisabled || !isPermittedToEdit} />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <small className="text-muted">{localise("REMARK_SYNC_DATA_BUTTON")}</small>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <hr />
                <Row className="mb-2">
                    <Col className="filter-column">
                        <Row>
                            <Col>
                                <Label className="system-label mb-0">{localise("TEXT_NAME")}</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={6}>
                                <AutoComplete data={filteredNames} value={filterText} className="user-group-name-suggest w-100"
                                    popupSettings={{ className: 'user-group-name-suggest-popover' }} onChange={this.onSearchFilterChange} />
                            </Col>
                            <Col sm={6}>
                                <ActionButton textKey="BUTTON_SEARCH" color="primary" onClick={this.onSearch}
                                    icon="fa-search" disableDefaultMargin={true} />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <small className="text-muted">{localise("REMARK_ROLE_MAPPINGS")}</small>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {
                            filteredUserGroups.length > 0 ?
                                <>
                                    <small className="color-blue"> ({filteredUserGroups.filter(i => i.isSelected).length || 0}/{filteredUserGroups.length} {localise('TEXT_SELECTED')}) </small>
                                    <Grid data={orderBy(filteredUserGroups, sort)}
                                        sort={sort} onSortChange={this.onSortChange}
                                        sortable={{ allowUnsort: false, mode: 'single' }}
                                        selectedField="isSelected"
                                        onSelectionChange={this.onFieldSelectionChange}
                                        onHeaderSelectionChange={this.onAllFieldSelectionChange} 
                                        className={isPermittedToEdit ? "" : "disabled-grid"}>
                                        <GridColumn field="isSelected" className="checkbox-grid-column" headerClassName="checkbox-grid-column"
                                            headerSelectionValue={isAllSelected} />
                                        <GridColumn field="name" title={localise('TEXT_ACTIVE_DIRECTORY_GROUP')} />
                                        <GridColumn field="description" title={localise('TEXT_DESCRIPTION')} />
                                        <GridColumn field="thirdPartyField" title={`${configService.getConfigurationValue("PRODUCT_NAME")} ${localise("TEXT_ROLE")}`} cell={this.RoleCell(this.onRoleChange)} />
                                        <GridColumn field="description" title={localise('TEXT_DESCRIPTION')} cell={this.RoleDescriptionCell()} />
                                    </Grid>
                                </>
                                :
                                <Card className="text-muted text-center mb-0">
                                    <CardBody>
                                        <span>{localise("ERROR_SEARCH_RESULT")}</span>
                                    </CardBody>
                                </Card>
                        }
                    </Col>
                </Row>
            </div>
        )
    }
}



// WEBPACK FOOTER //
// ./src/modules/externalSystems/components/ExternalSystemDetails/RoleMappingsTab.tsx