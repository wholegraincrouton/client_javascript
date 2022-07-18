import * as React from "react";
import { CellError } from "src/modules/bulkData/types/dto";
import { Row, Col } from "reactstrap";
import { localise } from "src/modules/shared/services";
import "./summary-popup.css";

interface Props {
    cell: CellError;
}

export class CellSummary extends React.Component<Props> {
    render() {
        const { cell } = this.props;
        return (
            <Row className="summary-cell">
                <Col>
                    <Row>
                        <span>{localise("TEXT_COLUMN_INDEX")}: {cell.colIndex + 1}</span>
                    </Row>
                    {
                        cell.columnName &&
                        <Row>
                            <span>{localise("TEXT_COLUMN_NAME")}: {cell.columnName}</span>
                        </Row>
                    }
                    {
                        cell.value &&
                        <Row>
                            <span>{localise("TEXT_CELL_VALUE")}: {cell.value}</span>
                        </Row>
                    }
                    <Row>
                        <span>{localise("TEXT_ERROR_TYPE")}: {cell.hasRequiredError ?
                            localise("TEXT_REQUIRED_FIELD_ERROR") : localise("TEXT_DATA_FORMAT_ERROR")}</span>
                    </Row>
                </Col>
            </Row>

        );
    }
}


// WEBPACK FOOTER //
// ./src/modules/bulkData/components/BulkDataImport/SummaryPopup/CellSummary.tsx