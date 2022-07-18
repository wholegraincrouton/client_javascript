import * as React from "react";
import { DetailPage, DetailFormBodyComponent, DetailFormProps, DetailPageContainer } from "src/modules/shared/components/DetailPage";
import { Alarm, AlarmStatus, AlarmUpdateStatus } from "src/modules/eventAlarms/types/dto";
import {
    contextService, localise, lookupService, accountSessionService, confirmDialogService,
    apiService, permissionService, configService
} from "src/modules/shared/services";
import { Card, CardBody, Row, Col, Input, Label } from "reactstrap";
import * as moment from 'moment';
import { alarmsService } from "src/modules/eventAlarms/services/alarms.service";
import "./../alarms.css";
import { DetailFormHeaderComponent } from "src/modules/shared/components/DetailPage/DetailForm";
import { ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { store } from "src/redux/store";
import { formValueSelector } from "redux-form";
import * as apiConstants from "src/modules/shared/constants/api.constants";

const service = apiConstants.DEVICES;

class AlarmDetails extends DetailPage<Alarm> {
    detailFormBody: DetailFormBodyComponent = FormBody;
    detailFormHeader: DetailFormHeaderComponent = AlarmHeaderButton
    listPagePath: string = "/eventalarm/alarmmanagement";

    validateItem() { return {}; }

    isReadOnly(item: Alarm) {
        return true;
    }

    afterSave() {
        this.props.history.goBack();
    }

    needConfirmationOnSave() {
        return true;
    }

    getConfirmationMessageKey() {
        return "CONFIRMATION_CLOSE";
    }
}

interface State {
    currentStatus: string;
    remarks?: string;
    isDirty: boolean;
    elapsedTime: moment.Moment;
    daysElapsed: number;
}

class FormBody extends React.Component<DetailFormProps, State> {
    offsetInMinutues = accountSessionService.getLoggedInUserTimeZoneOffsetInMinutues();
    timer: any;
    startMoment: moment.Moment;
    endMoment: moment.Moment;

    constructor(props: DetailFormProps) {
        super(props);
        this.onStatusChange = this.onStatusChange.bind(this);
        this.onRemarksChange = this.onRemarksChange.bind(this);
        this.incrementTimer = this.incrementTimer.bind(this);

        this.startMoment = moment.utc(new Date(this.props.item.startTime)).add(this.offsetInMinutues, 'm');
        this.endMoment = this.props.item.endTime ?
            moment.utc(new Date(this.props.item.endTime)).add(this.offsetInMinutues, 'm') :
            moment.utc(new Date()).add(this.offsetInMinutues, 'm');

        this.state = {
            currentStatus: this.props.item.status == AlarmStatus.Active ?
                AlarmUpdateStatus.Active : AlarmUpdateStatus.Closed,
            remarks: this.props.item.remarks,
            isDirty: false,
            elapsedTime: moment.utc(this.endMoment.diff(this.startMoment)),
            daysElapsed: this.endMoment.diff(this.startMoment, 'days')
        }
    }

    componentDidMount() {
        if (this.props.item.status == AlarmStatus.Active)
            this.timer = setInterval(this.incrementTimer, 1000);
    }

    componentWillUnmount() {
        if (this.props.item.status == AlarmStatus.Active)
            clearInterval(this.timer);
    }

    incrementTimer() {
        let newTime = this.state.elapsedTime.add(1, 's');
        let currentTime = moment.utc(new Date()).add(this.offsetInMinutues, 'm');

        this.setState({
            ...this.state,
            elapsedTime: newTime,
            daysElapsed: currentTime.diff(this.startMoment, 'days')
        });
    }

    onStatusChange(event: any) {
        const { props: formProps } = this;

        if (this.props.item.status == AlarmStatus.Active)
            clearInterval(this.timer);

        formProps.change("status", event.target.value);
        formProps.change("remarks", "");

        this.setState({
            ...this.state,
            currentStatus: event.target.value,
            remarks: undefined
        });
    }

    onRemarksChange(event: any) {
        const { props: formProps } = this;

        formProps.change("remarks", event.target.value);

        this.setState({
            ...this.state,
            remarks: event.target.value
        });
    }

    getElapsedTimeText(elapsedTime: moment.Moment, daysElapsed: number) {
        let textParts = elapsedTime.format("HH:mm:ss").split(':');
        return `${parseInt(textParts[0]) + daysElapsed * 24}:${textParts[1]}:${textParts[2]}`;
    }

    render() {
        const { item: alarm } = this.props;
        const { remarks, elapsedTime, daysElapsed } = this.state;
        const initialStatus = alarm.status;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer('UPDATE')

        return (
            <>
                <Row className="alarm-detail-row">
                    <Col>                      
                        <Row className="field-row">
                            <Col>
                                <Row><Label className="system-label">{localise("TEXT_SITE")}</Label></Row>
                                <Row className="data-row">
                                    <Card className="data-card">
                                        <CardBody className="data-card-body">{alarm.siteName}</CardBody>
                                    </Card>
                                </Row>
                                <Row className="data-row"><small className="text-muted">{localise("REMARK_SITE")}</small></Row>
                            </Col>
                        </Row>
                        <Row className="field-row">
                            <Col>
                                <Row><Label className="system-label">{localise("TEXT_CABINET")}</Label></Row>
                                <Row className="data-row">
                                    <Card className="data-card">
                                        <CardBody className="data-card-body">{alarm.cabinetName}</CardBody>
                                    </Card>
                                </Row>
                                <Row className="data-row"><small className="text-muted">{localise("REMARK_CABINET")}</small></Row>
                            </Col>
                        </Row>
                        <Row className="field-row">
                            <Col>
                                <Row><Label className="system-label">{localise("TEXT_EVENT")}</Label></Row>
                                <Row className="data-row">
                                    <Card className="data-card">
                                        <CardBody className="data-card-body">
                                            {lookupService.getTextFromMultipleLookups(["LIST_CABINET_HIGH_PRIORITY_EVENTS",
                                                "LIST_CABINET_LOW_PRIORITY_EVENTS", "LIST_CABINET_ITEM_EVENTS"], alarm.event)}
                                        </CardBody>
                                    </Card>
                                </Row>
                                <Row className="data-row"><small className="text-muted">{localise("REMARK_EVENT")}</small></Row>
                            </Col>
                        </Row>
                        <Row className="field-row">
                            <Col>
                                <Row><Label className="system-label">{localise("TEXT_ALARM")}</Label></Row>
                                <Row className="data-row">
                                    <Card className="data-card">
                                        <CardBody className="data-card-body">{lookupService.getText("LIST_ALARMS", alarm.alarmCode)}</CardBody>
                                    </Card>
                                </Row>
                                <Row className="data-row"><small className="text-muted">{localise("REMARK_ALARM")}</small></Row>
                            </Col>
                        </Row>
                        <Row className="field-row">
                            <Col>
                                <Row><Label className="system-label">{localise("TEXT_USER")}</Label></Row>
                                <Row className="data-row">
                                    <Card className="data-card">
                                        <CardBody className="data-card-body">
                                            {!alarm.startedUserName ? localise("TEXT_NA") : alarm.startedUserName}
                                        </CardBody>
                                    </Card>
                                </Row>
                                <Row className="data-row"><small className="text-muted">{localise("REMARK_ALARM_USER")}</small></Row>
                            </Col>
                        </Row>
                        <Row className="field-row">
                            <Col>
                                <Row><Label className="system-label">{localise("TEXT_STATUS")}</Label></Row>
                                <Row className="data-row">
                                    <Card className="data-card">
                                        <CardBody className="data-card-body">{lookupService.getText("LIST_ALARM_STATUS", initialStatus)}</CardBody>
                                    </Card>
                                </Row>
                                <Row className="data-row"><small className="text-muted">{localise("REMARK_STATUS")}</small></Row>
                            </Col>
                        </Row>
                        <Row className="field-row">
                            <Col>
                                <Row><Label className="system-label">{localise("TEXT_START_DATETIME")}</Label></Row>
                                <Row className="data-row">
                                    <Card className="data-card">
                                        <CardBody className="data-card-body">
                                            {this.startMoment.format(contextService.getCurrentDateTimeFormat() || configService.getDateTimeFormatConfigurationValue().momentDateTimeWithSecondsFormat)}
                                        </CardBody>
                                    </Card>
                                </Row>
                                <Row className="data-row"><small className="text-muted">{localise("REMARK_START_TIME")}</small></Row>
                            </Col>
                        </Row>
                        <Row className="field-row">
                            <Col>
                                <Row><Label className="system-label">{localise("TEXT_ELAPSED_TIME")}</Label></Row>
                                <Row className="data-row">
                                    <Card className="data-card">
                                        <CardBody className="data-card-body">{daysElapsed > 0 ?
                                            this.getElapsedTimeText(elapsedTime, daysElapsed) : elapsedTime.format("HH:mm:ss")}</CardBody>
                                    </Card>
                                </Row>
                                <Row className="data-row"><small className="text-muted">{localise("REMARK_ELAPSED_TIME")}</small></Row>
                            </Col>
                        </Row>
                        <Row className="field-row">
                            <Col>
                                <Row><Label className="system-label">{localise("TEXT_END_DATETIME")}</Label></Row>
                                <Row className="data-row">
                                    <Card className="data-card">
                                        <CardBody className="data-card-body">
                                            {alarm.endTime ? this.endMoment.
                                                format(contextService.getCurrentDateTimeFormat() || configService.getDateTimeFormatConfigurationValue().momentDateTimeWithSecondsFormat) : localise("TEXT_NA")}
                                        </CardBody>
                                    </Card>
                                </Row>
                                <Row className="data-row"><small className="text-muted">{localise("REMARK_END_TIME")}</small></Row>
                            </Col>
                        </Row>
                        <Row className="field-row">
                            <Col>
                                <Row><Label className="system-label">{localise("TEXT_SMS_ALERT_AUDIENCE")}</Label></Row>
                                <Row className="data-row">
                                    <Card className="data-card">
                                        <CardBody className="data-card-body">
                                            {
                                                alarm.smsUsers && alarm.smsUsers.length > 0 ?
                                                    alarm.smsUsers.join(", ") : localise("TEXT_NO_USERS_CONFIGURED")
                                            }
                                        </CardBody>
                                    </Card>
                                </Row>
                                <Row className="data-row"><small className="text-muted">{localise("REMARK_SMS_ALERT_AUDIENCE")}</small></Row>
                            </Col>
                        </Row>
                        <Row className="field-row">
                            <Col>
                                <Row><Label className="system-label">{localise("TEXT_EMAIL_ALERT_AUDIENCE")}</Label></Row>
                                <Row className="data-row">
                                    <Card className="data-card">
                                        <CardBody className="data-card-body">
                                            {
                                                alarm.emailUsers && alarm.emailUsers.length > 0 ?
                                                    alarm.emailUsers.join(", ") : localise("TEXT_NO_USERS_CONFIGURED")
                                            }
                                        </CardBody>
                                    </Card>
                                </Row>
                                <Row className="data-row"><small className="text-muted">{localise("REMARK_EMAIL_ALERT_AUDIENCE")}</small></Row>
                            </Col>
                        </Row>
                        <Row className="field-row">
                            <Col>
                                <Row><Label className="system-label">{localise("TEXT_LAST_UPDATE")}</Label></Row>
                                <Row className="data-row">
                                    <Card className="data-card">
                                        <CardBody className="data-card-body">
                                            {moment.utc(new Date(alarm.updatedOnUtc)).add(this.offsetInMinutues, 'm')
                                                .format(contextService.getCurrentDateTimeFormat() || configService.getDateTimeFormatConfigurationValue().momentDateTimeWithSecondsFormat)}
                                        </CardBody>
                                    </Card>
                                </Row>
                                <Row className="data-row"><small className="text-muted">{localise("REMARK_LAST_UPDATE")}</small></Row>
                            </Col>
                        </Row>
                        <Row className="field-row">
                            <Col>
                                <Row><Label className="system-label">{localise("TEXT_CLOSED_BY")}</Label></Row>
                                <Row className="data-row">
                                    <Card className="data-card">
                                        <CardBody className="data-card-body">
                                            {!initialStatus || !alarm.closedByName || initialStatus == AlarmStatus.Active ?
                                                localise("TEXT_NA") : initialStatus == AlarmStatus.ClosedByCabinetEvent ?
                                                    alarmsService.getClosedByEventText(alarm.closedByName) : alarm.closedByName}
                                        </CardBody>
                                    </Card>
                                </Row>
                                <Row className="data-row"><small className="text-muted">{localise("REMARK_CLOSED_BY")}</small></Row>
                            </Col>
                        </Row>
                        <Row className="field-row">
                            <Col>
                                <Row><Label className="system-label">{localise("TEXT_REMARKS")}</Label></Row>
                                <Row className="data-row">
                                    <Input className="input-textbox" readOnly={initialStatus != AlarmUpdateStatus.Active || !isPermittedToEdit} type="textarea"
                                        value={initialStatus == AlarmUpdateStatus.Active ? remarks : alarm.remarks} onChange={this.onRemarksChange} />
                                </Row>
                                <Row className="data-row"><small className="text-muted">{localise("REMARK_REMARKS")}</small></Row>
                            </Col>
                        </Row>

                    </Col>
                </Row>
            </>
        );
    }
}

const AlarmHeaderButton = (formProps: DetailFormProps) => {

    function closeAlarm() {
        confirmDialogService.showDialog('CONFIRMATION_CLOSE',
            () => {
                const selector = formValueSelector(formProps.form);
                const formState = store.getState();
                let remarks = selector(formState, 'remarks');
                apiService.put('alarms', undefined, { id: formProps.item.id, remarks: remarks }, service).then(() => {
                    formProps.reset();
                    formProps.history.goBack();
                });
            });
    }

    return <>
        <ActionButton isPermissionAllowed={formProps.item.status == AlarmStatus.Active && permissionService.canPermissionGrant('UPDATE')}
            textKey="BUTTON_CANCEL_ALARM" onClick={closeAlarm} color="primary" icon="fa-times" />
    </>
}


export default DetailPageContainer(AlarmDetails, "AlarmDetails", "alarms", () => {
    //Code to return a new empty object.
    return { id: "", customerId: contextService.getCurrentCustomerId() };
}, apiConstants.DEVICES);


// WEBPACK FOOTER //
// ./src/modules/eventAlarms/components/Alarms/AlarmDetails/AlarmDetails.tsx