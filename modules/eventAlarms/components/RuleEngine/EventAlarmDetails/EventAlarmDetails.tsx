import * as React from "react";
import { DetailPage, DetailFormBodyComponent, DetailPageContainer, DetailFormProps } from "../../../../shared/components/DetailPage";
import { EventAlarmConfig, EventSources, AlertType } from "../../../types/dto";
import { contextService, localise, configService } from "../../../../shared/services";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { DetailsTab } from "./Tabs/DetailsTab";
import { AlertsTab } from "./Tabs/AlertsTab";
import { ActionsTab } from "./Tabs/ActionsTab";
import { AlarmTab } from "./Tabs/AlarmTab";
import "./../rule-engine.css";
import { Row, Col, Alert, Label } from "reactstrap";
import { SubmissionError } from "redux-form";

class EventAlarmDetails extends DetailPage<EventAlarmConfig> {

    detailFormBody: DetailFormBodyComponent = FormBody;
    listPagePath: string = "/eventalarm/eventalarmmanagement";

    validateItem() { return {}; }

    objectToFormValues(eventAlarm: EventAlarmConfig): any {
        return {
            ...eventAlarm,
            eventSource: eventAlarm.id == "" ?
                JSON.stringify({ type: EventSources.Web, id: undefined }) :
                JSON.stringify(eventAlarm.eventSource),
            eventActions: eventAlarm.eventActions || []
        };
    }

    formValuesToObject(values: any): EventAlarmConfig {
        return {
            ...values, eventSource: JSON.parse(values.eventSource)
        };
    }

    beforeSave(item: EventAlarmConfig, isNew: boolean): boolean {
        let error = this.validate(item, isNew);

        if (error) {
            throw new SubmissionError({
                _error: error
            });
        }
        return true;
    }

    validate(item: EventAlarmConfig, isNew: boolean) {
        if (!isNew) {
            if (item.smsAlertConfiguration && item.smsAlertConfiguration.template &&
                (item.smsAlertConfiguration.users && item.smsAlertConfiguration.users.length == 0) &&
                (item.smsAlertConfiguration.roles && item.smsAlertConfiguration.roles.length == 0)) {
                return 'SMS_ALERTS:ERROR_USER_OR_ROLE_REQUIRED';
            }
            else if (item.emailAlertConfiguration && item.emailAlertConfiguration.template &&
                (item.emailAlertConfiguration.users && item.emailAlertConfiguration.users.length == 0) &&
                (item.emailAlertConfiguration.roles && item.emailAlertConfiguration.roles.length == 0)) {
                return 'EMAIL_ALERTS:ERROR_USER_OR_ROLE_REQUIRED';
            }
            else if (item.eventActions && item.eventActions.length > 0 &&
                item.eventActions.some(e => !e.duration)) {
                return 'ACTIONS:ERROR_ACTION_DURATIONS_REQUIRED';
            }
            else if (item.alarmConfiguration && item.alarmConfiguration.alarmName) {
                if (item.alarmConfiguration.sendEscalationAlert && (!item.alarmConfiguration.escalationInterval ||
                    !item.alarmConfiguration.escalationAlertUsers || !item.alarmConfiguration.escalationAlertUsers[0])) {
                    return 'ALARM:ERROR_ESCALATION_DETAILS_REQUIRED';
                }
                else if (item.alarmConfiguration.closeEvents && item.alarmConfiguration.closeEvents.length > 0) {
                    let events = item.alarmConfiguration.closeEvents;

                    if (events.some(e => !e) || events.some((e, i) => events.indexOf(e) != i)) {
                        return 'ALARM:ERROR_INVALID_CLOSE_EVENTS';
                    }
                }
            }
        }
        return null;
    }

    hideDescriptionHeader() {
        return true;
    }
}

interface LocalState {
    selectedTab: number;
}

class FormBody extends React.Component<DetailFormProps, LocalState> {
    constructor(props: DetailFormProps) {
        super(props);
        this.onSelectTab = this.onSelectTab.bind(this);

        this.state = {
            selectedTab: 0
        };
    }

    onSelectTab(e: any) {
        this.setState({ ...this.state, selectedTab: e.selected });
    }

    getTabHeader(titleKey: string, hasError: boolean = false, isDisabled: boolean = false) {
        return (
            <>
                <Label className="mt-1 mb-1" title={hasError ? localise("TEXT_ERROR_VERIFY_DATA_TAB") :
                    isDisabled ? localise("TEXT_PLEASE_SAVE_TO_PROCEED") : ""}>
                    {localise(titleKey)} {hasError && <i className="fas fa-exclamation-circle error-tab-icon"></i>}
                </Label>
            </>
        );
    }

