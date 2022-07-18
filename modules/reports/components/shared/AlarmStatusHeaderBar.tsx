import * as React from "react";
import { Row, Col } from "reactstrap";
import { localise } from "src/modules/shared/services";
import 'src/modules/reports/components/reports.css';

export class AlarmStatusHeaderBar extends React.Component {
    render() {
        return (
            <Row>
                <Col>
                    <span className="badge badge-pill badge-light">
                        <i className="fas fa-square-full fa-lg color-sev1-alarm" />
                        &nbsp;&nbsp;{localise("TEXT_SEV1_ALARM")}
                    </span>
                </Col>
                <Col>
                    <span className="badge badge-pill badge-light">
                        <i className="fas fa-square-full fa-lg color-sev1-esc" />
                        &nbsp;&nbsp;{localise("TEXT_SEV1_ESCALATION")}
                    </span>
                </Col>
                <Col>
                    <span className="badge badge-pill badge-light">
                        <i className="fas fa-square-full fa-lg color-sev2-alarm" />
                        &nbsp;&nbsp;{localise("TEXT_SEV2_ALARM")}
                    </span>
                </Col>
                <Col>
                    <span className="badge badge-pill badge-light">
                        <i className="fas fa-square-full fa-lg color-sev2-esc" />
                        &nbsp;&nbsp;{localise("TEXT_SEV2_ESCALATION")}
                    </span>
                </Col>
            </Row>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/reports/components/shared/AlarmStatusHeaderBar.tsx