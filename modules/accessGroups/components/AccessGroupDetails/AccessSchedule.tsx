import * as React from "react";
import { Row, Col, Label } from "reactstrap";
import { Field, formValueSelector } from "redux-form";
import { store } from 'src/redux/store';
import { TimePicker, DatePicker } from "@progress/kendo-react-dateinputs";
import { localise } from "src/modules/shared/services";
import LookupCheckList from "src/modules/shared/components/LookupCheckList/LookupCheckList";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import * as moment from 'moment';
import { DefaultDateTimeFormats } from "src/modules/shared/constants/datetime.constants";
import { dateTimeUtilService } from "src/modules/shared/services/datetime-util.service";

interface CustomProps {
    isNew: boolean;
    accessDurationSelection?: string;
    accessDaysSelection?: string;
    accessTimeSelection?: string;
    accessValidFrom?: string | null;
    accessValidTo?: string | null;
    scheduleStartsAt?: string | null;
    scheduleEndsAt?: string | null;
    scheduleList?: string[];
    onRadioSelectionChange: (event: any) => void;
    changeAccessDaysSelection: (selectedDays: any) => void;
    onFromDateChange: (date: string) => void;
    onToDateChange: (date: string) => void;
    isPermittedToEdit?: boolean;
}

interface LocalState {
    country?: string;
    accessValidFrom?: Date;
    accessValidTo?: Date;
    isFromTime?: boolean;
}

export class AccessSchedule extends React.Component<CustomProps & DetailFormProps, LocalState>{
    fromTime?: Date | null;
    toTime?: Date | null;
    minTime?: Date | null;

