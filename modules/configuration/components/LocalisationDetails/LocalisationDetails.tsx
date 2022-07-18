import * as React from 'react';
import { Localisation } from '../../types/dto';
import { DetailPage, DetailFormBodyComponent, DetailFormProps, DetailPageContainer } from '../../../shared/components/DetailPage';
import { ConfigurationForm } from '../shared/ConfigurationForm';
import { contextService, applicationService } from '../../../shared/services';

class LocalisationDetails extends DetailPage<Localisation> {

    detailFormBody: DetailFormBodyComponent = FormBody;
    listPagePath: string = "/configuration/localisationmanagement";

    validateItem(item: Localisation): any {
        return {};
    }

    afterSave() {       
        applicationService.initializePermittedLocalisations();
    }
}

const FormBody = (formProps: DetailFormProps) =>
    <ConfigurationForm {...formProps} configurationLookupKey="LIST_LOCALISATIONKEYS" />

export default DetailPageContainer(LocalisationDetails, "LocalisationDetails", "localisationtexts", () => {
    //Code to return a new empty object.
    return { id: "", customerId: contextService.getCurrentCustomerId()}
});



// WEBPACK FOOTER //
// ./src/modules/configuration/components/LocalisationDetails/LocalisationDetails.tsx