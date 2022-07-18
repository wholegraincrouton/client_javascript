import * as React from 'react';
import { SubmissionError } from 'redux-form';
import { Row, Col, Label, Alert } from 'reactstrap';
import { TabStrip, TabStripTab } from '@progress/kendo-react-layout';
import { store } from 'src/redux/store';
import * as apiConstants from "src/modules/shared/constants/api.constants";
import { localise, apiService, accountSessionService, utilityService, customerService } from "../../../shared/services";
import { DetailPage, DetailFormBodyComponent, DetailPageContainer } from '../../../shared/components/DetailPage';
import { DetailFormProps } from 'src/modules/shared/components/DetailPage/DetailForm';
import { alertActions } from '../../../shared/actions/alert.actions';
import { userService } from '../../services/user.service';
import { userImageService } from '../../services/user-image.service';
import { User, UserProfileImageConstants, CardDataConst, UserCustomerRole } from '../../types/dto';
import { UserDetailsTab } from './Tabs/UserDetailsTab';
import UserRolesTab from './Tabs/UserRolesTab';
import UserAccessibleItemsTab from './Tabs/UserAccessibleItemsTab';
import UserManagedCabinetsTab from './Tabs/UserManagedCabinetsTab';
import { UserCredentialsTab } from './Tabs/UserCredentialsTab';
import './user-details.css';

class UserDetails extends DetailPage<User> {
    detailFormBody: DetailFormBodyComponent = FormBody;
    listPagePath: string = "/users/usermanagement";

    validateItem(item: User): any {
        return {};
    }

    objectToFormValues(user: User) {
        user.customerRoles = user.customerRoles ? utilityService.getSortedList(user.customerRoles, 'customerId', 'role') : [];
        user.customerCabinets = user.customerCabinets ? utilityService.getSortedList(user.customerCabinets, 'customerId') : [];
        user.customerCabinets.forEach((c) => {
            c.cabinetList = c.cabinetList ? c.cabinetList.sort() : []
        });
        user.biometricData = user.biometricData || [];

        let customer = customerService.getCurrentCustomerData();

        const values = {
            ...user,
            isTwoFactorAuthEnabled: user.id ? user.isTwoFactorAuthEnabled : true,
            timeZone: user.timeZone || 'AUS Eastern Standard Time',
            culture: user.culture || '*',
            company: user.company || (customer && customer.name),
            customerRoles: JSON.stringify(user.customerRoles),
            customerCabinets: JSON.stringify(user.customerCabinets),
            biometricData: JSON.stringify(user.biometricData),
        };

        return values;
    }

    formValuesToObject(values: any) {
        const user = {
            ...values,
            customerRoles: values.customerRoles && JSON.parse(values.customerRoles),
            biometricData: values.biometricData && JSON.parse(values.biometricData),
            customerCabinets: values.customerCabinets && JSON.parse(values.customerCabinets)
        };

        return user;
    }

    beforeSave(item: User, isNew: boolean): boolean {
        const customerRoles = (item.customerRoles || []) as UserCustomerRole[];
        const customerIds = utilityService.getDistinctStrings(customerRoles.map(c => c.customerId || '')).filter(c => c != "*");
        item.customerCabinets = (item.customerCabinets || []).filter(c => customerIds.includes(c.customerId));

        let error = this.validate(item, isNew);

        if (error) {
            throw new SubmissionError({
                _error: error
            });
        }

        if (item.mobileNumber && !item.mobileNumber.startsWith('+')) {
            item.mobileNumber = `+${item.mobileNumber}`;
        }

        if (this.hasProfileImageChanged(item, isNew)) {
            if (item.hasProfileImage) {
                apiService.get('account', 'GetProfileImageWriteUrl', undefined, { userId: item.id }, false, false, apiConstants.ACCOUNTS)
                    .then((url: string) => {
                        userImageService.uploadUserImageFile(url)
                            .catch(() => {
                                alertActions.showError("ERROR_IMAGE_UPLOAD");
                                return false;
                            });
                    });
            }
            else {
                apiService.get('account', 'GetProfileImageDeleteUrl', undefined, { userId: item.id }, false, false, apiConstants.ACCOUNTS)
                    .then((deleteUrl: string) => {
                        userImageService.deleteUserImageFile(deleteUrl)
                            .catch(() => {
                                alertActions.showError("ERROR_IMAGE_DELETE");
                                return false;
                            });
                    });
            }
        }

        return true;
    }

    afterSave(id: string, item: User) {
        userImageService.removeUserImage();
        let loggedInUser = accountSessionService.getAuthenticatedUser();

        if (loggedInUser && loggedInUser.id == id) {
            if (item.hasProfileImage) {
                if (item.profileImageURL) {
                    userImageService.changeUserAvatar(item.hasProfileImage || false, item.profileImageURL, true);
                }
                else {
                    apiService.get('account', 'GetProfileImageReadUrl', undefined, { userId: id }, false, false, apiConstants.ACCOUNTS)
                        .then((url: string) => {
                            userImageService.changeUserAvatar(item.hasProfileImage || false, url, true);
                        });
                }
            }
            else
                userImageService.changeUserAvatar(item.hasProfileImage || false, UserProfileImageConstants.DefaultImagePath, true);
        }

        userService.clearCustomerUserList();
        userService.enableTwoFactorAuth(item);
    }

