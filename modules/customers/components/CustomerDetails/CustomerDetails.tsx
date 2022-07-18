import * as React from 'react';
import { Row, Col, Label, Alert } from "reactstrap";
import { TabStrip, TabStripTab } from '@progress/kendo-react-layout';
//import * as apiConstants from "src/modules/shared/constants/api.constants";
import { apiService, configService, customerService, localise } from '../../../shared/services';
import { DetailPage, DetailFormBodyComponent, DetailPageContainer, DetailFormProps } from '../../../shared/components/DetailPage';
import { BillingTypes, Customer } from '../../types/dto';
import { CustomerVASTab } from './Tabs/CustomerVASTab';
import { CustomerDetailsTab } from './Tabs/CustomerDetailsTab';
import { alertActions } from 'src/modules/shared/actions/alert.actions';
import { customerLogoService } from '../../services/customer-logo.service';
import '../customer.css';
import { SubmissionError } from 'redux-form';
import { CustomerBillingTab } from './Tabs/CustomerBillingTab';

class CustomerDetails extends DetailPage<Customer>{
    detailFormBody: DetailFormBodyComponent = FormBody;
    listPagePath: string = "/configuration/customermanagement";

    validateItem(): any {
        return {};
    }

    objectToFormValues(customer: Customer): any {
        return {
            ...customer,
            country: customer.country || 'AU',
            state: customer.state || 'NEW_SOUTH_WALES',
            billingCurrency: customer.billingCurrency || 'AUD',
            status: customer.status || 'ACTIVE',
            emailAlertStatus: customer.emailAlertStatus || 'DISABLED',
            smsAlertStatus: customer.smsAlertStatus || 'DISABLED',
            integrationStatus: customer.integrationStatus || 'DISABLED',
            siteInductionStatus: customer.siteInductionStatus || 'DISABLED',
            mobileAppStatus: customer.mobileAppStatus || 'DISABLED',
            billedBy: customer.billedBy || 'CIC',
            licenseFeePerCabinet: customer.licenseFeePerCabinet || 0,
            integrationFeePercentage: customer.integrationFeePercentage || 0,
            licensePeriod: customer.licensePeriod || '1',
            dateFormat: customer.dateFormat || 'DD/MM/YYYY',
            timeFormat: customer.timeFormat || 'hh:mm:ss A'
        };
    }

    beforeSave(item: Customer, isNew: boolean): boolean {
        let error = this.validate(item, isNew);

        if (error) {
            throw new SubmissionError({
                _error: error
            });
        }

        if (item.mobileNumber && !item.mobileNumber.startsWith('+')) {
            item.mobileNumber = `+${item.mobileNumber}`;
        }

        if (this.hasLogoChanged(item, isNew)) {
            if (item.hasLogo) {
                apiService.get('customer', 'GetLogoWriteUrl', undefined, { customerId: item.id })
                    .then((url: string) => {
                        customerLogoService.uploadCustomerLogoFile(url)
                            .catch(() => {
                                alertActions.showError("ERROR_IMAGE_UPLOAD");
                                return false;
                            });
                    });
            }
            else {
                apiService.get('customer', 'GetLogoDeleteUrl', undefined, { customerId: item.id })
                    .then((deleteUrl: string) => {
                        customerLogoService.deleteCustomerLogoFile(deleteUrl)
                            .catch(() => {
                                alertActions.showError("ERROR_IMAGE_DELETE");
                                return false;
                            });
                    });
            }
        }

        return true;
    }

    validate(customer: Customer, isNew: boolean) {
        if (!customer.salesForceCustomerId || (customer.billedBy == BillingTypes.Reseller && !customer.resellerName) ||
            !customer.licenseFeePerCabinet || !customer.integrationFeePercentage) {
            return 'BILLING:ERROR_REQUIRED_FIELD';
        }

        if (!isNew) {
            var maxCustomerSMSLimit = parseInt(configService.getConfigurationValue('MAX_SMS_PER_CUSTOMER', '*', customer.id));
            var maxUserSMSLimit = parseInt(configService.getConfigurationValue('MAX_SMS_PER_USER', '*', customer.id));

            if (customer.smsAlertStatus == 'ENABLED' && (customer.maxSmsPerCustomer == 0 || customer.maxSmsPerUser == 0)) {
                return 'VAS_DETAILS:ERROR_INVALID_SMS_LIMIT';
            } else if (customer.maxSmsPerCustomer && customer.maxSmsPerCustomer > maxCustomerSMSLimit) {
                return `VAS_DETAILS:ERROR_INVALID_MAXIMUM_CUSTOMER_SMS_LIMIT-${maxCustomerSMSLimit}`;
            } else if (customer.maxSmsPerUser && customer.maxSmsPerUser > maxUserSMSLimit) {
                return `VAS_DETAILS:ERROR_INVALID_MAXIMUM_USER_SMS_LIMIT-${maxUserSMSLimit}`;
            }
        }

        return null;
    }

    afterSave(id: string, customer: Customer, isNew: boolean) {
        let customers = customerService.getCustomerList();
        if (!isNew) {

            let item = customers.find(c => c.id == id);

            if (item)
                item.name = customer.name;
            customerService.setCustomerList(customers);
        }

        //apiService.post('account', 'RefreshSignin', undefined, [], false, false, apiConstants.ACCOUNTS);
    }

    afterDelete(id: string) {
        let customers = customerService.getCustomerList();
        let item = customers.find(c => c.id == id);

        if (item)
            customers.splice(customers.indexOf(item), 1);
        customerService.setCustomerList(customers);
        return true;
    }

    hideDescriptionHeader() {
        return true;
    }

    hasLogoChanged(item: Customer, isNew: boolean) {
        const { item: initialItem } = this.props;
        return (isNew && item.hasLogo) || (initialItem && item.logoURL != initialItem.logoURL);
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
        var value = errorMsg.split("-").length > 1 ? errorMsg.split("-")[1] : '';
        var errorMsg = errorMsg.split("-")[0];
        return (
            <Row className="mt-2 mb-2">
                <Col>
                    <Alert className="mb-0" color="danger">
                        <small className="text-danger">{localise(errorMsg) + ' ' + value}</small>
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
            <div className="customer-tabs">
                <TabStrip selected={selectedTab} onSelect={this.onSelectTab} keepTabsMounted={true}>
                    <TabStripTab title={this.getTabHeader("TEXT_DETAILS", errorTab == "DETAILS")}
                        contentClassName="customer-details-tab">
                        {errorTab == "DETAILS" && this.getErrorAlertRow(errorMsg)}
                        <CustomerDetailsTab {...props} />
                    </TabStripTab>
                    <TabStripTab title={this.getTabHeader("TEXT_BILLING", errorTab == "BILLING")}
                        contentClassName="customer-billing-tab">
                        {errorTab == "BILLING" && this.getErrorAlertRow(errorMsg)}
                        <CustomerBillingTab {...props} />
                    </TabStripTab>
                    <TabStripTab title={this.getTabHeader("TEXT_VAS_SERVICES", errorTab == "VAS_DETAILS", props.isNew)}
                        contentClassName="customer-vas-tab" disabled={props.isNew}>
                        {errorTab == "VAS_DETAILS" && this.getErrorAlertRow(errorMsg)}
                        <CustomerVASTab {...props} />
                    </TabStripTab>
                </TabStrip>
            </div>
        );
    }
}

export default DetailPageContainer(CustomerDetails, "CustomerDetails", "customer");



// WEBPACK FOOTER //
// ./src/modules/customers/components/CustomerDetails/CustomerDetails.tsx