    constructor(props: CustomProps & DetailFormProps) {
        super(props);
        this.onRadioOptionSelectionChange = this.onRadioOptionSelectionChange.bind(this);
        this.onScheduleListChange = this.onScheduleListChange.bind(this);
        this.onFromTimeChange = this.onFromTimeChange.bind(this);
        this.onToTimeChange = this.onToTimeChange.bind(this);
        this.onAccessFromDateChange = this.onAccessFromDateChange.bind(this);
        this.onAccessToDateChange = this.onAccessToDateChange.bind(this);
        this.resetTo24HoursSelection = this.resetTo24HoursSelection.bind(this);
        this.state = {
            accessValidFrom: props.accessValidFrom ? new Date(props.accessValidFrom) : new Date(),
            accessValidTo: props.accessValidTo ? new Date(props.accessValidTo) : new Date(),
            isFromTime: props.item.scheduleStartsAt ? true : false,
        };

        var today = new Date();
        if (this.props.item.scheduleStartsAt) {
            let timeArray = this.props.item.scheduleStartsAt.split(':');
            this.fromTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), timeArray[0], timeArray[1], 0);
            this.minTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), timeArray[0], timeArray[1] + 1, 0);
        }
        if (this.props.item.scheduleEndsAt) {
            let timeArray = this.props.item.scheduleEndsAt.split(':');
            this.toTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), timeArray[0], timeArray[1], 0);
        }
    }

    onRadioOptionSelectionChange(event: any) {
        const { props } = this;
        props.onRadioSelectionChange(event);
        switch (event.target.value) {
            case 'unlimitedAccess':
                props.change('accessValidFrom', null);
                props.change('accessValidTo', null);
                props.change('accessDurationSelection', 'unlimitedAccess');
                break;
            case 'limitedAccess':
                props.change('accessDurationSelection', 'limitedAccess');
                break;
            case 'allDays':
                props.change('scheduleList', ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]);
                props.change('accessDaysSelection', 'allDays');
                break;
            case 'limitedDays':
                props.change('scheduleList', ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]);
                props.change('accessDaysSelection', 'limitedDays');
                break;
            case 'allHours':
                props.change('accessTimeSelection', 'allHours');
                props.change('scheduleStartsAt', null);
                props.change('scheduleEndsAt', null);
                this.setState({
                    isFromTime: false
                });
                break;
            case 'limitedHours':
                props.change('accessTimeSelection', 'limitedHours');
                props.change('scheduleStartsAt', null);
                props.change('scheduleEndsAt', null);
                break;
        }
    }

    onScheduleListChange(selectedDays: any) {
        if (selectedDays.length == 7) {
            this.props.change('accessDaysSelection', 'allDays');

        }
        else {
            this.props.change('accessDaysSelection', 'limitedDays');
        }
        this.props.changeAccessDaysSelection(selectedDays);
    }

    onFromTimeChange(selectedTime: Date) {
        var today = new Date();
        this.fromTime = selectedTime;
        this.minTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), selectedTime.getHours(), (selectedTime.getMinutes() + 1), selectedTime.getUTCSeconds());

        this.setState({
            isFromTime: true
        });

        if (this.toTime && this.toTime < this.fromTime) {
            this.props.change('scheduleEndsAt', null);
        }

        if (selectedTime) {
            if (selectedTime.getHours() == 0 && selectedTime.getMinutes() == 0) {
                this.resetTo24HoursSelection('scheduleEndsAt');
            }
        }
    }

    onToTimeChange(selectedTime: Date) {
        this.toTime = selectedTime;
        if (selectedTime) {
            if (selectedTime.getHours() == 23 && selectedTime.getMinutes() == 59) {
                this.resetTo24HoursSelection('scheduleStartsAt');
            }
        }
    }

    onAccessFromDateChange(date: any) {
        var dateTime = moment(moment(date).format("YYYY-MM-DD") + ' 00:00:00').format(DefaultDateTimeFormats.DateTimeFormat);

        const { onFromDateChange } = this.props;
        this.setState({
            accessValidFrom: date
        });
        var formatDate = moment(dateTime).format(DefaultDateTimeFormats.DateTimeFormat);
        onFromDateChange(formatDate);
    }

    onAccessToDateChange(date: any) {
        var dateTime = moment(moment(date).format("YYYY-MM-DD") + ' 23:59:59').format(DefaultDateTimeFormats.DateTimeFormat);
        const { onToDateChange } = this.props;
        this.setState({
            accessValidTo: date
        })
        var formatDate = moment(dateTime).format(DefaultDateTimeFormats.DateTimeFormat);
        onToDateChange(formatDate);
    }

    resetTo24HoursSelection(timeComponentName: string) {
        const selector = formValueSelector(this.props.form);
        const formState = store.getState();
        var time = selector(formState, timeComponentName);
        if (time != null &&
            ((timeComponentName == 'scheduleStartsAt' && this.fromTime && this.fromTime.getHours() == 0 && this.fromTime.getMinutes() == 0) ||
                (timeComponentName == 'scheduleEndsAt' && this.toTime && this.toTime.getHours() == 23 && this.toTime.getMinutes() == 59))) {
            let event = { target: { value: 'allHours' } };
            this.onRadioOptionSelectionChange(event);
        }
    }

    render() {

        const { props } = this;
        const { isPermittedToEdit } = this.props;

        return (
            <>
                <Row>
                    <Col>
                        <Label className="system-label">{localise('TEXT_ACCESS_DURATION')}</Label>
                    </Col>
                </Row>
                <Row className="access-schedule-values-row">
                    <Col xl={2} xs={6}>
                        <Label>
                            <Field name="accessDurationSelection" value="unlimitedAccess" checked={props.accessDurationSelection === "unlimitedAccess"}
                                onChange={this.onRadioOptionSelectionChange} component="input" type="radio" disabled={!isPermittedToEdit}></Field>
                            {localise('TEXT_UNLIMITED_ACCESS')}</Label>
                    </Col>
                    <Col xl={2} xs={6}>
                        <Label>
                            <Field name="accessDurationSelection" value="limitedAccess" checked={props.accessDurationSelection === "limitedAccess"}
                                onChange={this.onRadioOptionSelectionChange} component="input" type="radio" disabled={!isPermittedToEdit}></Field>
                            {localise('TEXT_LIMITED_ACCESS')}</Label>
                    </Col>
                    <Col xl={4} xs={6} className="mt-3 mt-xl-0">
                        <span className="timerange-label">{localise('TEXT_FROM')}</span>
                        <br />
                        <Field name="accessValidFrom" key={props.accessDurationSelection}
                            disabled={props.accessDurationSelection != 'limitedAccess' || !isPermittedToEdit}
                            component={DtPickerFrom} formProps={props} onDateChange={this.onAccessFromDateChange} />
                    </Col>
                    <Col xl={4} xs={6} className="mt-3 mt-xl-0">
                        <span className="timerange-label">{localise('TEXT_TO')}</span>
                        <br />
                        <Field name="accessValidTo" component={DtPickerTo}
                            disabled={props.accessDurationSelection != 'limitedAccess' || !isPermittedToEdit} formProps={props} onDateChange={this.onAccessToDateChange} />
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
                <Row className="access-schedule-values-row">
                    <Col xl={2} xs={6}>
                        <Label>
                            <Field name="accessDaysSelection" value="allDays" onChange={this.onRadioOptionSelectionChange}
                                component="input" type="radio" checked={props.accessDaysSelection === "allDays"} disabled={!isPermittedToEdit}></Field>
                            {localise('TEXT_ALL_DAYS')}</Label>
                    </Col>
                    <Col xl={2} xs={6}>
                        <Label>
                            <Field name="accessDaysSelection" value="limitedDays" onChange={this.onRadioOptionSelectionChange}
                                component="input" type="radio" checked={props.accessDaysSelection === "limitedDays"} disabled={!isPermittedToEdit}></Field>
                            {localise('TEXT_LIMITED_DAYS')}</Label>
                    </Col>
                    <Col xl={8} className="mt-3 mt-xl-0">
                        <Field component={ScheduleListComp} formProps={props} onSelectionChange={this.onScheduleListChange}
                            name="scheduleList" className="form-control" required disabled={!isPermittedToEdit} />
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col>
                        <Label className="system-label">{localise('TEXT_ACCESS_TIME')}</Label>
                    </Col>
                </Row>
                <Row className="access-schedule-values-row">
                    <Col xl={2} xs={6}>
                        <Label>
                            <Field name="accessTimeSelection" value="allHours" onChange={this.onRadioOptionSelectionChange}
                                component="input" type="radio" checked={props.accessTimeSelection === "allHours"} disabled={!isPermittedToEdit}></Field>
                            {localise('TEXT_24_HOURS')}</Label>
                    </Col>
                    <Col xl={2} xs={6}>
                        <Label>
                            <Field name="accessTimeSelection" value="limitedHours" onChange={this.onRadioOptionSelectionChange}
                                component="input" type="radio" checked={props.accessTimeSelection === "limitedHours"} disabled={!isPermittedToEdit}></Field>
                            {localise('TEXT_LIMITED_HOURS')}</Label>
                    </Col>
                    <Col xl={4} xs={6} className="mt-3 mt-xl-0">
                        <span className="timerange-label">{localise('TEXT_FROM')}</span>
                        <br />
                        <Field name="scheduleStartsAt" component={TimePickerFromComp} formProps={props} onTimeSelectionChange={this.onFromTimeChange}
                            disabled={props.accessTimeSelection == 'allHours' || !isPermittedToEdit} />
                    </Col>
                    <Col xl={4} xs={6} className="mt-3 mt-xl-0">
                        <span className="timerange-label">{localise('TEXT_TO')}</span>
                        <br />
                        <Field name="scheduleEndsAt"
                            component={(props: any) => <TimePickerToComp {...props} min={this.minTime} />}
                            formProps={props} onTimeSelectionChange={this.onToTimeChange}
                            disabled={props.accessTimeSelection == 'allHours' || !this.state.isFromTime || !isPermittedToEdit} />
                    </Col>
                </Row>
                <br />
            </>
        )
    }
}

