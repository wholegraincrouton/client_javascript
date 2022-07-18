import * as React from "react";
import { Col, Input, Label, Row } from "reactstrap";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { FormAuditField, FormField } from "src/modules/shared/components/Form";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import { configService, localise } from "src/modules/shared/services";
import { CustomerLogoControl } from "../CustomerLogo/CustomerLogoControl";
import { permissionService } from 'src/modules/shared/services/permission.service';

interface State {
    smsAlertStatus?: string;
    maxSmsPerCustomer?: number;
    maxSmsPerUser?: number;
}
export class CustomerVASTab extends React.Component<DetailFormProps, State> {
    smsPerCustomerConfig = configService.getConfigurationValue('SMS_PER_CUSTOMER_DEFAULT', '*', this.props.initialValues['id']);
    smsPerUserConfig = configService.getConfigurationValue('SMS_PER_USER_DEFAULT', '*', this.props.initialValues['id']);

    constructor(props: DetailFormProps) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.onImageChange = this.onImageChange.bind(this);
        this.onSMSAlertChange = this.onSMSAlertChange.bind(this);
        this.state = {
            smsAlertStatus: this.props.initialValues['smsAlertStatus'],
            maxSmsPerCustomer: this.props.initialValues['maxSmsPerCustomer'],
            maxSmsPerUser: this.props.initialValues['maxSmsPerUser'],
        }
    }

    handleChange(event: any) {
        const { name, value } = event.target;       
        this.props.change(name, value == '' ? 0 : value);
        this.setState({
            ...this.state,
            [name]: value == '' ? 0 : value
        });
    }

    onImageChange(hasImage: boolean, url?: string) {
        const { change } = this.props;
        change("hasLogo", hasImage);
        change("logoURL", url);
    }

    onSMSAlertChange(event: any) {
        var maxSmsPerCustomerValue = event.target.value == 'DISABLED' ? 0 : parseInt(this.smsPerCustomerConfig)
        var maxSmsPerUserValue = event.target.value == 'DISABLED' ? 0 : parseInt(this.smsPerUserConfig)

        this.props.change('smsAlertStatus', event.target.value);
        this.props.change('maxSmsPerCustomer', maxSmsPerCustomerValue);
        this.props.change('maxSmsPerUser', maxSmsPerUserValue);

        this.setState({
            ...this.state,
            smsAlertStatus: event.target.value,
            maxSmsPerCustomer: maxSmsPerCustomerValue,
            maxSmsPerUser: maxSmsPerUserValue
        });
    }

    render() {
        const { item } = this.props;
        const { smsAlertStatus, maxSmsPerCustomer, maxSmsPerUser } = this.state;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');
        
        return (
            <>
                <Row className="mb-3">
                    <Col>
                        <small className="text-muted">{localise("TEXT_VAS_TAB_DESCRIPTION")}</small>
                    </Col>
                    <Col md="auto">
                        <small className="text-muted">{localise('TEXT_REQUIRED_FIELD')}</small>
                    </Col>
                </Row>
                <Row>
                    <Col className="order-md-last mb-3 mb-md-0 mt-md-4 text-center offset-lg-1 offset-xl-2">
                        <CustomerLogoControl hasLogo={item.hasLogo} customerId={item.id} onChange={this.onImageChange} readonly={!isPermittedToEdit}/>
                    </Col>
                    <Col md={6}>
                        <FormField labelKey="TEXT_EMAIL_ALERTS" remarksKey="REMARK_EMAIL_ALERTS" required={true} disabled={!isPermittedToEdit}
                            name="emailAlertStatus" component={(props: any) =>
                                <LookupDropDown {...props} lookupKey="LIST_CUSTOMER_VAS_STATUS" />} />
                        <FormField labelKey="TEXT_SMS_ALERTS" remarksKey="REMARK_SMS_ALERTS" required={true} disabled={!isPermittedToEdit}
                            name="smsAlertStatus" component={(props: any) =>
                                <LookupDropDown {...props} lookupKey="LIST_CUSTOMER_VAS_STATUS" onChange={e => this.onSMSAlertChange(e)} />} />
                        {
                            smsAlertStatus && smsAlertStatus == 'ENABLED' &&
                            <div>
                                <Row className="sms-limits">
                                    <Col>
                                        <Label>{localise("TEXT_MAX_SMS_PER_CUSTOMER")}</Label>
                                        <Input type="number" name="maxSmsPerCustomer" value={maxSmsPerCustomer} required={true} onChange={this.handleChange}
                                        disabled={!isPermittedToEdit}/>
                                    </Col>
                                    <Col>
                                        <Label>{localise("TEXT_MAX_SMS_PER_USER")}</Label>
                                        <Input type="number" name="maxSmsPerUser" value={maxSmsPerUser} required={true} onChange={this.handleChange}
                                        disabled={!isPermittedToEdit}/>
                                    </Col>
                                </Row>
                                <br/><br/><br/>
                            </div>
                        }

                        <FormField labelKey="TEXT_INTEGRATION" remarksKey="REMARK_INTEGRATION" required={true} disabled={!isPermittedToEdit}
                            name="integrationStatus" component={(props: any) =>
                                <LookupDropDown {...props} lookupKey="LIST_CUSTOMER_VAS_STATUS" />} />
                        <FormField labelKey="TEXT_SITE_INDUCTIONS" remarksKey="REMARK_SITE_INDUCTIONS" required={true} disabled={!isPermittedToEdit}
                            name="siteInductionStatus" component={(props: any) =>
                                <LookupDropDown {...props} lookupKey="LIST_CUSTOMER_VAS_STATUS" />} />
                        <FormField labelKey="TEXT_MOBILE_APP" remarksKey="REMARK_MOBILE_APP" required={true} disabled={!isPermittedToEdit}
                            name="mobileAppStatus" component={(props: any) =>
                                <LookupDropDown {...props} lookupKey="LIST_CUSTOMER_VAS_STATUS" />} />

                        <FormAuditField updatedOnUtc={item.updatedOnUtc} updatedByName={item.updatedByName} />
                    </Col>
                </Row>
            </>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/customers/components/CustomerDetails/Tabs/CustomerVASTab.tsx