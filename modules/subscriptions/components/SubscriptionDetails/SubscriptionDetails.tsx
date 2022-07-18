import * as React from 'react';
import { contextService, localise, lookupService } from '../../../shared/services';
import { DateTimePicker } from "@progress/kendo-react-dateinputs";
import { DetailPage, DetailFormBodyComponent, DetailPageContainer, DetailFormProps } from '../../../shared/components/DetailPage';
import { ReportSubscription } from '../../types/dto';
import { LookupDropDown } from 'src/modules/shared/components/LookupDropDown/LookupDropDown';
import { FormField, FormAuditField } from 'src/modules/shared/components/Form';
import { TimeDurations, LookupItem } from 'src/modules/shared/types/dto';
import * as moment from 'moment';
import { DefaultDateTimeFormats } from 'src/modules/shared/constants/datetime.constants';
import { Row, Col, Label } from 'reactstrap';
import { WeekdayRadioSelection } from 'src/modules/shared/components/WeekdayRadioSelection/WeekdayRadioSelection';
import { UserRadioGrid } from 'src/modules/shared/components/UserRadioGrid/UserRadioGrid';
import { permissionService } from 'src/modules/shared/services/permission.service';
import { dateTimeUtilService } from 'src/modules/shared/services/datetime-util.service';

class ReportSubscriptionDetails extends DetailPage<ReportSubscription>{
    detailFormBody: DetailFormBodyComponent = FormBody;
    listPagePath: string = "/reports/reportsubscriptionmanagement";

    objectToFormValues(item: ReportSubscription) {
        if (!item.id)
            item.dataRange = "1:0";
        if(!item.fileType)
            item.fileType = "EXCEL";
        return item;
    }

    validateItem(item: ReportSubscription) {
        return {};
    }
}

interface State {
    customerId?: string;
    frequency?: string;
    from: string;
    to: string;
}

class FormBody extends React.Component<DetailFormProps, State> {
    excludedReports: LookupItem[];

    constructor(props: DetailFormProps) {
        super(props);
        this.onFrequencyChange = this.onFrequencyChange.bind(this);
        this.excludedReportsFilter = this.excludedReportsFilter.bind(this);
        this.onDeleteClick = this.onDeleteClick.bind(this);

        this.state = {
            customerId: props.item.customerId,
            frequency: props.item.frequency,
            from: props.item.from,
            to: props.item.to
        }

        this.excludedReports = lookupService.getList("LIST_EXCLUDED_SUBSCRIPTION_REPORTS");
    }

    onFrequencyChange(event: any, inputProps: any) {
        const value = event.target.value;
        inputProps.onChange(event);
        this.props.change("day", value == TimeDurations.Weekly ? "SUNDAY" : null);
        this.setState({ ...this.state, frequency: value });
    }

    onDayChange(event: any, inputProps: any) {
        const value = event.target.value;
        inputProps.onChange(event);
        this.props.change("day", value);
    }

    onDateChange(event: any, name: string) {
        let value = event.target.value;
        this.props.change(name, value ? moment(value as Date).format(DefaultDateTimeFormats.DateTimeFormat) : null);
        this.setState({ ...this.state, [name]: value });
    }

    onDeleteClick() {
        let event = { target: { value: null } };
        this.onDateChange(event, 'to');
    }

    durationValidator(value: any, item: any) {
        return !item.from ? localise("ERROR_FIELD_REQUIRED") : undefined;
    }

    excludedReportsFilter(item: LookupItem) {
        return !this.excludedReports.find(r => r.value == item.value);
    }

