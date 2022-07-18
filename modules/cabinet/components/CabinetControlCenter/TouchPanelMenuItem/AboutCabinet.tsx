import * as React from "react";
import { Row, Col } from "reactstrap";
import { localise } from "src/modules/shared/services";
import { store } from "src/redux/store";
import { CabinetSimulationState } from "src/modules/cabinet/types/store";

export default class AboutCabinet extends React.Component<any> {
    render() {
        var storeCabinet: CabinetSimulationState = store.getState().cabinetSimulation;
        
        return(
            <div>
                <Row className="about-cabinet-row">
                    <Col>{localise("TEXT_CABINET")}: {storeCabinet.cabinetName}</Col>
                </Row>
                <Row className="about-cabinet-row">
                    <Col>{localise("TEXT_SITE")}: {storeCabinet.siteName}</Col>
                </Row>
                <Row className="about-cabinet-row">
                    <Col>{localise("TEXT_SERIAL_NUMBER")}:</Col>
                </Row>
                <Row className="about-cabinet-row">
                    <Col>{localise("TEXT_PROVISIONING_KEY")}: {storeCabinet.provisioningKey}</Col>
                </Row>
                <Row className="about-cabinet-row">
                    <Col>{localise("TEXT_FIRMWARE_VERSION")}:</Col>
                </Row>
                <Row className="about-cabinet-row">
                    <Col>{localise("TEXT_NUMBER_OF_ITEMS")}: {storeCabinet.itemCount}</Col>
                </Row>
                <Row className="about-cabinet-row">
                    <Col>{localise("TEXT_NUMBER_OF_USERS")}: {storeCabinet.accessDefinitionSnapshot && storeCabinet.accessDefinitionSnapshot.users.length}</Col>
                </Row>
                <Row className="about-cabinet-row">
                    <Col>{localise("TEXT_LAST_SERVICE_DATE")}:</Col>
                </Row>
                <Row className="about-cabinet-row">
                    <Col>{localise("TEXT_LAST_SUPPORT_TECHNICIAN")}:</Col>
                </Row>
            </div>
        );
    }
}


// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetControlCenter/TouchPanelMenuItem/AboutCabinet.tsx