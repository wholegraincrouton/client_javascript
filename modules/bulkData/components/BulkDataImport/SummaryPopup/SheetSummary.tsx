import * as React from "react";
import { SheetError } from "src/modules/bulkData/types/dto";
import { Row, Col } from "reactstrap";
import { localise } from "src/modules/shared/services";
import { RowSummary } from "./RowSummary";
import "./summary-popup.css";

interface Props {
    sheet: SheetError;
}

export class SheetSummary extends React.Component<Props> {
    render() {
        const { sheet } = this.props;
        return (
            <Row>
                <Col>
                    {
                        sheet.sheetName &&
                        <h4>{localise("TEXT_SHEET_NAME")}: {sheet.sheetName}</h4>
                    }
                    {
                        sheet.errorRows &&
                        <Row>
                            <Col>
                                <span><br />{localise("TEXT_PROCESSED_ROW_COUNT")}: {sheet.totalProcessedRowCount}</span>
                                <span><br />{localise("TEXT_SUCCESSFUL_RECORDS_COUNT")}: {sheet.successObjectsCount}</span>
                            </Col>
                        </Row>
                    }
                    {
                        sheet.errorMessages && sheet.errorMessages.length > 0 &&
                        <Row>
                            <Col>
                                {
                                    sheet.errorMessages.map(error =>
                                        <span><br />{localise("TEXT_ERROR")}: {localise(error)}</span>
                                    )
                                }
                            </Col>
                        </Row>
                    }
                    {
                        sheet.errorRows && sheet.errorRows.length > 0 &&
                        <Row>
                            <Col>
                                {
                                    sheet.errorRows.map((row, key) =>
                                        <RowSummary key={key} row={row} />
                                    )
                                }
                            </Col>
                        </Row>
                    }
                </Col>
            </Row>
        );
    }
}


// WEBPACK FOOTER //
// ./src/modules/bulkData/components/BulkDataImport/SummaryPopup/SheetSummary.tsx