const ScheduleListComp = (props: any) => {
    const { isPermittedToEdit } = props;
    return <LookupCheckList disabled={!isPermittedToEdit} {...props} key={props.formProps.scheduleList + props.formProps.accessDaysSelection} lookupKey="LIST_WEEKDAYS" selectedList={props.formProps.scheduleList}
        onCheckBoxChange={(e: any) => {
            props.input.onChange(e);
            props.onSelectionChange(e);
        }} />
}

const DtPickerFrom = (props: any) => {
    const dateFormat = dateTimeUtilService.getKendoDateFormat();

    return (
        <div>
            <DatePicker disabled={props.disabled} style={{ width: 150, height: 150 }}
                format={dateFormat} formatPlaceholder={{ year: 'YYYY', month: 'MM', day: 'DD' }}                 
                defaultValue={props.input.value ? new Date(props.input.value) : null}  {...props}
                onChange={(event: any) => {
                    props.input.onChange(moment(event.target.value).format(DefaultDateTimeFormats.DateTimeFormat));
                    let fromDateTime = event.target.value as Date;
                    props.formProps.change('accessDurationSelection', 'limitedAccess'); // Bind the slection to formporps when no radio selection made
                    props.onDateChange(fromDateTime);
                }} />
        </div>
    );
}

const DtPickerTo = (props: any) => {
    const dateFormat = dateTimeUtilService.getKendoDateFormat();

    return (
        <div>
            <DatePicker disabled={props.disabled}
                format={dateFormat} formatPlaceholder={{ year: 'YYYY', month: 'MM', day: 'DD' }}                
                defaultValue={props.input.value ? new Date(props.input.value) : props.formProps.accessValidTo} {...props}
                onChange={(event: any) => {
                    let toDateTime = event.target.value as Date;
                    props.input.onChange(moment(event.target.value).format(DefaultDateTimeFormats.DateTimeFormat));
                    props.formProps.change('accessDurationSelection', 'limitedAccess'); // Bind the slection to formporps when no radio selection made
                    props.onDateChange(toDateTime);
                }} />
        </div>
    );
}

