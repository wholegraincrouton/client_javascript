import React from "react";
import { Col, Input, Label, Row } from "reactstrap";
import { CabinetDetail, TempSiteDetail } from "src/modules/cabinet/types/dto";
import FormFieldContent from "src/modules/shared/components/Form/FormFieldContent";
import { UserGrid } from "src/modules/shared/components/UserGrid/UserGrid";
import { UserGroupGrid } from "src/modules/shared/components/UserGroupGrid/UserGroupGrid";
import { WizardDialog } from "src/modules/shared/components/WizardDialog/WizardDialog";
import { confirmDialogService, apiService, notificationDialogService, localise, contextService } from "src/modules/shared/services";
import { DataUpdateResult } from "src/modules/shared/types/dto";
import { SiteItemSelectControl } from "src/modules/sites/shared/siteItemSelect/SiteItemSelectControl";
import { AccessGroup } from "../../types/dto";
import { AccessScheduleWizard } from "./AccessScheduleWizard";
import "./access-group-wizard.css"
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";

interface State {
    currentStep: number;
    isDirty: boolean;
    errorMsg: string;
    accessGroup: AccessGroup;
    showErrorsForName: boolean;
    showErrorsForRemark: boolean;
    showErrorsForItemsList: boolean;
    showErrorsForAccessSchedule: boolean;
    showErrorsForUserGroup: boolean;
    showErrorsForUser: boolean;
    allowUserGroups: string;
    allowUsers: string;
}

interface Props {
    closeDialog: () => void;
}

export class AccessGroupWizard extends React.Component<Props, State>{
    constructor(props: Props) {
        super(props);
        let customerId = contextService.getCurrentCustomerId();
        this.state = {
            currentStep: 1,
            isDirty: false,
            errorMsg: '',
            accessGroup: {
                customerId: customerId,
                id: '',
                groupName: '',
                scheduleEndsAt: '',
                remark: '',
                cabinetDetails: [],
                accessDurationSelection: '',
                accessDaysSelection: '',
                accessTimeSelection: '',
                scheduleList: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]
            },
            showErrorsForName: false,
            showErrorsForRemark: false,
            showErrorsForItemsList: false,
            showErrorsForAccessSchedule: false,
            showErrorsForUserGroup: false,
            showErrorsForUser: false,
            allowUserGroups: 'YES',
            allowUsers: 'YES',
        }

        this.onCancelClick = this.onCancelClick.bind(this);
        this.onBackClick = this.onBackClick.bind(this);
        this.onNextClick = this.onNextClick.bind(this);
        this.onSaveClick = this.onSaveClick.bind(this);
        this.validate = this.validate.bind(this);
        this.getComponent = this.getComponent.bind(this);
        this.onNameChange = this.onNameChange.bind(this);
        this.onRemarkChange = this.onRemarkChange.bind(this);
        this.onCabinetItemsChange = this.onCabinetItemsChange.bind(this);
        this.onUserGroupsChange = this.onUserGroupsChange.bind(this);
        this.onUsersChange = this.onUsersChange.bind(this);
        this.onAccessScheduleChange = this.onAccessScheduleChange.bind(this);
        this.allowUserGroupChange = this.allowUserGroupChange.bind(this);
        this.allowUserChange = this.allowUserChange.bind(this);
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
        let { accessGroup } = this.state;
        const error = this.validate();        

