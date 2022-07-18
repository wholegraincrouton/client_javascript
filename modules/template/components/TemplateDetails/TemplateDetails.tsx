import * as React from "react";
import { DetailPage, DetailFormBodyComponent, DetailPageContainer } from "../../../shared/components/DetailPage";
import { Template, TemplateChannels } from "../../types/dto";
import { DetailFormProps } from "../../../shared/components/DetailPage/DetailForm";
import { FormField, FormAuditField } from "../../../shared/components/Form";
import { LookupDropDown } from "../../../shared/components/LookupDropDown/LookupDropDown";
import Input from "reactstrap/lib/Input";
import { contextService } from "../../../shared/services";
import { utilityService } from "src/modules/shared/services/util.service";
import { permissionService } from 'src/modules/shared/services/permission.service';

class TemplateDetails extends DetailPage<Template> {
  detailFormBody: DetailFormBodyComponent = FormBody;
  listPagePath: string = "/configuration/templatemanagement";

  validateItem(item: Template) {
    return {};
  }

  objectToFormValues(template: Template): any {
    if (template.templates == undefined) template.templates = [];

    return { ...template, templates: JSON.stringify(template.templates) };
  }

  formValuesToObject(values: any): Template {
    return {
      ...values, templates: JSON.parse(values.templates)
    };
  }
}

interface LocalState {
  channel?: string;
}

class FormBody extends React.Component<DetailFormProps, LocalState> {
  constructor(props: DetailFormProps) {
    super(props);
    this.onChannelChange = this.onChannelChange.bind(this);
    this.validateChannel = this.validateChannel.bind(this);
    this.state = {
      channel: props.initialValues["channel"]
    };
  }

  onChannelChange(event: any, inputProps: any) {
    const { props: formProps } = this;
    this.setState({ channel: event.target.value });
    inputProps.onChange(event);
    formProps.change("subject", "");
    formProps.change("senderId", "");
  }

  onContentChange(event: any, inputProps: any) {
    const { props: formProps } = this;
    formProps.change("content", event.target.value);
    inputProps.onChange(event);
  }

  validateChannel(value: any) {
    const { state } = this;
    return state.channel == TemplateChannels.Email ? utilityService.validateEmail(value) : "";
  }

  render() {
    const { props: formProps } = this;
    const { state } = this;
    const { item } = this.props;
    const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');
    
    return (
      <>
        <FormField name="culture" labelKey="TEXT_CULTURE" remarksKey="REMARK_CULTURE" required={true} disabled={!isPermittedToEdit}
          component={(props: any) => (<LookupDropDown {...props} lookupKey="LIST_CULTURE" />)} />
        <FormField name="section" labelKey="TEXT_SECTION" remarksKey="REMARK_SECTION" required={true} disabled={!isPermittedToEdit}
          component={(props: any) => (<LookupDropDown {...props} lookupKey="LIST_SECTION" />)} />
        <FormField name="channel" labelKey="TEXT_CHANNEL" remarksKey="REMARK_CHANNEL" required={true} disabled={!isPermittedToEdit}
          component={(props: any) => (<LookupDropDown {...props} lookupKey="LIST_ALERT_CHANNELS" onChange={(e: any) => this.onChannelChange(e, props)} />)}
        />
        <FormField name="key" labelKey="TEXT_KEY" remarksKey="REMARK_KEY" required={true} disabled={!isPermittedToEdit}
          component={(props: any) => (
            <LookupDropDown {...props} lookupKey={state.channel == TemplateChannels.Email ? "LIST_EMAIL_TEMPLATES" : "LIST_SMS_TEMPLATES"} />)} />
        {
          state.channel == TemplateChannels.Email &&
          <FormField name="senderId" remarksKey="REMARK_SENDER_ID" required={true} labelKey="TEXT_SENDER_ID" disabled={!isPermittedToEdit}
            component={Input} validate={this.validateChannel} />
        }
        {state.channel == TemplateChannels.Email && (
          <FormField name="subject" remarksKey={"REMARK_SUBJECT"} required={true} labelKey={"TEXT_SUBJECT"} disabled={!isPermittedToEdit}
            component={Input} />)}
        <FormField remarksKey="REMARK_CONTENT" required={true} labelKey="TEXT_CONTENT" name="content" disabled={!isPermittedToEdit}
          component={(props: any) => (<Input{...props} type="textarea" name="content" id="content" style={{ height: 150 }}
            onChange={(e: any) => this.onContentChange(e, props)} />)}
        />
        <FormField remarksKey="REMARK_TEMPLATE_REMARK" required={true} labelKey="TEXT_REMARK" name="remark" disabled={!isPermittedToEdit}
          component={Input} />
        <FormAuditField updatedOnUtc={formProps.item.updatedOnUtc} updatedByName={formProps.item.updatedByName} />
      </>
    );
  }
}

export default DetailPageContainer(TemplateDetails, "TemplateDetails", "alertTemplate", () => {
  //Code to return a new empty object.
  return {
    id: "", customerId: contextService.getCurrentCustomerId()
  };
}
);



// WEBPACK FOOTER //
// ./src/modules/template/components/TemplateDetails/TemplateDetails.tsx