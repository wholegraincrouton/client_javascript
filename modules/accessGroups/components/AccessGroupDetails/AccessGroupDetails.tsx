import * as React from 'react';
import { Group } from '../../types/dto';
import { DetailPage, DetailPageContainer, DetailFormCheckBox } from '../../../shared/components/DetailPage';
import { DetailFormProps, DetailFormBodyComponent } from 'src/modules/shared/components/DetailPage/DetailForm';
import { contextService, localise, lookupService } from '../../../shared/services';
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { AccessSchedule } from './AccessSchedule';
import { FormField, FormAuditField } from 'src/modules/shared/components/Form';
import { Input, Row, Col, Button, Alert, Label } from 'reactstrap';
import { formValueSelector, SubmissionError } from 'redux-form';
import { store } from 'src/redux/store';
import { LookupItem } from 'src/modules/shared/types/dto';
import { CabinetDetail, TempSiteDetail } from 'src/modules/cabinet/types/dto';
import { UserGrid } from 'src/modules/shared/components/UserGrid/UserGrid';
import { accessGroupService } from 'src/modules/shared/components/AccessGroupList/access-group-list-service';
import { UserGroupGrid } from 'src/modules/shared/components/UserGroupGrid/UserGroupGrid';
import "./access-group.css";
import { permissionService } from 'src/modules/shared/services/permission.service';
import { SiteItemSelectControl } from 'src/modules/sites/shared/siteItemSelect/SiteItemSelectControl';

class AccessGroupDetails extends DetailPage<Group> {

    detailFormBody: DetailFormBodyComponent = FormBody;
    listPagePath: string = "/accessgroups/overview";

    validateItem(item: Group): any {
        return {};
    }

    beforeSave(item: Group, isNew: boolean): boolean {
        let error = this.validate(item, isNew);

        if (error) {
            throw new SubmissionError({
                _error: error
            });
        }

        if (item.tempSiteDetails) {
            item.cabinetDetails = this.getSavingCabinetDetails(item.tempSiteDetails);
            delete item.tempSiteDetails;
        }

        if (!item.scheduleList) { // For the first save if scheduleList == undefined => all days
            item.scheduleList = lookupService.getList('LIST_WEEKDAYS').map((lookItem: LookupItem) => {
                return lookItem.value || ''
            });
        }
        accessGroupService.clearAccessGroups();
        return true;
    }

    afterDelete() {
        accessGroupService.clearAccessGroups();
        return true;
    }

