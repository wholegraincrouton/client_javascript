import * as React from "react";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { ExternalSystem } from "../../types/dto";
import { Row, Col, Label } from "reactstrap";
import { localise, permissionService } from "src/modules/shared/services";
import { Grid, GridColumn, GridCellProps, GridRowClickEvent } from "@progress/kendo-react-grid";
import { externalSystemsService } from "../../services/externalSystems.service";
import { DataMaskConfig, BitInfo, DataMaskParentTypes } from "src/modules/shared/types/dto";
import { DataMaskConfigPopup } from "src/modules/shared/components/DataMaskConfig/DataMaskConfigPopup";
import { NullableTextCell } from "src/modules/shared/components/DataGrid/Cells/NullableTextCell";

interface State {
    dataMasks: DataMaskConfig[];
    applicableDataMaskId?: string;
    editingDataMask?: DataMaskConfig;
}

export class DataMaskConfiguration extends React.Component<DetailFormProps, State>{
    constructor(props: DetailFormProps) {
        super(props);
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.onDataMaskRowClick = this.onDataMaskRowClick.bind(this);
        this.onDataMaskConfigChange = this.onDataMaskConfigChange.bind(this);
        this.onDataMaskConfigCancel = this.onDataMaskConfigCancel.bind(this);

        let intialExternalSystemDetails = props.initialValues as ExternalSystem;

        this.state = {
            dataMasks: externalSystemsService.getProccessedDataMaskSettings(intialExternalSystemDetails.dataMasks || [],
                intialExternalSystemDetails.applicableDataMaskId),
            applicableDataMaskId: intialExternalSystemDetails.applicableDataMaskId
        };
    }

    onSelectionChange(event: any) {
        let { dataMasks } = this.state;
        var dataItem = event.dataItem as DataMaskConfig;
        let selected = event.syntheticEvent.target.checked;

        dataMasks.forEach(d => d.isSelected = false);

        if (selected) {
            let selectedDataMask = dataMasks.find(m => m.id == dataItem.id);
            if (selectedDataMask) {
                selectedDataMask.isSelected = true;
                this.setState({
                    ...this.state,
                    dataMasks: dataMasks,
                    applicableDataMaskId: dataItem.id
                });
                this.props.change("applicableDataMaskId", dataItem.id);
            }
        }
        else {
            this.setState({
                ...this.state,
                dataMasks: dataMasks,
                applicableDataMaskId: undefined
            });
            this.props.change("applicableDataMaskId", null);
        }
    }

    SelectionHeaderCell() {
        return (<span></span>);
    }

    BitInfoCell() {
        return class extends React.Component<GridCellProps> {
            constructor(props: GridCellProps) {
                super(props);
            }

            render() {
                const { dataItem, field } = this.props;
                const facilityCodeBitsInfo: BitInfo = dataItem["facilityCodeBitsInfo"];
                const cardDetailsBitsInfo: BitInfo = dataItem["cardDetailsBitsInfo"];
                const issueCodeBitsInfo: BitInfo = dataItem["issueCodeBitsInfo"];
                const currentField: BitInfo = dataItem[field || ''];

                let allEmpty = !facilityCodeBitsInfo.startBit && !facilityCodeBitsInfo.endBit &&
                    !cardDetailsBitsInfo.startBit && !cardDetailsBitsInfo.endBit &&
                    !issueCodeBitsInfo.startBit && !issueCodeBitsInfo.endBit;
                let currentFieldEmpty = !currentField.startBit && !currentField.endBit;

                return (
                    <td>
                        {
                            allEmpty ?
                                <Label title={localise("TEXT_NO_START_END_BIT_FOUND")}
                                    className="fas fa-exclamation-circle text-danger" />
                                :
                                currentFieldEmpty ?
                                    <span>{`0 - 0 (${localise("TEXT_NA")})`}</span>
                                    :
                                    <span>{`${currentField.startBit} - ${currentField.endBit}`}</span>
                        }
                    </td>
                );
            }
        }
    }

    onDataMaskRowClick(event: GridRowClickEvent) {
        this.setState({
            ...this.state,
            editingDataMask: event.dataItem as DataMaskConfig
        });
    }

    onDataMaskConfigChange(dataMaskConfig: DataMaskConfig) {
        const { dataMasks } = this.state;

        var newTempArray:DataMaskConfig[] = JSON.parse(JSON.stringify(dataMasks));
        newTempArray.splice(newTempArray.findIndex(d => d.id == dataMaskConfig.id), 1, dataMaskConfig);

        this.setState({
            ...this.state,
            dataMasks: newTempArray,
            editingDataMask: undefined
        });

        this.props.change("tempDataMasks", newTempArray);
    }

    onDataMaskConfigCancel() {
        this.setState({
            ...this.state,
            editingDataMask: undefined
        });
    }

    render() {
        const { item } = this.props;
        const { dataMasks, editingDataMask } = this.state;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');

        return (
            <div className="data-mask-setting-tab">
                <Row className="data-mask-description">
                    <Col>
                        <small className="text-muted">{localise('TEXT_SELECT_DATA_MASK_FOR_IMPORTED_USERS')}</small>
                    </Col>
                </Row>
                <Row>
                    <Col className="data-mask-table">
                        {
                            dataMasks.length > 0 ?
                                <Grid data={dataMasks}
                                    selectedField="isSelected"
                                    onSelectionChange={this.onSelectionChange}
                                    onRowClick={this.onDataMaskRowClick}
                                    className={isPermittedToEdit ? "non-sortable" : "disabled-grid"}>
                                    <GridColumn field="isSelected" headerCell={this.SelectionHeaderCell} />
                                    <GridColumn field="cardType" title={localise('TEXT_CARD_TYPE_NAME')} />
                                    <GridColumn field="name" title={localise('TEXT_DATA_MASK_NAME')} cell={NullableTextCell()} />
                                    <GridColumn field="totalBits" title={localise('TEXT_DATA_MASK_BIT_LENGTH')} />                                    
                                    <GridColumn field="facilityCodeBitsInfo" title={localise('TEXT_FACILITY_CODE_START_END_BITS')} cell={this.BitInfoCell()} />
                                    <GridColumn field="cardDetailsBitsInfo" title={localise('TEXT_CARD_ID_START_END_BITS')} cell={this.BitInfoCell()} />
                                    <GridColumn field="issueCodeBitsInfo" title={localise('TEXT_ISSUE_CODE_START_END_BITS')} cell={this.BitInfoCell()} />
                                </Grid>
                                :
                                <div>
                                    <hr />
                                    <div className="text-muted text-center">{localise("ERROR_SEARCH_RESULT")}</div>
                                </div>
                        }
                    </Col>
                </Row>
                {
                    editingDataMask &&
                    <DataMaskConfigPopup dataMask={editingDataMask} parentType={DataMaskParentTypes.ExternalSystem}
                        integrationSystem={item.integrationSystem} onBack={this.onDataMaskConfigCancel} onSave={this.onDataMaskConfigChange} />
                }
            </div>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/externalSystems/components/ExternalSystemDetails/DataMaskConfiguration.tsx