    getErrorAlertRow(errorMsg: string) {
        return (
            <Row className="mt-2 mb-2">
                <Col>
                    <Alert className="mb-0" color="danger">
                        <small className="text-danger">{localise(errorMsg)}</small>
                    </Alert>
                </Col>
            </Row>
        );
    }

    render() {
        const { props } = this;
        const { selectedTab } = this.state;
        const errorTab = props.error && props.error.split(":")[0];
        const errorMsg = props.error && props.error.split(":")[1];

        let eventSourceType = props.item.eventSource && props.item.eventSource.type;
        let eventSourceItemEvent = props.item.eventSource && props.item.eventSource.isItemEvent;

        let defaultConfigsValue = configService.getConfigurationValue("DEFAULT_EVENT_ALARM_CONFIGURATIONS");
        let defaultConfigs = defaultConfigsValue ? JSON.parse(defaultConfigsValue) as EventAlarmConfig[] : [];
        let defaultConfig = defaultConfigs.find(c => c.eventCode == props.item.eventCode);

        return (
            <div className="rule-engine-tabs">
                <TabStrip selected={selectedTab} onSelect={this.onSelectTab} keepTabsMounted={true}>
                    <TabStripTab title={this.getTabHeader("TEXT_DETAILS", errorTab == "DETAILS")}
                        contentClassName="rule-engine-detail-tab">
                        {errorTab == "DETAILS" && this.getErrorAlertRow(errorMsg)}
                        <DetailsTab {...props} />
                    </TabStripTab>
                    <TabStripTab title={this.getTabHeader("TEXT_SMS_ALERTS", errorTab == "SMS_ALERTS", props.isNew)}
                        contentClassName="rule-engine-sms-alerts-tab" disabled={props.isNew}>
                        {errorTab == "SMS_ALERTS" && this.getErrorAlertRow(errorMsg)}
                        <AlertsTab {...props} alertType={AlertType.SMS} hasDefaultTemplate={(props.item.isDefault && defaultConfig &&
                            defaultConfig.smsAlertConfiguration && defaultConfig.smsAlertConfiguration.template != null &&
                            defaultConfig.smsAlertConfiguration.template != '') || false} />
                    </TabStripTab>
                    <TabStripTab title={this.getTabHeader("TEXT_EMAIL_ALERTS", errorTab == "EMAIL_ALERTS", props.isNew)}
                        contentClassName="rule-engine-email-alerts-tab" disabled={props.isNew}>
                        {errorTab == "EMAIL_ALERTS" && this.getErrorAlertRow(errorMsg)}
                        <AlertsTab {...props} alertType={AlertType.EMail} hasDefaultTemplate={(props.item.isDefault && defaultConfig &&
                            defaultConfig.emailAlertConfiguration && defaultConfig.emailAlertConfiguration.template != null &&
                            defaultConfig.emailAlertConfiguration.template != '') || false} />
                    </TabStripTab>
                    <TabStripTab title={this.getTabHeader("TEXT_ACTIONS", errorTab == "ACTIONS", props.isNew)}
                        contentClassName="rule-engine-actions-tab" disabled={props.isNew || 
                            (eventSourceType != EventSources.Cabinet && eventSourceType != EventSources.Site ) || 
                            (eventSourceType == EventSources.Cabinet && eventSourceItemEvent == true)}>
                        {errorTab == "ACTIONS" && this.getErrorAlertRow(errorMsg)}
                        <ActionsTab {...props} defaultActions={props.item.isDefault && defaultConfig && defaultConfig.eventActions} />
                    </TabStripTab>
                    <TabStripTab title={this.getTabHeader("TEXT_ALARM", errorTab == "ALARM", props.isNew)}
                        contentClassName="rule-engine-alarm-tab" disabled={props.isNew ||
                            (eventSourceType != EventSources.Cabinet && eventSourceType != EventSources.Site)}>
                        {errorTab == "ALARM" && this.getErrorAlertRow(errorMsg)}
                        <AlarmTab {...props} defaultCloseEvents={props.item.isDefault && defaultConfig &&
                            defaultConfig.alarmConfiguration && defaultConfig.alarmConfiguration.closeEvents} />
                    </TabStripTab>
                </TabStrip>
            </div>
        );
    }
}

export default DetailPageContainer(EventAlarmDetails, "EventAlarmDetails", "eventAlarmConfiguration", () => {
    //Code to return a new empty object.
    return { id: "", customerId: contextService.getCurrentCustomerId() };
});



// WEBPACK FOOTER //
// ./src/modules/eventAlarms/components/RuleEngine/EventAlarmDetails/EventAlarmDetails.tsx