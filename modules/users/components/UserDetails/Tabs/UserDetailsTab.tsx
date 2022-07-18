import * as React from "react";
import { Row, Col, Input, Label } from "reactstrap";
import { DatePicker } from "@progress/kendo-dateinputs-react-wrapper";
import { configService, localise, utilityService } from "src/modules/shared/services";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { FormField, FormAuditField } from "src/modules/shared/components/Form";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import { UserProfileImageControl } from "../UserProfileImage/UserProfileImageControl";
import * as moment from 'moment';
import { UserFields } from "src/modules/users/types/dto";
import { permissionService } from '../../../../shared/services/permission.service';

export class UserDetailsTab extends React.Component<DetailFormProps> {
    constructor(props: DetailFormProps) {
        super(props);
        this.onDateChange = this.onDateChange.bind(this);
        this.onImageChange = this.onImageChange.bind(this);
        this.getReadOnlyToolTip = this.getReadOnlyToolTip.bind(this);
    }

    onImageChange(hasImage: boolean, url?: string) {
        const { change } = this.props;
        change("hasProfileImage", hasImage);
        change("tempProfileImageURL", url);
    }

    onDateChange(event: any, p: any) {
        let value = event.sender.value();

        let e = {
            target: {
                value: value ? moment(value as Date).format('YYYY-MM-DD') : null,
                name: p.name
            }
        }
        p.onChange(e);
    }

    getReadOnlyToolTip(fieldName: string, userFieldList: string[]) {
        const { item } = this.props;
        var isDisabled = userFieldList.includes(fieldName) || (userFieldList.length == 0 && item.externalSystemId);
        return isDisabled ? localise("TEXT_CANNOT_EDIT_EXTERNAL_SYSTEM_FIELDS") : undefined;
    }

    render() {
        const { item } = this.props;
        const userMappings = item.userFieldsInExternalMapping || [];
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');

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
                <Row>
                    <Col className="order-md-last mb-3 mb-md-0 mt-md-4 text-center offset-lg-1 offset-xl-2">
                        <UserProfileImageControl hasImage={item.hasProfileImage} profileImageURL={item.profileImageURL}
                            userId={item.id} onChange={this.onImageChange} />
                    </Col>
                    <Col md={6}>
                        <FormField remarksKey="REMARK_FIRST_NAME" required={true} labelKey="TEXT_FIRST_NAME" name="firstName"
                            tooltip={this.getReadOnlyToolTip(UserFields.FirstName, userMappings)} component={Input}
                            disabled={!isPermittedToEdit || userMappings.includes(UserFields.FirstName) || (userMappings.length == 0 && item.externalSystemId)} />
                        <FormField remarksKey="REMARK_LAST_NAME" labelKey="TEXT_LAST_NAME" name="lastName"
                            tooltip={this.getReadOnlyToolTip(UserFields.LastName, userMappings)} component={Input}
                            disabled={!isPermittedToEdit || userMappings.includes(UserFields.LastName) || (userMappings.length == 0 && item.externalSystemId)} />
                        <FormField name="designation" required={false} remarksKey="REMARK_USER_DESIGNATION" labelKey="TEXT_DESIGNATION"
                            tooltip={this.getReadOnlyToolTip(UserFields.Designation, userMappings)} component={Input}
                            disabled={!isPermittedToEdit || userMappings.includes(UserFields.Designation) || (userMappings.length == 0 && item.externalSystemId)} />
                        <FormField name="description" required={false} remarksKey="REMARK_USER_DESCRIPTION" labelKey="TEXT_DESCRIPTION"
                            tooltip={this.getReadOnlyToolTip(UserFields.Description, userMappings)} component={Input}
                            disabled={!isPermittedToEdit || userMappings.includes(UserFields.Description) || (userMappings.length == 0 && item.externalSystemId)} />
                        <FormField name="company" required={false} remarksKey="REMARK_COMPANY" labelKey="TEXT_COMPANY"
                            tooltip={this.getReadOnlyToolTip(UserFields.Company, userMappings)} component={Input}
                            disabled={!isPermittedToEdit || userMappings.includes(UserFields.Company) || (userMappings.length == 0 && item.externalSystemId)} />
                        <FormField remarksKey="REMARK_MOBILE_NUMBER" required={false} labelKey="TEXT_MOBILE_NUMBER" name="mobileNumber"
                            tooltip={this.getReadOnlyToolTip(UserFields.MobileNumber, userMappings)} component={Input}
                            disabled={!isPermittedToEdit || userMappings.includes(UserFields.MobileNumber) || (userMappings.length == 0 && item.externalSystemId)}
                            validate={utilityService.validateMobileNumber} />
                        <FormField name="culture" required={true} remarksKey="REMARK_USER_CULTURE" labelKey="TEXT_CULTURE"
                            component={(props: any) =>
                                <LookupDropDown {...props} lookupKey="LIST_CULTURE" tooltip={this.getReadOnlyToolTip(UserFields.Culture, userMappings)}
                                    disabled={!isPermittedToEdit || userMappings.includes(UserFields.Culture) || (userMappings.length == 0 && item.externalSystemId)} />} />
                        <FormField remarksKey="REMARK_ACCESS_EXPIRES_ON" labelKey="TEXT_ACCESS_EXPIRES_ON" name="accessExpiryDate"
                            component={(props: any) =>
                                <div>
                                    {
                                        !isPermittedToEdit || userMappings.includes(UserFields.AccessExpiryDate) || (userMappings.length == 0 && item.externalSystemId) ?
                                            <Label style={{ color: "#495057" }} title={localise("TEXT_CANNOT_EDIT_EXTERNAL_SYSTEM_FIELDS")}>
                                                {props.value != '' ? moment(props.value).format("YYYY-MM-DD") : localise("TEXT_NA")}
                                            </Label>
                                            :
                                            <DatePicker {...props} value={props.value ? new Date(props.value) : undefined}
                                                change={(e: any) => this.onDateChange(e, props)}
                                                format={configService.getKendoDateFormatByCurrentFormat() || configService.getDateTimeFormatConfigurationValue().kendoDateFormat} />
                                    }
                                </div>
                            } />
                        <FormAuditField updatedOnUtc={item.updatedOnUtc} updatedByName={item.updatedByName} />
                    </Col>
                </Row>
            </>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/users/components/UserDetails/Tabs/UserDetailsTab.tsx