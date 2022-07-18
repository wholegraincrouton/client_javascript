import * as React from 'react';
import { Input } from 'reactstrap';
import { FormField, FormAuditField } from "../../../shared/components/Form";
import { LookupDropDown } from '../../../shared/components/LookupDropDown/LookupDropDown';
import { DetailFormProps, DetailFormCheckBox } from '../../../shared/components/DetailPage';
import { lookupService } from 'src/modules/shared/services';
import { permissionService } from 'src/modules/shared/services/permission.service';

interface Props extends DetailFormProps {
    configurationLookupKey: string;
}

interface State {
    selectedKey: string | undefined;
}

export class ConfigurationForm extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            selectedKey: undefined
        }

        this.onKeyChange = this.onKeyChange.bind(this);
    }

    onKeyChange(event: any, inputProps: any) {
        this.setState({ selectedKey: event.target.value });
        inputProps.onChange(event);
    }

    render() {

        const formProps  = this.props;
        const { item } = this.props;

        const selectedKey = this.state.selectedKey || formProps.initialValues['key'];
        const remark = lookupService.getRemark(formProps.configurationLookupKey, selectedKey);
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');
        
        return <>          
            <FormField name="culture" required={true} remarksKey="REMARK_CULTURE" labelKey="TEXT_CULTURE" disabled={!isPermittedToEdit}
                component={(props: any) => <LookupDropDown {...props} lookupKey="LIST_CULTURE" />} />
            <FormField name="section" remarksKey="REMARK_SECTION" required={true} labelKey="TEXT_SECTION" disabled={!isPermittedToEdit}
                component={(props: any) => <LookupDropDown {...props} lookupKey="LIST_SECTION" />} />
            <FormField name="key" remarksKey="REMARK_KEY" required={true} labelKey="TEXT_KEY" disabled={!formProps.isNew || !isPermittedToEdit}
                component={(props: any) => <LookupDropDown {...props} lookupKey={formProps.configurationLookupKey} onChange={(e: any) => this.onKeyChange(e, props)} />} />
            {remark && selectedKey && <FormField labelKey="TEXT_REMARK_SELECTED_KEY" name="remark"
                component={() => <div><small className="text-muted font-weight-bold">{remark}</small></div>} />}
            <FormField remarksKey="REMARK_VALUE" required={true} labelKey="TEXT_VALUE" name="value" disabled={!isPermittedToEdit}
                component={Input} />
            <FormField name="includeInCabinet" remarksKey="REMARK_INCLUDE_IN_CABINET" disabled={!isPermittedToEdit}
                component={(props: any, readonly: boolean = !isPermittedToEdit) => <DetailFormCheckBox {...props} fieldName="TEXT_INCLUDE_IN_DEVICE" isDisabled={!isPermittedToEdit}
                ></DetailFormCheckBox>} />
            <FormAuditField updatedOnUtc={formProps.item.updatedOnUtc} updatedByName={formProps.item.updatedByName} />
        </>
    }
}


// WEBPACK FOOTER //
// ./src/modules/configuration/components/shared/ConfigurationForm.tsx