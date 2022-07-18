import * as React from 'react';
import { match } from 'react-router';
import { History, Location, UnregisterCallback } from 'history';
import * as qs from "query-string";
import { DetailFormBodyComponent, DetailFormHeaderComponent } from './DetailForm';
import { DetailReduxForm, DetailReduxFormProps } from './DetailReduxForm';
import { DetailObject } from '../../types/store';
import { confirmDialogService, contextService, navService } from '../../services';
import { alertActions } from '../../actions/alert.actions';
import { DataUpdateResult } from '../../types/dto';
import { uiDomService } from '../../services/ui-dom.service';

export interface DetailPageProps<T extends DetailObject> {
    pageName: string;
    item?: T;
    match: match<any>;
    history: History;
    location: Location;
    loadData: (id: string) => Promise<DetailObject>;
    saveData: (item: T) => Promise<DataUpdateResult>;
    delete: (id: string) => Promise<void>;
    clearStore: () => void;
}

export abstract class DetailPage<T extends DetailObject> extends React.Component<DetailPageProps<T>> {
    constructor(props: DetailPageProps<T>) {
        super(props);
        this.goBack = this.goBack.bind(this);
        this.onSave = this.onSave.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.reInitializeForm = this.reInitializeForm.bind(this);
        this.beforeSave = this.beforeSave.bind(this);
        this.afterSave = this.afterSave.bind(this);
        this.afterDelete = this.afterDelete.bind(this);
        this.needConfirmationOnSave = this.needConfirmationOnSave.bind(this);
        this.getConfirmationMessageKey = this.getConfirmationMessageKey.bind(this);
        this.saveCallback = this.saveCallback.bind(this);

        this.detailForm = DetailReduxForm(`${props.pageName}Form`, this.validateItem) as any;

        this.state = {}
    }

    detailForm: (props: DetailReduxFormProps) => JSX.Element;
    historyUnlisten: UnregisterCallback;

    abstract listPagePath: string;
    abstract detailFormBody: DetailFormBodyComponent;
    detailFormHeader?: DetailFormHeaderComponent;
    abstract validateItem(item: T): any;

    componentDidMount() {
        this.reInitializeForm();
    }

    reInitializeForm() {
        this.loadDataUsingRouteParam(this.props.location);
        this.historyUnlisten = this.props.history.listen((location: Location) => {
            this.loadDataUsingRouteParam(location);
        })
    }

    componentWillUnmount() {
        this.historyUnlisten();
        this.props.clearStore();
    }

    loadDataUsingRouteParam(location: Location) {

        const currentPath = this.props.location.pathname;
        const newPath = location.pathname;

        if (newPath != currentPath) //This means navigating away from the page 
            return;

        const { props } = this;
        props.loadData(props.match.params.id)
            //Hack to resize content after data load.
            .then(() => uiDomService.adjustDynamicPageContentSizes());
    }

    goBack() {
        if (!this.backButtonOverride())
            navService.goBackToListPage(this.listPagePath, this.props.history);
    }

    backButtonOverride() {
        return false;
    }

    onSave(values: any) {
        const item = this.formValuesToObject(values);
        const isNew = this.isNew(item);

        //Execute beforeSave and see whether we can go ahead and save data.
        var goAhead = this.beforeSave(item, isNew);

        if (!goAhead)
            return;

        if (this.needConfirmationOnSave()) {
            confirmDialogService.showDialog(this.getConfirmationMessageKey(),
                () => {
                    this.saveData(item, isNew);
                });
        }
        else {
            this.saveData(item, isNew);
        }
    }

    needConfirmationOnSave() {
        return false; //Default implemenation
    }

    getConfirmationMessageKey() {
        return "CONFIRMATION_SAVE"; //Default implemenation
    }

    saveData(item: T, isNew: boolean) {
        const { props } = this;

        props.saveData && props.saveData(item)
            .then(result => {
                alertActions.showSuccess('TEXT_SAVE_SUCCESS');
                this.afterSave(result.id, item, isNew);

                //Navigate to the newly created item url.
                if (isNew || this.refreshAfterUpdate()) {
                    let searchParams = qs.parse(props.history.location.search);
                    searchParams.contextCustomerId = contextService.getCurrentCustomerId();
                    props.history.push({
                        pathname: props.match.path.replace(":id", result.id),
                        search: qs.stringify(searchParams)
                    });
                }
            })
            .catch(error => {
                this.onSaveError(error, item, isNew);
            });
    }

    deleteItem() {
        const { props } = this;
        const itemId = props.item && props.item.id || "";

        props.item && props.delete && confirmDialogService.showDialog('CONFIRMATION_DELETE',
            () => {
                props.delete(itemId)
                    .then(() => {
                        this.afterDelete(itemId, props.item);
                        this.goBack();
                        alertActions.showSuccess('TEXT_DELETE_SUCCESS');
                    })
            });
    }

    objectToFormValues(item: T): any {
        return item;
    }

    formValuesToObject(values: any): T {
        return values as T;
    }

    beforeSave(item: T, isNew: boolean): boolean {
        return true; //Default implemenation
    }

    afterSave(id: string, item: T, isNew: boolean) {
    }

    afterDelete(id: string, item?: T) {
        return true; //Default implemenation
    }

    onSaveError(error: any, item: T, isNew: boolean) {
    }

    private isNew(item: T) {
        return item.id == "";
    }

    isReadOnly(item: T) {
        return false;
    }

    hideDescriptionHeader(item: T) {
        return false;
    }

    hideDeleteButton(item: T) {
        return false;
    }

    refreshAfterUpdate() {
        return false;
    }

    saveCallback(values: any) {
        this.onSave(values);
    }

    render() {
        const { props } = this;
        const DetailForm = this.detailForm;

        const formValues = props.item ? this.objectToFormValues(props.item) : props.item;
        const readonly = props.item && this.isReadOnly(props.item);
        const hideDescriptionHeader = props.item && this.hideDescriptionHeader(props.item);
        const hideDeleteButton = props.item && this.hideDeleteButton(props.item);

        return (
            props.item ?
                <DetailForm reload={this.reInitializeForm} header={this.detailFormHeader} history={this.props.history}
                    isNew={this.isNew(props.item)} initialValues={formValues} onSubmit={this.onSave} item={props.item}
                    body={this.detailFormBody} onBackClick={this.goBack} onDeleteClick={this.deleteItem} readonly={readonly}
                    hideDescriptionHeader={hideDescriptionHeader} hideDeleteButton={hideDeleteButton} saveCallback={this.saveCallback} /> : null
        )
    }
}


// WEBPACK FOOTER //
// ./src/modules/shared/components/DetailPage/DetailPage.tsx