    render() {
        const { item } = this.props;
        const { customerId, frequency, from, to } = this.state;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');
        let fromValid = from && moment(from).isValid();
        let toValid = to && moment(to).isValid();
        let readonly = item.isActive == false || !isPermittedToEdit;
        const dateTimeFormat = dateTimeUtilService.getKendoDateTimeFormat();
        
        return (
            <div className="report-subscription-form">
                <FormField labelKey="TEXT_REPORT" remarksKey="REMARK_REPORT" required={true}
                    name="reportCode" component={(props: any) => <LookupDropDown {...props} disabled={readonly}
                        lookupKey="LIST_SUBSCRIPTION_REPORTS" filter={this.excludedReportsFilter} />} />
                <FormField labelKey="TEXT_DATA_RANGE" remarksKey="REMARK_DATA_RANGE" required={true}
                    name="dataRange" component={(props: any) => <LookupDropDown {...props} disabled={readonly}
                        lookupKey="LIST_REPORT_DATA_RANGES" />} />
                <FormField labelKey="TEXT_FREQUENCY" remarksKey="REMARK_FREQUENCY" required={true}
                    name="frequency" component={(props: any) => <LookupDropDown {...props} lookupKey="LIST_REPORT_FREQUENCIES"
                        disabled={readonly} onChange={(e: any) => this.onFrequencyChange(e, props)} showRemarks={true} />} />
                {
                    frequency && frequency == TimeDurations.Weekly &&
                    <FormField name="day" remarksKey="REMARK_WEEKDAYS" required={true} className="w-50"
                        component={(props: any) => <WeekdayRadioSelection value={props.value}
                            onChange={(e: any) => this.onDayChange(e, props)} disabled={readonly} />} />
                }
                <FormField labelKey="TEXT_SUBSCRIPTION_DURATION" remarksKey="REMARK_SUBSCRIPTION_DURATION"
                    required={true} validate={this.durationValidator} disableInbuiltValidator={true}
                    name="duration" component={(props: any) =>
                        <Row className={readonly ? "readonly-section" : ""}>
                            <Col xl={4} lg={6} className="mb-2">
                                <Label className="mr-3">{localise("TEXT_FROM")}:</Label>
                                <DateTimePicker name="from"
                                    value={fromValid ? new Date(from) : undefined}
                                    min={!readonly ? new Date(from) < new Date() ? new Date(from) : new Date() : undefined}
                                    max={toValid ? new Date(to) : undefined}
                                    onChange={(e: any) => this.onDateChange(e, 'from')}
                                    format={dateTimeFormat} formatPlaceholder={{ year: 'YYYY', month: 'MM', day: 'DD', hour: 'HH', minute: 'mm' }} />
                            </Col>
                            <Col xl={4} lg={6}>
                                <Label className="mr-3">{localise("TEXT_TO")}:</Label>
                                <DateTimePicker name="to"
                                    value={toValid ? new Date(to) : undefined}
                                    min={fromValid ? new Date(from) : new Date()}
                                    onChange={(e: any) => this.onDateChange(e, 'to')}
                                    format={dateTimeFormat} formatPlaceholder={{ year: 'YYYY', month: 'MM', day: 'DD', hour: 'HH', minute: 'mm' }} />
                                {
                                    toValid && !readonly &&
                                    <span className="ml-3 delete-icon">
                                        <i className="fa fa-times text-muted" aria-hidden="true" onClick={this.onDeleteClick} />
                                    </span>
                                }
                            </Col>
                        </Row>
                    } />
                <FormField labelKey="TEXT_FILE_TYPE" remarksKey="REMARK_FILE_TYPE" required={true}
                    name="fileType" component={(props: any) => <LookupDropDown {...props} disabled={readonly}
                    lookupKey="LIST_FILE_TYPES" />}
                />
                <FormField labelKey="TEXT_USER" remarksKey="REMARK_USER" required={true} disabled={readonly}
                    name="userId" component={(props: any) => <UserRadioGrid customerId={customerId || ''}
                        value={props.value} readonly={readonly} onChange={(id) => props.onChange({ target: { value: id } })} />} />
                <FormAuditField updatedOnUtc={this.props.item.updatedOnUtc} updatedByName={this.props.item.updatedByName} />
            </div>
        );
    }
}

export default DetailPageContainer(ReportSubscriptionDetails, 'ReportSubscriptionDetails', 'reportsubscription', () => {
    return { id: "", customerId: contextService.getCurrentCustomerId() }
});



// WEBPACK FOOTER //
// ./src/modules/subscriptions/components/SubscriptionDetails/SubscriptionDetails.tsx