import * as React from 'react';
import { Lookup } from '../../types/dto';
import { DetailPage, DetailFormBodyComponent, DetailPageContainer, DetailFormProps, DetailFormCheckBox } from '../../../shared/components/DetailPage';
import { FormField, FormAuditField, FormJsonField } from '../../../shared/components/Form';
import { LookupDropDown } from '../../../shared/components/LookupDropDown/LookupDropDown';
import { LookupItemEditGrid } from './LookupItemEditGrid';
import { contextService, lookupService, applicationService } from '../../../shared/services';
import { permissionService } from 'src/modules/shared/services/permission.service';

class LookupDetails extends DetailPage<Lookup> {

    detailFormBody: DetailFormBodyComponent = FormBody;
    listPagePath: string = "/configuration/lookupmanagement";

    validateItem(item: Lookup): any {
        return {};
    }

    objectToFormValues(lookup: Lookup) {
        lookup.items = lookup.items || [];
        const values = { ...lookup, items: JSON.stringify(lookup.items) };
        return values;
    }

    formValuesToObject(values: any) {
        const lookup = { ...values, items: JSON.parse(values.items) };
        return lookup;
    }

    afterSave() {       
        applicationService.initializeLookups();
    }
}


interface FormBodyState {
    selectedKey: string | undefined;
}

class FormBody extends React.Component<DetailFormProps, FormBodyState> {

    constructor(props: DetailFormProps) {
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
        const formProps = this.props;
        const { item } = this.props;
        const customerId = contextService.getCurrentCustomerId();

        const selectedKey = this.state.selectedKey || formProps.initialValues['key'];
        const remark = lookupService.getRemark("LIST_LOOKUPKEYS", selectedKey);
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');
        
        return <>           
            <FormField name="culture" labelKey="TEXT_CULTURE" remarksKey="REMARK_CULTURE" required={true} disabled={!isPermittedToEdit}
                component={(props: any) => <LookupDropDown {...props} lookupKey="LIST_CULTURE" />} />
            <FormField name="section" labelKey="TEXT_SECTION" remarksKey="REMARK_SECTION" required={true} disabled={!isPermittedToEdit}
                component={(props: any) => <LookupDropDown {...props} lookupKey="LIST_SECTION" />} />
            <FormField name="key" labelKey="TEXT_KEY" remarksKey="REMARK_KEY" required={true} disabled={!formProps.isNew || !isPermittedToEdit}
                component={(props: any) => <LookupDropDown {...props} lookupKey="LIST_LOOKUPKEYS" onChange={(e: any) => this.onKeyChange(e, props)} />} />
            {remark && selectedKey && <FormField labelKey="TEXT_REMARK_SELECTED_KEY" name="remark"
                component={() => <div><small className="text-muted font-weight-bold">{remark}</small></div>} />}
            <FormField name="includeInCabinet" remarksKey="REMARK_INCLUDE_IN_CABINET" disabled={!isPermittedToEdit}
                component={(props: any) => <DetailFormCheckBox {...props} fieldName="TEXT_INCLUDE_IN_DEVICE"  isDisabled={!isPermittedToEdit}></DetailFormCheckBox>} />
            <FormAuditField updatedOnUtc={formProps.item.updatedOnUtc} updatedByName={formProps.item.updatedByName}  />
            <FormJsonField name="items" customerId={customerId} disabled={!isPermittedToEdit}
                parentFormName={formProps.form} deletePermissionKeySuffix="DELETEKEY" addPermissionKeySuffix="ADDKEY"
                valueProp="items" changeProp="onChange" component={LookupItemEditGrid} defaultSort={{ field: "text", dir: "asc" }} />
        </>
    }
}

export default DetailPageContainer(LookupDetails, "LookupDetails", "lookups", () => {
    //Code to return a new empty object.
    return { id: "", customerId: contextService.getCurrentCustomerId() }
});



// WEBPACK FOOTER //
// ./src/modules/configuration/components/LookupDetails/LookupDetails.tsx