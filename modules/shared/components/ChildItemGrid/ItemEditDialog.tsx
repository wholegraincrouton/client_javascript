import * as React from 'react';
import { Dialog } from '@progress/kendo-react-dialogs';
import { ItemEditForm, ItemEditFormBodyComponent, ItemEditFormProps } from './ItemEditForm';
import "./child-item-grid.scss";

interface Props<T> {
    name: string;
    item?: T;
    isNew?: boolean;
    isParentItemNew: boolean; //Whether the parent page item is new.
    canDelete?: boolean;
    bodyComponent: ItemEditFormBodyComponent;
    validateItem?: (item: T, props: ItemEditFormProps) => {};
    onClose?: () => void;
    onSave?: (item: T) => void;
    onDelete?: (item: T) => void;
    formError?: string;
}

export class ItemEditDialog<T> extends React.Component<Props<T>> {
    constructor(props: Props<T>) {
        super(props);
        this.onDelete = this.onDelete.bind(this);
    }

    editForm = ItemEditForm(this.props.name, this.props.bodyComponent, this.props.validateItem);

    onDelete() {
        const { props } = this;
        props.onDelete && props.item && props.onDelete(props.item);
    }

    render() {
        const EditForm = this.editForm;
        const { props } = this;
        
        return (
            <Dialog width={750}>
                <EditForm initialValues={props.item} canDelete={props.canDelete}
                    enableReinitialize={true} isNew={props.isNew} isParentItemNew={props.isParentItemNew}
                    formError={props.formError} onSubmit={props.onSave} onDeleteClick={this.onDelete} onBackClick={props.onClose} />
            </Dialog>
        )
    }
}



// WEBPACK FOOTER //
// ./src/modules/shared/components/ChildItemGrid/ItemEditDialog.tsx