    validate(accessGroup: Group, isNew: boolean) {
        var accessValidFrom = accessGroup.accessValidFrom != null && accessGroup.accessValidFrom;
        var accessValidTo = accessGroup.accessValidTo != null && accessGroup.accessValidTo;
        var scheduleStartsAt = accessGroup.scheduleStartsAt != null && accessGroup.scheduleStartsAt;
        var scheduleEndsAt = accessGroup.scheduleEndsAt != null && accessGroup.scheduleEndsAt;

        var updatedAccessValidToDate = accessValidTo && new Date(accessValidTo).getTime();
        var today = new Date().getTime();
        
        if (accessValidFrom && accessValidTo && (accessValidFrom > accessValidTo)) {
            return 'ACCESS_SCHEDULE:ERROR_INVALID_ACCESS_VALIDITY';
        }
        else if (accessValidTo && isNew && (updatedAccessValidToDate < today)) {
            return "ACCESS_SCHEDULE:ERROR_PAST_ACCESS_DURATION_TO_DATE_NOT_ALLOWED";
        }
        else if (accessGroup.accessValidTo &&
            new Date(accessGroup.accessValidTo).getTime() < today) {
            return 'ACCESS_SCHEDULE:ERROR_PAST_ACCESS_DURATION_TO_DATE_NOT_ALLOWED';
        }
        else if (accessGroup.accessDurationSelection && accessGroup.accessDurationSelection != "unlimitedAccess" &&
            (accessGroup.accessValidFrom == undefined || accessGroup.accessValidTo == undefined)) {
            return 'ACCESS_SCHEDULE:ERROR_ACCESS_DURATION_SELECTION_REQUIRED';
        }
        else if (accessGroup.accessDaysSelection == "limitedDays" && (accessGroup.scheduleList == undefined
            || accessGroup.scheduleList.length == 0)) {
            return 'ACCESS_SCHEDULE:ERROR_ACCESS_DAY_SELECTION_REQUIRED';
        }
        else if (accessGroup.accessTimeSelection && accessGroup.accessTimeSelection != "allHours" &&
            (accessGroup.scheduleStartsAt == undefined || accessGroup.scheduleEndsAt == undefined)) {
            return 'ACCESS_SCHEDULE:ERROR_ACCESS_TIME_SELECTION_REQUIRED';
        }
        else if (scheduleStartsAt && scheduleEndsAt && (new Date(scheduleStartsAt) > new Date(scheduleEndsAt))) {
            return 'ACCESS_SCHEDULE:ERROR_INVALID_SCHEDULE_TIME';
        }
        else if (accessGroup.id != "" && (accessGroup.cabinetDetails == undefined || accessGroup.cabinetDetails.length == 0) &&
            accessGroup.tempSiteDetails == undefined) {
            return 'ACCESSIBLE_CABINETS:ERROR_PLEASE_SELECT_CABINET_GROUP_CABINET_ITEMS';
        }
        else if (accessGroup.tempSiteDetails) {
            let error = null;
            if (!accessGroup.tempSiteDetails.some(s => s.isSelected)) {
                error = 'ACCESSIBLE_CABINETS:ERROR_PLEASE_SELECT_SITE_CABINET_ITEMS';
            }
            accessGroup.tempSiteDetails.forEach(site => {
                if (site.isSelected) {
                    if (!site.cabinets.some(c => c.isSelected)) {
                        error = 'ACCESSIBLE_CABINETS:ERROR_PLEASE_SELECT_CABINET_FOR_SELECTED_SITE';
                    }
                    else {
                        site.cabinets.forEach(cabinet => {
                            if (cabinet.isSelected) {
                                if (!cabinet.items || !cabinet.items.some(i => i.isSelected)) {
                                    error = 'ACCESSIBLE_CABINETS:ERROR_PLEASE_SELECT_ITEMS_FOR_SELECTED_CABINET';
                                }
                            }
                        });
                    }
                }
            });
            return error;
        }
        else {
            return null;
        }
    }

    getSavingCabinetDetails(tempSiteDetails: TempSiteDetail[]) {
        let newCabinetDetailsList: CabinetDetail[] = []
        tempSiteDetails.forEach(site => {
            site.isSelected && site.cabinets.forEach((cabinet) => {
                if (cabinet.isSelected) {
                    let newCabinetDetail: CabinetDetail = {
                        cabinetId: cabinet.cabinetId,
                        itemIndexes: []
                    };

                    cabinet.items && cabinet.items.forEach(item => {
                        item.isSelected && newCabinetDetail.itemIndexes.push(item.number);
                    });

                    newCabinetDetail.itemIndexes.length > 0 && newCabinetDetailsList.push(newCabinetDetail); // If atleast one item selected add to the list
                }
            });
        });
        return newCabinetDetailsList;
    }

    hideDescriptionHeader() {
        return true;
    }
}

interface LocalState {
    selectedTab: number;
    isAccessScheduleVisible: boolean;
    accessDurationSelection?: string;
    accessDaysSelection?: string;
    accessTimeSelection?: string;
    accessValidFrom?: string | null;
    accessValidTo?: string | null;
    scheduleStartsAt?: string | null;
    scheduleEndsAt?: string | null;
    scheduleList?: string[];
    isUnlimitedAccess?: boolean;
    selectedCabinets?: CabinetDetail[];
}

