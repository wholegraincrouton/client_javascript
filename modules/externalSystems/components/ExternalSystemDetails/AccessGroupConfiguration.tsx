import { orderBy, SortDescriptor } from "@progress/kendo-data-query";
import { AutoComplete } from "@progress/kendo-react-dropdowns";
import { Grid, GridColumn, GridHeaderSelectionChangeEvent, GridSelectionChangeEvent, GridSortChangeEvent } from "@progress/kendo-react-grid";
import * as React from "react";
import { Button, Col, Input, Label, Row } from "reactstrap";
import { alertActions } from "src/modules/shared/actions/alert.actions";
import { ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { localise, permissionService } from "src/modules/shared/services";
import { LookupItem } from "src/modules/shared/types/dto";
import { externalSystemsService } from "../../services/externalSystems.service";
import { ExternalSystem, IntegrationStatus, IntegrationSystems } from "../../types/dto";

interface State {
    displayList: GridItem[];
    selectedList: string[];
    sort: SortDescriptor[];
    filteredGroups: GridItem[];
    totalCount: number;
    selectedCount: number;
    recordLimit: number;
    filter: Filter;
    isAutoSyncEnabled: boolean;
    isButtonDisabled: boolean;
}

interface Filter {
    groupName: string;
}

interface GridItem extends LookupItem {
    rowSelected: boolean;
}

export class AccessGroupConfiguration extends React.Component<DetailFormProps, State, GridItem>{
    pageSize: number = 10;
    gridItemList: GridItem[] = [];

    constructor(props: DetailFormProps) {
        super(props);
        this.onSortChange = this.onSortChange.bind(this);
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.onHeaderSelectionChange = this.onHeaderSelectionChange.bind(this);
        this.onShowMore = this.onShowMore.bind(this);
        this.onAccessGroupNameChange = this.onAccessGroupNameChange.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.toggleAutoSync = this.toggleAutoSync.bind(this);
        this.onSyncButtonClick = this.onSyncButtonClick.bind(this);

        let externalSystem = props.item as ExternalSystem;

        let userGroups = externalSystem.userGroups;

        userGroups && userGroups.forEach(userGroup => {
            let obj = {
                text: userGroup.name,
                value: userGroup.id,
                remark: userGroup.description,
                rowSelected: externalSystem.selectedUserGroups.includes(userGroup.id) ? true : false
            }
            this.gridItemList.push(obj);
        })

        this.state = {
            selectedList: externalSystem.selectedUserGroups || [],
            sort: [{ field: 'text', dir: 'asc' }],
            filteredGroups: this.gridItemList,
            displayList: orderBy(this.gridItemList, [{ field: 'text', dir: 'asc' }]).slice(0, this.pageSize),
            totalCount: userGroups ? userGroups.length : 0,
            selectedCount: externalSystem.selectedUserGroups.length,
            recordLimit: this.pageSize,
            filter: {
                groupName: ""
            },
            isAutoSyncEnabled: externalSystem.isAutoSyncEnabled,
            isButtonDisabled: false
        };
    }

    onSortChange(event: GridSortChangeEvent) {
        this.setState({ ...this.state, sort: event.sort })
    }

    onSelectionChange(event: GridSelectionChangeEvent) {
        const userGroup = this.gridItemList.find(item => item.value == event.dataItem.value);

        if (userGroup) {
            userGroup.rowSelected = !userGroup.rowSelected;
        }

        let filteredList: string[] = [];
        this.gridItemList.filter(e => e.rowSelected).forEach(m => {
            m.value ? filteredList.push(m.value) : undefined
        })

        this.props.change("selectedUserGroups", filteredList);

        this.setState({
            ...this.state,
            selectedList: filteredList,
            selectedCount: this.gridItemList.filter(r => r.rowSelected).length
        })
    }

    onHeaderSelectionChange(event: GridHeaderSelectionChangeEvent) {
        const { selectedList, totalCount } = this.state;

        const isSelected = event.nativeEvent.target.checked;
        this.gridItemList.forEach(item => item.rowSelected = isSelected);
        let filteredList: string[] = [];
        this.gridItemList && this.gridItemList.filter(e => e.rowSelected).forEach(m => {
            m.value ? filteredList.push(m.value) : undefined
        })

        this.props.change("selectedUserGroups", filteredList);

        this.setState({
            ...this.state,
            selectedList: selectedList,
            selectedCount: isSelected ? totalCount : 0
        })
    }

    onShowMore() {
        const { recordLimit, sort, filteredGroups } = this.state;
        let newRecordLimit = recordLimit + this.pageSize;

        this.setState({
            ...this.state,
            displayList: orderBy(filteredGroups, sort).slice(0, newRecordLimit),
            recordLimit: newRecordLimit
        })
    }

    onAccessGroupNameChange(e: any) {
        this.setState({ ...this.state, filter: { groupName: e.target.value } });
    }

    onSearch() {
        const { filter, sort } = this.state;

        let filteredGroups = this.gridItemList.filter(g =>
            !filter.groupName || g.text && g.text.trim().toLowerCase().includes(filter.groupName.trim().toLowerCase()));

        this.setState({
            ...this.state,
            filteredGroups: filteredGroups,
            displayList: orderBy(filteredGroups, sort).slice(0, this.pageSize),
            recordLimit: this.pageSize
        });
    }

    toggleAutoSync() {
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

    render() {
        const { dirty, item } = this.props;
        const { sort, displayList, filteredGroups, totalCount, selectedCount, recordLimit, filter, isAutoSyncEnabled, isButtonDisabled } = this.state;
        const allItemsSelected = this.gridItemList.every(item => item.rowSelected);
        const isSyncButtonDisabled = dirty || item.integrationStatus == IntegrationStatus.Inactive || isButtonDisabled;
        const filteredNames = displayList.filter(u => u.text && u.text.toLowerCase().includes(filter.groupName && filter.groupName.toLowerCase())).map(u => u.text);
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');

        return (
            <div className="user-groups-tab">
                <Row>
                    <Col>
                        <small className="text-muted">{localise('REMARK_ACCESS_GROUP_CONFIGURATION')}</small>
                    </Col>
                </Row>
                {
                    item.integrationSystem == IntegrationSystems.Brivo &&
                    <>
                        <Row className="form-group pt-2 mb-0">
                            <Col lg={8} className="pt-2">
                                <Row>
                                    <Col className="ml-4">
                                        <Label className="mb-0">
                                            <Input type="checkbox" name="isAutoSyncEnabled" checked={isAutoSyncEnabled}
                                                onChange={this.toggleAutoSync} disabled={!isPermittedToEdit}/>
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
                                            title={isSyncButtonDisabled ? localise('TEXT_FORCE_SYNC_BUTTON_TOOLTIP') : ""}
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
                    </>
                }
                <Row>
                    <Col className="mb-2 mt-2 filter-box">
                        <Row>
                            <Col>
                                <Label className="system-label mb-0">{localise("TEXT_GROUP_NAME")}</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={6} lg={4}>
                                <AutoComplete data={filteredNames} value={filter.groupName} onChange={this.onAccessGroupNameChange}
                                    popupSettings={{ className: 'auto-complete-popover' }} />
                            </Col>
                            <Col sm={4} lg={4}>
                                <ActionButton textKey="BUTTON_SEARCH" color="primary" onClick={this.onSearch}
                                    icon="fa-search" disableDefaultMargin={true} />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {
                            displayList.length > 0 ?
                                <Col>
                                    <Row>
                                        <Col>
                                            <small className="grid-selection-count">({selectedCount}/{totalCount} {localise("TEXT_SELECTED")})</small>
                                            <Grid
                                                data={orderBy(displayList, sort)}
                                                sort={sort} onSortChange={this.onSortChange}
                                                sortable={{ allowUnsort: false, mode: 'single' }}
                                                selectedField="rowSelected"
                                                onSelectionChange={this.onSelectionChange}
                                                onHeaderSelectionChange={this.onHeaderSelectionChange}
                                                className={isPermittedToEdit ? "" : "disabled-grid"}>
                                                <GridColumn field="rowSelected" width="auto" className="checkbox-grid-column"
                                                    headerClassName="checkbox-grid-column" headerSelectionValue={allItemsSelected} />
                                                <GridColumn field="text" title={localise('TEXT_GROUP_NAME')} />
                                                {
                                                    item.integrationSystem != IntegrationSystems.Brivo &&
                                                    <GridColumn field="remark" title={localise('TEXT_GROUP_DESCRIPTION')} />
                                                }

                                            </Grid>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            {
                                                (recordLimit < filteredGroups.length) &&
                                                <Button className="show-more" color="link" onClick={this.onShowMore}>{localise('BUTTON_SHOW_MORE')}</Button>
                                            }
                                        </Col>
                                    </Row>
                                </Col>
                                :
                                <div>
                                    <hr />
                                    <div className="text-muted text-center">{localise("ERROR_SEARCH_RESULT")}</div>
                                </div>
                        }
                    </Col>
                </Row>
            </div>
        );
    }
}


// WEBPACK FOOTER //
// ./src/modules/externalSystems/components/ExternalSystemDetails/AccessGroupConfiguration.tsx