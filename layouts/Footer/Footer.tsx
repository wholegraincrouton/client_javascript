import * as React from 'react';
import { Row, Col } from 'reactstrap';
import { configService, localise } from 'src/modules/shared/services';

interface Props {
    default?: boolean,
    fluid?: boolean
}

class Footer extends React.Component<Props> {
    render() {
        return (
            <Row className="footer-row">
                <Col xs={5} sm={7}>
                    <span className="clickable" onClick={() => window.open(configService.getConfigurationValue("URL_COMPANY"), '_blank')}>
                        {configService.getConfigurationValue("COMPANY_NAME")}
                    </span>
                    <span className="clickable d-none d-sm-inline-block"
                        onClick={() => window.location.href = "mailto:" + configService.getConfigurationValue("HELP_CENTRE_CONTACT_US_EMAIL")}>
                        &nbsp;|&nbsp;
                        {configService.getConfigurationValue("HELP_CENTRE_CONTACT_US_EMAIL")}
                    </span>
                </Col>
                <Col xs={7} sm={5} className="text-right">
                    <span className="clickable" onClick={() => window.open(configService.getConfigurationValue("URL_DOC_TERMS_OF_USE"), '_blank')}>
                        {localise("TEXT_TERMS_OF_USE")}
                    </span>
                    <span className="clickable" onClick={() => window.open(configService.getConfigurationValue("URL_DOC_PRIVACY_POLICY"), '_blank')}>
                        &nbsp;|&nbsp;
                        {localise("TEXT_PRIVACY_POLICY")}
                    </span>
                </Col>
            </Row>
        );
    }
}

export default Footer;



// WEBPACK FOOTER //
// ./src/layouts/Footer/Footer.tsx