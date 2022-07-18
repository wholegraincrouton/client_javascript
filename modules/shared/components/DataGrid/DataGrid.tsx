import * as React from "react";
import { connect } from "react-redux";
import { Grid, GridSortChangeEvent, GridColumn, GridSelectionChangeEvent, GridRowClickEvent, GridRowProps, GridEvent } from "@progress/kendo-react-grid";
import { History } from "history";
import * as qs from "query-string";
import { DataGridState } from "../../types/store";
import { dataGridActions } from "../../actions/data-grid.actions";
import { Button, Row, Col, Card, CardBody } from "reactstrap";
import "./data-grid.css";
import { DeleteButton } from "../ActionButtons/ActionButtons";
import { confirmDialogService, localise } from "../../services";
import { permissionService } from "../../services/permission.service";

interface Props {
    name: string;
    action?: string;
    allGridsState: any;
    baseService?: string;
    history: History;
    onRowClick?: (dataItem: any) => void;
    loadMore: (gridName: string, action?: string, baseService?: string) => Promise<void>;
    changeSelection: (gridName: string, ids: string[], selected: boolean) => void;
    bulkDelete: (gridName: string, baseService?: string) => void;
    clearData: (gridName: string) => void;
    rowRender?: (row: React.ReactElement<HTMLTableRowElement>, props: GridRowProps) => React.ReactNode;
    isAutoScrollEnabled?: boolean;
}

class DataGrid extends React.Component<Props> {

    sortSettings = { allowUnsort: false, mode: 'single' }
    containerElementIdPrefix = "gridContainer_";
    isPermittedToView: boolean = false;
    isRequestSent: boolean = false;
    constructor(props: Props) {
        super(props);
        this.onSort = this.onSort.bind(this);
        this.onLoadMore = this.onLoadMore.bind(this);
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.onHeaderSelectionChange = this.onHeaderSelectionChange.bind(this);
        this.onBulkDelete = this.onBulkDelete.bind(this);
        this.onRowClick = this.onRowClick.bind(this);
        this.onRowRender = this.onRowRender.bind(this);
    }

    componentWillUnmount() {
        this.props.clearData(this.props.name);
    }

    onSort(e: GridSortChangeEvent) {
        const criteria = qs.parse(this.props.history.location.search);

        let sort = {
            sortField: e.sort[0].field,
            sortDir: e.sort[0].dir
        };

        this.props.history.push({
            pathname: "",
            search: qs.stringify({ ...criteria, ...sort })
        })
    }

    onLoadMore() {
        this.props.loadMore(this.props.name, this.props.action, this.props.baseService)
            .then(() => {
                this.isRequestSent = false;
            });
    }

    onSelectionChange(event: GridSelectionChangeEvent) {
        if (!event.dataItem.isDeleted) {
            this.props.changeSelection(this.props.name, [event.dataItem.id], !event.dataItem.rowSelected)
            this.forceUpdate();
        }
    }

    onHeaderSelectionChange(event: any) {
        const checked = event.syntheticEvent.target.checked;
        const state: DataGridState = this.props.allGridsState[this.props.name];

        const allIds: string[] = state.dataItems.filter(i => !i.isDeleted).map(item => item.id);
        this.props.changeSelection(this.props.name, allIds, checked);
        this.forceUpdate();
    }

    onRowClick(event: GridRowClickEvent) {
        this.props.onRowClick && this.props.onRowClick(event.dataItem);
    }

    onBulkDelete() {
        confirmDialogService.showDialog("CONFIRMATION_BULKDELETE",
            () => { this.props.bulkDelete(this.props.name, this.props.baseService); });
    }

    onRowRender(tr: any, props: any) {
        var component = tr;
        if (props.dataItem.isDeleted) {
            component = React.cloneElement(tr, { ...tr.props, className: tr.props.className + ' disabled-row' }, tr.props.children);
        }
        else if (!this.isPermittedToView) {
            component = React.cloneElement(tr, { ...tr.props, className: tr.props.className + ' non-selectable-row' }, tr.props.children);
        }

        if (this.props.rowRender)
            component = this.props.rowRender(component, props);

        return component;
    }

    scrollHandler = (event: GridEvent) => {
        const e = event.nativeEvent;
        if (e.target.scrollTop + 10 >= e.target.scrollHeight - e.target.clientHeight && this.props.isAutoScrollEnabled && !this.isRequestSent) {
            this.isRequestSent = true;
            this.onLoadMore();
        }
    };

    render() {
        const { props } = this;
        const state: DataGridState = props.allGridsState[props.name];

        if (!state || !state.dataItems || state.dataItems.length == 0)
            return (
                <Card>
                    <CardBody>
                        <div className="text-muted text-center">{localise("ERROR_SEARCH_RESULT")}</div>
                    </CardBody>
                </Card>)

        const anyItemSelected = state.dataItems.find(item => item.rowSelected) != undefined;
        const allItemsSelected = state.dataItems.find(item => !item.isDeleted)
            && !state.dataItems.find(item => !item.isDeleted && !item.rowSelected) || false;

        const canBulkDelete = permissionService.isActionPermittedForCustomer('DELETE');
        this.isPermittedToView = permissionService.isActionPermittedForCustomer('SEARCH');

        return (
            <Card id={this.containerElementIdPrefix + props.name} className="data-grid-container compact">
                <CardBody>
                    <Row className="mb-2">
                        <Col></Col>
                        <Col xs="auto">
                            {canBulkDelete && <DeleteButton disabled={!anyItemSelected} onClick={this.onBulkDelete} />}
                        </Col>
                    </Row>
                    <Row>
                        <Col className="responsive-data-grid">
                            <Grid data={state.dataItems}
                                onScroll={this.scrollHandler}
                                sortable={{ allowUnsort: false, mode: 'single' }}
                                sort={[state.sort]}
                                onSortChange={this.onSort}
                                selectedField="rowSelected"
                                onSelectionChange={this.onSelectionChange}
                                onHeaderSelectionChange={this.onHeaderSelectionChange}
                                onRowClick={this.onRowClick}
                                rowRender={this.onRowRender}>
                                {canBulkDelete && <GridColumn field="rowSelected" width="auto" className="checkbox-grid-column" headerClassName="checkbox-grid-column" headerSelectionValue={allItemsSelected} />}
                                {props.children}
                            </Grid>
                        </Col>
                    </Row>
                    {state.continuationToken && <Button color="link" className="show-more" onClick={this.onLoadMore}>{localise("BUTTON_SHOW_MORE")}</Button>}
                </CardBody>
            </Card>
        )
    }
}

const mapStateToProps = (state: any) => {
    return { allGridsState: state.dataGrid };
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        loadMore: (gridName: string, action?: string, baseService?: string) =>
            dispatch(dataGridActions.loadMoreData(gridName, action, baseService)),

        changeSelection: (gridName: string, ids: string[], selected: boolean) =>
            dispatch(dataGridActions.changeSelection(gridName, ids, selected)),

        bulkDelete: (gridName: string, baseService?: string) =>
            dispatch(dataGridActions.bulkDelete(gridName, baseService)),

        clearData: (gridName: string) =>
            dispatch(dataGridActions.clearData(gridName))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DataGrid);


// WEBPACK FOOTER //
// ./src/modules/shared/components/DataGrid/DataGrid.tsx