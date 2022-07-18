import { SortDescriptor } from "@progress/kendo-data-query";
import { GridSortChangeEvent } from "@progress/kendo-react-grid";
import * as React from "react";
import { Col, Input, Label, Row } from "reactstrap";
import { formValueSelector } from "redux-form";
import { alertActions } from "src/modules/shared/actions/alert.actions";
import { ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { FormField, FormJsonField } from "src/modules/shared/components/Form";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import { NumericInput } from "src/modules/shared/components/NumericInput/NumericInput";
import { BiometricDataGrid } from "src/modules/shared/components/UserBiometricDataGrid/BiometricDataGrid";
import { configService, contextService, localise, notificationDialogService, permissionService, utilityService } from "src/modules/shared/services";
import { localiseWithParams } from "src/modules/shared/services/localisation.service";
import { softwareRoles } from "src/modules/users/constants/user-roles.constants";
import { userService } from "src/modules/users/services/user.service";
import { User, UserCustomerRole, UserFields } from "src/modules/users/types/dto";
import { store } from "src/redux/store";

interface Props {
    showFieldErrors?: boolean;
    saveCallback?: (values: any) => void;
}

interface State {
    readonly?: boolean;
    sort: SortDescriptor[];
}

export class UserCredentialsTab extends React.Component<DetailFormProps & Props, State> {
    constructor(props: DetailFormProps) {
        super(props);
        this.getReadOnlyToolTip = this.getReadOnlyToolTip.bind(this);
        this.onOTPChange = this.onOTPChange.bind(this);
        this.activateUser = this.activateUser.bind(this);
        this.showPINPopup = this.showPINPopup.bind(this);
        this.getEffectiveCustomerForUser = this.getEffectiveCustomerForUser.bind(this);
        this.getPinLength = this.getPinLength.bind(this);
        this.getTooltipForActivationBtn = this.getTooltipForActivationBtn.bind(this);
        this.onSave = this.onSave.bind(this);

        this.state = {
            sort: [{ field: "enrolmentSource", dir: "asc" }]
        }
    }

    getReadOnlyToolTip(fieldName: string, userFieldList: string[]) {
        const { item } = this.props;
        var isDisabled = userFieldList.includes(fieldName) || (userFieldList.length == 0 && item.externalSystemId);
        return isDisabled ? localise("TEXT_CANNOT_EDIT_EXTERNAL_SYSTEM_FIELDS") : undefined;
    }

    onOTPChange(event: any, p: any) {
        let e = {
            target: {
                value: event.target.checked
            }
        };
        p.onChange(e);
    }

    activateUser() {
        const { item } = this.props;
        userService.sendActivationEmail(item.id)
            .then(() => {
                alertActions.showSuccess('TEXT_ACTIVATION_EMAIL_SENT');
            });
    }

    showPINPopup() {
        this.getEffectiveCustomerForUser()
            .then(customerId => {
                userService.generatePIN(customerId).then((pin: any) => {
                    this.props.change('pin', pin);

                    const shouldDisplayPIN: string = configService.getConfigurationValue("DISPLAY_PIN", undefined, customerId);
                    const message = (shouldDisplayPIN && shouldDisplayPIN.toLowerCase() == 'true') ?
                        localiseWithParams('PIN_SUCCESS_MESSAGE', { "pin": pin }) : 'PIN_SUCCESS_MESSAGE_HIDE_PIN';

                    notificationDialogService.showDialog(message, this.onSave, undefined, true);
                });
            })
    }

    getEffectiveCustomerForUser() {
        const { item, form, isNew } = this.props;

        var promise = new Promise<string>(resolve => {

            //If new, get from client-side form value (customer roles grid).
            //If editing, get the relevant customerId from the backend.
            //(This is because we don't load all customer roles to client side.)

            if (isNew) {
                const selector = formValueSelector(form);
                const formState = store.getState();
                var customerId = "*";

                var formValue = selector(formState, 'customerRoles');

                if (formValue != undefined) {
                    var selectedCustomerIds = JSON.parse(selector(formState, 'customerRoles'));
                    if (selectedCustomerIds.length == 1)
                        customerId = selectedCustomerIds[0].customerId;
                }

                resolve(customerId);
            }
            else {
                const userId = item.id;
                userService.getEffectiveCustomerForUser(userId)
                    .then((customerId: string) => {
                        resolve(customerId)
                    })
            }
        });

        return promise;
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

    getPinLength() {
        const customerId = contextService.getCurrentCustomerId();
        const pinLength = configService.getConfigurationValue("PIN_LENGTH", '*', customerId);
        var pin = '';
        for (var i = 0; i < parseInt(pinLength); i++) {
            pin += "*";
        }
        return pin;
    }

    getTooltipForActivationBtn(user: User, hasSoftwareRole: boolean) {
        let tooltip = '';
        if (user.email) {
            tooltip = hasSoftwareRole ? (user.isEmailConfirmed ? localise('TEXT_EMAIL_ACTIVATED_TOOLTIP') : localise('TEXT_ACTIVATE_RESEND_TOOLTIP'))
                : localise('TEXT_ACTIVATE_DISABLE_TOOLTIP');
        } else {
            tooltip = hasSoftwareRole ? localise('TEXT_EMAIL_REQUIRED_TOOLTIP') : localise('TEXT_ACTIVATE_DISABLE_TOOLTIP');
        }
        return tooltip;
    }

    onSave() {
        const { saveCallback } = this.props;
        const reduxStore = store.getState();
        saveCallback && saveCallback(reduxStore.form.UserDetailsForm.values);
    }

    render() {
        const { item } = this.props;
        const customerId = contextService.getCurrentCustomerId();
        const userMappings = item.userFieldsInExternalMapping || [];
        const canActivateUser = permissionService.canPermissionGrant('ACTIVATE');
        const canAddPIN = permissionService.canPermissionGrant('PIN');
        const maxBiometricCount = configService.getConfigurationValue("MAX_BIOMETRIC_COUNT", "*", customerId);
        var userCustomerRoles = item.customerRoles as UserCustomerRole[];
        const hasSoftwareRole = (userCustomerRoles && userCustomerRoles.some(cr => softwareRoles.includes(cr.role))) || false;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');

        const isUserActivationBtnDisabled = item.dirty || !hasSoftwareRole || !item.email || item.isEmailConfirmed;

        const reduxStore = store.getState();
        const user = reduxStore.form.UserDetailsForm.values as User;
        const disablePINButton = user.isTwoFactorAuthEnabled && !user.email;

        return (
            <>
                <Row className="mb-2">
                    <Col xs="auto">
                        <small className="text-muted">{localise("REMARK_USER_CARD_DATA")}</small>
                    </Col>
                </Row>
                <Row>
                    <Col md={6}>
                        <Label className="system-label">{localise('TEXT_USER_EMAIL_FOR_SOFTWARE')}</Label>
                        <FormField remarksKey="REMARK_EMAIL" required={false} labelKey="TEXT_EMAIL" name="email"
                            tooltip={this.getReadOnlyToolTip(UserFields.Email, userMappings)} component={Input}
                            disabled={!isPermittedToEdit || userMappings.includes(UserFields.Email) || (userMappings.length == 0 && item.externalSystemId)}
                            validate={utilityService.validateEmail} />
                        {
                            !(userMappings.length == 0 && item.externalSystemId) &&
                            <FormField name="isTwoFactorAuthEnabled" remarksKey="REMARK_TWO_FACTOR_AUTHENTICATION"
                                component={(props: any) =>
                                    <Label>
                                        <Row>
                                            <Col>
                                                {localise("TEXT_TWO_FACTOR_AUTHENTICATION")}
                                                <Input type="checkbox" checked={props.value} onChange={(e: any) => this.onOTPChange(e, props)}
                                                    disabled={!isPermittedToEdit} />
                                            </Col>
                                        </Row>
                                    </Label>
                                } />
                        }
                        <FormField name="timeZone" required={true} remarksKey="REMARK_TIMEZONE" labelKey="TEXT_TIMEZONE"
                            component={(props: any) =>
                                <LookupDropDown {...props} lookupKey="LIST_TIMEZONE" tooltip={this.getReadOnlyToolTip(UserFields.TimeZone, userMappings)}
                                    disabled={!isPermittedToEdit || userMappings.includes(UserFields.TimeZone) || (userMappings.length == 0 && item.externalSystemId)} />} />
                    </Col>
                    <Col className="text-right">
                        <ActionButton style={{ width: '239px' }} textKey={"BUTTON_REACTIVATE"} icon="fa-envelope" color="secondary"
                            disabled={!isPermittedToEdit || isUserActivationBtnDisabled} onClick={this.activateUser} isPermissionAllowed={canActivateUser}
                            title={this.getTooltipForActivationBtn(item, hasSoftwareRole)} />
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col md={6}>
                        <Label className="system-label">{localise('TEXT_USER_ID_PIN_FOR_CABINET')}</Label>
                        <FormField remarksKey="REMARK_ALTERNATE_ID" required={false} labelKey="TEXT_ALTERNATE_ID" name="alternateId"
                            tooltip={this.getReadOnlyToolTip(UserFields.AlternateId, userMappings)} component={NumericInput}
                            disabled={!isPermittedToEdit || userMappings.includes(UserFields.AlternateId) || (userMappings.length == 0 && item.externalSystemId)} />
                        <FormField remarksKey="REMARK_USER_PIN" required={false} labelKey="TEXT_PIN" name="pin"
                            component={(props: any) =>
                                <Input {...props} value={this.getPinLength()} disabled={true} />} />
                    </Col>
                    <Col className="text-right">
                        <ActionButton style={{ width: '239px' }} color="secondary" icon="fa-key" disabled={disablePINButton}
                            isPermissionAllowed={isPermittedToEdit && canAddPIN} textKey="BUTTON_RESET_PIN" onClick={this.showPINPopup} />
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <Label className="system-label">{localise('TEXT_USER_BIOMETRIC_CREDENTIALS_FOR_CABINET')}</Label>
                        <FormJsonField name="biometricData" customerId={customerId} items={item.biometricData} parentFormName={item.form}
                            newButtonLabelKey={"BUTTON_ADD_BIOMETRIC_CREDENTIAL"} newButtonColor={'primary'} newButtonIcon={'fa-fingerprint'}
                            newButtonWidth={'239px'} maxItemCount={parseInt(maxBiometricCount)}
                            readonly={!isPermittedToEdit || (userMappings.includes(UserFields.Cards))}
                            valueProp="items" changeProp="onChange" component={BiometricDataGrid} defaultSort={{ field: "enrolmentSource", dir: "asc" }} />
                    </Col>
                </Row>
            </>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/users/components/UserDetails/Tabs/UserCredentialsTab.tsx