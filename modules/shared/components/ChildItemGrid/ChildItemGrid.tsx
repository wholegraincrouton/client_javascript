import * as React from 'react';
import { Grid, GridColumn, GridRowClickEvent, GridColumnProps, GridSortChangeEvent, GridSelectionChangeEvent } from '@progress/kendo-react-grid';
import { SortDescriptor, orderBy } from '@progress/kendo-data-query';
import { confirmDialogService, contextService, localise } from '../../services';
import { ItemEditDialog } from './ItemEditDialog';
import { Row, Col } from 'reactstrap';
import { NewButton, DeleteButton } from '../ActionButtons/ActionButtons';
import { deleteCell } from './DeleteCell';
import { ItemEditFormBodyComponent, ItemEditFormProps } from './ItemEditForm';
import { permissionService } from '../../services/permission.service';
import "./child-item-grid.css";

export interface ChildItemGridProps<T> {
    name: string;
    parentFormName?: string;
    deletePermissionKeySuffix?: string;
    addPermissionKeySuffix?: string;
    items: T[];
    defaultSort?: SortDescriptor;
    isParentItemNew: boolean; //Whether the parent page's item is new.
    onChange?: (items: T[]) => void;
    newButtonLabelKey?: string;
    newButtonColor?: string;
    newButtonIcon?: string;
    newButtonWidth?: string;
    maxItemCount?: number;
    customerId?: string;
    readonly?: boolean;
    detailGridComponent?: any;
    descriptionKey?: string
}

export interface State<T> {
    editingItem?: T;
    canEdit?: boolean;
    isEditingNewItem?: boolean;
    sort?: SortDescriptor[];
    formError?: string;
}

export abstract class ChildItemGrid<T> extends React.Component<ChildItemGridProps<T>, State<T>> {

    constructor(props: ChildItemGridProps<T>) {
        super(props);

        this.state = {
            sort: props.defaultSort && [props.defaultSort],
            canEdit: false
        };
        this.onRowRender = this.onRowRender.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.onRowClick = this.onRowClick.bind(this);
        this.onNewClick = this.onNewClick.bind(this);
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.onHeaderSelectionChange = this.onHeaderSelectionChange.bind(this);
        this.bulkDelete = this.bulkDelete.bind(this);
        this.onEditingCancel = this.onEditingCancel.bind(this);
        this.onSave = this.onSave.bind(this);
        this.onSort = this.onSort.bind(this);
        this.beforeSave = this.beforeSave.bind(this);
        this.onSavingItem = this.onSavingItem.bind(this);
        this.onExpandClick = this.onExpandClick.bind(this);
    }

    abstract editFormBody: ItemEditFormBodyComponent;
    abstract getItemId(item: T): any;
    abstract getNewItem(): T;
    abstract onExpandClick(event: any): void;
    abstract validateItem(item: T, props: ItemEditFormProps): {};
    abstract getColumns(): GridColumnProps[];
    canEditRow: boolean = false;

    beforeSave(item: T, isNew?: boolean): boolean {
        return true; //Default implemenation
    }

    onSavingItem(isNew: boolean, item: T, items?: T[]): T {
        return item;
    }

    onRowClick(e: GridRowClickEvent) {
        this.canEditRow && this.setState({
            ...this.state,
            editingItem: e.dataItem,
            isEditingNewItem: false
        });
    }

    onNewClick() {
        this.setState({
            ...this.state,
            editingItem: this.getNewItem(),
            isEditingNewItem: true
        });
    }

    onEditingCancel() {
        this.exitEditing();
    }

    onRowRender(tr: any, props: any) {
        if (!this.canEditRow) {
            return React.cloneElement(tr, {
                ...tr.props,
                className: tr.props.className + ' non-selectable-row'
            }, tr.props.children);
        } else {
            return tr;
        }
    }

    onSave(item: T) {

        const { state } = this;

        //Execute beforeSave and see whether we can go ahead and save data.
        var goAhead = this.beforeSave(item, state.isEditingNewItem);

        if (!goAhead) {
            return;
        }

        let { items: items } = this.props;
        items = items || [];
        item = this.onSavingItem(state.isEditingNewItem || false, item, items);

        if (state.isEditingNewItem) {
            items.unshift(item);
            this.scrollGridIntoView();
        }
        else {
            const itemId = this.getItemId(item);
            let oldItem = items.find(i => this.getItemId(i) == itemId);
            if (oldItem) {
                const index = items.indexOf(oldItem);
                items[index] = item;
            }
        }

        this.exitEditing();
        this.triggerOnChange(items);
    }

    scrollGridIntoView() {
        setTimeout(() => {
            const conatiner = `${this.props.name}-container`;
            let elem = document.querySelector(`#${conatiner} .k-grid`) as HTMLDivElement;
            if (elem) elem.scrollIntoView(false);
        }, 0);
    }

    exitEditing() {
        this.setState({
            ...this.state,
            editingItem: undefined,
            isEditingNewItem: false,
            formError: undefined
        })
    }

    updateDetailGridData() {
        this.forceUpdate();
    }

