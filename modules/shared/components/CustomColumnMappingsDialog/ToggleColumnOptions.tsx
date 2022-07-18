import React from "react";
import { Button, Col, Row } from "reactstrap";
import { localise } from "../../services";
interface Props {
    toggleColumnOptions: () => void;
}

export class ColumnOptionsToggle extends React.Component<Props> {
    render() {
        const { toggleColumnOptions } = this.props;

        return (
            <Row className="text-left">
                <Col>
                    <Button className="pt-0 pb-0" color="link" onClick={toggleColumnOptions}>
                        <small>{localise("TEXT_COLUMN_OPTIONS")}</small>
                    </Button>
                </Col>
            </Row>
        );
    }
}


// WEBPACK FOOTER //
// ./src/modules/shared/components/CustomColumnMappingsDialog/ToggleColumnOptions.tsx