class FormBody extends React.Component<DetailFormProps, LocalState> {
    constructor(props: DetailFormProps) {
        super(props);
        this.onSelectTab = this.onSelectTab.bind(this);
        this.toggleAccessScheduleVisibility = this.toggleAccessScheduleVisibility.bind(this);
        this.onRadioSelectionChange = this.onRadioSelectionChange.bind(this);
        this.changeAccessDaysSelection = this.changeAccessDaysSelection.bind(this);
        this.toggleIndefiniteAccess = this.toggleIndefiniteAccess.bind(this);
        this.onUserGroupsChange = this.onUserGroupsChange.bind(this);
        this.onUsersChange = this.onUsersChange.bind(this);
        this.onCabinetItemsChange = this.onCabinetItemsChange.bind(this);
        this.onAccessValidFromDateChange = this.onAccessValidFromDateChange.bind(this);
        this.onAccessValidToDateChange = this.onAccessValidToDateChange.bind(this);

        const selector = formValueSelector(this.props.form);
        const formState = store.getState();
        var accessValidFrom = selector(formState, 'accessValidFrom');
        var scheduleList = selector(formState, 'scheduleList');
        var scheduleStartsAt = selector(formState, 'scheduleStartsAt');
        var selectedCabinets = selector(formState, 'cabinetDetails');

        this.state = {
            selectedTab: 0,
            isAccessScheduleVisible: false,
            accessDurationSelection: accessValidFrom == undefined ? "unlimitedAccess" : "limitedAccess",
            accessDaysSelection: scheduleList == undefined ? "allDays" :
                scheduleList.length == 7 ? "allDays" : "limitedDays",
            accessTimeSelection: scheduleStartsAt ? "limitedHours": "allHours",
            scheduleList: props.isNew ? lookupService.getList('LIST_WEEKDAYS').map((lookItem: LookupItem) => {
                return lookItem.value || ''
            }) : scheduleList,
            selectedCabinets: selectedCabinets
        };
    }

    //#region UI Elements

    getTabHeader(titleKey: string, hasError: boolean = false, isDisabled: boolean = false) {
        return (
            <>
                <Label className="mt-1 mb-1" title={hasError ? localise("TEXT_ERROR_VERIFY_DATA_TAB") :
                    isDisabled ? localise("TEXT_PLEASE_SAVE_TO_PROCEED") : ""}>
                    {localise(titleKey)} {hasError && <i className="fas fa-exclamation-circle error-tab-icon"></i>}
                </Label>
            </>
        );
    }

    getTabContentDescription(descriptionKey: string, includeRequiredFlag: boolean = false) {
        return (
            <Row className="mb-2">
                <Col>
                    <small className="text-muted">{localise(descriptionKey)}</small>
                </Col>
                {
                    includeRequiredFlag &&
                    <Col md="auto">
                        <small className="text-muted">{localise('TEXT_REQUIRED_FIELD')}</small>
                    </Col>
                }
            </Row>
        );
    }

    getErrorAlertRow(errorMsg: string) {
        return (
            <Row className="mt-2 mb-2">
                <Col>
                    <Alert className="mb-0" color="danger">
                        <small className="text-danger">{localise(errorMsg)}</small>
                    </Alert>
                </Col>
            </Row>
        );
    }

    //#endregion

    //#region Event Handlers

    onSelectTab(e: any) {
        this.setState({ ...this.state, selectedTab: e.selected })
    }

    //#region Access Schedule

    toggleIndefiniteAccess(event: any) {
        const { props } = this;
        let checked = event.target.value;

        let newScheduleList = checked ? this.getAllDays() : this.getLimitedDays();
        let newAccessDurationSelection = checked ? 'unlimitedAccess' : 'limitedAccess';
        let newAccessDaysSelection = checked ? 'allDays' : 'limitedDays';
        let newAccessTimeSelection = checked ? 'allHours' : 'limitedHours';

        props.change("scheduleList", newScheduleList);
        props.change("accessDurationSelection", newAccessDurationSelection);
        props.change("accessDaysSelection", newAccessDaysSelection);
        props.change("accessTimeSelection", newAccessTimeSelection);

        if (checked) {
            props.change("scheduleStartsAt", null);
            props.change("scheduleEndsAt", null);
            props.change("accessValidFrom", null);
            props.change("accessValidTo", null);
        }

        this.setState({
            ...this.state,
            scheduleList: newScheduleList,
            accessDurationSelection: newAccessDurationSelection,
            accessDaysSelection: newAccessDaysSelection,
            accessTimeSelection: newAccessTimeSelection
        });
    }

    toggleAccessScheduleVisibility() {
        this.setState({ ...this.state, isAccessScheduleVisible: !this.state.isAccessScheduleVisible });
    }