        if (!error) {
            apiService.post<DataUpdateResult>('groups', undefined, accessGroup, [], true)
                .then((e: any) => {
                    closeDialog();
                    notificationDialogService.showDialog(
                        'CONFIRMATION_SAVE_ACCESS_GROUP', () => { }, 'TEXT_NEW_ACCESS_GROUP_CREATED');
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
            { label: localise('TEXT_DETAILS') },
            { label: localise('TEXT_SELECT_ITEMS') },
            { label: localise('TEXT_USER_GROUPS') },
            { label: localise('TEXT_USERS') },
            { label: localise('TEXT_ACCESS_SCHEDULE') }
        ];

        return steps;
    }

    getComponent(stepNumber: number) {
        const { accessGroup, errorMsg, showErrorsForName, showErrorsForRemark, showErrorsForItemsList, showErrorsForAccessSchedule,
            allowUserGroups, allowUsers, showErrorsForUserGroup, showErrorsForUser } = this.state;
        switch (stepNumber) {
            case 1:
                return (
                    <>
                        <Row className="mb-3">
                            <Col>
                                <small className="text-muted">{localise("REMARK_ACCESS_GROUP_DETAILS")}</small>
                            </Col>
                            <Col md="auto">
                                <small className="text-muted">{localise('TEXT_REQUIRED_FIELD')}</small>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <FormFieldContent remarksKey="REMARK_ACCESSGROUP_NAME"
                                    required={true} labelKey="TEXT_ACCESSGROUP_NAME"
                                    inputComponent={Input}
                                    meta={{ error: localise(errorMsg), touched: showErrorsForName, warning: undefined }}
                                    input={{ onChange: this.onNameChange, value: accessGroup.groupName }} />
                                <FormFieldContent remarksKey="REMARK_ACCESSGROUP_REMARK"
                                    required={true}
                                    labelKey="TEXT_REMARK"
                                    inputComponent={Input}
                                    meta={{ error: localise(errorMsg), touched: showErrorsForRemark, warning: undefined }}
                                    input={{ onChange: this.onRemarkChange, value: accessGroup.remark }} />
                            </Col>
                        </Row>
                    </>
                );
            case 2:
                return (
                    <>
                        <Row className="mb-3">
                            <Col>
                                <small className="text-muted">{localise("REMARK_ACCESS_GROUP_SELECT_ITEMS")}</small>
                            </Col>
                            <Col md="auto">
                                <small className="text-muted">{localise('TEXT_REQUIRED_FIELD')}</small>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                {
                                    showErrorsForItemsList && errorMsg &&
                                    <small className="text-danger">{localise(errorMsg)}</small>
                                }
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <SiteItemSelectControl customerId={accessGroup.customerId || ''}
                                    selectedCabinets={accessGroup.cabinetDetails}
                                    onChange={this.onCabinetItemsChange}
                                    siteSelectRemark="REMARK_ACCESS_DEFINITION_SITES"
                                    cabinetSelectRemark="REMARK_ACCESS_DEFINITION_CABINETS"
                                    cabinetItemSelectRemark="REMARK_ACCESS_DEFINITION_ACCESSIBLE_ITEMS"
                                    isItemFilterOption={true} />
                            </Col>
                        </Row>
                    </>
                );
            case 3:
                return (
                    <>
                        <Row className="mb-3">
                            <Col>
                                <small className="text-muted">{localise("TEXT_ACCESS_USERGROUPS_DESCRIPTION")}</small>
                            </Col>
                            <Col md="auto">
                                <small className="text-muted">{localise('TEXT_REQUIRED_FIELD')}</small>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                {
                                    showErrorsForUserGroup && errorMsg &&
                                    <small className="text-danger">{localise(errorMsg)}</small>
                                }
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                            <Label className="system-label">{localise('REMARK_ALLOW_ACCESS_TO_USER_GROUPS')}
                                <LookupDropDown
                                        lookupKey="LIST_BOOLEAN_FLAGS"
                                        value={allowUserGroups}
                                        onChange={this.allowUserGroupChange}
                                        />
                            </Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <UserGroupGrid customerId={accessGroup.customerId || ''}
                                    userGroupList={accessGroup.userGroupList || []}
                                    onChange={this.onUserGroupsChange}
                                    readonly={allowUserGroups == 'NO'} />
                            </Col>
                        </Row>
                    </>
                );
            case 4:
                return (
                    <>
                        <Row className="mb-3">
                            <Col>
                                <small className="text-muted">{localise("TEXT_ACCESS_USERS_DESCRIPTION")}</small>
                            </Col>
                            <Col md="auto">
                                <small className="text-muted">{localise('TEXT_REQUIRED_FIELD')}</small>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                {
                                    showErrorsForUser && errorMsg &&
                                    <small className="text-danger">{localise(errorMsg)}</small>
                                }
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                            <Label className="system-label">{localise('REMARK_ALLOW_ACCESS_TO_USERS')}
                                <LookupDropDown
                                        lookupKey="LIST_BOOLEAN_FLAGS"
                                        value={allowUsers}
                                        onChange={this.allowUserChange}
                                        />
                            </Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <UserGrid customerId={accessGroup.customerId || ''}
                                    userList={accessGroup.userIdList || []}
                                    onChange={this.onUsersChange}
                                    columns={['description', 'designation']}
                                    readonly={allowUsers == 'NO'}/>
                            </Col>
                        </Row>
                    </>
                );
            case 5:
                return (
                    <>
                    <Row>
                        <Col>
                            {
                                showErrorsForAccessSchedule && errorMsg &&
                                <small className="text-danger">{localise(errorMsg)}</small>
                            }
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <AccessScheduleWizard
                                onChanges={this.onAccessScheduleChange}
                            />
                        </Col>
                    </Row>

                    </>
                )
            default:
                return <></>;
        }
    }

    render() {
        const { currentStep } = this.state;

        return (
            <WizardDialog titleKey={localise('TEXT_ADD_NEW_ACCESS_GROUP')} stepCount={5} steps={this.getSteps()}
                currentStep={currentStep} component={this.getComponent(currentStep)}
                onBackClick={this.onBackClick} onNextClick={this.onNextClick}
                onCancelClick={this.onCancelClick} onSaveClick={this.onSaveClick} />
        );
    }

    validate() {
        const { accessGroup, currentStep, allowUsers, allowUserGroups } = this.state;
        let isError: boolean = false;
        let showErrorsForName: boolean =  false;
        let showErrorsForRemark: boolean =  false;
        let showErrorsForItemsList: boolean =  false;
        let showErrorsForAccessSchedule: boolean =  false;
        let showErrorsForUserGroup: boolean =  false;
        let showErrorsForUser: boolean =  false;
        let errorMsg: string = '';

        switch (currentStep) {
            case 1:
                if (!accessGroup.groupName) {
                    showErrorsForName =  true;
                    errorMsg = 'ERROR_NAME_REQUIRED';
                    isError = true;
                } else if (!accessGroup.remark) {
                    showErrorsForRemark =  true;
                    errorMsg = 'ERROR_REMARK_REQUIRED';
                    isError = true;
                }
                break;
            case 2:
                if (!accessGroup.tempSiteDetails) {
                    showErrorsForItemsList = true;
                    errorMsg = 'ERROR_PLEASE_SELECT_ITEMS_FOR_SELECTED_CABINET';
                    isError = true;
                } else if (accessGroup.tempSiteDetails && !accessGroup.tempSiteDetails.some(s => s.isSelected)) {
                    showErrorsForItemsList = true;
                    errorMsg = 'ERROR_PLEASE_SELECT_SITE_CABINET_ITEMS';
                    isError = true;
                } else if (accessGroup.tempSiteDetails) {
                    accessGroup.tempSiteDetails.forEach(site => {
                        if (site.isSelected) {
                            if (!site.cabinets.some(c => c.isSelected)) {
                                showErrorsForItemsList = true;
                                errorMsg = 'ERROR_PLEASE_SELECT_CABINET_FOR_SELECTED_SITE';
                                isError = true;
                            }
                            else {
                                site.cabinets.forEach(cabinet => {
                                    if (cabinet.isSelected) {
                                        if (!cabinet.items || !cabinet.items.some(i => i.isSelected)) {
                                            showErrorsForItemsList = true;
                                            errorMsg = 'ERROR_PLEASE_SELECT_ITEMS_FOR_SELECTED_CABINET';
                                            isError = true;
                                        }
                                    }
                                });
                            }
                        }
                    });
                }

                break;
            case 3:
                if(allowUserGroups == 'YES' && (!accessGroup.userGroupList || accessGroup.userGroupList.length < 1)) {
                    showErrorsForUserGroup = true;
                    errorMsg = 'ERROR_USER_GROUP_REQUIRED_WIZARD';
                    isError = true;
                }
                break;
            case 4:
                if(allowUsers == 'YES' && (!accessGroup.userIdList || accessGroup.userIdList.length < 1)) {
                    showErrorsForUser = true;
                    errorMsg = 'ERROR_USER_REQUIRED_WIZARD';
                    isError = true;
                }
                break;
            case 5:
                var accessValidFrom = accessGroup.accessValidFrom != null && accessGroup.accessValidFrom;
                var accessValidTo = accessGroup.accessValidTo != null && accessGroup.accessValidTo;
                var scheduleStartsAt = accessGroup.scheduleStartsAt != null && accessGroup.scheduleStartsAt;
                var scheduleEndsAt = accessGroup.scheduleEndsAt != null && accessGroup.scheduleEndsAt;                

                var updatedAccessValidToDate = accessValidTo && new Date(accessValidTo).getTime();
                var today = new Date().getTime();

                if (accessValidFrom && accessValidTo && (accessValidFrom > accessValidTo)
                    || accessGroup.accessDurationSelection == 'limitedAccess' && (!accessValidFrom || !accessValidTo)) {
                    showErrorsForAccessSchedule = true;
                    errorMsg = 'ERROR_INVALID_ACCESS_VALIDITY';
                    isError = true;
                }
                else if (accessValidTo && (updatedAccessValidToDate < today)) {
                    showErrorsForAccessSchedule = true;
                    errorMsg = 'ERROR_PAST_ACCESS_DURATION_TO_DATE_NOT_ALLOWED';
                    isError = true;
                }
                else if (accessGroup.accessValidTo &&
                    new Date(accessGroup.accessValidTo).getTime() < today) {
                    showErrorsForAccessSchedule = true;
                    errorMsg = 'ERROR_PAST_ACCESS_DURATION_TO_DATE_NOT_ALLOWED';
                    isError = true;
                }
                else if (accessGroup.accessDaysSelection == "limitedDays" && (accessGroup.scheduleList == undefined
                    || accessGroup.scheduleList.length == 0)) {
                    showErrorsForAccessSchedule = true;
                    errorMsg = 'ERROR_ACCESS_DAY_SELECTION_REQUIRED';
                    isError = true;
                }
                else if (accessGroup.accessTimeSelection && accessGroup.accessTimeSelection != "allHours" &&
                    (accessGroup.scheduleStartsAt == undefined || accessGroup.scheduleEndsAt == undefined)) {
                    showErrorsForAccessSchedule = true;
                    errorMsg = 'ERROR_ACCESS_TIME_SELECTION_REQUIRED';
                    isError = true;
                }
                else if (scheduleStartsAt && scheduleEndsAt && (new Date(scheduleStartsAt) > new Date(scheduleEndsAt))
                    || accessGroup.accessTimeSelection == 'limitedHours' && (!scheduleEndsAt || !scheduleStartsAt)) {
                    showErrorsForAccessSchedule = true;
                    errorMsg = 'ERROR_INVALID_SCHEDULE_TIME';
                    isError = true;
                }
                break;
            default:
                 break;
        }

        this.setState({
            ...this.state,
            showErrorsForName: showErrorsForName,
            showErrorsForRemark: showErrorsForRemark,
            showErrorsForItemsList: showErrorsForItemsList,
            showErrorsForUserGroup: showErrorsForUserGroup,
            showErrorsForUser: showErrorsForUser,
            showErrorsForAccessSchedule: showErrorsForAccessSchedule,
            errorMsg: errorMsg
        });
        return isError;
    }

    setErrorByMsg(error: string) {
        let showErrorsForName = false;
        let showErrorsForAccessSchedule = false;
        switch(error) {
            case 'ERROR_ACCESSGROUP_NAME_REQUIRED':
            case 'ERROR_DUPLICATE_ACCESSGROUP_NAME':
                showErrorsForName = true;
                break;
            case 'ERROR_BOTH_ACCESS_VALID_DATE_VALUES_SHOULD_NULL_OR_SHOULD_HAVE_VALID_VALUES':
            case 'ERROR_SCHEDULE_DAYS_REQUIRED':
            case 'ERROR_BOTH_SCHEDULE_DATE_VALUES_SHOULD_NULL_OR_SHOULD_HAVE_VALID_VALUES':
            case 'ERROR_INVALID_DATE_FORMAT':
            case 'ERROR_INVALID_SCHEDULE_TIME':
            case 'ERROR_INVALID_ACCESS_VALIDITY':
                showErrorsForAccessSchedule = true;
                break;
            default:
                showErrorsForName = false;
                showErrorsForAccessSchedule = false;
        }

        this.setState({
            ...this.state,
            showErrorsForName: showErrorsForName,
            showErrorsForAccessSchedule: showErrorsForAccessSchedule,
            errorMsg: error
        });
    }

    onNameChange(value: any) {
        this.setState({ ...this.state, isDirty: true, showErrorsForName: false, accessGroup: { ...this.state.accessGroup, groupName: value } });
    }

    onRemarkChange(value: any) {
        this.setState({ ...this.state, isDirty: true, showErrorsForRemark: false, accessGroup: { ...this.state.accessGroup, remark: value } });
    }

    onCabinetItemsChange(value: TempSiteDetail[]) {
        let newCabinetDetailsList: CabinetDetail[] = []
        value.forEach(site => {
            site.isSelected && site.cabinets.forEach((cabinet) => {
                if (cabinet.isSelected) {
                    let newCabinetDetail: CabinetDetail = {
                        cabinetId: cabinet.cabinetId,
                        itemIndexes: []
                    };

                    cabinet.items && cabinet.items.forEach(item => {
                        item.isSelected && newCabinetDetail.itemIndexes.push(item.number);
                    });

                    newCabinetDetail.itemIndexes.length > 0 && newCabinetDetailsList.push(newCabinetDetail);
                }
            });
        });

        this.setState({ ...this.state, isDirty: true, accessGroup: { ...this.state.accessGroup, cabinetDetails: newCabinetDetailsList, tempSiteDetails: value } })
    }

    onUserGroupsChange(value: any) {
        this.setState({ ...this.state, isDirty: true, accessGroup: { ...this.state.accessGroup, userGroupList: value } });
    }

    onUsersChange(value: any) {
        this.setState({ ...this.state, isDirty: true, accessGroup: { ...this.state.accessGroup, userIdList: value } });
    }

    onAccessScheduleChange(value: any) {
        this.setState({ ...this.state, isDirty: true, accessGroup: { ...this.state.accessGroup, ...value } });
    }

    allowUserGroupChange(event: any) {
        this.setState({...this.state, allowUserGroups: event.target.value});
    }

    allowUserChange(event: any) {
        this.setState({...this.state, allowUsers: event.target.value});
    }

}


// WEBPACK FOOTER //
// ./src/modules/accessGroups/components/AccessGroupWizard/AccessGroupWizard.tsx