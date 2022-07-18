import React from "react";
import { Col, Input, Row } from "reactstrap";
import FormFieldContent from "src/modules/shared/components/Form/FormFieldContent";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import { WizardDialog } from "src/modules/shared/components/WizardDialog/WizardDialog";
import { confirmDialogService, apiService, notificationDialogService, localise } from "src/modules/shared/services";
import { DataUpdateResult } from "src/modules/shared/types/dto";
import { ItemGroup } from "../../types/dto";

interface State {
    currentStep: number;
    isDirty: boolean;
    errorMsg: string;
    itemGroup: ItemGroup;
    showErrorsForName: boolean;
    showErrorsForRemark: boolean;
    showErrorsForMaxCount: boolean;
}

interface Props {
    closeDialog: () => void;
}

export class ItemGroupWizard extends React.Component<Props, State> {
    nameInput = (props: any) => <Input {...props} maxLength={40} />
    constructor(props: Props) {
        super(props);

        this.state = {
            currentStep: 1,
            isDirty: false,
            errorMsg: '',
            itemGroup: {
                id: '',
                name: '',
                itemCount: 0,
                maxItemsPerUser: '',
                remark: ''
            },
            showErrorsForName: false,
            showErrorsForRemark: false,
            showErrorsForMaxCount: false
        }
        this.onCancelClick = this.onCancelClick.bind(this);
        this.onBackClick = this.onBackClick.bind(this);
        this.onNextClick = this.onNextClick.bind(this);
        this.onSaveClick = this.onSaveClick.bind(this);
        this.validate = this.validate.bind(this);
        this.getComponent = this.getComponent.bind(this);
        this.onNameChange = this.onNameChange.bind(this);
        this.onRemarkChange = this.onRemarkChange.bind(this);
        this.onMaxItemsPerUserChange = this.onMaxItemsPerUserChange.bind(this);
        this.setErrorByMsg = this.setErrorByMsg.bind(this);
        this.dirtyPageHandler = this.dirtyPageHandler.bind(this);
        
        window.addEventListener("beforeunload", this.dirtyPageHandler);
    }

    componentDidMount() {
    }

    dirtyPageHandler(e: any) {
        if (this.state.isDirty) {
            e.returnValue = "";
            return "";
        }
        return;
    }

    onCancelClick() {
        const { closeDialog } = this.props;
        const { isDirty } = this.state;

        if (isDirty) {
            confirmDialogService.showDialog("CONFIRMATION_WIZARD_UNSAVED_CHANGES", closeDialog);
        }
        else {
            closeDialog();
        }
    }

    onBackClick() {
        this.setState({
            ...this.state,
            currentStep: this.state.currentStep - 1,
        });
    }

    onNextClick() {
        const error = this.validate();

        if (!error) {
            this.setState({
                ...this.state,
                errorMsg: '',
                currentStep: this.state.currentStep + 1,
            });
        }
    }

    onSaveClick() {
        const { closeDialog } = this.props;
        let { itemGroup } = this.state;
        const error = this.validate();


        if (!error) {
            apiService.post<DataUpdateResult>('itemGroup', undefined, itemGroup, [], true)
                .then((e: any) => {
                    closeDialog();
                    notificationDialogService.showDialog(
                        'CONFIRMATION_SAVE_ITEM_GROUP', () => { }, 'TEXT_NEW_ITEM_GROUP_CREATED');
                })
                .catch((e: any) => {
                    console.log(e);
                    notificationDialogService.showDialog(
                        e.response.data || 'TEXT_ERROR', () => { }, 'TEXT_ERROR');
                    this.setErrorByMsg(e.response.data)
                });
        }
    }

    getSteps() {
        const steps = [
            { label: localise('TEXT_DETAILS') }
        ];

        return steps;
    }

