import { Dialog } from "@progress/kendo-react-dialogs";
import React from "react";
import { Col, Input, Label, Row } from "reactstrap";
import { confirmDialogService, localise } from "../../services";
import { columnConfigurationService } from "../../services/column-configuration.service";
import { ActionButton, SaveButton } from "../ActionButtons/ActionButtons";
import "./custom-column-mappings-dialog.css";

interface Props {
    titleKey: string;
    columns: string[];
    selectedColumns: string[];
    mandatoryColumns?: string[];
    onColumnChanges: (selectedColumns: string[]) => void;
    closeDialog: () => void;
}

interface State {
    selectedColumns: string[];
}
export class CustomColumnMappingsDialog extends React.Component<Props, State>{
    isDirty: boolean;
    showErrors: boolean;

    constructor(props: Props) {
        super(props);

        const { selectedColumns } = this.props;
        this.state = {
            selectedColumns: selectedColumns
        };

        this.isChecked = this.isChecked.bind(this);
        this.isMandatoryColumn = this.isMandatoryColumn.bind(this);
        this.onCheckboxCheck = this.onCheckboxCheck.bind(this);
        this.onSaveClick = this.onSaveClick.bind(this);
        this.onCancelClick = this.onCancelClick.bind(this);
        this.getColumnsSettings = this.getColumnsSettings.bind(this);
    }

    isChecked(columnName: string) {
        const { selectedColumns } = this.state;
        return selectedColumns.some(c => c == columnName);
    }

    isMandatoryColumn(columnName: string) {
        const { mandatoryColumns } = this.props;
        if (mandatoryColumns)
            return mandatoryColumns.some(c => c == columnName);
        return false;
    }

    onCheckboxCheck(e: any) {
        this.showErrors = false;
        let columns: string[] = [];
        const { selectedColumns } = this.state;
        columns = selectedColumns || [];

        if (selectedColumns && selectedColumns.some(s => s == e.target.value)) {
            if (selectedColumns.length > 1)
                columns = selectedColumns.filter(s => s != e.target.value);
            else
                this.showErrors = true;
        } else {
            columns.push(e.target.value);
        }
        this.setState({ ...this.state, selectedColumns: columns });
        this.isDirty = true;
    }

    onSaveClick() {
        const { onColumnChanges, titleKey } = this.props;
        const { selectedColumns } = this.state;
        onColumnChanges(selectedColumns);
        this.isDirty = false;

        columnConfigurationService.setColumnConfigurationsForReport(selectedColumns, titleKey);
    }

    onCancelClick() {
        const { closeDialog } = this.props;

        if (this.isDirty) {
            confirmDialogService.showDialog("CONFIRMATION_WIZARD_UNSAVED_CHANGES", closeDialog);
        }
        else {
            closeDialog();
        }
    }

    render() {
        const { columns } = this.props;

        return (
            <Dialog className="custom-column-mappings-dialog">

                <Row>
                    <Col xl={6} lg={4} md={6} className="title-column"><h3>{localise("TEXT_COLUMN_FILTER")}</h3></Col>
                    <Col xl={6} lg={8} md={6} className="button-column text-lg-right text-right">
                        <ActionButton className="btn-cancel" textKey="BUTTON_CANCEL" color="danger"
                            onClick={this.onCancelClick} />
                        <SaveButton className="btn-save" onClick={this.onSaveClick} />
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col><small className="text-muted">{localise("REMARK_COLUMNS_FILTER")}</small></Col>
                </Row>
                <Row>
                    <Col>
                        {
                            this.showErrors &&
                            <small className="text-danger">{localise("ERROR_UNSELECT_ALL_COLUMNS")}</small>
                        }
                    </Col>
                </Row>
                <br />
                <Row>
                    {
                        columns && columns.length > 0 &&
                        <Col>{this.getColumnsSettings()}</Col>

                    }
                    {
                        !columns &&
                        <Col><p>Nothing to show</p></Col>
                    }
                </Row>
            </Dialog>
        )
    }

    getColumnsSettings() {
        let renderedItems: JSX.Element[] = [];
        const { columns } = this.props;

        columns.forEach(column => {
            renderedItems.push(
                <Row className="ml-4 mb-2">
                    <Col>
                        <Label className="mb-0">
                            <Input type="checkbox" name="isAutoSyncEnabled" checked={this.isChecked(column)} value={column}
                                onChange={this.onCheckboxCheck} disabled={this.isMandatoryColumn(column)} />
                            {localise(column)}
                        </Label>
                    </Col>
                </Row>
            );
        });

        return (
            <Row>
                <Col>
                    {renderedItems}
                </Col>
            </Row>
        );
    }
}


// WEBPACK FOOTER //
// ./src/modules/shared/components/CustomColumnMappingsDialog/CustomColumnMappingsDialog.tsx