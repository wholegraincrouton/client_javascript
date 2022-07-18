import { DatePicker, TimePicker } from "@progress/kendo-react-dateinputs";
import moment from "moment";
import React from "react";
import { Col, Input, Label, Row } from "reactstrap";
import FormFieldContent from "src/modules/shared/components/Form/FormFieldContent";
import LookupCheckList from "src/modules/shared/components/LookupCheckList/LookupCheckList";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import { DefaultDateTimeFormats } from "src/modules/shared/constants/datetime.constants";
import { localise } from "src/modules/shared/services";
import { dateTimeUtilService } from "src/modules/shared/services/datetime-util.service";
import { AccessSchedule } from "../../types/dto";
import "./access-group-wizard.css"

interface Props {
    onChanges: (accessSchedule: AccessSchedule) => void;
}

interface State {
    accessSchedule: AccessSchedule,
    isFromTime?: boolean;
    isDirty?: boolean;
    indefiniteAccess: string;
}

export class AccessScheduleWizard extends React.Component<Props, State> {
    fromTime?: Date | null;
    toTime?: Date | null;
    minTime?: Date | null;

    constructor(props: Props) {
        super(props);

        this.state = {
            accessSchedule: {
                accessValidFrom: undefined,
                accessValidTo: undefined,
                scheduleEndsAt: '',
                accessDurationSelection: 'unlimitedAccess',
                accessDaysSelection: 'allDays',
                scheduleList: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
                accessTimeSelection: 'allHours'
            },
            indefiniteAccess: 'YES',
            isFromTime: false
        };

        this.onRadioOptionSelectionChange = this.onRadioOptionSelectionChange.bind(this);
        this.onScheduleListChange = this.onScheduleListChange.bind(this);
        this.onFromTimeChange = this.onFromTimeChange.bind(this);
        this.onToTimeChange = this.onToTimeChange.bind(this);
        this.onAccessFromDateChange = this.onAccessFromDateChange.bind(this);
        this.onAccessToDateChange = this.onAccessToDateChange.bind(this);
        this.onChanges = this.onChanges.bind(this);
        this.onChangeIndefiniteAccess = this.onChangeIndefiniteAccess.bind(this);
    }

    onRadioOptionSelectionChange(event: any) {
        let updatedSchedule: AccessSchedule = { ...this.state.accessSchedule };
        switch (event.target.value) {
            case 'unlimitedAccess':
                updatedSchedule = {
                    ...this.state.accessSchedule,
                    accessValidFrom: undefined,
                    accessValidTo: undefined,
                    accessDurationSelection: 'unlimitedAccess'
                };
                break;
            case 'limitedAccess':
                updatedSchedule = {
                    ...this.state.accessSchedule,
                    accessDurationSelection: 'limitedAccess'
                };
                break;
            case 'allDays':
                updatedSchedule = {
                    ...this.state.accessSchedule,
                    scheduleList: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
                    accessDaysSelection: 'allDays'
                };
                break;
            case 'limitedDays':
                updatedSchedule = {
                    ...this.state.accessSchedule,
                    scheduleList: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
                    accessDaysSelection: 'limitedDays'
                };
                break;
            case 'allHours':
                updatedSchedule = {
                    ...this.state.accessSchedule,
                    scheduleStartsAt: '',
                    scheduleEndsAt: '',
                    accessTimeSelection: 'allHours'
                };
                this.toTime = undefined;
                this.fromTime = undefined;

                break;
            case 'limitedHours':
                updatedSchedule = {
                    ...this.state.accessSchedule,
                    accessTimeSelection: 'limitedHours'
                };
                break;
        }

        this.setState({
            ...this.state,
            accessSchedule: {
                ...updatedSchedule
            },
            isDirty: true
        });
        this.onChanges(updatedSchedule);
    }

    onScheduleListChange(selectedDays: any) {
        let updatedSchedule: AccessSchedule = { ...this.state.accessSchedule };
        if (selectedDays.length == 7) {
            updatedSchedule = { ...this.state.accessSchedule, accessDaysSelection: 'allDays' };
        }
        else {
            updatedSchedule = { ...this.state.accessSchedule, accessDaysSelection: 'limitedDays', scheduleList: selectedDays };
        }

        this.setState({ ...this.state, accessSchedule: { ...this.state.accessSchedule, ...updatedSchedule } });
        this.onChanges(updatedSchedule);
    }

