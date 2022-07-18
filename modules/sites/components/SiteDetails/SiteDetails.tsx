import * as React from 'react';
import { SubmissionError } from 'redux-form';
import { Row, Col, Label, Alert } from "reactstrap";
import { TabStrip, TabStripTab } from '@progress/kendo-react-layout';
import { contextService, localise } from '../../../shared/services';
import { DetailPage, DetailFormBodyComponent, DetailPageContainer, DetailFormProps } from '../../../shared/components/DetailPage';
import { Site } from '../../types/dto';
import { siteService } from '../../services/site.service';
import { SiteDetailsTab } from './Tabs/SiteDetailsTab';
import { SiteCabinetsTab } from './Tabs/SiteCabinetsTab';
import '../sites.css';
import { SiteCabinetsConfigsTab } from './Tabs/SiteCabinetsConfigsTab';
import { DataMaskConfig, DataMaskStatus } from 'src/modules/shared/types/dto';
import { SiteCabientsDatamaskTab } from './Tabs/SiteCabinetsDatamaskTab';

class SiteDetails extends DetailPage<Site>{
    detailFormBody: DetailFormBodyComponent = FormBody;
    listPagePath: string = "/cabinet/sitemanagement";

    validateItem(site: Site) {
        return {};
    }

    
    objectToFormValues(site: Site): any {
        if (site.configurations == undefined)
        site.configurations = [];

        return {
            ...site, configurations: JSON.stringify(site.configurations),
            dataMask: site.dataMask && JSON.stringify(site.dataMask),
            automaticUpdatesInterval: site.id ? site.automaticUpdatesInterval : "24:00:00"
        };
    }

    formValuesToObject(values: any): Site {
        return {
            ...values, configurations: JSON.parse(values.configurations),
            dataMask: values.dataMask && JSON.parse(values.dataMask)
        };
    }

    beforeSave(site: Site, isNew: boolean): boolean {
        let error = this.validate(site, isNew);

        if (error) {
            throw new SubmissionError({
                _error: error
            });
        }

        siteService.clearSitesList();
        return true;
    }

    afterDelete() {
        siteService.clearSitesList();
        return true;
    }

    validate(site: Site, isNew: boolean) {
        if (!site.name || !site.remark) {
            return "DETAILS:ERROR_REQUIRED_FIELD";
        }

        if (!isNew) {
            if (site.dataMask) {
                if (this.areRequiredFieldsEmpty(site.dataMask)) {
                    return "DATAMASK:ERROR_DATA_MASK_REQUIRED_FIELDS";
                }
    
                if (this.areRequiredBitsEmpty(site.dataMask)) {
                    return "DATAMASK:ERROR_DATA_MASK_BITS_REQUIRED";
                }
    
                if (this.areBitsOverlapping(site.dataMask)) {
                    return "DATAMASK:ERROR_DATA_MASK_BITS_OVERLAP";
                }
            }
        }
        return null;
    }

    //#region Data Mask Validations
    areRequiredFieldsEmpty(dataMask: DataMaskConfig) {
        if (dataMask.status == DataMaskStatus.Inactive)
            return false;

        return !dataMask.sourceType || !dataMask.name || !dataMask.cardType ||
            !dataMask.totalBits || !dataMask.facilityCode;
    }

    areRequiredBitsEmpty(dataMask: DataMaskConfig) {
        if (dataMask.status == DataMaskStatus.Inactive)
            return false;

        return !dataMask.cardDetailsBitsInfo.startBit || !dataMask.cardDetailsBitsInfo.endBit;
    }

