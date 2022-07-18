import * as React from 'react';
import CardBody from 'reactstrap/lib/CardBody';
import Card from 'reactstrap/lib/Card';
import Col from 'reactstrap/lib/Col';
import Row from 'reactstrap/lib/Row';
import { contextService, localise, permissionService } from 'src/modules/shared/services';
import { DateTimeDetailedInfo, CabinetAlarmSummary } from 'src/modules/dashboard/types/dto';
import Label from 'reactstrap/lib/Label';
import Button from 'reactstrap/lib/Button';
import { History } from 'history';
import CardHeader from 'reactstrap/lib/CardHeader';
import { TimeDurationPicker } from 'src/modules/shared/components/TimeDurationPicker/TimeDurationPicker';
import { dashboardService } from 'src/modules/dashboard/services/dashboard.service';
import { PopOver } from 'src/modules/shared/components/PopOver/PopOver';
import * as qs from "query-string";

interface Props {
    data: CabinetAlarmSummary;
    history: History;
    customerId?: string;
    onTimeDurationChange: (timeDuration: string) => void;
}

export default class AlarmsWidget extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
        this.navigateToCurrentActiveAlarms = this.navigateToCurrentActiveAlarms.bind(this);
    }

    navigateToCurrentActiveAlarms() {
        this.props.history.push({
            pathname: "/reports/overview/active_alarms_report",
            search: qs.stringify({
                ['contextCustomerId']: contextService.getCurrentCustomerId()
            })
        });
    }

    render() {
        const { data: displayData, onTimeDurationChange } = this.props;

        let data = displayData || {
            cabinetCount: 0,
            currentTotalVolume: 0,
            previousTotalVolume: 0,
            unAvailableItemCount: 0,
            currentTotalAlarmTime: {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0
            },
            previousTotalAlarmTime: {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0
            }
        };

        const canViewAlarms =
            permissionService.checkIfPermissionExistsForCustomer('NAV_ALARMS') &&
            permissionService.checkIfPermissionExistsForCustomer('ALARMS_SEARCH');

        //#region Calculations

        const currentEscalationPercentage = data.currentTotalEscalationsPercentage;
        const previousEscalationPercentage = data.previousTotalEscalationsPercentage;

        const currentAverageAlarmTimeInSeconds = data.currentTotalVolume == 0 ? 0 : (data.currentTotalAlarmTime.days * 86400 +
            data.currentTotalAlarmTime.hours * 3600 + data.currentTotalAlarmTime.minutes * 60 +
            data.currentTotalAlarmTime.seconds) / data.currentTotalVolume;
        const previousAverageAlarmTimeInSeconds = data.previousTotalVolume == 0 ? 0 : (data.previousTotalAlarmTime.days * 86400 +
            data.previousTotalAlarmTime.hours * 3600 + data.previousTotalAlarmTime.minutes * 60 +
            data.previousTotalAlarmTime.seconds) / data.previousTotalVolume;
        const averageAlarmTimeChangeInSeconds = Math.abs(previousAverageAlarmTimeInSeconds - currentAverageAlarmTimeInSeconds);

        const currentAverageAlarmTime: DateTimeDetailedInfo = {
            days: 0,
            hours: Math.floor(currentAverageAlarmTimeInSeconds / 3600),
            minutes: Math.floor((currentAverageAlarmTimeInSeconds % 3600) / 60),
            seconds: currentAverageAlarmTimeInSeconds % 60
        };
        const previousAverageAlarmTime: DateTimeDetailedInfo = {
            days: 0,
            hours: Math.floor(previousAverageAlarmTimeInSeconds / 3600),
            minutes: Math.floor((previousAverageAlarmTimeInSeconds % 3600) / 60),
            seconds: previousAverageAlarmTimeInSeconds % 60
        };
        const averageAlarmTimeChange = {
            days: 0,
            hours: Math.floor(averageAlarmTimeChangeInSeconds / 3600),
            minutes: Math.floor((averageAlarmTimeChangeInSeconds % 3600) / 60),
            seconds: averageAlarmTimeChangeInSeconds % 60
        };

        //#endregion

        return (
            <Card className={`data-grid-container compact${data.sev1AlarmCount > 0 ? " has-sev-1" : ""} mb-2`}>
                <CardHeader>
                    <Row>
                        <Col>
                            <Label id="lblTotal"><b>{localise('TEXT_ALARMS')}</b></Label>
                        </Col>
                    </Row>
                </CardHeader>
                <CardBody>
                    <Row>
                        <Col sm={6} lg={12} xl={6} className="status-column">
                            <Row className="subtitle-row">
                                <Col xs={10} className="subtitle-column">
                                    <Label className="sub-title">{localise("TEXT_CURRENT_ALARM_STATUS")}</Label>
                                </Col>
                                {
                                    canViewAlarms &&
                                    <Col xs={2} className="text-right menu">
                                        <Button id="alarmleftPopover"><i className="fa fa-ellipsis-h" /></Button>
                                        <PopOver placement="bottom-end" target="alarmleftPopover" container="alarmleftPopover" trigger="focus"
                                            header={localise("TEXT_CURRENT_ALARM_STATUS")}
                                            body={
                                                <Row>
                                                    <Col>
                                                        <ul className="pl-4 mb-1">
                                                            <li className="hover-blue clickable mb-1" onClick={this.navigateToCurrentActiveAlarms}>
                                                                {localise("TEXT_CURRENT_ACTIVE_ALARMS")}
                                                            </li>
                                                        </ul>
                                                    </Col>
                                                </Row>
                                            } />
                                    </Col>
                                }
                            </Row>
                            <Row className="content-row pr-2">
                                <Col>
                                    <Row onClick={canViewAlarms ? this.navigateToCurrentActiveAlarms : undefined}
                                        className={`status-tile ml-1 mt-1 ${data.sev1AlarmCount > 0 ? "has-sev-1" : ""} ${canViewAlarms ? "clickable" : ""}`}>
                                        <Col className="h-100">
                                            <Row className="h-50">
                                                <Col className="pr-0">
                                                    <Label className="status-text mt-2">{localise("TEXT_SEVERITY1").toUpperCase()}</Label>
                                                </Col>
                                                <Col className="text-right pl-0">
                                                    <Label className="status-count">{data.sev1AlarmCount}</Label>
                                                </Col>
                                            </Row>
                                            {
                                                data.sev1AlarmEscalationCount > 0 &&
                                                <Row className="status-remark">
                                                    <Col>
                                                        <i className="fa fa-exclamation-circle" />
                                                        <Label className="ml-2 mb-0">
                                                            {data.sev1AlarmEscalationCount + " " + localise("TEXT_ESCALATED")}
                                                        </Label>
                                                    </Col>
                                                </Row>
                                            }
                                        </Col>
                                    </Row>
                                    <Row onClick={canViewAlarms ? this.navigateToCurrentActiveAlarms : undefined}
                                        className={`status-tile ml-1 mt-2 ${data.sev2AlarmCount > 0 ? "has-sev-2" : ""} ${canViewAlarms ? "clickable" : ""}`}>
                                        <Col className="h-100">
                                            <Row className="h-50">
                                                <Col className="pr-0">
                                                    <Label className="status-text mt-2">{localise("TEXT_SEVERITY2").toUpperCase()}</Label>
                                                </Col>
                                                <Col className="text-right pl-0">
                                                    <Label className="status-count">{data.sev2AlarmCount}</Label>
                                                </Col>
                                            </Row>
                                            {
                                                data.sev2AlarmEscalationCount > 0 &&
                                                <Row className="status-remark">
                                                    <Col>
                                                        <i className="fa fa-exclamation-circle" />
                                                        <Label className="ml-2 mb-0">
                                                            {data.sev2AlarmEscalationCount + " " + localise("TEXT_ESCALATED")}
                                                        </Label>
                                                    </Col>
                                                </Row>
                                            }
                                        </Col>
                                    </Row>
                                    <Row className={`status-tile ml-1 mt-2 ${data.cabinetCount > 0 ? "has-cabinets-impact " : ""}`}>
                                        <Col xs={5} sm={6} lg={7} xl={5}>
                                            <Label className="status-text mt-2">{localise("TEXT_CABINETS_IMPACTED").toUpperCase()}</Label>
                                        </Col>
                                        <Col xs={7} sm={6} lg={5} xl={7} className="text-right">
                                            <Label className="status-count">{data.cabinetCount}</Label>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Col>
                        <Col sm={6} lg={12} xl={6} className="stats-column mt-2 mt-sm-0 mt-lg-2 mt-xl-0">
                            <Row className="subtitle-row">
                                <Col xs={10} className="subtitle-column">
                                    <Row>
                                        <Col lg={7}>
                                            <Label className="sub-title">{localise("TEXT_ALARM_EVENTS")}</Label>
                                        </Col>
                                        <Col lg={5} className="time-picker-column pt-lg-1 pt-xl-0">
                                            <TimeDurationPicker onChange={onTimeDurationChange}
                                                value={dashboardService.getAlarmsSelectedTimeDuration()} />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row className="content-row pl-lg-2 pl-xl-0">
                                <Col>
                                    <Row className="stat-row">
                                        <Col>
                                            <Row>
                                                <Col className="pr-0">
                                                    <Label className="stat-title mb-0">{localise("TEXT_TOTAL_VOLUME")}</Label>
                                                </Col>
                                                <Col className="text-right">
                                                    <Label className="stat-previous-title mb-0">{localise("TEXT_PREVIOUS")} + {localise("TEXT_CHANGE")}</Label>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col xs={5}>
                                                    <Label className="stat-count">{data.currentTotalVolume}</Label>
                                                </Col>
                                                <Col xs={3} className="text-right pl-0 pr-0">
                                                    <Label className="stat-previous">{data.previousTotalVolume}</Label>
                                                </Col>
                                                <Col xs={4} className="text-right pl-0">
                                                    <Label className="stat-change">
                                                        {Math.abs(data.previousTotalVolume - data.currentTotalVolume)}
                                                        <i className={`ml-2 fa fa-${data.previousTotalVolume > data.currentTotalVolume ? "caret-down" :
                                                                data.previousTotalVolume < data.currentTotalVolume ? "caret-up" :
                                                                    "minus"}`} />
                                                    </Label>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                    <hr />
                                    <Row className="stat-row">
                                        <Col>
                                            <Row>
                                                <Col className="pr-0">
                                                    <Label className="stat-title mb-0">{localise("TEXT_ESCALATIONS")}</Label>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col xs={5}>
                                                    <Label className="stat-count">{currentEscalationPercentage}%</Label>
                                                </Col>
                                                <Col xs={3} className="text-right pl-0 pr-0">
                                                    <Label className="stat-previous">{previousEscalationPercentage}%</Label>
                                                </Col>
                                                <Col xs={4} className="text-right pl-0">
                                                    <Label className="stat-change">
                                                        {Math.abs(previousEscalationPercentage - currentEscalationPercentage).toFixed(2)}%
                                                        <i className={`ml-2 fa fa-${previousEscalationPercentage > currentEscalationPercentage ? "caret-down" :
                                                                previousEscalationPercentage < currentEscalationPercentage ? "caret-up" :
                                                                    "minus"}`} />
                                                    </Label>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                    <hr />
                                    <Row className="stat-row">
                                        <Col>
                                            <Row>
                                                <Col className="pr-0">
                                                    <Label className="stat-title mb-0">{localise("TEXT_AVERAGE_ALARM_TIME")}</Label>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col xs={5}>
                                                    <Label className="stat-count">
                                                        {currentAverageAlarmTime.hours > 0 ? `${currentAverageAlarmTime.hours}h ` : ""}
                                                        {currentAverageAlarmTime.minutes}m
                                                    </Label>
                                                </Col>
                                                <Col xs={3} className="text-right pl-0 pr-0">
                                                    <Label className="stat-previous">
                                                        {previousAverageAlarmTime.hours > 0 ? `${previousAverageAlarmTime.hours}h ` : ""}
                                                        {previousAverageAlarmTime.minutes}m
                                                    </Label>
                                                </Col>
                                                <Col xs={4} className="text-right pl-0">
                                                    <Label className="stat-change">
                                                        {averageAlarmTimeChange.hours > 0 ? `${averageAlarmTimeChange.hours}h ` : ""}
                                                        {averageAlarmTimeChange.minutes}m
                                                        <i className={`ml-2 fa fa-${previousAverageAlarmTimeInSeconds > currentAverageAlarmTimeInSeconds ? "caret-down" :
                                                                previousAverageAlarmTimeInSeconds < currentAverageAlarmTimeInSeconds ? "caret-up" :
                                                                    "minus"}`} />
                                                    </Label>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/dashboard/widgets/AlarmsWidget.tsx