import * as React from "react";
import { Row, Col } from "reactstrap";
import { localise } from "../../services";

interface Props {
    showRequiredLabel: boolean;
}

class FormDescriptionHeader extends React.Component<Props>  {
    render() {
        return (
            <Row className="mb-4">
                <Col>
                    <small className="text-muted"> {localise("TEXT_PAGE_DESCRIPTION")} </small>
                </Col>
                {
                    this.props.showRequiredLabel &&
                    <Col md="auto">
                        <small className="text-muted"> {localise('TEXT_REQUIRED_FIELD')} </small>
                    </Col>
                }
            </Row>
        );
    }
}

export default FormDescriptionHeader


// WEBPACK FOOTER //
// ./src/modules/shared/components/Form/FormDescriptionHeader.tsx