    getComponent(stepNumber: number) {
        const { errorMsg, itemGroup, showErrorsForName, showErrorsForRemark, showErrorsForMaxCount } = this.state;

        switch (stepNumber) {
            case 1:
                return (
                    <>
                        <Row className="mb-3">
                            <Col>
                                <small className="text-muted">{localise("TEXT_PAGE_DESCRIPTION")}</small>
                            </Col>
                            <Col md="auto">
                                <small className="text-muted">{localise('TEXT_REQUIRED_FIELD')}</small>
                            </Col>
                        </Row>
                        <FormFieldContent labelKey="TEXT_ITEM_GROUP_NAME" 
                            remarksKey="REMARK_ITEM_GROUP_NAME"
                            required={true} 
                            inputComponent={this.nameInput}
                            meta={{ error: localise(errorMsg), touched: showErrorsForName, warning: undefined }}
                            input={{ onChange: this.onNameChange, value: itemGroup.name }}/>
                        <FormFieldContent labelKey="TEXT_REMARK"
                            remarksKey="REMARK_REMARK"
                            required={true}
                            inputComponent={Input}
                            meta={{ error: localise(errorMsg), touched: showErrorsForRemark, warning: undefined }}
                            input={{ onChange: this.onRemarkChange, value: itemGroup.remark }}/>
                        <FormFieldContent labelKey="TEXT_MAX_ITEMS_PER_USER"
                            remarksKey="REMARK_MAX_ITEMS_PER_USER"
                            required={true} 
                            inputComponent={(props: any) =>
                                <LookupDropDown {...props} lookupKey="LIST_MAXIMUM_KEYS_PER_USER" />}
                            meta={{ error: localise(errorMsg), touched: showErrorsForMaxCount, warning: undefined }}
                            input={{ onChange: this.onMaxItemsPerUserChange, value: itemGroup.maxItemsPerUser }}/>
                    </>
                );
            default:
                return <></>;
        }
    }

    render() {
        const { currentStep } = this.state;

        return (
            <>
                <div className="item-group-wizard">
                    <WizardDialog titleKey={localise('TEXT_ADD_NEW_ITEM_GROUP')} stepCount={1} steps={this.getSteps()}
                    currentStep={currentStep} component={this.getComponent(currentStep)}
                    onBackClick={this.onBackClick} onNextClick={this.onNextClick}
                    onCancelClick={this.onCancelClick} onSaveClick={this.onSaveClick} />
                </div>
            </>
        );
    }

    validate() {
        const { itemGroup } = this.state;
        let errorMsg = '';
        let showErrorsForName = false
        let showErrorsForRemark = false;
        let showErrorsForMaxCount = false;
        let isError = false;

        if (!itemGroup.name){
            showErrorsForName = true;
            errorMsg = 'ERROR_NAME_REQUIRED';
            isError = true;
        } else if (!itemGroup.remark) {
            showErrorsForRemark = true;
            errorMsg = 'ERROR_REMARK_REQUIRED';
            isError = true;
        } else if(!itemGroup.maxItemsPerUser){
            showErrorsForMaxCount = true;
            errorMsg = 'ERROR_FIELD_REQUIRED';
            isError = true;
        }
        this.setState({...this.state, showErrorsForName: showErrorsForName, showErrorsForRemark: showErrorsForRemark, showErrorsForMaxCount: showErrorsForMaxCount, errorMsg: errorMsg});
        return isError;
    }

    setErrorByMsg(error: string) {
        let showErrorsForName = false;
        let showErrorsForRemark = false;
        let showErrorsForMaxCount = false;
        switch(error) {
            case 'ERROR_ITEMGROUP_NAME_REQUIRED':
            case 'ERROR_DUPLICATE_ITEM_GROUP':
                showErrorsForName = true;
                break;
            case 'ERROR_ITEMGROUP_REMARK_REQUIRED':
                showErrorsForRemark = true;
                break;
            case 'ERROR_ITEMGROUP_MAX_ITEMS_PER_USER_REQUIRED':
                showErrorsForMaxCount: true;
            default:
                break;
        }

        this.setState({
            ...this.state,
            showErrorsForName: showErrorsForName,
            showErrorsForRemark: showErrorsForRemark,
            showErrorsForMaxCount: showErrorsForMaxCount,
            errorMsg: error
        })
    }

    onNameChange(value: any){
        this.setState({...this.state, isDirty: true, itemGroup: {...this.state.itemGroup, name: value}});
    }

    onRemarkChange(value: any){
        this.setState({...this.state, isDirty: true, itemGroup: {...this.state.itemGroup, remark: value}});
    }

    onMaxItemsPerUserChange(value: any){
        this.setState({...this.state, isDirty: true, itemGroup: {...this.state.itemGroup, maxItemsPerUser: value}});
    }

}



// WEBPACK FOOTER //
// ./src/modules/itemGroups/components/ItemGroupWizard/ItemGroupWizard.tsx