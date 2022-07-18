import * as React from "react";
import { RowError } from "src/modules/bulkData/types/dto";
import { Row, Col } from "reactstrap";
import { localise } from "src/modules/shared/services";
import { CellSummary } from "./CellSummary";
import "./summary-popup.css";

interface Props {
    row: RowError;
}

export class RowSummary extends React.Component<Props> {
    render() {
        const { row } = this.props;
        return (
            <Row className="summary-row">
                <Col>
                    <Row>
                        <span>{localise("TEXT_ROW_INDEX")}: {row.rowIndex + 1}</span>
                    </Row>
                    {
                        row.errorCells.length > 0 &&
                        <Row>
                            <Col>
                                {
                                    row.errorCells.map((cell, key) =>
                                        <CellSummary key={key} cell={cell} />
                                    )
                                }
                            </Col>
                        </Row>
                    }
                    {
                        row.errorMessage &&
                        <Row>
                            <span>{localise("TEXT_ERROR")}: {localise(row.errorMessage)}</span>
                        </Row>
                    }
                </Col>
            </Row>
        );
    }
}


// WEBPACK FOOTER //
// ./src/modules/bulkData/components/BulkDataImport/SummaryPopup/RowSummary.tsx