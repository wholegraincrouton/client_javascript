import * as React from 'react';
import { GridColumnProps } from '@progress/kendo-react-grid';
import { Col, Input, Label, Row } from 'reactstrap';
import { localise } from '../../services';
import { ChildItemGridProps, ChildItemGrid, ItemEditFormProps, ItemEditFormBodyComponent } from '../ChildItemGrid';
import { LookupDropDown } from 'src/modules/shared/components/LookupDropDown/LookupDropDown';
import { BiometricData, CardDataConst } from 'src/modules/users/types/dto'
import "./biometric-grid.css";

export class BiometricDataGrid extends ChildItemGrid<BiometricData> {
    constructor(props: ChildItemGridProps<BiometricData>) {
        super(props);
        this.validateItem = this.validateItem.bind(this);
    }

    editFormBody: ItemEditFormBodyComponent = EditFormBody;

    getItemId(item: BiometricData) {
        return item.id;
    }

    getNewItem(): BiometricData {
        return { id: '' };
    }

    onExpandClick(event: any) {
    }

    onSave(item: BiometricData) {

        const { state } = this;
        var savingItem = state.editingItem;

        //Execute beforeSave and see whether we can go ahead and save data.
        var goAhead = this.beforeSave(savingItem || item, state.isEditingNewItem);

        if (!goAhead) {
            return;
        }

        let { items: items } = this.props;
        items = items || [];
        item = this.onSavingItem(state.isEditingNewItem || false, savingItem || item, items);

        if (state.isEditingNewItem) {
            items.unshift(savingItem || item);
            this.scrollGridIntoView();
        }
        else {
            const itemId = this.getItemId(item);
            let oldItem = items.find(i => this.getItemId(i) == itemId);
            if (oldItem) {
                const index = items.indexOf(oldItem);
                items[index] = item;
            }
        }

        this.exitEditing();
        this.triggerOnChange(items);
    }

    onSavingItem(isNew: boolean, item: BiometricData, items: BiometricData[]) {
        //Since we are using a textbox for sortOrder, we receive a string at runtime.
        //We need to convert it to an integer before saving.
        if (isNew) {
            item.id = items.filter(i => i.extenalSystemCardId == null).length > 0 ? (parseInt(Math.max.apply(Math, items.filter(i => i.extenalSystemCardId == null).map(function (o) { return o.id; }))) + 1).toString() : "1";
        }
        return item;
    }

    validateItem(item: BiometricData, props: ItemEditFormProps): {} {
        const items = this.props.items;

        if (props.isNew && items && item.enrolmentSource && item.identityType && item.binaryData) {
            const duplicate = items.find(i => i.enrolmentSource != undefined && i.enrolmentSource == item.enrolmentSource &&
                i.identityType != undefined && i.identityType == item.identityType && i.binaryData != undefined && i.binaryData == item.binaryData);
            if (duplicate)
                return { value: localise("ERROR_DUPLICATE_CARD_DETAIL") }
        }

        return {};
    }

    getColumns(): GridColumnProps[] {
        return [
            { field: "identityType", title: localise('TEXT_IDENTITY_TYPE') },
            { field: "enrolmentSource", title: localise('TEXT_DATA_SOURCE') },
            { field: "binaryData", title: localise('TEXT_CARD_BINARY_DATA') },
            { field: "hexData", title: localise('TEXT_CARD_HEX_DATA') },
        ]
    }
}

interface State {
    biometricData: BiometricData;
    readonly: boolean;
    facilityCodeInHex?: string;
    facilityCodeInBinary?: string;
    cardIdInHex?: string;
    cardIdInBinary?: string;
    issueCodeInHex?: string;
    issueCodeInBinary?: string;
}

export class EditFormBody extends React.Component<ItemEditFormProps, State> {
    constructor(props: ItemEditFormProps) {
        super(props);
        this.onCardDataChange = this.onCardDataChange.bind(this);
        this.onTextFieldChange = this.onTextFieldChange.bind(this);
        this.onBinaryDataChange = this.onBinaryDataChange.bind(this);
        this.getHexValue = this.getHexValue.bind(this);
        this.getBinaryValue = this.getBinaryValue.bind(this);
        this.isDecimal = this.isDecimal.bind(this);

        this.state = {
            biometricData: this.props.initialValues as BiometricData,
            readonly: this.props != undefined && this.props.initialValues['enrolmentSource'] != undefined &&
                this.props.initialValues['enrolmentSource'] != CardDataConst.WEB_ENROLMENT_SOURCE,

            facilityCodeInBinary: (this.props.initialValues['facilityCode'] != "" && this.props.initialValues['facilityCode'] != undefined) ?
                this.getBinaryValue(this.props.initialValues['facilityCode']) : '',

            facilityCodeInHex: (this.props.initialValues['facilityCode'] != "" && this.props.initialValues['facilityCode'] != undefined) ?
                this.getHexValue(this.props.initialValues['facilityCode']) : '',

            cardIdInBinary: (this.props.initialValues['cardId'] != "" && this.props.initialValues['cardId'] != undefined) ?
                this.getBinaryValue(this.props.initialValues['cardId']) : '',

            cardIdInHex: (this.props.initialValues['cardId'] != "" && this.props.initialValues['cardId'] != undefined) ?
                this.getHexValue(this.props.initialValues['cardId']) : '',

            issueCodeInBinary: (this.props.initialValues['issueCode'] != "" && this.props.initialValues['issueCode'] != undefined) ?
                this.getBinaryValue(this.props.initialValues['issueCode']) : '',

            issueCodeInHex: (this.props.initialValues['issueCode'] != "" && this.props.initialValues['issueCode'] != undefined) ?
                this.getHexValue(this.props.initialValues['issueCode']) : '',
        }
    }

