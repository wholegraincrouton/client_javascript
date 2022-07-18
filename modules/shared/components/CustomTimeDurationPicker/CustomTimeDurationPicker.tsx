import * as React from "react";
import { TimeDurations } from "../../types/dto";
import { Row, Col, Label, Button } from "reactstrap";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { localise, configService } from "../../services";
import * as moment from 'moment';
import { dateTimeUtilService } from "../../services/datetime-util.service";
import "./custom-time-duration-picker.css";

interface Props {
    periodDurationValue?: string;
    customStartDate?: Date;
    customEndDate?: Date;
    onChange: (startDate: Date, endDate: Date, duration: string) => void;
    displayLabel: boolean;
    callPath?: string;
}

interface State {
    startDate?: Date;
    endDate?: Date;
    showCustomPeriod: boolean;
    periodSelection?: string;
}

export class CustomTimeDurationPicker extends React.Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.onDurationChange = this.onDurationChange.bind(this);
        this.onStartDateChange = this.onStartDateChange.bind(this);
        this.onEndDateChange = this.onEndDateChange.bind(this);           

        this.state = {
            periodSelection: props.periodDurationValue,
            showCustomPeriod: props.periodDurationValue == TimeDurations.Custom,
            startDate: props.customStartDate,
            endDate: props.customEndDate,
        }
    }

    onDurationChange(duration: any) {
        let startDay = dateTimeUtilService.getStartTimeForFilters(duration);

        let showCustomPeriod = duration == TimeDurations.Custom;

        let endDay = new Date();

        this.props.onChange(startDay, endDay, duration);

        this.setState({
            ...this.state,
            showCustomPeriod: showCustomPeriod,
            periodSelection: duration,
            startDate: startDay,
            endDate: endDay
        });
    }

    onStartDateChange(e: any) {
        let startDay = e.target.value;
        let endDay = this.state.endDate || new Date();

        this.props.onChange(startDay, endDay, this.state.periodSelection == undefined ? TimeDurations.Weekly : this.state.periodSelection);
        this.setState({
            ...this.state,
            startDate: e.target.value
        });
    }

    onEndDateChange(e: any) {
        let startDay = this.state.startDate || new Date();
        let endDay = e.target.value;

        this.props.onChange(startDay, endDay, this.state.periodSelection == undefined ? TimeDurations.Weekly : this.state.periodSelection);
        this.setState({
            ...this.state,
            endDate: endDay
        });
    }

    render() {
        const { periodSelection, startDate, endDate, showCustomPeriod } = this.state;

        let isReportRoute = this.props.callPath && this.props.callPath == '/reports/overview';

        let maxEndDate = moment(new Date()).add(1, 'days').toDate();
        let minEndDate = moment(new Date()).subtract(isReportRoute ? 363 : 118, 'days').toDate();
        let maxStartDate = moment(new Date()).subtract(1, 'days').toDate();
        let minStartDate = moment(new Date()).subtract(isReportRoute ? 363 : 118, 'days').toDate();

        return (
            <Row className="custom-time-duration-picker">
                {
                    this.props.displayLabel &&
                    <Col sm={4} md={2} xl={1} className="pt-1">
                        <Label>{localise('TEXT_PERIOD')}:</Label>
                    </Col>
                }
                <Col sm={8} md={5} lg={3} className="pt-1">
                    <Button className={`mr-2${periodSelection == TimeDurations.Weekly ? " selected" : ""}`}
                        onClick={() => this.onDurationChange(TimeDurations.Weekly)} title={localise("TEXT_WEEKLY")}>
                        {localise("TEXT_W")}
                    </Button>
                    <Button className={`mr-2${periodSelection == TimeDurations.Fortnightly ? " selected" : ""}`}
                        onClick={() => this.onDurationChange(TimeDurations.Fortnightly)} title={localise("TEXT_FORTNIGHTLY")}>
                        {localise("TEXT_F")}
                    </Button>
                    <Button className={`mr-2${periodSelection == TimeDurations.Monthly ? " selected" : ""}`}
                        onClick={() => this.onDurationChange(TimeDurations.Monthly)} title={localise("TEXT_MONTHLY")}>
                        {localise("TEXT_M")}
                    </Button>
                    <Button className={`mr-2${periodSelection == TimeDurations.Quarterly ? " selected" : ""}`}
                        onClick={() => this.onDurationChange(TimeDurations.Quarterly)} title={localise("TEXT_QUARTERLY")}>
                        {localise("TEXT_Q")}
                    </Button>
                    <Button className={periodSelection == TimeDurations.Custom ? "selected" : ""}
                        onClick={() => this.onDurationChange(TimeDurations.Custom)}>{localise('TEXT_CUSTOM')}</Button>
                </Col>
                {
                    showCustomPeriod &&
                    <Col lg={7} xl={8}>
                        <Row>
                            <Col md={6} className="mb-2 mb-md-0">
                                <Label className="mb-0 mr-2" size="sm">{localise('TEXT_START_DATE')}:</Label>
                                <DatePicker
                                    width={130}
                                    max={maxStartDate}
                                    min={minStartDate}
                                    format={configService.getKendoDateFormatByCurrentFormat() || configService.getDateTimeFormatConfigurationValue().kendoDateFormat}
                                    value={startDate}
                                    onChange={this.onStartDateChange} />
                            </Col>
                            <Col md={6}>
                                <Label className="mb-0 mr-2" size="sm">{localise('TEXT_END_DATE')}:</Label>
                                <DatePicker
                                    width={130}
                                    max={maxEndDate}
                                    min={minEndDate}
                                    format={configService.getKendoDateFormatByCurrentFormat() || configService.getDateTimeFormatConfigurationValue().kendoDateFormat}
                                    value={endDate}
                                    onChange={this.onEndDateChange} />
                            </Col>
                        </Row>
                    </Col>
                }
            </Row>
        );
    }
}


// WEBPACK FOOTER //
// ./src/modules/shared/components/CustomTimeDurationPicker/CustomTimeDurationPicker.tsx