    areBitsOverlapping(dataMask: DataMaskConfig) {
        if (dataMask.status == DataMaskStatus.Inactive ||
            (dataMask.facilityCodeBitsInfo.startBit == 0 && dataMask.facilityCodeBitsInfo.endBit == 0 &&
                dataMask.issueCodeBitsInfo.startBit == 0 && dataMask.issueCodeBitsInfo.endBit == 0))
            return false;

        return (
            (+dataMask.facilityCodeBitsInfo.startBit <= +dataMask.cardDetailsBitsInfo.startBit && +dataMask.facilityCodeBitsInfo.endBit >= +dataMask.cardDetailsBitsInfo.startBit) ||
            (+dataMask.facilityCodeBitsInfo.startBit <= +dataMask.cardDetailsBitsInfo.endBit && +dataMask.facilityCodeBitsInfo.endBit >= +dataMask.cardDetailsBitsInfo.endBit) ||
            (+dataMask.facilityCodeBitsInfo.startBit >= +dataMask.cardDetailsBitsInfo.startBit && +dataMask.facilityCodeBitsInfo.endBit <= +dataMask.cardDetailsBitsInfo.endBit) ||
            (+dataMask.cardDetailsBitsInfo.startBit <= +dataMask.issueCodeBitsInfo.startBit && +dataMask.cardDetailsBitsInfo.endBit >= +dataMask.issueCodeBitsInfo.startBit) ||
            (+dataMask.cardDetailsBitsInfo.startBit <= +dataMask.issueCodeBitsInfo.endBit && +dataMask.cardDetailsBitsInfo.endBit >= +dataMask.issueCodeBitsInfo.endBit) ||
            (+dataMask.cardDetailsBitsInfo.startBit >= +dataMask.issueCodeBitsInfo.startBit && +dataMask.cardDetailsBitsInfo.endBit <= +dataMask.issueCodeBitsInfo.endBit) ||
            (+dataMask.issueCodeBitsInfo.startBit <= +dataMask.facilityCodeBitsInfo.startBit && +dataMask.issueCodeBitsInfo.endBit >= +dataMask.facilityCodeBitsInfo.startBit) ||
            (+dataMask.issueCodeBitsInfo.startBit <= +dataMask.facilityCodeBitsInfo.endBit && +dataMask.issueCodeBitsInfo.endBit >= +dataMask.facilityCodeBitsInfo.endBit) ||
            (+dataMask.issueCodeBitsInfo.startBit >= +dataMask.facilityCodeBitsInfo.startBit && +dataMask.issueCodeBitsInfo.endBit <= +dataMask.facilityCodeBitsInfo.endBit)
        );
    }
    //#endregion

    hideDescriptionHeader() {
        return true;
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
        return (
            <Row className="mt-2 mb-2">
                <Col>
                    <Alert className="mb-0" color="danger">
                        <small className="text-danger">{localise(errorMsg)}</small>
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
            <div className="site-tabs">
                <TabStrip selected={selectedTab} onSelect={this.onSelectTab} keepTabsMounted={true}>
                    <TabStripTab title={this.getTabHeader("TEXT_DETAILS", errorTab == "DETAILS")}
                        contentClassName="site-details-tab">
                        {errorTab == "DETAILS" && this.getErrorAlertRow(errorMsg)}
                        <SiteDetailsTab {...props} />
                    </TabStripTab>
                    <TabStripTab title={this.getTabHeader("TEXT_CONFIGURATIONS", false, props.isNew)}
                        contentClassName="cabinet-group-configs-tab" disabled={props.isNew}>
                        <SiteCabinetsConfigsTab {...props} />
                    </TabStripTab>
                    <TabStripTab title={this.getTabHeader("TEXT_CABINETS_AT_SITE", false, props.isNew)}
                        contentClassName="site-cabinet-list-tab" disabled={props.isNew}>
                        <SiteCabinetsTab {...props} />
                    </TabStripTab>
                    <TabStripTab title={this.getTabHeader("TEXT_DATA_MASK", errorTab == "DATAMASK", props.isNew)}
                        contentClassName="cabinet-group-datamask-tab" disabled={props.isNew}>
                        {errorTab == "DATAMASK" && this.getErrorAlertRow(errorMsg)}
                        <SiteCabientsDatamaskTab {...props}
                            showFieldErrors={errorTab == "DATAMASK" && errorMsg == "ERROR_DATA_MASK_REQUIRED_FIELDS"} />
                    </TabStripTab>
                </TabStrip>
            </div>
        );
    }
}

export default DetailPageContainer(SiteDetails, 'SiteDetails', 'Site', () => {
    //Code to return a new empty object.
    return { id: "", customerId: contextService.getCurrentCustomerId() }
});



// WEBPACK FOOTER //
// ./src/modules/sites/components/SiteDetails/SiteDetails.tsx