    onCardDataChange(biometricData?: BiometricData) {
        this.setState({
            ...this.state,
            biometricData: biometricData || {
                id: '',
                enrolmentSource: '',
                identityType: '',
                binaryData: '',
                hexData: '',
            },
            readonly: this.state.readonly
        });
        this.props.change('isDirty', true);
    }

    onTextFieldChange(event: any) {
        const { biometricData } = this.state;
        const name = event.target.name;
        const value = event.target.value;

        if (name == 'enrolmentSource') {
            biometricData.enrolmentSource = value;
            biometricData.identityType = '';
            biometricData.binaryData = '';
            biometricData.hexData = '';
            biometricData.maskedBinaryData = '';
            biometricData.facilityCode = '';
            biometricData.cardId = '';
            biometricData.issueCode = '';
        }
        else {
            switch (name) {
                case 'identityType':
                    biometricData.identityType = value
                    break;
                case 'facilityCode':
                    biometricData.facilityCode = value
                    break;
                case 'cardId':
                    biometricData.cardId = value
                    break;
                case 'issueCode':
                    biometricData.issueCode = value
                    break;
            }
        }

        this.onCardDataChange(biometricData);

        name == 'facilityCode' ? this.setState({ ...this.state, facilityCodeInHex: this.getHexValue(value), facilityCodeInBinary: this.getBinaryValue(value) }) : {};
        name == 'cardId' ? this.setState({ ...this.state, cardIdInHex: this.getHexValue(value), cardIdInBinary: this.getBinaryValue(value) }) : {};
        name == 'issueCode' ? this.setState({ ...this.state, issueCodeInHex: this.getHexValue(value), issueCodeInBinary: this.getBinaryValue(value) }) : {};
    }

    onBinaryDataChange(event: any) {
        const { biometricData } = this.state;
        const value = event.target.value;

        let isBinary = /^[01]+$/.test(value);

        if (isBinary || value.length == 0) {
            biometricData.binaryData = value;
            biometricData.hexData = value.length != 0 ? parseInt(value, 2).toString(16).toUpperCase() : '';

            this.onCardDataChange(biometricData);
        }
    }

    getHexValue(value: string) {        
        if(this.isDecimal(value) || value.length == 0){
            return parseInt(value).toString(16)
        }else if (this.isDecimal(value.substring(1))){
            return parseInt(value.substring(1)).toString(16)
        }else{
            return ""
        }
    }

    getBinaryValue(value: string) {
        if(this.isDecimal(value) || value.length == 0){
            return parseInt(value).toString(2)
        }else if (this.isDecimal(value.substring(1))){
            return parseInt(value.substring(1)).toString(2)
        }else{
            return ""
        }        
    }
    
    isDecimal(value: string){
        return /^[0-9\b]+$/.test(value);
    }

