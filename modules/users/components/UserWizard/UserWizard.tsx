import React from "react";
import { Alert, Card, CardBody, Col, Input, Label, Row } from "reactstrap";
import { orderBy, SortDescriptor } from "@progress/kendo-data-query";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import {
    apiService, configService, confirmDialogService, customerService,
    localise, lookupService, notificationDialogService, permissionService, utilityService
} from "src/modules/shared/services";
import { softwareRoles } from "../../constants/user-roles.constants";
import FormFieldContent from "src/modules/shared/components/Form/FormFieldContent";
import { ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import { NumericInput } from "src/modules/shared/components/NumericInput/NumericInput";
import { cabinetService } from "src/modules/cabinet/services/cabinet.service";
import { WizardDialog } from "src/modules/shared/components/WizardDialog/WizardDialog";
import { CabinetBasicDetails } from "src/modules/cabinet/types/dto";
import { PermissionConfig } from "src/modules/security/types/dto";
import { DataUpdateResult } from "src/modules/shared/types/dto";
import { BiometricData, CardDataConst, CustomerCabinets, User, UserCustomerRole } from "../../types/dto";
import './user-wizard.css';

interface Props {
    customerId: string;
    closeDialog: () => void;
}

interface State {
    currentStep: number;
    isDirty: boolean;
    showErrors: boolean;
    errorMsg: string;
    user: User;
    customerWebRoles: GridRole[];
    customerCabinetRoles: GridRole[];
    customerCabinets: GridCabinet[];
    webRoleGridSort: SortDescriptor[];
    cabinetRoleGridSort: SortDescriptor[];
    cabinetGridSort: SortDescriptor[];
    showBiometricData: boolean;
    editableWebSection: boolean;
    facilityCodeInHex?: string;
    facilityCodeInBinary?: string;
    cardIdInHex?: string;
    cardIdInBinary?: string;
    issueCodeInHex?: string;
    issueCodeInBinary?: string;
}

interface GridRole extends PermissionConfig {
    name: string;
    description: string;
    rowSelected: boolean;
}

interface GridCabinet extends CabinetBasicDetails {
    rowSelected: boolean;
    address: string;
}

export class UserWizard extends React.Component<Props, State> {
    webGridName: string = 'web-roles-grid';
    cabinetGridName: string = 'cabinet-roles-grid';

    constructor(props: Props) {
        super(props);
        this.onCancelClick = this.onCancelClick.bind(this);
        this.onBackClick = this.onBackClick.bind(this);
        this.onNextClick = this.onNextClick.bind(this);
        this.onSaveClick = this.onSaveClick.bind(this);
        this.validate = this.validate.bind(this);
        this.onFirstNameChange = this.onFirstNameChange.bind(this);
        this.onLastNameChange = this.onLastNameChange.bind(this);
        this.onJobTitleNameChange = this.onJobTitleNameChange.bind(this);
        this.onCompanyChange = this.onCompanyChange.bind(this);
        this.onTimezoneChange = this.onTimezoneChange.bind(this);
        this.onMobileNumberChange = this.onMobileNumberChange.bind(this);
        this.onEmailChange = this.onEmailChange.bind(this);
        this.onOTPChange = this.onOTPChange.bind(this);
        this.onRoleSortChange = this.onRoleSortChange.bind(this);
        this.onRoleSelectionChange = this.onRoleSelectionChange.bind(this);
        this.onRoleHeaderSelectionChange = this.onRoleHeaderSelectionChange.bind(this);
        this.onRolesChange = this.onRolesChange.bind(this);
        this.onCabinetSortChange = this.onCabinetSortChange.bind(this);
        this.onCabinetSelectionChange = this.onCabinetSelectionChange.bind(this);
        this.onCabinetHeaderSelectionChange = this.onCabinetHeaderSelectionChange.bind(this);
        this.onCabinetsChange = this.onCabinetsChange.bind(this);
        this.onAlternateIdChange = this.onAlternateIdChange.bind(this);
        this.toggleBiometricData = this.toggleBiometricData.bind(this);
        this.toggleWebSection = this.toggleWebSection.bind(this);
        this.getPinLength = this.getPinLength.bind(this);
        this.onCardDataChange = this.onCardDataChange.bind(this);
        this.onTextFieldChange = this.onTextFieldChange.bind(this);
        this.onBinaryDataChange = this.onBinaryDataChange.bind(this);
        this.getHexValue = this.getHexValue.bind(this);
        this.getBinaryValue = this.getBinaryValue.bind(this);
        this.getComponent = this.getComponent.bind(this);

        let customer = customerService.getCurrentCustomerData();

        this.state = {
            currentStep: 1,
            isDirty: false,
            showErrors: false,
            errorMsg: '',
            user: {
                id: '',
                company: customer && customer.name,
                culture: '*',
                timeZone: 'AUS Eastern Standard Time',
                mobileNumber: '',
                email: '',
                isTwoFactorAuthEnabled: true,
                customerRoles: [{ customerId: props.customerId, role: 'CABINET_USER' }],
                customerCabinets: [],
                biometricData: []
            },
            customerWebRoles: [],
            customerCabinetRoles: [],
            customerCabinets: [],
            webRoleGridSort: [{ field: 'name', dir: 'asc' }],
            cabinetRoleGridSort: [{ field: 'name', dir: 'asc' }],
            cabinetGridSort: [{ field: 'name', dir: 'asc' }],
            showBiometricData: false,
            editableWebSection: false
        };
    }

    componentDidMount() {
        const { customerId } = this.props;
        const { user } = this.state;

        if (customerId && user && user.customerRoles) {
            let roleLookup = lookupService.getList('LIST_ROLES', customerId);

            permissionService.getConfiguredRoles(customerId).then((roles: PermissionConfig[]) => {
                cabinetService.getCabinets(customerId, false, true).then((data: CabinetBasicDetails[]) => {
                    let customerCabinetList = user.customerCabinets && user.customerCabinets.find(c => c.customerId == customerId);

                    this.setState({
                        customerWebRoles: roles.filter(r => softwareRoles.includes(r.role || '')).map((r) => {
                            let item = roleLookup.find(i => i.value == r.role);

                            return {
                                ...r,
                                customerId: customerId,
                                name: (item && item.text) || '',
                                description: (item && item.remark) || '',
                                rowSelected: (user.customerRoles && user.customerRoles.some(cr => cr.customerId == customerId && cr.role == r.role)) || false,
                                gridPermissions: []
                            };
                        }),
                        customerCabinetRoles: roles.filter(r => !softwareRoles.includes(r.role || '')).map((r) => {
                            let item = roleLookup.find(i => i.value == r.role);

                            return {
                                ...r,
                                customerId: customerId,
                                name: (item && item.text) || '',
                                description: (item && item.remark) || '',
                                rowSelected: (user.customerRoles && user.customerRoles.some(cr => cr.customerId == customerId && cr.role == r.role)) || false,
                                gridPermissions: []
                            };
                        }),
                        customerCabinets: data.map((c) => {
                            return {
                                ...c,
                                address: (c.cabinetLocation && c.cabinetLocation.address) || '',
                                rowSelected: customerCabinetList ? customerCabinetList.cabinetList.some(d => d == c.id) : false

                            };
                        })
                    });
                });
            });
        }
    }

    //#region Button handlers

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
            showBiometricData: false
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
                showBiometricData: false
            });
        }
        else {
            this.setState({ ...this.state, showErrors: true, errorMsg: error });
        }
    }

    onSaveClick() {
        const { closeDialog } = this.props;
        const { user } = this.state;
        const error = this.validate();

        if (!error) {
            this.setState({ ...this.state, showErrors: false, errorMsg: '' });

            apiService.post<DataUpdateResult>('user', undefined, user, [], true)
                .then((e: any) => {
                    closeDialog();
                    notificationDialogService.showDialog(
                        'CONFIRMATION_USER_SAVE', () => { }, 'TEXT_NEW_USER_CREATED');
                })
                .catch((e: any) => {
                    console.log(e);
                    this.setState({ ...this.state, showErrors: true, errorMsg: e.response.data });
                });
        }
        else {
            this.setState({ ...this.state, showErrors: true, errorMsg: error });
        }
    }

    //#endregion

    //#region Change functions

    onFirstNameChange(value: any) {
        this.setState({ ...this.state, isDirty: true, showErrors: false, errorMsg: '', user: { ...this.state.user, firstName: value } });
    }

    onLastNameChange(value: any) {
        this.setState({ ...this.state, isDirty: true, user: { ...this.state.user, lastName: value } });
    }

    onJobTitleNameChange(value: any) {
        this.setState({ ...this.state, isDirty: true, user: { ...this.state.user, designation: value } });
    }

    onCompanyChange(value: any) {
        this.setState({ ...this.state, isDirty: true, user: { ...this.state.user, company: value } });
    }

    onTimezoneChange(value: any) {
        this.setState({ ...this.state, isDirty: true, user: { ...this.state.user, timeZone: value } });
    }

    onMobileNumberChange(value: any) {
        this.setState({ ...this.state, isDirty: true, user: { ...this.state.user, mobileNumber: value } });
    }

    onEmailChange(value: any) {
        this.setState({ ...this.state, isDirty: true, showErrors: false, errorMsg: '', user: { ...this.state.user, email: value } });
    }

    onOTPChange() {
        this.setState({
            ...this.state, isDirty: true, user: {
                ...this.state.user,
                isTwoFactorAuthEnabled: !this.state.user.isTwoFactorAuthEnabled
            }
        });
    }

    onTextFieldChange(event: any) {
        const { user } = this.state;
        const name = event.target.name;
        const value = event.target.value;
        const biometricData = (user.biometricData && user.biometricData[0]) || { id: '' };

        if (name == 'enrolmentSource') {
            biometricData.enrolmentSource = value;
            biometricData.identityType = '';
            biometricData.binaryData = '';
            biometricData.hexData = '';
            biometricData.maskedBinaryData = '';
            biometricData.facilityCode = '';
            biometricData.cardId = '';
            biometricData.issueCode = '';
        }
        else {
            switch (name) {
                case 'identityType':
                    biometricData.identityType = value
                    break;
                case 'facilityCode':
                    biometricData.facilityCode = value
                    break;
                case 'cardId':
                    biometricData.cardId = value
                    break;
                case 'issueCode':
                    biometricData.issueCode = value
                    break;
            }
        }

        this.onCardDataChange(biometricData);

        name == 'facilityCode' ? this.setState({ ...this.state, facilityCodeInHex: this.getHexValue(value), facilityCodeInBinary: this.getBinaryValue(value) }) : {};
        name == 'cardId' ? this.setState({ ...this.state, cardIdInHex: this.getHexValue(value), cardIdInBinary: this.getBinaryValue(value) }) : {};
        name == 'issueCode' ? this.setState({ ...this.state, issueCodeInHex: this.getHexValue(value), issueCodeInBinary: this.getBinaryValue(value) }) : {};
    }

    onBinaryDataChange(event: any) {
        const { user } = this.state;
        const value = event.target.value;
        const biometricData = (user.biometricData && user.biometricData[0]) || { id: '' };
        let isBinary = /^[01]+$/.test(value);

        if (isBinary || value.length == 0) {
            biometricData.binaryData = value;
            biometricData.hexData = value.length != 0 ? parseInt(value, 2).toString(16).toUpperCase() : '';

            this.onCardDataChange(biometricData);
        }
    }

    onCardDataChange(biometricData?: BiometricData) {
        this.setState({
            ...this.state,
            isDirty: true,
            showErrors: false,
            errorMsg: '',
            user: {
                ...this.state.user,
                biometricData: [biometricData || {
                    id: '',
                    enrolmentSource: '',
                    identityType: '',
                    binaryData: '',
                    hexData: '',
                }]
            }
        });
    }

    onRoleSortChange(event: any) {
        const gridName = event.target._reactInternalFiber.key;

        this.setState({
            ...this.state,
            webRoleGridSort: gridName == this.webGridName ? event.sort : this.state.webRoleGridSort,
            cabinetRoleGridSort: gridName == this.cabinetGridName ? event.sort : this.state.cabinetRoleGridSort
        })
    }

    onRoleSelectionChange(event: any) {
        const gridName = event.target._reactInternalFiber.key;
        const { role } = event.dataItem;
        const { customerId } = this.props;
        let { customerWebRoles, customerCabinetRoles, user } = this.state;
        let rolesList = gridName == this.webGridName ? customerWebRoles : customerCabinetRoles;

        const customerRole = rolesList.find(cr => cr.customerId == customerId && cr.role == role);

        if (customerRole && user.customerRoles) {
            customerRole.rowSelected = !customerRole.rowSelected;

            if (customerRole.rowSelected) {
                user.customerRoles.push({ customerId: customerId, role: role });
            }
            else {
                let userCustomerRole = user.customerRoles.find(cr => cr.customerId == customerId && cr.role == role);

                if (userCustomerRole) {
                    user.customerRoles.splice(user.customerRoles.indexOf(userCustomerRole), 1);
                }
            }
            user.customerRoles = utilityService.getSortedList(user.customerRoles, 'customerId', 'role');

            this.onRolesChange(user.customerRoles);

            this.setState({
                ...this.state,
                customerWebRoles: gridName == this.webGridName ? rolesList : customerWebRoles,
                customerCabinetRoles: gridName == this.cabinetGridName ? rolesList : customerCabinetRoles,
                user: { ...this.state.user, customerRoles: user.customerRoles }
            });
        }
    }

    onRoleHeaderSelectionChange(event: any) {
        const gridName = event.target._reactInternalFiber.key;
        const isSelected = event.nativeEvent.target.checked;
        const { customerId } = this.props;
        let { customerWebRoles, customerCabinetRoles, user } = this.state;
        let rolesList = gridName == this.webGridName ? customerWebRoles : customerCabinetRoles;

        rolesList.forEach(cr => cr.rowSelected = isSelected);

        if (isSelected) {
            rolesList.forEach(cr => {
                user.customerRoles && user.customerRoles.push({ customerId: customerId, role: cr.role || '' });
            });
        }
        else {
            user.customerRoles = user.customerRoles && user.customerRoles.filter(cr => cr.customerId != customerId);
        }

        user.customerRoles = utilityService.getSortedList(user.customerRoles || [], 'customerId', 'role');

        this.onRolesChange(user.customerRoles);

        this.setState({
            ...this.state,
            customerWebRoles: gridName == this.webGridName ? rolesList : customerWebRoles,
            customerCabinetRoles: gridName == this.cabinetGridName ? rolesList : customerCabinetRoles,
            user: { ...this.state.user, customerRoles: user.customerRoles }
        });
    }

    onRolesChange(roles: UserCustomerRole[]) {
        this.setState({ ...this.state, isDirty: true, showErrors: false, errorMsg: '', user: { ...this.state.user, customerRoles: roles } });
    }

    onAlternateIdChange(value: any) {
        this.setState({ ...this.state, isDirty: true, user: { ...this.state.user, alternateId: value } });
    }

    onCabinetSortChange(event: any) {
        this.setState({ ...this.state, cabinetGridSort: event.sort })
    }

    onCabinetSelectionChange(event: any) {
        const { customerId } = this.props;
        const { customerCabinets, user } = this.state;

        const customerCabinet = customerCabinets.find(c => c.id == event.dataItem.id);

        if (customerCabinet) {
            customerCabinet.rowSelected = !customerCabinet.rowSelected;

            let managedCabinet = user.customerCabinets && user.customerCabinets.find(c => c.customerId == customerId);

            if (managedCabinet) {
                if (customerCabinet.rowSelected) {
                    managedCabinet.cabinetList.push(customerCabinet.id);
                }
                else {
                    let index = managedCabinet.cabinetList.indexOf(customerCabinet.id);
                    managedCabinet.cabinetList.splice(index, 1);
                }
            }
            else {
                if (customerCabinet.rowSelected) {
                    managedCabinet = { customerId: customerId, cabinetList: [customerCabinet.id] };
                    user.customerCabinets && user.customerCabinets.push(managedCabinet);
                }
            }

            this.onCabinetsChange(user.customerCabinets || []);

            this.setState({
                ...this.state,
                customerCabinets: customerCabinets,
                user: { ...this.state.user, customerCabinets: user.customerCabinets }
            });
        }
    }

    onCabinetHeaderSelectionChange(event: any) {
        const { customerId } = this.props;
        const { customerCabinets, user } = this.state;

        const isSelected = event.nativeEvent.target.checked;
        customerCabinets.forEach(u => u.rowSelected = isSelected);

        let managedCabinet = user.customerCabinets && user.customerCabinets.find(c => c.customerId == customerId);

        if (managedCabinet) {
            if (isSelected) {
                managedCabinet.cabinetList = [];
                customerCabinets.forEach(c => managedCabinet && managedCabinet.cabinetList.push(c.id));
            }
            else {
                managedCabinet.cabinetList = [];
            }
        }
        else {
            if (isSelected) {
                managedCabinet = { customerId: customerId, cabinetList: customerCabinets.map(c => c.id) };
                user.customerCabinets && user.customerCabinets.push(managedCabinet);
            }
        }

        this.onCabinetsChange(user.customerCabinets || []);

        this.setState({
            ...this.state,
            customerCabinets: customerCabinets,
            user: { ...this.state.user, customerCabinets: user.customerCabinets }
        });
    }

    onCabinetsChange(cabinets: CustomerCabinets[]) {
        this.setState({ ...this.state, isDirty: true, showErrors: false, errorMsg: '', user: { ...this.state.user, customerCabinets: cabinets } });
    }

    //#endregion

    //#region Utility functions

    onRowRender(tr: any, props: any) {
        return React.cloneElement(tr, {
            ...tr.props,
            className: tr.props.className + ' non-selectable-row'
        }, tr.props.children);
    }

    getPinLength() {
        const { customerId } = this.props;
        const pinLength = configService.getConfigurationValue("PIN_LENGTH", '*', customerId);
        var pin = '';

        for (var i = 0; i < parseInt(pinLength); i++) {
            pin += "*";
        }

        return pin;
    }

    getHexValue(value: string) {
        if (this.isDecimal(value) || value.length == 0) {
            return parseInt(value).toString(16)
        } else if (this.isDecimal(value.substring(1))) {
            return parseInt(value.substring(1)).toString(16)
        } else {
            return ""
        }
    }

    getBinaryValue(value: string) {
        if (this.isDecimal(value) || value.length == 0) {
            return parseInt(value).toString(2)
        } else if (this.isDecimal(value.substring(1))) {
            return parseInt(value.substring(1)).toString(2)
        } else {
            return ""
        }
    }

    isDecimal(value: string) {
        return /^[0-9\b]+$/.test(value);
    }

    //#endregion

    //#region Toggle functions

    toggleBiometricData() {
        this.setState({ ...this.state, showBiometricData: !this.state.showBiometricData });
    }

    toggleWebSection(e: any) {
        const { customerId } = this.props;
        const { user, customerCabinets, customerWebRoles } = this.state;
        const isChecked = e.target.checked == true;

        if (isChecked) {
            customerCabinets.forEach(r => r.rowSelected = true);
            user.customerCabinets = [{ customerId: customerId, cabinetList: customerCabinets.map(c => c.id) }];
        }
        else {
            customerWebRoles.forEach(r => r.rowSelected = false);
            customerCabinets.forEach(r => r.rowSelected = false);
            user.customerCabinets = [];
            user.customerRoles = user.customerRoles && user.customerRoles.filter(cr => !softwareRoles.includes(cr.role));
        }

        this.setState({
            ...this.state,
            editableWebSection: isChecked,
            customerWebRoles: customerWebRoles,
            customerCabinets: customerCabinets,
            user: {
                ...this.state.user,
                customerRoles: user.customerRoles,
                customerCabinets: user.customerCabinets
            }
        });
    }

    //#endregion

    getSteps() {
        const steps = [
            { label: localise('TEXT_PERSONAL_INFORMATION') },
            { label: localise('TEXT_CONTACT_DETAILS') },
            { label: localise('TEXT_CABINET_ACCESS_DETAILS') },
            { label: localise('TEXT_SOFTWARE_ACCESS_DETAILS') }
        ];

        return steps;
    }

    getComponent(stepNumber: number) {
        const { user, showErrors, errorMsg, customerWebRoles, webRoleGridSort, customerCabinetRoles, cabinetRoleGridSort,
            customerCabinets, cabinetGridSort, showBiometricData, editableWebSection, facilityCodeInBinary,
            facilityCodeInHex, cardIdInBinary, cardIdInHex, issueCodeInBinary, issueCodeInHex } = this.state;
        const allWebRolesSelected = customerWebRoles.every(r => r.rowSelected);
        const allCabinetRolesSelected = customerCabinetRoles.every(r => r.rowSelected);
        const allCabinetsSelected = customerCabinets.every(item => item.rowSelected);
        const biometricData = (user.biometricData && user.biometricData[0]) || { id: '' };

        switch (stepNumber) {
            case 1:
                return (
                    <>
                        <Row className="mb-2">
                            <Col>
                                <small className="text-muted">{localise("REMARK_PERSONAL_INFORMATION")}</small>
                            </Col>
                            <Col className="text-right">
                                <small className="text-muted">{localise('TEXT_REQUIRED_FIELD')}</small>
                            </Col>
                        </Row>
                        <FormFieldContent remarksKey="REMARK_FIRST_NAME" labelKey="TEXT_FIRST_NAME" inputComponent={Input}
                            meta={{ error: localise('ERROR_FIELD_REQUIRED'), touched: showErrors && !user.firstName, warning: undefined }}
                            input={{ onChange: this.onFirstNameChange, value: user.firstName }} required={true} />
                        <FormFieldContent remarksKey="REMARK_LAST_NAME" labelKey="TEXT_LAST_NAME" inputComponent={Input}
                            meta={{ error: undefined, touched: undefined, warning: undefined }}
                            input={{ onChange: this.onLastNameChange, value: user.lastName }} />
                        <FormFieldContent remarksKey="REMARK_USER_DESIGNATION" labelKey="TEXT_DESIGNATION" inputComponent={Input}
                            meta={{ error: undefined, touched: undefined, warning: undefined }}
                            input={{ onChange: this.onJobTitleNameChange, value: user.designation }} />
                        <FormFieldContent remarksKey="REMARK_COMPANY" labelKey="TEXT_COMPANY" inputComponent={Input}
                            meta={{ error: undefined, touched: undefined, warning: undefined }}
                            input={{ onChange: this.onCompanyChange, value: user.company }} />
                        <FormFieldContent remarksKey="REMARK_TIMEZONE" labelKey="TEXT_TIMEZONE"
                            inputComponent={(props: any) => <LookupDropDown {...props} lookupKey="LIST_TIMEZONE" />}
                            meta={{ error: undefined, touched: undefined, warning: undefined }}
                            input={{ onChange: this.onTimezoneChange, value: user.timeZone }} required={true} />
                    </>
                );
            case 2:
                return (
                    <>
                        <Row className="mb-2">
                            <Col>
                                <small className="text-muted">{localise("REMARK_CONTACT_DETAILS")}</small>
                            </Col>
                        </Row>
                        <FormFieldContent remarksKey="REMARK_MOBILE_NUMBER" labelKey="TEXT_MOBILE_NUMBER" inputComponent={Input}
                            meta={{ error: undefined, touched: undefined, warning: undefined }}
                            input={{ onChange: this.onMobileNumberChange, value: user.mobileNumber }} />
                        <FormFieldContent remarksKey="REMARK_EMAIL" labelKey="TEXT_EMAIL" inputComponent={Input}
                            meta={{
                                error: localise('ERROR_USER_OTP_EMAIL_REQUIRED'),
                                touched: showErrors && user.isTwoFactorAuthEnabled && !user.email, warning: undefined
                            }}
                            input={{ onChange: this.onEmailChange, value: user.email }} />
                        <FormFieldContent remarksKey="REMARK_TWO_FACTOR_AUTHENTICATION" className="mb-0"
                            meta={{ error: undefined, touched: undefined, warning: undefined }}
                            inputComponent={() =>
                                <Label className="system-label mb-0">
                                    <Row>
                                        <Col>
                                            {localise("TEXT_TWO_FACTOR_AUTHENTICATION")}
                                            <Input className="ml-3" type="checkbox" checked={user.isTwoFactorAuthEnabled} onChange={this.onOTPChange} />
                                        </Col>
                                    </Row>
                                </Label>
                            } />
                    </>
                );
            case 3:
                return (
                    <>
                        <Row className="mb-2">
                            <Col>
                                <small className="text-muted">{localise("REMARK_CABINET_ACCESS_DETAILS")}</small>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Row className="system-label pl-1">
                                    <Col>
                                        <Label>{localise('TEXT_CABINET_ROLES')}</Label>
                                    </Col>
                                </Row>
                                {
                                    customerCabinetRoles.length > 0 ?
                                        <Row>
                                            <Col>
                                                <Grid key={this.cabinetGridName}
                                                    className="cabinet-roles-grid"
                                                    data={orderBy(customerCabinetRoles, cabinetRoleGridSort)}
                                                    rowRender={this.onRowRender}
                                                    sort={cabinetRoleGridSort}
                                                    sortable={{ allowUnsort: false, mode: 'single' }}
                                                    onSortChange={this.onRoleSortChange}
                                                    selectedField="rowSelected"
                                                    onSelectionChange={this.onRoleSelectionChange}
                                                    onHeaderSelectionChange={this.onRoleHeaderSelectionChange}>
                                                    <GridColumn field="rowSelected" width="auto" className="checkbox-grid-column"
                                                        headerClassName="checkbox-grid-column" headerSelectionValue={allCabinetRolesSelected} />
                                                    <GridColumn field="name" title={localise('TEXT_ROLE')} />
                                                    <GridColumn field="description" title={localise('TEXT_DESCRIPTION')} />
                                                </Grid>
                                            </Col>
                                        </Row>
                                        :
                                        <Card>
                                            <CardBody>
                                                <Row className="text-muted text-center">
                                                    <Col>
                                                        <span>{localise("ERROR_SEARCH_RESULT")}</span>
                                                    </Col>
                                                </Row>
                                            </CardBody>
                                        </Card>
                                }
                            </Col>
                        </Row>
                        <hr />
                        <Row>
                            <Col md={6}>
                                <Label className="system-label">{localise('TEXT_USER_ID_PIN_FOR_CABINET')}</Label>
                                <FormFieldContent remarksKey="REMARK_ALTERNATE_ID" labelKey="TEXT_ALTERNATE_ID" inputComponent={NumericInput}
                                    meta={{ error: undefined, touched: undefined, warning: undefined }}
                                    input={{ onChange: this.onAlternateIdChange, value: user.alternateId, placeholder: localise('REMARK_USER_ID_PLACEHOLDER') }} />
                                <FormFieldContent remarksKey="REMARK_USER_PIN" labelKey="TEXT_PIN" className="mb-0"
                                    meta={{ error: undefined, touched: undefined, warning: undefined }}
                                    inputComponent={(props: any) => <Input {...props} value={this.getPinLength()} disabled={true} />} />
                            </Col>
                        </Row>
                        <hr />
                        <Row>
                            <Col>
                                <ActionButton className="p-0 m-0" color="link" icon={`fa-angle-${showBiometricData ? 'up' : 'down'}`}
                                    textKey={showBiometricData ? localise('BUTTON_HIDE_BIOMETRIC_DATA') : localise('BUTTON_SHOW_BIOMETRIC_DATA')}
                                    disableDefaultMargin={true} onClick={this.toggleBiometricData} />
                            </Col>
                        </Row>
                        {
                            showBiometricData &&
                            <Row className="mt-3 mb-2">
                                <Col>
                                    <Row>
                                        <Col md={3}>
                                            <Label className="system-label">{localise('TEXT_DATA_SOURCE')}</Label>
                                        </Col>
                                        <Col md={9}>
                                            <LookupDropDown name="enrolmentSource" value={biometricData.enrolmentSource}
                                                lookupKey="LIST_CARD_ENROLLMENT_SOURCES" onChange={this.onTextFieldChange} />
                                            <Col xs="auto">
                                                <small className="text-muted">{localise("REMARK_CARD_ENROLLMENT_SOURCE")}</small>
                                            </Col>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={3}>
                                            <Label className="system-label">{localise('TEXT_IDENTITY_TYPE')}</Label>
                                        </Col>
                                        <Col md={9}>
                                            <LookupDropDown name="identityType" value={biometricData.identityType}
                                                lookupKey="LIST_CARD_MAKERS" onChange={this.onTextFieldChange} />
                                            <Col xs="auto">
                                                <small className="text-muted">{localise("REMARK_CARD_MAKE")}</small>
                                            </Col>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={3}>
                                            <Label className="system-label">{localise('TEXT_CARD_BINARY_DATA')}</Label>
                                        </Col>
                                        <Col md={9}>
                                            <Input name="binaryData" value={biometricData.binaryData} onChange={this.onBinaryDataChange}
                                                disabled={biometricData.enrolmentSource != CardDataConst.WEB_ENROLMENT_SOURCE} />
                                            <Col xs="auto">
                                                <small className="text-muted">{localise("REMARK_CARD_BINARY_DATA")}</small>
                                            </Col>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={3}>
                                            <Label className="system-label">{localise('TEXT_CARD_HEX_DATA')}</Label>
                                        </Col>
                                        <Col md={9}>
                                            <Input name="hexData" value={biometricData.hexData} disabled={true} />
                                            <Col xs="auto">
                                                <small className="text-muted">{localise("REMARK_CARD_HEX_DATA")}</small>
                                            </Col>
                                        </Col>
                                    </Row>
                                    {
                                        (biometricData.enrolmentSource == CardDataConst.WEB_ENROLMENT_SOURCE ||
                                            biometricData.enrolmentSource == CardDataConst.EXCHANGE_ENROLMENT_SOURCE) &&
                                        <>
                                            <Label className="system-label">{localise('TEXT_DATA_FIELDS')}</Label>
                                            <Row className="mb-2">
                                                <Col xs="auto">
                                                    <small className="text-muted">{localise("REMARK_DATA_FIELDS")}</small>
                                                </Col>
                                            </Row>
                                            <Row className="mr-2">
                                                <Col md={4}>
                                                    <small className="system-label">{localise('TEXT_FACILITY_CODE')}</small>
                                                    <Row className="mb-2">
                                                        <Col md={6}>
                                                            <small className="text-muted">{localise('TEXT_DECIMAL')}</small>
                                                        </Col>
                                                        <Col md={6} >
                                                            <Input name="facilityCode" disabled={biometricData.enrolmentSource != CardDataConst.WEB_ENROLMENT_SOURCE}
                                                                onChange={this.onTextFieldChange} value={biometricData.facilityCode} className="data-field" />
                                                        </Col>
                                                    </Row>
                                                    <Row className="mb-2">
                                                        <Col md={6}>
                                                            <small className="text-muted">{localise('TEXT_HEXADECIMAL')}</small>
                                                        </Col>
                                                        <Col md={6} >
                                                            <Input className="data-field" disabled={true} value={facilityCodeInHex} />
                                                        </Col>
                                                    </Row>
                                                    <Row className="mb-2">
                                                        <Col md={6}>
                                                            <small className="text-muted">{localise('TEXT_BINARY')}</small>
                                                        </Col>
                                                        <Col md={6}>
                                                            <Input className="data-field" disabled={true} value={facilityCodeInBinary} />
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                <Col md={4}>
                                                    <small className="system-label">{localise('TEXT_CARD_ID_OR_CODE')}</small>
                                                    <Row className="mb-2">
                                                        <Col md={6}>
                                                            <small className="text-muted">{localise('TEXT_DECIMAL')}</small>
                                                        </Col>
                                                        <Col md={6}>
                                                            <Input name="cardId" disabled={biometricData.enrolmentSource != CardDataConst.WEB_ENROLMENT_SOURCE}
                                                                onChange={this.onTextFieldChange} value={biometricData.cardId} className="data-field" />
                                                        </Col>
                                                    </Row>
                                                    <Row className="mb-2">
                                                        <Col md={6}>
                                                            <small className="text-muted">{localise('TEXT_HEXADECIMAL')}</small>
                                                        </Col>
                                                        <Col md={6}>
                                                            <Input className="data-field" disabled={true} value={cardIdInHex} />
                                                        </Col>
                                                    </Row>
                                                    <Row className="mb-2">
                                                        <Col md={6}>
                                                            <small className="text-muted">{localise('TEXT_BINARY')}</small>
                                                        </Col>
                                                        <Col md={6}>
                                                            <Input className="data-field" disabled={true} value={cardIdInBinary} />
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                <Col md={4}>
                                                    <small className="system-label">{localise('TEXT_CARD_ISSUE_CODE')}</small>
                                                    <Row className="mb-2">
                                                        <Col md={6}>
                                                            <small className="text-muted">{localise('TEXT_DECIMAL')}</small>
                                                        </Col>
                                                        <Col md={6}>
                                                            <Input name="issueCode" disabled={biometricData.enrolmentSource != CardDataConst.WEB_ENROLMENT_SOURCE}
                                                                onChange={this.onTextFieldChange} value={biometricData.issueCode} className="data-field" />
                                                        </Col>
                                                    </Row>
                                                    <Row className="mb-2">
                                                        <Col md={6}>
                                                            <small className="text-muted">{localise('TEXT_HEXADECIMAL')}</small>
                                                        </Col>
                                                        <Col md={6}>
                                                            <Input className="data-field" disabled={true} value={issueCodeInHex} />
                                                        </Col>
                                                    </Row>
                                                    <Row className="mb-2">
                                                        <Col md={6}>
                                                            <small className="text-muted">{localise('TEXT_BINARY')}</small>
                                                        </Col>
                                                        <Col md={6}>
                                                            <Input className="data-field" disabled={true} value={issueCodeInBinary} />
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                            <Row className="mb-0">
                                                <Col xs="auto">
                                                    <small className="text-muted">{localise("REMARK_DATA_FIELD_CONVERSIONS")}</small>
                                                </Col>
                                            </Row>
                                        </>
                                    }
                                </Col>
                            </Row>
                        }
                    </>
                );
            case 4:
                return (
                    <>
                        {
                            showErrors &&
                            <Row className="mb-2">
                                <Col>
                                    <Alert className="mb-0" color="danger">
                                        <small className="text-danger">{localise(errorMsg)}</small>
                                    </Alert>
                                </Col>
                            </Row>
                        }
                        <FormFieldContent className="mb-1" inputComponent={() =>
                            <Label className="ml-3 mb-0 system-label">
                                <Row>
                                    <Col>
                                        <Input type="checkbox" checked={editableWebSection} onChange={this.toggleWebSection} />
                                        {localise("TEXT_ALLOW_SOFTWARE_ACCESS")}
                                    </Col>
                                </Row>
                            </Label>
                        } />
                        <Row className="mb-2">
                            <Col>
                                <small className="text-muted">{localise("REMARK_SOFTWARE_ACCESS_DETAILS")}</small>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col>
                                <Row className="system-label pl-1">
                                    <Col>
                                        <Label>{localise('TEXT_WEB_ROLES')}</Label>
                                    </Col>
                                </Row>
                                {
                                    customerWebRoles.length > 0 ?
                                        <Row>
                                            <Col>
                                                <Grid key={this.webGridName}
                                                    data={orderBy(customerWebRoles, webRoleGridSort)}
                                                    className={`web-roles-grid ${editableWebSection ? "" : "disabled-grid"}`}
                                                    rowRender={this.onRowRender}
                                                    sort={webRoleGridSort}
                                                    sortable={{ allowUnsort: false, mode: 'single' }}
                                                    onSortChange={this.onRoleSortChange}
                                                    selectedField="rowSelected"
                                                    onSelectionChange={this.onRoleSelectionChange}
                                                    onHeaderSelectionChange={this.onRoleHeaderSelectionChange}>
                                                    <GridColumn field="rowSelected" width="auto" className="checkbox-grid-column"
                                                        headerClassName="checkbox-grid-column" headerSelectionValue={allWebRolesSelected} />
                                                    <GridColumn field="name" title={localise('TEXT_ROLE')} />
                                                    <GridColumn field="description" title={localise('TEXT_DESCRIPTION')} />
                                                </Grid>
                                            </Col>
                                        </Row>
                                        :
                                        <Card>
                                            <CardBody>
                                                <Row className="text-muted text-center">
                                                    <Col>
                                                        <span>{localise("ERROR_SEARCH_RESULT")}</span>
                                                    </Col>
                                                </Row>
                                            </CardBody>
                                        </Card>
                                }
                            </Col>
                        </Row>
                        <Row className="mb-2">
                            <Col>
                                <Row className="system-label pl-1">
                                    <Col>
                                        <Label className="mb-0">{localise('TEXT_CABINETS')}</Label>
                                    </Col>
                                </Row>
                                <Row className="mb-2">
                                    <Col xs="auto">
                                        <small className="text-muted">{localise("REMARK_MANAGED_CABINETS")}</small>
                                    </Col>
                                </Row>
                                {
                                    customerCabinets.length > 0 ?
                                        <Row>
                                            <Col>
                                                <Grid data={orderBy(customerCabinets, cabinetGridSort)}
                                                    className={`cabinets-grid ${editableWebSection ? "" : "disabled-grid"}`}
                                                    rowRender={this.onRowRender}
                                                    selectedField="rowSelected"
                                                    onSelectionChange={this.onCabinetSelectionChange}
                                                    onHeaderSelectionChange={this.onCabinetHeaderSelectionChange}
                                                    sort={cabinetGridSort}
                                                    sortable={{ allowUnsort: false, mode: 'single' }}
                                                    onSortChange={this.onCabinetSortChange} >
                                                    <GridColumn field="rowSelected" width="auto" className="checkbox-grid-column"
                                                        headerClassName="checkbox-grid-column" headerSelectionValue={allCabinetsSelected} />
                                                    <GridColumn field="name" title={localise('TEXT_CABINET_NAME')} />
                                                    <GridColumn field="name" title={localise('TEXT_CABINET_NAME')}
                                                        cell={(props) => <td>{`${props.dataItem['name']}\n(${props.dataItem['itemCount']} keys)`}</td>} />
                                                    <GridColumn field="itemCount" title={localise('TEXT_ITEMS')} />
                                                    <GridColumn field="siteName" title={localise('TEXT_SITE')} />
                                                    <GridColumn field="address" title={localise('TEXT_ADDRESS')} />
                                                </Grid>
                                            </Col>
                                        </Row>
                                        :
                                        <Card>
                                            <CardBody>
                                                <Row className="text-muted text-center">
                                                    <Col>
                                                        <span>{localise("ERROR_SEARCH_RESULT")}</span>
                                                    </Col>
                                                </Row>
                                            </CardBody>
                                        </Card>
                                }
                            </Col>
                        </Row>
                    </>
                );
            default:
                return <></>;
        }
    }

    validate() {
        const { currentStep, user, editableWebSection, customerCabinets } = this.state;

        switch (currentStep) {
            case 1:
                if (!user.firstName) {
                    return 'ERROR_FIRST_NAME_REQUIRED';
                }
                break;
            case 2:
                if (user.isTwoFactorAuthEnabled && !user.email) {
                    return 'ERROR_EMAIL_REQUIRED_OTP';
                }
                break;
            case 4:
                if (!user.customerRoles || user.customerRoles.length == 0) {
                    return 'ERROR_USER_NO_ROLES_SPECIFIED';
                }
                else if (editableWebSection &&
                    (!(user.customerRoles && user.customerRoles.some(
                        cr => softwareRoles.includes(cr.role))) || !customerCabinets.some(c => c.rowSelected))) {
                            return 'ERROR_USER_SOFTWARE_ACCESS';
                }
                else if (user.customerRoles && user.customerRoles.some(cr => softwareRoles.includes(cr.role)) && !user.email) {
                    return 'ERROR_EMAIL_REQUIRED_SOFTWARE_USERS';
                }
                break;
            default:
                break;
        }

        return '';
    }

    render() {
        const { currentStep } = this.state;

        return (
            <WizardDialog titleKey={localise('TEXT_ADD_NEW_USER')} stepCount={4} steps={this.getSteps()}
                currentStep={currentStep} component={this.getComponent(currentStep)}
                onBackClick={this.onBackClick} onNextClick={this.onNextClick}
                onCancelClick={this.onCancelClick} onSaveClick={this.onSaveClick} />
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/users/components/UserWizard/UserWizard.tsx