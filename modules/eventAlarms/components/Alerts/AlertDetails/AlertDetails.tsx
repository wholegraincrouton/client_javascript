import * as React from 'react';
import { DetailPage, DetailPageContainer, DetailFormBodyComponent, DetailFormProps } from 'src/modules/shared/components/DetailPage';
import { Alert, EventSources } from 'src/modules/eventAlarms/types/dto';
import { Row, Col, Card, CardBody, Label } from 'reactstrap';
import { localise, lookupService, accountSessionService, contextService, configService } from 'src/modules/shared/services';
import * as moment from 'moment';
import { TemplateChannels } from 'src/modules/template/types/dto';
import RichTextEditor from 'react-rte';
import "./../alerts.css";

class AlertDetails extends DetailPage<Alert> {
    detailFormBody: DetailFormBodyComponent = FormBody;
    listPagePath: string = "/eventalarm/alertmanagement";

    validateItem() { return {}; }

    isReadOnly() { return true; }
}

class FormBody extends React.Component<DetailFormProps> {
    offsetInMinutes = accountSessionService.getLoggedInUserTimeZoneOffsetInMinutues();

    render() {
        const { item: alert } = this.props;
        let alarmTime = moment.utc(new Date(alert.alertTime)).add(this.offsetInMinutes, 'm');
        let eventTime = moment.utc(new Date(alert.eventTime)).add(this.offsetInMinutes, 'm');

        return (
            <>
                <Row className="alert-detail-row">
                    <Col>                       
                        <Row className="field-row">
                            <Col>
                                <Row><Label className="system-label">{localise("TEXT_USER")}</Label></Row>
                                <Row className="data-row">
                                    <Card className="data-card">
                                        <CardBody className="data-card-body">{alert.userName}</CardBody>
                                    </Card>
                                </Row>
                                <Row className="data-row"><small className="text-muted">{localise("REMARK_USER")}</small></Row>
                            </Col>
                        </Row>
                        <Row className="field-row">
                            <Col>
                                <Row><Label className="system-label">{localise("TEXT_EVENT_SOURCE")}</Label></Row>
                                <Row className="data-row">
                                    <Card className="data-card">
                                        <CardBody className="data-card-body">{lookupService.getText("LIST_EVENT_SOURCES", alert.eventSource)}</CardBody>
                                    </Card>
                                </Row>
                                <Row className="data-row"><small className="text-muted">{localise("REMARK_EVENT_SOURCE")}</small></Row>
                            </Col>
                        </Row>
                        <Row className="field-row">
                            <Col>
                                <Row><Label className="system-label">{localise("TEXT_EVENT")}</Label></Row>
                                <Row className="data-row">
                                    <Card className="data-card">
                                        <CardBody className="data-card-body">{(alert.eventSource == EventSources.Web) ? lookupService.getText("LIST_PORTAL_EVENTS", alert.event) :
                                            lookupService.getTextFromMultipleLookups(["LIST_CABINET_HIGH_PRIORITY_EVENTS",
                                                "LIST_CABINET_LOW_PRIORITY_EVENTS", "LIST_CABINET_ITEM_EVENTS"], alert.event)}</CardBody>
                                    </Card>
                                </Row>
                                <Row className="data-row"><small className="text-muted">{localise("REMARK_EVENT")}</small></Row>
                            </Col>
                        </Row>
                        <Row className="field-row">
                            <Col>
                                <Row><Label className="system-label">{localise("TEXT_EVENT_TIME")}</Label></Row>
                                <Row className="data-row">
                                    <Card className="data-card">
                                        <CardBody className="data-card-body">
                                            {eventTime.format(contextService.getCurrentDateTimeFormat() || configService.getDateTimeFormatConfigurationValue().momentDateTimeWithSecondsFormat)}
                                        </CardBody>
                                    </Card>
                                </Row>
                                <Row className="data-row"><small className="text-muted">{localise("REMARK_EVENT_DATETIME")}</small></Row>
                            </Col>
                        </Row>
                        <Row className="field-row">
                            <Col>
                                <Row><Label className="system-label">{localise("TEXT_ALERT_TIME")}</Label></Row>
                                <Row className="data-row">
                                    <Card className="data-card">
                                        <CardBody className="data-card-body">
                                            {alarmTime.format(contextService.getCurrentDateTimeFormat() || configService.getDateTimeFormatConfigurationValue().momentDateTimeWithSecondsFormat)}
                                        </CardBody>
                                    </Card>
                                </Row>
                                <Row className="data-row"><small className="text-muted">{localise("REMARK_ALERT_DATETIME")}</small></Row>
                            </Col>
                        </Row>
                        <Row className="field-row">
                            <Col>
                                <Row><Label className="system-label">{localise("TEXT_ALERT_CHANNEL")}</Label></Row>
                                <Row className="data-row">
                                    <Card className="data-card">
                                        <CardBody className="data-card-body">{lookupService.getText("LIST_ALERT_CHANNELS", alert.channel)}</CardBody>
                                    </Card>
                                </Row>
                                <Row className="data-row"><small className="text-muted">{localise("REMARK_CHANNEL")}</small></Row>
                            </Col>
                        </Row>
                        <Row className="field-row">
                            <Col>
                                <Row><Label className="system-label">{localise("TEXT_FROM")}</Label></Row>
                                <Row className="data-row">
                                    <Card className="data-card">
                                        <CardBody className="data-card-body">{alert.senderId}</CardBody>
                                    </Card>
                                </Row>
                                <Row className="data-row"><small className="text-muted">{localise("REMARK_SENDER_ID")}</small></Row>
                            </Col>
                        </Row>
                        {
                            alert.channel == TemplateChannels.Email &&
                            <Row className="field-row">
                                <Col>
                                    <Row><Label className="system-label">{localise("TEXT_SUBJECT")}</Label></Row>
                                    <Row className="data-row">
                                        <Card className="data-card">
                                            <CardBody className="data-card-body">{alert.subject}</CardBody>
                                        </Card>
                                    </Row>
                                    <Row className="data-row"><small className="text-muted">{localise("REMARK_SUBJECT")}</small></Row>
                                </Col>
                            </Row>
                        }
                        <Row className="field-row">
                            <Col>
                                <Row><Label className="system-label">{localise("TEXT_CONTENT")}</Label></Row>
                                <Row className="data-row">
                                    <RichTextEditor
                                        value={RichTextEditor.createValueFromString(alert.content, "html")}
                                        readOnly={true} />
                                </Row>
                                <Row className="data-row"><small className="text-muted">{localise("REMARK_CONTENT")}</small></Row>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </>
        );
    }
}

export default DetailPageContainer(AlertDetails, "AlertDetails", "alert", () => {
    //Code to return a new empty object.
    return { id: "", customerId: contextService.getCurrentCustomerId() };
});



// WEBPACK FOOTER //
// ./src/modules/eventAlarms/components/Alerts/AlertDetails/AlertDetails.tsx