    onRadioSelectionChange(event: any) {
        switch (event.target.value) {
            case 'unlimitedAccess':
            case 'limitedAccess':
                this.setState({
                    ...this.state,
                    accessDurationSelection: event.target.value,
                    accessValidTo: null,
                    accessValidFrom: null
                });
                break;
            case 'allDays':
                this.setState({
                    ...this.state,
                    scheduleList: this.getAllDays(),
                    accessDaysSelection: event.target.value,
                });
                break;
            case 'limitedDays':
                this.setState({
                    ...this.state,
                    scheduleList: this.getLimitedDays(),
                    accessDaysSelection: event.target.value,
                });
                break;
            case 'allHours':
            case 'limitedHours':
                this.setState({
                    ...this.state,
                    accessTimeSelection: event.target.value,
                });
                break;
        }
    }

    changeAccessDaysSelection(selectedDays: any) {
        if (selectedDays.length == 7) {
            this.setState({
                ...this.state,
                accessDaysSelection: 'allDays',
            });
        }
        else {
            this.setState({
                ...this.state,
                accessDaysSelection: 'limitedDays',
            });
        }
    }

    //#endregion

    onUsersChange(users: string[]) {
        this.props.change("userIdList", users);
    }

    onUserGroupsChange(userGroups: string[]) {
        this.props.change("userGroupList", userGroups);
    }

    onCabinetItemsChange(siteCabinetItems: TempSiteDetail[]) {
        this.props.change("tempSiteDetails", siteCabinetItems);
    }

    onAccessValidFromDateChange(date: string) {
        this.props.change("accessValidFrom", date);
    }

    onAccessValidToDateChange(date: string) {
        this.props.change("accessValidTo", date);
    }
    //#endregion

    getAllDays() {
        let allDays = lookupService.getList('LIST_WEEKDAYS').map((lookItem: LookupItem) => {
            return lookItem.value || ''
        });
        return allDays;
    }

    getLimitedDays() {
        let limitedDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
        return limitedDays;
    }

