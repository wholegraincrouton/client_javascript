import * as React from "react";
import { Col, Input, Row } from "reactstrap";
import { localise, utilityService } from "src/modules/shared/services";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { FormField, FormAuditField } from "src/modules/shared/components/Form";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import { CountryList, CountryStateList } from "src/modules/shared/components/CountryLocationList";
import { permissionService } from 'src/modules/shared/services/permission.service';

interface State {
    country?: string;
}

export class CustomerDetailsTab extends React.Component<DetailFormProps, State> {
    nameInput = (props: any) => <Input {...props} maxLength={40} />

    constructor(props: DetailFormProps) {
        super(props);
        this.onCountryChange = this.onCountryChange.bind(this);

        this.state = {
            country: (props.initialValues as any).country,
        }
    }

    onCountryChange(event: any, inputProps: any) {
        const { props: formProps } = this;
        this.setState({ country: event.target.value });
        inputProps.onChange(event);
        formProps.change("state", "");
    }

    render() {
        const { item } = this.props;
        const { country } = this.state;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');
        
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
                <FormField remarksKey="REMARK_CUSTOMER_NAME" required={true} labelKey="TEXT_CUSTOMER_NAME" name="name"
                    component={Input} disabled={!isPermittedToEdit}/>
                <FormField remarksKey="REMARK_FIRST_NAME" required={true} labelKey="TEXT_FIRST_NAME" name="firstName"
                    component={Input} disabled={!isPermittedToEdit}/>
                <FormField remarksKey="REMARK_LAST_NAME" required={true} labelKey="TEXT_LAST_NAME" name="lastName"
                    component={Input} disabled={!isPermittedToEdit}/>
                <FormField remarksKey="REMARK_MOBILE_NUMBER" required={true} labelKey="TEXT_MOBILE_NUMBER" name="mobileNumber"
                    component={Input} validate={utilityService.validateMobileNumber} disabled={!isPermittedToEdit}/>
                <FormField remarksKey="REMARK_EMAIL" required={true} labelKey="TEXT_EMAIL" name="email"
                    component={Input} validate={utilityService.validateEmail} disabled={!isPermittedToEdit}/>
                <FormField name="country" required={true} remarksKey="REMARK_COUNTRY" labelKey="TEXT_COUNTRY"
                    component={(props: any) => <CountryList {...props} allowAny={false}
                        onChange={(e: any) => this.onCountryChange(e, props)} />} disabled={!isPermittedToEdit}/>
                <FormField name="state" required={true} remarksKey="REMARK_STATE" labelKey="TEXT_STATE"
                    component={(props: any) => <CountryStateList {...props} 
                        selectedCountry={country || item.country} />} disabled={!isPermittedToEdit}/>
                <FormField name="status" required={true} remarksKey="REMARK_ACCOUNT_STATUS" labelKey="TEXT_ACCOUNT_STATUS"
                    component={(props: any) => <LookupDropDown {...props} lookupKey="LIST_ACCOUNT_STATUS" />} disabled={!isPermittedToEdit}/>
                <FormField name="dateFormat" required={true} remarksKey="REMARK_DATE_FORMAT" labelKey="TEXT_DATE_FORMAT"
                    component={(props: any) => <LookupDropDown {...props} lookupKey="LIST_DATE_FORMAT" />} disabled={!isPermittedToEdit}/>
                <FormField name="timeFormat" required={true} remarksKey="REMARK_TIME_FORMAT" labelKey="TEXT_TIME_FORMAT"
                    component={(props: any) => <LookupDropDown {...props} lookupKey="LIST_TIME_FORMAT" />} disabled={!isPermittedToEdit}/>
                <FormAuditField updatedOnUtc={item.updatedOnUtc} updatedByName={item.updatedByName} />
            </>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/customers/components/CustomerDetails/Tabs/CustomerDetailsTab.tsx