const TimePickerFromComp = (props: any) => {
    let timeInDateTimeFormat;

    if (props.input.value != '') {
        let timeArray = props.input.value.split(':');
        let currentDate = new Date();
        timeInDateTimeFormat = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), timeArray[0], timeArray[1], 0)
    }

    const timeFormat = dateTimeUtilService.getKendoTimeFormat();

    return (
        <div className="timerange-field">
            <TimePicker {...props} key={props.disabled} value={props.input.value != '' ? timeInDateTimeFormat : null}
                disabled={props.disabled} popupSettings={{ animate: false }} format={timeFormat} formatPlaceholder={"formatPattern"}
                onChange={(event: any) => {
                    props.input.onChange(moment(event.target.value).format("HH:mm"));
                    props.onTimeSelectionChange(event.target.value);
                }} />
        </div>
    );
}

const TimePickerToComp = (props: any) => {
    let timeInDateTimeFormat;

    if (props.input.value != '') {
        let timeArray = props.input.value.split(':');
        let currentDate = new Date();
        timeInDateTimeFormat = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), timeArray[0], timeArray[1], 0);
    }

    const timeFormat = dateTimeUtilService.getKendoTimeFormat();

    return (
        <div className="timerange-field">
            <TimePicker {...props} key={props.disabled} value={props.input.value != '' ? timeInDateTimeFormat : null}
                min={props.min} disabled={props.disabled} popupSettings={{ animate: false }} format={timeFormat} formatPlaceholder={"formatPattern"}
                onChange={(event: any) => {
                    props.input.onChange(moment(event.target.value).format("HH:mm"));
                    props.onTimeSelectionChange(event.target.value);
                }} />
        </div>
    );
}



// WEBPACK FOOTER //
// ./src/modules/accessGroups/components/AccessGroupDetails/AccessSchedule.tsx