    triggerOnChange(items: T[]) {
        this.props.onChange && this.props.onChange(items.map(item => {
            //Remove extra fields that we don't need to store in the value.
            let purified = { ...(item as any) };
            delete purified.rowSelected;
            return purified;
        }));
    }

    deleteItem(item: T) {
        let { items: items } = this.props;
        const deletedId = this.getItemId(item);

        confirmDialogService.showDialog("CONFIRMATION_DELETE",
            () => {
                items = items.filter(i => this.getItemId(i) != deletedId);
                this.exitEditing();
                this.triggerOnChange(items);
            })
    }

    bulkDelete() {
        confirmDialogService.showDialog("CONFIRMATION_BULKDELETE",
            () => {
                const remainingItems = this.props.items.filter(item => !(item as any).rowSelected);
                this.triggerOnChange(remainingItems);
            });
    }

    onSort(e: GridSortChangeEvent) {
        this.setState({
            ...this.state,
            sort: e.sort
        })
    }

    onSelectionChange(event: GridSelectionChangeEvent) {
        const changedItemId = this.getItemId(event.dataItem);
        const changedItem: any = this.props.items.find(item => this.getItemId(item) == changedItemId);

        changedItem.rowSelected = !changedItem.rowSelected;

        this.forceUpdate();
    }

    onHeaderSelectionChange(event: any) {
        const checked = event.syntheticEvent.target.checked;
        this.props.items.forEach(item => (item as any).rowSelected = checked);

        this.forceUpdate();
    }

    render() {
        const { props, state } = this;
        let items: any[] = props.items || [];

        items = this.state.sort && items ? orderBy(items, this.state.sort) : items;

        items.forEach(item => {
            if (item.rowSelected == undefined) item.rowSelected = false;
        })

        const anyItemSelected = items.find(item => item.rowSelected) != undefined;
        const allItemsSelected = !items.find(item => !item.rowSelected);

        const selectedCustomerId = contextService.getCurrentCustomerId();

        const canDeleteKey = props.deletePermissionKeySuffix ?
            permissionService.isActionPermittedForCustomer(props.deletePermissionKeySuffix, selectedCustomerId) : true;

        const canAddKey = props.addPermissionKeySuffix ?
            permissionService.isActionPermittedForCustomer(props.addPermissionKeySuffix, selectedCustomerId) : true;

        const canAddNewItem = props.maxItemCount ? (props.items.length < props.maxItemCount) : true;

        this.canEditRow = canAddKey;

        return (
            <div id={`${props.name}-container`}>
                <Row className="mb-3">
                    {
                        props.descriptionKey &&
                        <Col xl={9}><small className="text-muted">{localise(props.descriptionKey)}</small></Col>
                    }
                    <Col className="text-right">
                        {items.length > 0 && canDeleteKey && !props.readonly && <DeleteButton
                            disabled={!anyItemSelected} onClick={this.bulkDelete} />}
                        {
                            canAddKey && !props.readonly &&
                            <NewButton labelKey={this.props.newButtonLabelKey} canAddNew={canAddNewItem} btnColor={this.props.newButtonColor} btnWidth={this.props.newButtonWidth}
                                btnIcon={this.props.newButtonIcon} onClick={this.onNewClick} />
                        }
                    </Col>
                </Row>
                {
                    items && items.length > 0 ?
                        <Grid data={items}
                            style={{ maxHeight: '350px' }}
                            sort={state.sort}
                            sortable={{ allowUnsort: false, mode: 'single' }}
                            selectedField="rowSelected"
                            onSelectionChange={this.onSelectionChange}
                            onHeaderSelectionChange={this.onHeaderSelectionChange}
                            onSortChange={this.onSort}
                            rowRender={this.onRowRender}
                            detail={this.props.detailGridComponent}
                            expandField="expanded"
                            onExpandChange={this.onExpandClick}
                            onRowClick={this.onRowClick} >

                            {canDeleteKey && !props.readonly && <GridColumn field="rowSelected" width="auto"
                                className="checkbox-grid-column" headerClassName="checkbox-grid-column" headerSelectionValue={allItemsSelected} />}
                            {this.getColumns().map((col, key) => <GridColumn key={key} {...col} />)}
                            {canDeleteKey && !props.readonly && <GridColumn width="50px" cell={deleteCell(this.deleteItem)} />}
                        </Grid>
                        :
                        <div>
                            <hr />
                            <div className="text-muted text-center">{localise("ERROR_SEARCH_RESULT")}</div>
                        </div>
                }
                {
                    state.editingItem &&
                    <ItemEditDialog name={`${props.name}EditForm`} validateItem={this.validateItem}
                        item={state.editingItem} canDelete={canDeleteKey && !props.readonly} onClose={this.onEditingCancel}
                        isNew={state.isEditingNewItem} isParentItemNew={props.isParentItemNew}
                        onSave={this.onSave} onDelete={this.deleteItem} bodyComponent={this.editFormBody}
                        formError={state.formError}>
                    </ItemEditDialog>
                }
            </div>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/shared/components/ChildItemGrid/ChildItemGrid.tsx