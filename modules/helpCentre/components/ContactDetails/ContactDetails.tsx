import * as React from "react";
import { Row, Col } from "reactstrap";
import { localise, configService } from "src/modules/shared/services";
import "./contactDetails.css";

export class ContactDetails extends React.Component {
    render() {
        return (
            <div className="contact-details">
                <Row className="pl-4 pt-4">
                    <Col >
                        <h5 className="color-blue"><b>{localise("TEXT_CONTACT_US")}</b></h5>
                        <p>{localise("TEXT_CONTACT_US_REMARK")}</p>
                    </Col>
                </Row>
                <Row className="pl-4 pt-4">
                    <Col xs="5" sm="4" md="3" lg="3">
                        <h5 className="color-blue"><b>{localise("TEXT_CONTACT_US_SUPPORT_TICKET")}</b></h5>
                    </Col>
                    <Col xs="10" sm="7" md="7" lg="8">
                        <p className="clickable-link color-blue align-text" onClick={() => window.open(configService.getConfigurationValue("HELP_CENTRE_SUPPORT_TICKET_URL", "*", "*"), "_blank")}>{localise("TEXT_CONTACT_US_SUPPORT_TICKET_REMARK")}</p>
                    </Col>
                </Row>
                <Row className="pl-4 pt-4">
                    <Col xs="12" sm="12" md="12">
                        <p><b>{localise("TEXT_CONTACT_METHOD_DESCRIPTION")}</b></p>
                    </Col>
                    <Col xs="4" sm="4" md="3" lg="3">
                        <h5 className="color-blue"><b>{localise("TEXT_EMAIL")}</b></h5>
                    </Col>
                    <Col xs="12" sm="8" md="8" lg="9">
                        <p className="clickable-link color-blue align-text"
                            onClick={() => window.location.href = "mailto:" + configService.getConfigurationValue("HELP_CENTRE_CONTACT_US_EMAIL", "*", "*")}>
                            {configService.getConfigurationValue("HELP_CENTRE_CONTACT_US_EMAIL")}
                        </p>
                    </Col>
                </Row>
                <Row className="pl-4 pt-4">
                    <Col xs="4" sm="4" md="3" lg="3">
                        <h5 className="color-blue"><b>{localise("TEXT_PHONE")}</b></h5>
                    </Col>
                    <Col xs="12" sm="8" md="8" lg="3">
                        <p className="align-text">{configService.getConfigurationValue("HELP_CENTRE_CONTACT_US_PHONE", "*", "*")}</p>
                    </Col>
                </Row>
            </div>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/helpCentre/components/ContactDetails/ContactDetails.tsx