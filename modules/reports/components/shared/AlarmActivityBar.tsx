import * as React from "react";
import { Row, Col } from "reactstrap";
import { dateTimeUtilService } from "src/modules/shared/services/datetime-util.service";
import 'src/modules/reports/components/reports.css';

interface Props {
    severityLevel: number;
    startTime: Date;
    escalationTimes?: Date[];
}

export class AlarmActivityBar extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
        this.getDurationString = this.getDurationString.bind(this);
    }

    getDurationString() {
        const { startTime, escalationTimes } = this.props;
        
        let end = (escalationTimes && escalationTimes.length > 0) ?
            new Date(escalationTimes[0]) : new Date();
        let start = (new Date(startTime));

        start.setSeconds(0, 0);
        end.setSeconds(0, 0);

        const durationMilliseconds = end.getTime() - start.getTime();
        const durationHours = Math.floor(durationMilliseconds / (1000 * 60 * 60));
        const durationMinutes = Math.floor((durationMilliseconds % (1000 * 60 * 60)) / (1000 * 60));

        return `${durationHours > 0 ? (durationHours + "h ") : ""}${durationMinutes}m`;
    }

    render() {
        const { severityLevel, startTime, escalationTimes } = this.props;

        const timeFormat = dateTimeUtilService.getTimeFormatWithoutSeconds();

        return (
            <Row className="alarm-activity-bar mt-2 ml-1 mr-1">
                <Col xs={5}>
                    <Row className={`text-white ${severityLevel == 2 ? "bg-color-sev2-alarm" : "bg-color-sev1-alarm"}`}>
                        <Col><span>{this.getDurationString()}</span></Col>
                    </Row>
                    <Row>
                        <Col className="p-0">
                            <span>{dateTimeUtilService.getDateDisplayTextByUserTimeZone(startTime, timeFormat)}</span>
                        </Col>
                    </Row>
                </Col>
                {
                    escalationTimes && escalationTimes.length > 0 &&
                    <Col xs={2}>
                        <Row className={`${severityLevel == 2 ? "bg-color-sev2-esc" : "bg-color-sev1-esc"}`}>
                            <Col><span>1</span></Col>
                        </Row>
                        <Row>
                            <Col className="p-0">
                                <span>{dateTimeUtilService.getDateDisplayTextByUserTimeZone(escalationTimes[0], timeFormat)}</span>
                            </Col>
                        </Row>
                    </Col>
                }
                {
                    escalationTimes && escalationTimes.length > 1 &&
                    <Col xs={2}>
                        <Row className={`${severityLevel == 2 ? "bg-color-sev2-esc" : "bg-color-sev1-esc"}`}>
                            <Col><span>2</span></Col>
                        </Row>
                        <Row>
                            <Col className="p-0">
                                <span>{dateTimeUtilService.getDateDisplayTextByUserTimeZone(escalationTimes[1], timeFormat)}</span>
                            </Col>
                        </Row>
                    </Col>
                }
                {
                    escalationTimes && escalationTimes.length > 2 &&
                    <Col xs={2}>
                        <Row className={`${severityLevel == 2 ? "bg-color-sev2-esc" : "bg-color-sev1-esc"}`}>
                            <Col><span>3</span></Col>
                        </Row>
                        <Row>
                            <Col className="p-0">
                                <span>{dateTimeUtilService.getDateDisplayTextByUserTimeZone(escalationTimes[2], timeFormat)}</span>
                            </Col>
                        </Row>
                    </Col>
                }
            </Row>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/reports/components/shared/AlarmActivityBar.tsx