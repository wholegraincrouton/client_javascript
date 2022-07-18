import { orderBy, SortDescriptor } from "@progress/kendo-data-query";
import { AutoComplete } from "@progress/kendo-react-dropdowns";
import { Grid, GridCellProps, GridColumn, GridSelectionChangeEvent, GridSortChangeEvent } from "@progress/kendo-react-grid";
import React from "react";
import { Card, CardBody, Col, Input, Label, Row } from "reactstrap";
import { RoleDropDown } from "src/modules/security/components/RoleDropDown/RoleDropDown";
import { ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { FormAuditField } from "src/modules/shared/components/Form";
import FormFieldContent from "src/modules/shared/components/Form/FormFieldContent";
import { NumericInput } from "src/modules/shared/components/NumericInput/NumericInput";
import { WizardDialog } from "src/modules/shared/components/WizardDialog/WizardDialog";
import { apiService, confirmDialogService, customerService, localise, lookupService, notificationDialogService, permissionService } from "src/modules/shared/services";
import { BasicUser, DataUpdateResult } from "src/modules/shared/types/dto";
import { userService } from "src/modules/users/services/user.service";
import { UserGroup } from "../../types/dto";
import "./user-group-wizard.css"

interface State {
    currentStep: number;
    isDirty: boolean;
    showErrors: boolean;
    errorMsg: string;
    userGroup: UserGroup;
    users: GridUser[];
    filteredItems: GridUser[];
    selectedUsers: string[];
    sort: SortDescriptor[];
    filter: Filter;
}

interface Filter {
    name: string;
    role: string;
    email: string;
    mobileNumber: string;
}

interface GridUser extends BasicUser {
    rowSelected: boolean;
    rowDisabled: boolean;
}

interface Props {
    closeDialog: () => void;
}


export class UserGroupWizard extends React.Component<Props, State> {
    nameInput = (props: any) => <Input {...props} />
    constructor(props: Props) {
        super(props);

        let customer = customerService.getCurrentCustomerData();

        this.state = {
            currentStep: 1,
            isDirty: false,
            showErrors: false,
            errorMsg: '',
            userGroup: {
                id: '',
                customerId: customer!.id,
                name: '',
                remark: '',
                userCount: 0,
                userList: [],
                externalSystemId: ""
            },
            users: [],
            filteredItems: [],
            selectedUsers: [],
            sort: [{ field: "name", dir: "asc" }],
            filter: {
                name: "",
                role: "any",
                email: "",
                mobileNumber: ""
            }
        };
        this.onCancelClick = this.onCancelClick.bind(this);
        this.onBackClick = this.onBackClick.bind(this);
        this.onNextClick = this.onNextClick.bind(this);
        this.onSaveClick = this.onSaveClick.bind(this);
        this.validate = this.validate.bind(this);
        this.getComponent = this.getComponent.bind(this);
        this.onSort = this.onSort.bind(this);
        this.onRowRender = this.onRowRender.bind(this);
        this.onNameChange = this.onNameChange.bind(this);
        this.onRemarkChange = this.onRemarkChange.bind(this);
        this.onUserNameChange = this.onUserNameChange.bind(this);
        this.onRoleFilterChange = this.onRoleFilterChange.bind(this);
        this.onUserEmailChange = this.onUserEmailChange.bind(this);
        this.onMobileNumberChange = this.onMobileNumberChange.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.onHeaderSelectionChange = this.onHeaderSelectionChange.bind(this);
        this.dirtyPageHandler = this.dirtyPageHandler.bind(this);
        
        window.addEventListener("beforeunload", this.dirtyPageHandler);
    }

    componentDidMount() {
        const { userGroup } = this.state;
        userService.getUsers(userGroup.customerId, false).then(data => {
            const gridUsers = data.map(user => {
                return {
                    ...user,
                    rowSelected: userGroup.userList && userGroup.userList.includes(user.id),
                    rowDisabled: user.externalSystemId != undefined
                }
            });

            this.setState({
                users: gridUsers,
                filteredItems: gridUsers,
                selectedUsers: userGroup.userList
            });
        });
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
                showErrors: false,
                errorMsg: '',
                currentStep: this.state.currentStep + 1,
            });
        }
        else {
            this.setState({ ...this.state, showErrors: true, errorMsg: error });
        }
    }

    onSaveClick() {
        const { closeDialog } = this.props;
        const { selectedUsers } = this.state;
        let { userGroup } = this.state;
        const error = this.validate();

        userGroup.userList = selectedUsers;
        userGroup.userCount = selectedUsers.length;

        if (!error) {
            this.setState({ ...this.state, showErrors: false, errorMsg: '' });

            apiService.post<DataUpdateResult>('userGroup', undefined, userGroup, [], true)
                .then((e: any) => {
                    closeDialog();
                    notificationDialogService.showDialog(
                        'CONFIRMATION_SAVE_USER_GROUP', () => { }, 'TEXT_NEW_USER_GROUP_CREATED');
                })
                .catch((e: any) => {
                    console.log(e);
                    notificationDialogService.showDialog(
                        e.response.data || 'TEXT_ERROR', () => { }, 'TEXT_ERROR');
                    this.setState({ ...this.state, showErrors: true, errorMsg: e.response.data });
                });
        }
        else {
            this.setState({ ...this.state, showErrors: true, errorMsg: error });
        }
    }

    getSteps() {
        const steps = [
            { label: localise('TEXT_DETAILS') },
            { label: localise('TEXT_USER_LIST') }
        ];

        return steps;
    }

    getComponent(stepNumber: number) {
        const { userGroup, sort, filter, filteredItems, users, showErrors, errorMsg } = this.state;
        const isExternalUserGroup = userGroup.externalSystemId ? true : false;

        const filteredNames = users.filter(u => u.name.toLowerCase().includes(filter.name.toLowerCase())).map(u => u.name);
        const filteredEmails = users.filter(u => u.email && u.email.toLowerCase().includes(filter.email.toLowerCase())).map(u => u.email);
        const allItemsSelected = users.every(user => user.rowSelected);
        const selectedUserCount = users.filter(user => user.rowSelected).length;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(userGroup.id ? 'UPDATE' : 'NEW');

        switch (stepNumber) {
            case 1:
                return (
                    <>
                        <Row className="mb-2">
                            <Col>
                                <small className="text-muted">{localise("TEXT_PAGE_DESCRIPTION")}</small>
                            </Col>
                            <Col md="auto">
                                <small className="text-muted">{localise('TEXT_REQUIRED_FIELD')}</small>
                            </Col>
                        </Row>
                        <FormFieldContent labelKey={localise("TEXT_USER_GROUP") + " " + localise("TEXT_NAME")}
                            remarksKey="REMARK_USER_GROUP_NAME"
                            required={true}
                            disabled={!isPermittedToEdit || isExternalUserGroup}
                            tooltip={isExternalUserGroup ? localise("ERROR_CANNOT_EDIT_EXTERNAL_SYSTEM_USERGROUPS") : ""}
                            inputComponent={this.nameInput}
                            meta={{ error: localise(errorMsg), touched: showErrors, warning: undefined }}
                            input={{ onChange: this.onNameChange, value: userGroup.name }} />
                        <FormFieldContent labelKey="TEXT_REMARK"
                            remarksKey="REMARK_REMARK"
                            required={false} disabled={!isPermittedToEdit || isExternalUserGroup}
                            tooltip={isExternalUserGroup ? localise("ERROR_CANNOT_EDIT_EXTERNAL_SYSTEM_USERGROUPS") : ""}
                            inputComponent={Input}
                            meta={{ error: '', touched: showErrors, warning: undefined }}
                            input={{ onChange: this.onRemarkChange, value: userGroup.remark }} />
                        <FormAuditField updatedOnUtc={userGroup.updatedOnUtc} updatedByName={userGroup.updatedByName} />
                    </>
                );
            case 2:
                return (
                    <>
                        <Row className="mb-2">
                            <Col>
                                <small className="text-muted">{localise("REMARK_USER_LIST")}</small>
                            </Col>
                        </Row>

                        {/* <div className="largeScreen"> */}
                        <Row className="mb-2 filter-box">
                            <Col sm={6} md={6} lg={9} xl={9}>
                                <Row>
                                    <Col sm={6} lg={4} xl={3} className="filter-column">
                                        <Row>
                                            <Col>
                                                <Label className="system-label mb-0">{localise("TEXT_NAME")}</Label>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <AutoComplete data={filteredNames} value={filter.name}
                                                    popupSettings={{ className: 'user-group-name-suggest-popover' }} onChange={this.onUserNameChange} />
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col sm={6} lg={4} xl={3} className="filter-column">
                                        <Row>
                                            <Col>
                                                <Label className="system-label mb-0">{localise("TEXT_ROLE")}</Label>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <RoleDropDown allowAny={true} textAny="TEXT_ANY"
                                                    value={filter.role} onChange={this.onRoleFilterChange} />
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col sm={6} lg={4} xl={3} className="filter-column">
                                        <Row>
                                            <Col>
                                                <Label className="system-label mb-0">{localise("TEXT_EMAIL")}</Label>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <AutoComplete data={filteredEmails} value={filter.email} className="user-group-email-suggest"
                                                    popupSettings={{ className: 'user-group-email-suggest-popover' }} onChange={this.onUserEmailChange} />
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col sm={6} lg={4} xl={3} className="filter-column">
                                        <Row>
                                            <Col>
                                                <Label className="system-label mb-0">{localise("TEXT_MOBILE")}</Label>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <NumericInput onChange={this.onMobileNumberChange} value={filter.mobileNumber} />
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Col>
                            <Col sm={6} md={6} lg={3} xl={3} className="text-right pl-0">
                                <Row className="search-button-wizard">
                                    <Col>
                                        <ActionButton textKey="BUTTON_SEARCH" color="primary" onClick={this.onSearch}
                                            icon="fa-search" disableDefaultMargin={true} />
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <hr />
                        {
                            filteredItems.length > 0 ?
                                <>
                                    <Row>
                                        <Col>
                                            <small className="grid-selection-count">({selectedUserCount}/{users.length} {localise("TEXT_SELECTED")})</small>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <div className="largeScreen">
                                                <Grid
                                                    className={!isPermittedToEdit ? "disabled-grid" : ""}
                                                    data={orderBy(filteredItems, sort)}
                                                    sort={this.state.sort}
                                                    sortable={{ allowUnsort: false, mode: 'single' }}
                                                    onSortChange={this.onSort}
                                                    rowRender={this.onRowRender}
                                                    selectedField="rowSelected"
                                                    onSelectionChange={this.onSelectionChange}
                                                    onHeaderSelectionChange={this.onHeaderSelectionChange}>
                                                    <GridColumn field="rowSelected" width="auto" className="checkbox-grid-column"
                                                        headerClassName="checkbox-grid-column" headerSelectionValue={allItemsSelected} />
                                                    <GridColumn field="name" title={localise("TEXT_NAME")} />
                                                    <GridColumn field="rolesInCustomer" sortable={false} title={localise("TEXT_ROLES")} cell={BasicUserCustomerRolesCell()} />
                                                    <GridColumn field="designation" title={localise("TEXT_DESIGNATION")} />
                                                    <GridColumn field="mobileNumber" title={localise("TEXT_MOBILE")} />
                                                    <GridColumn field="email" title={localise("TEXT_EMAIL")} />
                                                </Grid>
                                            </div>
                                            <div className="smallScreen">
                                                <Grid
                                                    className={!isPermittedToEdit ? "disabled-grid" : ""}
                                                    data={orderBy(filteredItems, sort)}
                                                    sort={this.state.sort}
                                                    sortable={{ allowUnsort: false, mode: 'single' }}
                                                    onSortChange={this.onSort}
                                                    rowRender={this.onRowRender}
                                                    selectedField="rowSelected"
                                                    onSelectionChange={this.onSelectionChange}
                                                    onHeaderSelectionChange={this.onHeaderSelectionChange}>
                                                    <GridColumn field="rowSelected" width="auto" className="checkbox-grid-column"
                                                        headerClassName="checkbox-grid-column" headerSelectionValue={allItemsSelected} />
                                                    <GridColumn field="name" title={localise("TEXT_NAME")} />
                                                    <GridColumn field="rolesInCustomer" sortable={false} title={localise("TEXT_ROLES")} cell={BasicUserCustomerRolesCell()} />
                                                    <GridColumn field="designation" title={localise("TEXT_DESIGNATION")} />
                                                </Grid>
                                            </div>
                                        </Col>
                                    </Row>
                                </>
                                :
                                <Card className="text-muted text-center mb-0">
                                    <CardBody>
                                        <span>{localise("ERROR_SEARCH_RESULT")}</span>
                                    </CardBody>
                                </Card>
                        }
                    </>
                );
            default:
                return <></>;
        }
    }

    validate() {
        const { userGroup } = this.state;
        if (!userGroup.name) {
            return 'ERROR_NAME_REQUIRED';
        }
        return '';
    }

    onNameChange(value: any) {
        this.setState({ ...this.state, isDirty: true, userGroup: { ...this.state.userGroup, name: value } });
    }

    onRemarkChange(value: any) {
        this.setState({ ...this.state, isDirty: true, userGroup: { ...this.state.userGroup, remark: value } });
    }

    onSelectionChange(event: GridSelectionChangeEvent) {
        const { users, selectedUsers } = this.state;
        const user = users.find(c => c.id == event.dataItem.id);

        var selectedList: string[] = selectedUsers.map(u => { return u });

        if (user) {
            user.rowSelected = !user.rowSelected;

            if (user.rowSelected) {
                selectedList.push(user.id);
            }
            else {
                let index = selectedList.indexOf(user.id);
                selectedList.splice(index, 1);
            }
            this.setState({
                ...this.state,
                selectedUsers: selectedList,
                users
            });
        }
    }

    onHeaderSelectionChange(event: any) {
        const isSelected = event.nativeEvent.target.checked;
        const { users } = this.state;
        users.forEach(u => u.rowSelected = isSelected);
        var selectedList: string[] = [];
        if (isSelected) {
            users.forEach(u => selectedList.push(u.id));
        } else {
            selectedList = [];
        }
        this.setState({ users, selectedUsers: selectedList });
    }

    onUserNameChange(e: any) {
        this.setState({ ...this.state, filter: { ...this.state.filter, name: e.target.value } });
    }

    onRoleFilterChange(e: any) {
        this.setState({ ...this.state, filter: { ...this.state.filter, role: e.target.value } });
    }

    onUserEmailChange(e: any) {
        this.setState({ ...this.state, filter: { ...this.state.filter, email: e.target.value } });
    }

    onMobileNumberChange(e: any) {
        this.setState({ ...this.state, filter: { ...this.state.filter, mobileNumber: e.target.value } });
    }

    onSearch() {
        const { filter, users } = this.state;

        let filteredItems = users.filter(i =>
            (!filter.name || i.name.trim().toLowerCase().includes(filter.name.trim().toLowerCase())) &&
            (!filter.email || i.email && i.email.trim().toLowerCase().includes(filter.email.trim().toLowerCase())) &&
            (!filter.mobileNumber || i.mobileNumber && i.mobileNumber.trim().includes(filter.mobileNumber.trim())) &&
            (filter.role == 'any' || i.rolesInCustomer.includes(filter.role)));

        this.setState({ ...this.state, filteredItems: filteredItems });
    }

    onSort(e: GridSortChangeEvent) {
        this.setState({
            ...this.state,
            sort: e.sort
        })
    }

    onRowRender(tr: any) {
        return React.cloneElement(tr, {
            ...tr.props,
            className: tr.props.className + ' non-selectable-row'
        }, tr.props.children);
    }

    render() {
        const { currentStep } = this.state;

        return (
            <WizardDialog titleKey={localise('TEXT_ADD_NEW_USER_GROUP')} stepCount={2} steps={this.getSteps()}
                currentStep={currentStep} component={this.getComponent(currentStep)}
                onBackClick={this.onBackClick} onNextClick={this.onNextClick}
                onCancelClick={this.onCancelClick} onSaveClick={this.onSaveClick} />
        );
    }
}


export function BasicUserCustomerRolesCell(highlightField?: string) {
    return class extends React.Component<GridCellProps> {
        getRolesText() {
            const { rolesInCustomer } = this.props.dataItem as BasicUser;

            if (rolesInCustomer && rolesInCustomer.length > 0) {
                const roles = rolesInCustomer.map(cr => lookupService.getText("LIST_ROLES", cr));
                return roles.join('\n');
            }
            return '';
        }

        render() {
            return (
                <td className={highlightField && this.props.dataItem[highlightField] ? "highlight-cell" : ""}>
                    {this.getRolesText()}
                </td>
            );
        }
    }
}



// WEBPACK FOOTER //
// ./src/modules/userGroups/components/UserGroupWizard/UserGroupWizard.tsx