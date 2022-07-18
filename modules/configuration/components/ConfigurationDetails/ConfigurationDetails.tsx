import * as React from 'react';
import { Configuration } from '../../types/dto';
import { DetailPage, DetailFormBodyComponent, DetailFormProps, DetailPageContainer } from '../../../shared/components/DetailPage';
import { ConfigurationForm } from '../shared/ConfigurationForm';
import { contextService } from '../../../shared/services';

class ConfigurationDetails extends DetailPage<Configuration> {
    detailFormBody: DetailFormBodyComponent = FormBody;
    listPagePath: string = "/configuration/configurationmanagement";

    validateItem(item: Configuration): any {
        return {};
    }
}

const FormBody = (formProps: DetailFormProps) =>
    <ConfigurationForm {...formProps} configurationLookupKey="LIST_CONFIGURATIONKEYS" />

export default DetailPageContainer(ConfigurationDetails, "ConfigurationDetails", "configuration", () => {
    //Code to return a new empty object.
    return { id: "", customerId: contextService.getCurrentCustomerId()}
});



// WEBPACK FOOTER //
// ./src/modules/configuration/components/ConfigurationDetails/ConfigurationDetails.tsx