    render() {
        const { biometricData, readonly, facilityCodeInBinary, facilityCodeInHex, cardIdInBinary, cardIdInHex, issueCodeInBinary, issueCodeInHex } = this.state;

        return (
            <>
                <Row>
                    <Col md={3}>
                        <Label className="system-label">{localise('TEXT_DATA_SOURCE')}</Label>
                    </Col>
                    <Col md={9}>
                        <LookupDropDown name="enrolmentSource" value={biometricData.enrolmentSource} disabled={readonly}
                            lookupKey="LIST_CARD_ENROLLMENT_SOURCES" onChange={this.onTextFieldChange} />
                        <Col xs="auto">
                            <small className="text-muted">{localise("REMARK_CARD_ENROLLMENT_SOURCE")}</small>
                        </Col>
                    </Col>
                </Row>
                <Row>
                    <Col md={3}>
                        <Label className="system-label">{localise('TEXT_IDENTITY_TYPE')}</Label>
                    </Col>
                    <Col md={9}>
                        <LookupDropDown name="identityType" value={biometricData.identityType} disabled={readonly}
                            lookupKey="LIST_CARD_MAKERS" onChange={this.onTextFieldChange} />
                        <Col xs="auto">
                            <small className="text-muted">{localise("REMARK_CARD_MAKE")}</small>
                        </Col>
                    </Col>
                </Row>
                <Row>
                    <Col md={3}>
                        <Label className="system-label">{localise('TEXT_CARD_BINARY_DATA')}</Label>
                    </Col>
                    <Col md={9}>
                        <Input name="binaryData" value={biometricData.binaryData} onChange={this.onBinaryDataChange} disabled={biometricData.enrolmentSource != CardDataConst.WEB_ENROLMENT_SOURCE} />
                        <Col xs="auto">
                            <small className="text-muted">{localise("REMARK_CARD_BINARY_DATA")}</small>
                        </Col>
                    </Col>
                </Row>
                <Row>
                    <Col md={3}>
                        <Label className="system-label">{localise('TEXT_CARD_HEX_DATA')}</Label>
                    </Col>
                    <Col md={9}>
                        <Input name="hexData" value={biometricData.hexData} disabled={true} />
                        <Col xs="auto">
                            <small className="text-muted">{localise("REMARK_CARD_HEX_DATA")}</small>
                        </Col>
                    </Col>
                </Row>
                {
                    (biometricData.enrolmentSource == CardDataConst.WEB_ENROLMENT_SOURCE || biometricData.enrolmentSource == CardDataConst.EXCHANGE_ENROLMENT_SOURCE) &&
                    <>
                        <Label className="system-label">{localise('TEXT_DATA_FIELDS')}</Label>
                        <Row className="mb-2">
                            <Col xs="auto">
                                <small className="text-muted">{localise("REMARK_DATA_FIELDS")}</small>
                            </Col>
                        </Row>
                        <Row className="mr-2">
                            <Col md={4}>
                                <small className="system-label">{localise('TEXT_FACILITY_CODE')}</small>
                                <Row className="mb-2">
                                    <Col md={6}>
                                        <small className="text-muted">{localise('TEXT_DECIMAL')}</small>
                                    </Col>
                                    <Col md={6} >
                                        <Input name="facilityCode" disabled={biometricData.enrolmentSource != CardDataConst.WEB_ENROLMENT_SOURCE} onChange={this.onTextFieldChange} value={biometricData.facilityCode}
                                            className="data-field" />
                                    </Col>
                                </Row>
                                <Row className="mb-2">
                                    <Col md={6}>
                                        <small className="text-muted">{localise('TEXT_HEXADECIMAL')}</small>
                                    </Col>
                                    <Col md={6} >
                                        <Input className="data-field" disabled={true} value={facilityCodeInHex} />
                                    </Col>
                                </Row>
                                <Row className="mb-2">
                                    <Col md={6}>
                                        <small className="text-muted">{localise('TEXT_BINARY')}</small>
                                    </Col>
                                    <Col md={6}>
                                        <Input className="data-field" disabled={true} value={facilityCodeInBinary} />
                                    </Col>
                                </Row>
                            </Col>
                            <Col md={4}>
                                <small className="system-label">{localise('TEXT_CARD_ID_OR_CODE')}</small>
                                <Row className="mb-2">
                                    <Col md={6}>
                                        <small className="text-muted">{localise('TEXT_DECIMAL')}</small>
                                    </Col>
                                    <Col md={6}>
                                        <Input name="cardId" disabled={biometricData.enrolmentSource != CardDataConst.WEB_ENROLMENT_SOURCE} onChange={this.onTextFieldChange} value={biometricData.cardId} className="data-field" />
                                    </Col>
                                </Row>
                                <Row className="mb-2">
                                    <Col md={6}>
                                        <small className="text-muted">{localise('TEXT_HEXADECIMAL')}</small>
                                    </Col>
                                    <Col md={6}>
                                        <Input className="data-field" disabled={true} value={cardIdInHex} />
                                    </Col>
                                </Row>
                                <Row className="mb-2">
                                    <Col md={6}>
                                        <small className="text-muted">{localise('TEXT_BINARY')}</small>
                                    </Col>
                                    <Col md={6}>
                                        <Input className="data-field" disabled={true} value={cardIdInBinary} />
                                    </Col>
                                </Row>
                            </Col>
                            <Col md={4}>
                                <small className="system-label">{localise('TEXT_CARD_ISSUE_CODE')}</small>
                                <Row className="mb-2">
                                    <Col md={6}>
                                        <small className="text-muted">{localise('TEXT_DECIMAL')}</small>
                                    </Col>
                                    <Col md={6}>
                                        <Input name="issueCode" disabled={biometricData.enrolmentSource != CardDataConst.WEB_ENROLMENT_SOURCE} onChange={this.onTextFieldChange} value={biometricData.issueCode} className="data-field" />
                                    </Col>
                                </Row>
                                <Row className="mb-2">
                                    <Col md={6}>
                                        <small className="text-muted">{localise('TEXT_HEXADECIMAL')}</small>
                                    </Col>
                                    <Col md={6}>
                                        <Input className="data-field" disabled={true} value={issueCodeInHex} />
                                    </Col>
                                </Row>
                                <Row className="mb-2">
                                    <Col md={6}>
                                        <small className="text-muted">{localise('TEXT_BINARY')}</small>
                                    </Col>
                                    <Col md={6}>
                                        <Input className="data-field" disabled={true} value={issueCodeInBinary} />
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row className="mb-2">
                            <Col xs="auto">
                                <small className="text-muted">{localise("REMARK_DATA_FIELD_CONVERSIONS")}</small>
                            </Col>
                        </Row>
                    </>
                }
            </>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/shared/components/UserBiometricDataGrid/BiometricDataGrid.tsx