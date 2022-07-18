import * as React from "react";
import { Col, Input, Row } from "reactstrap";
import { BillingTypes } from "src/modules/customers/types/dto";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { FormField } from "src/modules/shared/components/Form";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import { localise, permissionService, utilityService } from "src/modules/shared/services";

interface State {
    billedBy?: string;
    resellerName?: string;
    isBilledByCIC?: boolean;
}

export class CustomerBillingTab extends React.Component<DetailFormProps, State> {
    constructor(props: DetailFormProps) {
        super(props);
        this.onBilledByChange = this.onBilledByChange.bind(this);
        this.onNumericChange = this.onNumericChange.bind(this);

        this.state = {
            billedBy: this.props.initialValues['billedBy'] || BillingTypes.CIC,
            isBilledByCIC: this.props.initialValues['billedBy'] == BillingTypes.CIC,
            resellerName: this.props.initialValues['resellerName']
        }
    }

    onBilledByChange(event: any) {
        const { props: formprops } = this;
        const { billedBy, resellerName } = this.state;

        formprops.change("billedBy", event.target.value);

        this.setState({
            ...this.state,
            billedBy: event.target.value,
            resellerName: billedBy == BillingTypes.CIC ? '' : resellerName
        });
    }

    onNumericChange(event: any) {
        const { name, value } = event.target;
        this.props.change(name, value == '' ? 0 : value);
        this.setState({
            ...this.state,
            [name]: value == '' ? 0 : value
        });
    }

    render() {
        const { item } = this.props;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');
        const { billedBy } = this.state;

        return (
            <>
                <Row className="mb-3">
                    <Col>
                        <small className="text-muted">{localise('TEXT_BILLING_TAB_DESCRIPTION')}</small>
                    </Col>
                    <Col md="auto">
                        <small className="text-muted">{localise('TEXT_REQUIRED_FIELD')}</small>
                    </Col>
                </Row>
                <FormField name="salesForceCustomerId" labelKey="TEXT_SALESFORCE_ID" remarksKey="REMARK_SALESFORCE_CUSTOMER_ID"
                    required={true} disabled={!isPermittedToEdit} component={Input} />
                <FormField name="billedBy" labelKey="TEXT_BILLED_BY" remarksKey="REMARK_BILLED_BY"
                    required={true} disabled={!isPermittedToEdit} component={(props: any) =>
                        <LookupDropDown {...props} lookupKey="LIST_BILLED_BY" value={billedBy} onChange={(e: any) => this.onBilledByChange(e)} />} />
                {
                    billedBy && billedBy == BillingTypes.Reseller &&
                    <FormField name="resellerName" labelKey="TEXT_RESELLER_NAME" remarksKey="REMARK_RESELLER_NAME"
                        required={true} disabled={!isPermittedToEdit} component={Input} />
                }
                <FormField name="billingCurrency" labelKey="TEXT_BILLING_CURRENCY" remarksKey="REMARK_BILLING_CURRENCY"
                    required={true} disabled={!isPermittedToEdit} component={(props: any) => <LookupDropDown {...props} lookupKey="LIST_CURRENCIES" />} />
                <FormField name="licenseFeePerCabinet" labelKey="TEXT_LICENSE_FEE_PER_CABINET" remarksKey="REMARK_LICENSE_FEE_PER_CABINET"
                    required={true} disabled={!isPermittedToEdit} validate={utilityService.validateNumber} disableInbuiltValidator={true}
                    component={this.LicenseFeeInput} />
                <FormField name="integrationFeePercentage" labelKey="TEXT_INTEGRATION_LICENSE_FEE_PERCENTAGE" remarksKey="REMARK_INTEGRATION_LICENSE_FEE_PERCENTAGE"
                    required={true} disabled={!isPermittedToEdit} validate={utilityService.validateNumber} disableInbuiltValidator={true}
                    component={this.IntegrationFeeInput} />
                <FormField name="licensePeriod" labelKey="TEXT_LICENSE_FEE_PERIOD" remarksKey="REMARK_LICENSE_FEE_PERIOD"
                    required={true} disabled={!isPermittedToEdit} validate={utilityService.validateNumber} disableInbuiltValidator={true}
                    component={(props: any) => <LookupDropDown {...props} lookupKey="LIST_LICENSE_FEE_PERIOD" />} />
            </>
        );
    }

    LicenseFeeInput = (props: any) => <Input type="number" name="licenseFeePerCabinet" value={props.value} onChange={this.onNumericChange} />;
    IntegrationFeeInput = (props: any) => <Input type="number" name="integrationFeePercentage" value={props.value} onChange={this.onNumericChange} />;
}



// WEBPACK FOOTER //
// ./src/modules/customers/components/CustomerDetails/Tabs/CustomerBillingTab.tsx