    render() {
        const { props: formProps } = this;
        const { selectedTab, isAccessScheduleVisible, accessDurationSelection, accessDaysSelection, accessTimeSelection,
            accessValidFrom, accessValidTo, scheduleStartsAt, scheduleEndsAt, scheduleList, selectedCabinets } = this.state;
        const errorTab = formProps.error && formProps.error.split(":")[0];
        const errorMsg = formProps.error && formProps.error.split(":")[1];
        const { item } = this.props;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');
        
        return (
            <div className="access-group-tabs">
                <TabStrip selected={selectedTab} onSelect={this.onSelectTab} keepTabsMounted={true}>
                    <TabStripTab title={this.getTabHeader("TEXT_ACCESS_GROUP_DETAILS", errorTab == "ACCESS_SCHEDULE")}
                        contentClassName="access-group-details-tab">
                        {errorTab == "ACCESS_SCHEDULE" && this.getErrorAlertRow(errorMsg)}
                        {this.getTabContentDescription("TEXT_ACCESS_GROUP_DETAILS_DESCRIPTION", true)}
                        <Row>
                            <Col>
                                <FormField remarksKey="REMARK_ACCESSGROUP_NAME" required={true} labelKey="TEXT_ACCESSGROUP_NAME" name="groupName"
                                    component={Input} disabled={!isPermittedToEdit}/>
                                <FormField remarksKey="REMARK_ACCESSGROUP_REMARK" required={true} labelKey="TEXT_REMARK" name="remark"
                                    component={Input} disabled={!isPermittedToEdit}/>
                                <div className="form-group">
                                    <Label>{localise("TEXT_ACCESS_SCHEDULE")}</Label>
                                </div>
                                <Row>
                                    <Col>
                                        <FormField name="accessSchedule"
                                            component={(props: any) => <DetailFormCheckBox {...props} fieldName="TEXT_INDEFINITE_ACCESS" onChange={this.toggleIndefiniteAccess}
                                                value={accessDurationSelection == 'unlimitedAccess' && accessDaysSelection == 'allDays' && accessTimeSelection == 'allHours'}
                                                isDisabled={!isPermittedToEdit}
                                            ></DetailFormCheckBox>}
                                        />
                                    </Col>
                                    <Col align="right">
                                        <Button color="link" onClick={this.toggleAccessScheduleVisibility} style={{ paddingTop: 0 }} >
                                            {localise(isAccessScheduleVisible ? "BUTTON_HIDE_ADVANCE_ACCESS_SCHEDULE_CONFIGURATIONS" : "BUTTON_SHOW_ADVANCE_ACCESS_SCHEDULE_CONFIGURATIONS")}
                                            <i className={"fas " + (isAccessScheduleVisible ? "fa-angle-up" : "fa-angle-down")} style={{ marginLeft: 10 }}></i>
                                        </Button>
                                    </Col>
                                </Row>
                                {
                                    isAccessScheduleVisible &&
                                    <AccessSchedule {...formProps} isNew={formProps.isNew}
                                        onRadioSelectionChange={this.onRadioSelectionChange}
                                        accessDurationSelection={accessDurationSelection}
                                        accessDaysSelection={accessDaysSelection}
                                        accessTimeSelection={accessTimeSelection}
                                        accessValidFrom={accessValidFrom}
                                        accessValidTo={accessValidTo}
                                        scheduleStartsAt={scheduleStartsAt}
                                        scheduleEndsAt={scheduleEndsAt}
                                        scheduleList={scheduleList}
                                        onFromDateChange={this.onAccessValidFromDateChange}
                                        onToDateChange={this.onAccessValidToDateChange}
                                        changeAccessDaysSelection={this.changeAccessDaysSelection}
                                        isPermittedToEdit={isPermittedToEdit}/>
                                }
                                <FormAuditField updatedOnUtc={formProps.item.updatedOnUtc} updatedByName={formProps.item.updatedByName} />
                            </Col>
                        </Row>
                    </TabStripTab>
                    <TabStripTab title={this.getTabHeader("TEXT_ACCESS_FOR_USERGROUPS", errorTab == "USER_ROLES", formProps.isNew)}
                        contentClassName="access-group-roles-tab" disabled={formProps.isNew}>
                        {errorTab == "USER_ROLES" && this.getErrorAlertRow(errorMsg)}
                        {this.getTabContentDescription("TEXT_ACCESS_USERGROUPS_DESCRIPTION")}
                        <UserGroupGrid customerId={formProps.item.customerId} userGroupList={formProps.item.userGroupList} onChange={this.onUserGroupsChange} readonly={!isPermittedToEdit}/>
                    </TabStripTab>
                    <TabStripTab title={this.getTabHeader("TEXT_ACCESS_FOR_USERS", errorTab == "USER_ROLES", formProps.isNew)}
                        contentClassName="access-group-users-tab" disabled={formProps.isNew}>
                        {errorTab == "USER_ROLES" && this.getErrorAlertRow(errorMsg)}
                        {this.getTabContentDescription("TEXT_ACCESS_USERS_DESCRIPTION")}
                        <UserGrid customerId={formProps.item.customerId} userList={formProps.item.userIdList} onChange={this.onUsersChange}
                            columns={['description', 'designation']} readonly={!isPermittedToEdit}/>
                    </TabStripTab>
                    <TabStripTab title={this.getTabHeader("TEXT_ACCESSIBLE_CABINETS_ITEMS", errorTab == "ACCESSIBLE_CABINETS", formProps.isNew)}
                        contentClassName="access-group-cabinets-tab" disabled={formProps.isNew}>
                        {errorTab == "ACCESSIBLE_CABINETS" && this.getErrorAlertRow(errorMsg)}
                        {this.getTabContentDescription("TEXT_ACCESSIBLE_CABINETS_DESCRIPTION", true)}
                        <SiteItemSelectControl customerId={formProps.item.customerId} selectedCabinets={selectedCabinets}
                            onChange={this.onCabinetItemsChange} siteSelectRemark="REMARK_ACCESS_DEFINITION_SITES"
                            cabinetSelectRemark="REMARK_ACCESS_DEFINITION_CABINETS" cabinetItemSelectRemark="REMARK_ACCESS_DEFINITION_ACCESSIBLE_ITEMS" 
                            readonly={!isPermittedToEdit}/>
                    </TabStripTab>
                </TabStrip>
            </div>
        );
    }
}

export default DetailPageContainer(AccessGroupDetails, "AccessGroupDetails", "groups", () => {
    //Code to return a new empty object.
    return { id: "", customerId: contextService.getCurrentCustomerId() }
});



// WEBPACK FOOTER //
// ./src/modules/accessGroups/components/AccessGroupDetails/AccessGroupDetails.tsx