    afterDelete() {
        userService.clearCustomerUserList();
        return true;
    }

    validate(item: User, isNew: boolean) {
        var formData = store.getState().form.UserDetailsForm as any;
        var initialExpiryDate = formData.initial != null && formData.initial.accessExpiryDate != null &&
            new Date(formData.initial.accessExpiryDate).getTime();
        var updatedExpiryDate = item.accessExpiryDate && new Date(item.accessExpiryDate).getTime();
        var today = new Date().getTime();

        if (item.isTwoFactorAuthEnabled && !item.email) {
            return "USER_CREDENTIALS:ERROR_USER_OTP_EMAIL_REQUIRED";
        }

        if (isNew && updatedExpiryDate && (updatedExpiryDate < today)) {
            return "DETAILS:ERROR_USER_PAST_EXPIRY_DATE_NOT_ALLOWED";
        }

        if (!isNew && updatedExpiryDate && (updatedExpiryDate < today)) {
            if (initialExpiryDate && initialExpiryDate < today) {
                if (initialExpiryDate != updatedExpiryDate) {
                    return "DETAILS:ERROR_USER_PAST_EXPIRY_DATE_NOT_ALLOWED";
                }
            }
            else {
                return "DETAILS:ERROR_USER_PAST_EXPIRY_DATE_NOT_ALLOWED";
            }
        }

        if (!item.customerRoles || item.customerRoles.length == 0) {
            return "ROLES:ERROR_USER_NO_ROLES_SPECIFIED";
        }

        if (!isNew && item.biometricData) {
            let biometricData = item.biometricData;
            biometricData.forEach(cardData => {
                if (!cardData.enrolmentSource && cardData.identityType ||
                    (cardData.enrolmentSource == CardDataConst.WEB_ENROLMENT_SOURCE &&
                        (!cardData.identityType || !cardData.binaryData))) {
                    return "CARD_DATA:ERROR_CARD_DATA_REQUIRED_FIELDS";
                } else {
                    return true;
                }
            });

        }

        return null;
    }

    hasProfileImageChanged(item: User, isNew: boolean) {
        const { item: initialItem } = this.props;
        return (isNew && item.hasProfileImage) || (initialItem && item.tempProfileImageURL != initialItem.tempProfileImageURL);
    }

    hideDeleteButton(item: User) {
        return item.id == accountSessionService.getLoggedInUserId();
    }

    hideDescriptionHeader() {
        return true;
    }

    refreshAfterUpdate() {
        return true;
    }
}

interface State {
    selectedTab: number;
}

class FormBody extends React.Component<DetailFormProps, State> {
    constructor(props: DetailFormProps) {
        super(props);
        this.onSelectTab = this.onSelectTab.bind(this);
        
        this.state = {
            selectedTab: 0
        };
    }

    onSelectTab(e: any) {
        this.setState({ ...this.state, selectedTab: e.selected });
    }

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

    render() {
        const { props } = this;
        const { selectedTab } = this.state;
        const errorTab = props.error && props.error.split(":")[0];
        const errorMsg = props.error && props.error.split(":")[1];

        return (
            <TabStrip className="user-tabs" selected={selectedTab} onSelect={this.onSelectTab} keepTabsMounted={false}>
                <TabStripTab title={this.getTabHeader("TEXT_DETAILS", errorTab == "DETAILS")} contentClassName="user-details-tab">
                    {errorTab == "DETAILS" && this.getErrorAlertRow(errorMsg)}
                    <UserDetailsTab {...props} />
                </TabStripTab>
                <TabStripTab title={this.getTabHeader("TEXT_USER_CREDENTIALS", errorTab == "USER_CREDENTIALS", props.isNew)}
                    contentClassName="user-card-data-tab">
                    {errorTab == "USER_CREDENTIALS" && this.getErrorAlertRow(errorMsg)}
                    <UserCredentialsTab {...props} showFieldErrors={errorTab == "USER_CREDENTIALS" && errorMsg == "ERROR_USER_CREDENTIALS_REQUIRED_FIELDS"}
                        saveCallback={props.saveCallback} />
                </TabStripTab>
                <TabStripTab title={this.getTabHeader("TEXT_ROLES", errorTab == "ROLES")} contentClassName="user-roles-tab">
                    {errorTab == "ROLES" && this.getErrorAlertRow(errorMsg)}
                    <UserRolesTab {...props} />
                </TabStripTab>
                <TabStripTab title={this.getTabHeader("TEXT_ACCESSIBLE_ITEMS", false, props.isNew)}
                    contentClassName="user-accessible-items-tab" disabled={props.isNew}>
                    <UserAccessibleItemsTab {...props} />
                </TabStripTab>
                <TabStripTab title={this.getTabHeader("TEXT_MANAGED_CABINETS", errorTab == "CABINETS", props.isNew)}
                    contentClassName="user-managed-cabinets-tab" disabled={props.isNew}>
                    {errorTab == "CABINETS" && this.getErrorAlertRow(errorMsg)}
                    <UserManagedCabinetsTab {...props} />
                </TabStripTab>
            </TabStrip>
        );
    }
}

export default DetailPageContainer(UserDetails, "UserDetails", "user");



// WEBPACK FOOTER //
// ./src/modules/users/components/UserDetails/UserDetails.tsx