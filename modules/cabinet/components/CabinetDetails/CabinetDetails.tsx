import * as React from 'react';
import { SubmissionError } from 'redux-form';
import { Label, Row, Col, Alert } from 'reactstrap';
import { TabStrip, TabStripTab } from '@progress/kendo-react-layout';
import { localise, contextService, utilityService } from '../../../shared/services';
import { DetailPage, DetailFormBodyComponent, DetailPageContainer } from '../../../shared/components/DetailPage';
import { DetailFormHeaderComponent, DetailFormProps } from '../../../shared/components/DetailPage/DetailForm';
import { DataMaskConfig, DataMaskStatus } from 'src/modules/shared/types/dto';
import { cabinetService } from '../../services/cabinet.service';
import { Cabinet, CabinetProvisioningStatus } from '../../types/dto';
import { CabinetDetailsTab } from './Tabs/CabinetDetailsTab';
import { CabinetConfigsTab } from './Tabs/CabinetConfigsTab';
import { CabinetItemsTab } from './Tabs/CabinetItemsTab';
import { CabinetDatamaskTab } from './Tabs/CabinetDatamaskTab';
import CabinetHeaderButtons from './CabinetHeaderButtons';
import "../cabinets.css";

class CabinetDetails extends DetailPage<Cabinet> {
    detailFormBody: DetailFormBodyComponent = FormBody;
    detailFormHeader: DetailFormHeaderComponent = CabinetHeaderButtons;
    listPagePath: string = "/cabinet/cabinetmanagement";

    validateItem(item: Cabinet) {
        return {};
    }

    objectToFormValues(cabinet: Cabinet): any {
        return {
            ...cabinet,
            timeZone: cabinet.timeZone || 'AUS Eastern Standard Time',
            automaticUpdatesInterval: cabinet.id ? cabinet.automaticUpdatesInterval : "24:00:00",
            configurations: JSON.stringify(cabinet.configurations || []),
            items: JSON.stringify(cabinet.items || []),
            dataMask: cabinet.dataMask && JSON.stringify(cabinet.dataMask),
        };
    }

    formValuesToObject(values: any): Cabinet {
        return {
            ...values,
            configurations: JSON.parse(values.configurations),
            items: JSON.parse(values.items),
            dataMask: values.dataMask && JSON.parse(values.dataMask)
        };
    }

    beforeSave(cabinet: Cabinet, isNew: boolean): boolean {
        let error = this.validate(cabinet, isNew);

        if (error) {
            throw new SubmissionError({
                _error: error
            });
        }

        if (isNew) {
            cabinet.items = [];
            let itemCount = parseInt(cabinet.itemCount);

            for (let i = 1; i <= itemCount; i++) {
                cabinet.items.push({ number: i, name: "", type: "", hardwareId: "" });
            }
        }
        cabinetService.clearCabinetList();
        return true;
    }

    afterDelete() {
        cabinetService.clearCabinetList();
        return true;
    }

    validate(item: Cabinet, isNew: boolean) {
        if (!item.name || !item.remark) {
            return "DETAILS:ERROR_REQUIRED_FIELD";
        }

        if (!isNew) {
            if (item.items) {
                for (let cabItem of item.items) {
                    const nameEmpty = utilityService.isStringEmpty(cabItem.name);
                    const duplicateExists = item.items.find(i => i.number != cabItem.number &&
                        !utilityService.isStringEmpty(i.name) && i.name == cabItem.name);

                    if (nameEmpty)
                        return "ITEMS:ERROR_ITEMS_REQUIRED_FIELDS";
                    else if (duplicateExists)
                        return "ITEMS:ERROR_DUPLICATE_ITEMS";
                }
            }

            if (item.dataMask) {
                if (this.areRequiredFieldsEmpty(item.dataMask)) {
                    return "DATAMASK:ERROR_DATA_MASK_REQUIRED_FIELDS";
                }

                if (this.areRequiredBitsEmpty(item.dataMask)) {
                    return "DATAMASK:ERROR_DATA_MASK_BITS_REQUIRED";
                }

                if (this.areBitsOverlapping(item.dataMask)) {
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

    hideDeleteButton(item: Cabinet) {
        return !(item.provisioningStatus == CabinetProvisioningStatus.Deprovisioned);
    }

    hideDescriptionHeader() {
        return true;
    }
}

interface LocalState {
    selectedTab: number;
}

class FormBody extends React.Component<DetailFormProps, LocalState> {
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
            <TabStrip className="cabinet-tabs" selected={selectedTab} onSelect={this.onSelectTab} keepTabsMounted={false}>
                <TabStripTab title={this.getTabHeader("TEXT_DETAILS", errorTab == "DETAILS")}
                    contentClassName="cabinet-details-tab">
                    {errorTab == "DETAILS" && this.getErrorAlertRow(errorMsg)}
                    <CabinetDetailsTab {...props} />
                </TabStripTab>
                <TabStripTab title={this.getTabHeader("TEXT_CONFIGURATIONS", false, props.isNew)}
                    contentClassName="cabinet-configs-tab" disabled={props.isNew}>
                    <CabinetConfigsTab {...props} />
                </TabStripTab>
                <TabStripTab title={this.getTabHeader("TEXT_ITEMS", errorTab == "ITEMS", props.isNew)}
                    contentClassName="cabinet-items-tab" disabled={props.isNew}>
                    {errorTab == "ITEMS" && this.getErrorAlertRow(errorMsg)}
                    <CabinetItemsTab {...props} error={errorTab == "ITEMS" ? errorMsg : ''} />
                </TabStripTab>
                <TabStripTab title={this.getTabHeader("TEXT_DATA_MASK", errorTab == "DATAMASK", props.isNew)}
                    contentClassName="cabinet-datamask-tab" disabled={props.isNew}>
                    {errorTab == "DATAMASK" && this.getErrorAlertRow(errorMsg)}
                    <CabinetDatamaskTab {...props}
                        showFieldErrors={errorTab == "DATAMASK" && errorMsg == "ERROR_DATA_MASK_REQUIRED_FIELDS"} />
                </TabStripTab>
            </TabStrip>
        );
    }
}

export default DetailPageContainer(CabinetDetails, 'CabinetDetails', 'cabinet', () => {
    //Code to return a new empty object.
    return { id: "", customerId: contextService.getCurrentCustomerId() }
});



// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetDetails/CabinetDetails.tsx