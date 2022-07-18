import * as React from "react";
import { Row, Col } from "reactstrap";
import { localise } from "src/modules/shared/services";

export class EventStatusHeaderBar extends React.Component {
    render() {
        return (
            <Row>
                <Col md={6} lg={3}>
                    <span className="badge badge-pill badge-light">
                        <i className="fas fa-square-full fa-lg color-grey" />
                        &nbsp;&nbsp;{localise("TEXT_ITEM_RETRIEVED")}
                    </span>
                </Col>
                <Col md={6} lg={3}>
                    <span className="badge badge-pill badge-light">
                        <i className="fas fa-square-full fa-lg color-green" />
                        &nbsp;&nbsp;{localise("TEXT_ITEM_RETURNED")}
                    </span>
                </Col>
                <Col md={6} lg={3}>
                    <span className="badge badge-pill badge-light">
                        <i className="fas fa-square-full fa-lg color-red" />
                        &nbsp;&nbsp;{localise("TEXT_ITEM_OVERDUE")}
                    </span>
                </Col>
                <Col md={6} lg={3}>
                    <span className="badge badge-pill badge-light">
                        <i className="fas fa-square-full fa-lg color-orange" />
                        &nbsp;&nbsp;{localise("TEXT_OTHER_EVENTS")}
                    </span>
                </Col>
            </Row>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/reports/components/shared/EventStatusHeaderBar.tsx