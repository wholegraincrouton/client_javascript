import * as React from "react";
import { SearchFilterBox, SearchFilterBoxProps, SearchFilterField } from "../../../../shared/components/SearchFilterBox";
import { AlertSearchCriteria, EventSources } from "../../../types/dto";
import { Col, Row } from "reactstrap";
import { contextService, configService } from "../../../../shared/services";
import { DateTimePicker } from "@progress/kendo-dateinputs-react-wrapper"; // DateTimePicker from kendo react is the prefered one but it doesnt work with the common redux forms so use this until there is fix.
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import { RoleFilter } from "src/modules/shared/components/RoleFilter/RoleFilter";
import AutoCompleteSearchField from "src/modules/shared/components/AutoCompleteSearchField/AutoCompleteSearchField";
import { userService } from "src/modules/users/services/user.service";

var userNameList: string[] = [];

export class AlertFilterBox extends SearchFilterBox<AlertSearchCriteria>{
    constructor(props: SearchFilterBoxProps) {
        let endTime = new Date();
        let startTime = new Date();
        startTime.setMonth(startTime.getMonth() - 1);
        super(props, {
            contextCustomerId: contextService.getCurrentCustomerId(),
            userName: '',
            role: 'any',
            eventSource: 'any',
            event: 'any',
            channel: 'any',
            alertStartTime: startTime.toISOString(),
            alertEndTime: endTime.toISOString(),
            eventStartTime: startTime.toISOString(),
            eventEndTime: endTime.toISOString()
        });
    }    

    componentDidMount() {
        this.getData();
        super.componentDidMount();
    }

    componentDidUpdate(previousProps: any) {
        const previousCustomerId = previousProps.customerId;
        let customerId = contextService.getCurrentCustomerId();
        if (customerId != previousCustomerId) {
            this.getData();
        }
    }

    getData() {
        let customerId = contextService.getCurrentCustomerId();
        userService.getUsers(customerId, false).then(users => {
            {
                var list: string[] = [];
                users.forEach((user) => {
                    list.push(user.name);
                });
                userNameList = list;
            }
        });
    }

    getFields(): JSX.Element {
        const { contextCustomerId, userName, role, eventSource, event, channel, alertStartTime, alertEndTime, eventStartTime, eventEndTime } = this.state;

        return (
            <>
                <Row className="filter-fields">               
                    <Col lg={6} xl={3}>
                        <SearchFilterField titleKey="TEXT_ROLE">
                            <LookupDropDown allowAny={true} textAny="TEXT_ANY_ROLE" name="role" customerId={contextCustomerId} lookupKey="LIST_ROLES"
                                value={role} onChange={this.handleChange} filter={RoleFilter} />
                        </SearchFilterField>
                    </Col>
                    <Col lg={6} xl={3}>
                        <SearchFilterField titleKey="TEXT_USER">
                            <AutoCompleteSearchField name="userName" value={userName} onChange={this.handleChange} data={userNameList} />
                        </SearchFilterField>
                    </Col>
                    <Col lg={6} xl={3}>
                        <SearchFilterField titleKey="TEXT_EVENT_SOURCE">
                            <LookupDropDown name="eventSource" lookupKey="LIST_EVENT_SOURCES" value={eventSource}
                                allowAny={true} textAny="TEXT_ANY_EVENT_SOURCE" onChange={this.handleChange} />
                        </SearchFilterField>
                    </Col>
                    <Col lg={6} xl={3}>
                        <SearchFilterField titleKey="TEXT_EVENT">
                            <LookupDropDown name="event"
                                lookupKey={eventSource == EventSources.Web ? "LIST_PORTAL_EVENTS" : ""}
                                additionalLookups={(eventSource == EventSources.Site || eventSource == EventSources.Cabinet) ?
                                    ["LIST_CABINET_HIGH_PRIORITY_EVENTS", "LIST_CABINET_LOW_PRIORITY_EVENTS", "LIST_CABINET_ITEM_EVENTS"] : []}
                                value={event} allowAny={true} textAny="TEXT_ANY_EVENT" onChange={this.handleChange} />
                        </SearchFilterField>
                    </Col>
                    <Col lg={6} xl={3}>
                        <SearchFilterField titleKey="TEXT_ALERT_CHANNEL">
                            <LookupDropDown name="channel" lookupKey="LIST_ALERT_CHANNELS" value={channel} allowAny={true} textAny="TEXT_ANY_CHANNEL"
                                onChange={this.handleChange} />
                        </SearchFilterField>
                    </Col>
                    <Col lg={6} xl={3}>
                        <SearchFilterField titleKey="TEXT_ALERT_START">
                            <DateTimePicker name="alertStartTime"
                                format={configService.getKendoDateTimeFormatByCurrentFormat() || configService.getDateTimeFormatConfigurationValue().kendoDateTimeFormat}
                                timeFormat={configService.getKendoTimeFormatByCurrentFormat()}
                                change={(e: any) => this.onDateChange(e, 'alertStartTime')}
                                value={new Date(alertStartTime)} />
                        </SearchFilterField>
                    </Col>
                    <Col lg={6} xl={3}>
                        <SearchFilterField titleKey="TEXT_ALERT_END" >
                            <DateTimePicker name="alertEndTime"
                                format={configService.getKendoDateTimeFormatByCurrentFormat() || configService.getDateTimeFormatConfigurationValue().kendoDateTimeFormat}
                                timeFormat={configService.getKendoTimeFormatByCurrentFormat()}
                                change={(e: any) => this.onDateChange(e, 'alertEndTime')}
                                value={new Date(alertEndTime)} />
                        </SearchFilterField>
                    </Col>
                    <Col lg={6} xl={3}>
                        <SearchFilterField titleKey="TEXT_EVENT_START">
                            <DateTimePicker name="eventStartTime"
                                format={configService.getKendoDateTimeFormatByCurrentFormat() || configService.getDateTimeFormatConfigurationValue().kendoDateTimeFormat}
                                timeFormat={configService.getKendoTimeFormatByCurrentFormat()}
                                change={(e: any) => this.onDateChange(e, 'eventStartTime')}
                                value={new Date(eventStartTime)} />
                        </SearchFilterField>
                    </Col>
                    <Col lg={6} xl={3}>
                        <SearchFilterField titleKey="TEXT_EVENT_END" >
                            <DateTimePicker name="eventEndTime"
                                format={configService.getKendoDateTimeFormatByCurrentFormat() || configService.getDateTimeFormatConfigurationValue().kendoDateTimeFormat}
                                timeFormat={configService.getKendoTimeFormatByCurrentFormat()}
                                change={(e: any) => this.onDateChange(e, 'eventEndTime')}
                                value={new Date(eventEndTime)} />
                        </SearchFilterField>
                    </Col>
                </Row>
            </>
        );
    }

    validateCriteria(criteria: AlertSearchCriteria): boolean {
        return criteria.contextCustomerId.length > 0;
    }

    onDateChange(event: any, name: string) {
        let time = new Date().toISOString();
        if (event.sender.value())
            time = event.sender.value().toISOString();
        let e = {
            target: {
                value: time,
                name: name
            }
        }
        this.setState(Object.assign(this.state, { [name]: time }), () => super.handleChange(e));
    }
}



// WEBPACK FOOTER //
// ./src/modules/eventAlarms/components/Alerts/AlertManagement/AlertFilterBox.tsx