    onFromTimeChange(event: any) {
        const { accessSchedule } = this.state;
        let updatedSchedule: AccessSchedule = { ...this.state.accessSchedule };
        let selectedTime = event.target.value as Date;
        let minutes: string = selectedTime.getMinutes().toLocaleString();;

        if (minutes.toLocaleString().length < 2) {
            minutes = `0${minutes}`;
        }

        let selectedTimeValue = `${selectedTime.getHours()}:${minutes}`;
        var today = new Date();
        this.fromTime = selectedTime;
        this.minTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), selectedTime.getHours(), (selectedTime.getMinutes() + 1), selectedTime.getUTCSeconds());

        this.setState({
            isFromTime: true
        });

        if (this.toTime && this.toTime < this.fromTime || !this.toTime) {
            if(selectedTimeValue == '0:00' && accessSchedule.scheduleEndsAt == '23:59' ) {                
                updatedSchedule = { ...this.state.accessSchedule, accessTimeSelection: 'allHours', scheduleStartsAt: '', scheduleEndsAt: '' }
                this.setState({ ...this.state, accessSchedule: { ...this.state.accessSchedule, accessTimeSelection: 'allHours', scheduleStartsAt: '', scheduleEndsAt: '' } });
            } else {
                updatedSchedule = { ...this.state.accessSchedule, scheduleStartsAt: selectedTimeValue, scheduleEndsAt: '' }
                this.setState({ ...this.state, accessSchedule: { ...this.state.accessSchedule, scheduleStartsAt: selectedTimeValue, scheduleEndsAt: '' } });
            }
        }

        this.onChanges(updatedSchedule);
    }

    onToTimeChange(event: any) {
        const { accessSchedule } = this.state;
        let updatedSchedule: AccessSchedule = { ...this.state.accessSchedule };
        let selectedTime = event.target.value;

        let minutes: string = selectedTime.getMinutes().toLocaleString();;

        if (minutes.toLocaleString().length < 2) {
            minutes = `0${minutes}`;
        }

        let selectedTimeValue = `${selectedTime.getHours()}:${minutes}`;
        this.toTime = selectedTime;
        
        if (selectedTime) {
            if(accessSchedule.scheduleStartsAt == '0:00' && selectedTimeValue == '23:59' ) {
                updatedSchedule = { ...this.state.accessSchedule, accessTimeSelection: 'allHours', scheduleStartsAt: '', scheduleEndsAt: '' }
                this.setState({ ...this.state, accessSchedule: { ...this.state.accessSchedule, accessTimeSelection: 'allHours', scheduleStartsAt: '', scheduleEndsAt: '' } });
            } else {
                updatedSchedule = { ...this.state.accessSchedule, scheduleEndsAt: selectedTimeValue }
                this.setState({ ...this.state, accessSchedule: { ...this.state.accessSchedule, scheduleEndsAt: selectedTimeValue } });
            }
        }

        this.onChanges(updatedSchedule);
    }

    onAccessFromDateChange(event: any) {
        let updatedSchedule: AccessSchedule = { ...this.state.accessSchedule };
        let date = event.target.value;
        var dateTime = moment(moment(date).format("YYYY-MM-DD") + ' 00:00:00').format(DefaultDateTimeFormats.DateTimeFormat);

        this.setState({
            ...this.state,
            accessSchedule: {
                ...this.state.accessSchedule,
                accessValidFrom: moment(dateTime).format(DefaultDateTimeFormats.DateTimeFormat)
            }
        });

        updatedSchedule = { ...this.state.accessSchedule, accessValidFrom: moment(dateTime).format(DefaultDateTimeFormats.DateTimeFormat) }
        this.onChanges(updatedSchedule);
    }

    onAccessToDateChange(event: any) {
        let updatedSchedule: AccessSchedule = { ...this.state.accessSchedule };
        var dateTime = moment(moment(event.target.value).format("YYYY-MM-DD") + ' 23:59:59').format(DefaultDateTimeFormats.DateTimeFormat);
        this.setState({
            ...this.state,
            accessSchedule: {
                ...this.state.accessSchedule,
                accessValidTo: moment(dateTime).format(DefaultDateTimeFormats.DateTimeFormat)
            }
        });
        updatedSchedule = { ...this.state.accessSchedule, accessValidTo: moment(dateTime).format(DefaultDateTimeFormats.DateTimeFormat) }
        this.onChanges(updatedSchedule);
    }

    onChanges(schedule: AccessSchedule) {
        const { onChanges } = this.props;
        onChanges(schedule);
    }


    onChangeIndefiniteAccess(event: any) {
        let updatedSchedule: AccessSchedule = { ...this.state.accessSchedule };
        if (event.target.value == 'YES') {
            this.setState({
                ...this.state,
                accessSchedule: {
                    ...this.state.accessSchedule,
                    accessValidFrom: undefined,
                    accessValidTo: undefined,
                    accessDurationSelection: 'unlimitedAccess',
                    scheduleList: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
                    accessDaysSelection: 'allDays',
                    scheduleStartsAt: '',
                    scheduleEndsAt: '',
                    accessTimeSelection: 'allHours'
                },
                indefiniteAccess: 'YES'
            });
            updatedSchedule = {
                ...this.state.accessSchedule,
                accessValidFrom: undefined,
                accessValidTo: undefined,
                accessDurationSelection: 'unlimitedAccess',
                scheduleList: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
                accessDaysSelection: 'allDays',
                scheduleStartsAt: '',
                scheduleEndsAt: '',
                accessTimeSelection: 'allHours'
            }
            this.toTime = undefined;
            this.fromTime = undefined;
        } else {
            this.setState({
                ...this.state,
                accessSchedule: {
                    ...this.state.accessSchedule,
                    accessDurationSelection: 'limitedAccess',
                    scheduleList: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
                    accessDaysSelection: 'limitedDays',
                    accessTimeSelection: 'limitedHours'
                },
                indefiniteAccess: 'NO'
            });
            updatedSchedule = {
                ...this.state.accessSchedule,
                accessDurationSelection: 'limitedAccess',
                scheduleList: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
                accessDaysSelection: 'limitedDays',
                accessTimeSelection: 'limitedHours'
            }
        }
        this.onChanges(updatedSchedule);

    }

    render() {

        const { accessSchedule, indefiniteAccess } = this.state;
        const dateFormat = dateTimeUtilService.getKendoDateFormat();
        const timeFormat = dateTimeUtilService.getKendoTimeFormat();

        let isIndeFiniteAccess = indefiniteAccess == 'YES';

        return (
            <>
                <br />
                <Row className="mb-3">
                    <Col>
                        <small className="text-muted">{localise("REMARK_ACCESS_SCHEDULE")}</small>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Label className="system-label">{localise('TEXT_INDEFINITE_ACCESS')}
                            <LookupDropDown
                                lookupKey="LIST_BOOLEAN_FLAGS"
                                value={indefiniteAccess}
                                onChange={this.onChangeIndefiniteAccess}
                            />
                        </Label>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Label className="system-label">{localise('TEXT_ACCESS_DURATION')}</Label>
                    </Col>
                </Row>
                <Row className="access-schedule-values-row access-schedule-wizard">
                    <Col xl={2} xs={6}>
                        <FormFieldContent
                            inputComponent={() =>
                                <Label>
                                    <Input type="radio"
                                        value="unlimitedAccess"
                                        onChange={this.onRadioOptionSelectionChange}
                                        checked={accessSchedule.accessDurationSelection === "unlimitedAccess"}
                                        key={accessSchedule.accessDurationSelection + accessSchedule.accessValidFrom}
                                        disabled={isIndeFiniteAccess}
                                    />
                                    {localise('TEXT_UNLIMITED_ACCESS')}
                                </Label>
                            }
                        />
                    </Col>
                    <Col xl={2} xs={6}>
                        <FormFieldContent
                            inputComponent={() =>
                                <Label>
                                    <Input
                                        type="radio"
                                        value="limitedAccess"
                                        checked={accessSchedule.accessDurationSelection === "limitedAccess"}
                                        onChange={this.onRadioOptionSelectionChange}
                                        key={accessSchedule.accessDurationSelection + accessSchedule.accessValidFrom}
                                        disabled={isIndeFiniteAccess}
                                    />
                                    {localise('TEXT_LIMITED_ACCESS')}</Label>
                            }
                        />
                    </Col>
                    <Col xl={4} xs={6} className="mt-3 mt-xl-0 date-picker">
                        <span className="timerange-label">{localise('TEXT_FROM')}</span>
                        <br />
                        <div className="date-picker">
                            <DatePicker
                                disabled={accessSchedule.accessDurationSelection != 'limitedAccess'}
                                format={dateFormat} formatPlaceholder={{ year: 'YYYY', month: 'MM', day: 'DD' }}
                                defaultValue={undefined}
                                onChange={this.onAccessFromDateChange}
                                key={accessSchedule.accessDurationSelection + accessSchedule.accessValidFrom}
                                value={accessSchedule.accessValidFrom ? new Date(accessSchedule.accessValidFrom) : undefined}
                            />
                        </div>

                    </Col>
                    <Col xl={4} xs={6} className="mt-3 mt-xl-0 date-picker">
                        <span className="timerange-label">{localise('TEXT_TO')}</span>
                        <br />
                        <div className="date-picker">
                            <DatePicker
                                disabled={accessSchedule.accessDurationSelection != 'limitedAccess'}
                                format={dateFormat} formatPlaceholder={{ year: 'YYYY', month: 'MM', day: 'DD' }}
                                defaultValue={undefined}
                                onChange={this.onAccessToDateChange}
                                key={accessSchedule.accessDurationSelection + accessSchedule.accessValidTo}
                                value={accessSchedule.accessValidTo ? new Date(accessSchedule.accessValidTo) : undefined}
                            />
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <small className="text-muted">
                            {localise('REMARK_ACCESS_DURATION')}
                        </small>
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col>
                        <Label className="system-label">{localise('TEXT_ACCESS_DAYS')}</Label>
                    </Col>
                </Row>
                <Row className="access-schedule-values-row access-schedule-wizard">
                    <Col xl={2} xs={6}>
                        <FormFieldContent
                            inputComponent={() =>
                                <Label>
                                    <Input type="radio"
                                        value="allDays"
                                        onChange={this.onRadioOptionSelectionChange}
                                        checked={accessSchedule.accessDaysSelection === "allDays"}
                                        disabled={isIndeFiniteAccess} />
                                    {localise('TEXT_ALL_DAYS')}</Label>
                            }
                        />
                    </Col>
                    <Col xl={2} xs={6}>
                        <FormFieldContent
                            inputComponent={() =>
                                <Label>
                                    <Input type="radio"
                                        value="limitedDays"
                                        onChange={this.onRadioOptionSelectionChange}
                                        checked={accessSchedule.accessDaysSelection === "limitedDays"}
                                        disabled={isIndeFiniteAccess} />
                                    {localise('TEXT_LIMITED_DAYS')}</Label>
                            }
                        />
                    </Col>
                    <Col xl={8} className="mt-3 mt-xl-0">
                        <LookupCheckList
                            lookupKey="LIST_WEEKDAYS"
                            onCheckBoxChange={this.onScheduleListChange}
                            selectedList={accessSchedule.scheduleList}
                            disabled={isIndeFiniteAccess}
                            key={indefiniteAccess}/>
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col>
                        <Label className="system-label">{localise('TEXT_ACCESS_TIME')}</Label>
                    </Col>
                </Row>
                <Row className="access-schedule-values-row  access-schedule-wizard">
                    <Col xl={2} xs={6}>
                        <FormFieldContent
                            inputComponent={() =>
                                <Label>
                                    <Input type="radio"
                                        name="accessTimeSelection"
                                        value="allHours"
                                        onChange={this.onRadioOptionSelectionChange}
                                        component="input"
                                        checked={accessSchedule.accessTimeSelection === "allHours"}
                                        disabled={isIndeFiniteAccess}
                                        key={accessSchedule.scheduleStartsAt || '' + accessSchedule.scheduleEndsAt || ''}/>
                                    {localise('TEXT_24_HOURS')}</Label>
                            }
                        />
                    </Col>
                    <Col xl={2} xs={6}>
                        <FormFieldContent
                            inputComponent={() =>
                                <Label>
                                    <Input type="radio"
                                        name="accessTimeSelection"
                                        value="limitedHours"
                                        onChange={this.onRadioOptionSelectionChange}
                                        component="input"
                                        checked={accessSchedule.accessTimeSelection === "limitedHours"}
                                        disabled={isIndeFiniteAccess} />
                                    {localise('TEXT_LIMITED_HOURS')}</Label>
                            }
                        />
                    </Col>
                    <Col xl={4} xs={6} className="mt-3 mt-xl-0">
                        <span className="timerange-label">{localise('TEXT_FROM')}</span>
                        <br />

                        <div className="timerange-field">
                            <TimePicker value={this.fromTime}
                                disabled={accessSchedule.accessTimeSelection == 'allHours'}
                                popupSettings={{ animate: false }} format={timeFormat} formatPlaceholder={"formatPattern"}
                                onChange={this.onFromTimeChange}
                                key={accessSchedule.accessTimeSelection}/>
                        </div>
                    </Col>
                    <Col xl={4} xs={6} className="mt-3 mt-xl-0">
                        <span className="timerange-label">{localise('TEXT_TO')}</span>
                        <br />
                        <div className="timerange-field">
                            <TimePicker value={this.toTime}
                                disabled={accessSchedule.accessTimeSelection == 'allHours'}
                                popupSettings={{ animate: false }} format={timeFormat} formatPlaceholder={"formatPattern"}
                                onChange={this.onToTimeChange}
                                key={accessSchedule.accessTimeSelection}/>
                        </div>
                    </Col>
                </Row>
                <br />
            </>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/accessGroups/components/AccessGroupWizard/AccessScheduleWizard.tsx