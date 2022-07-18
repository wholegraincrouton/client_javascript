import * as React from "react";
import { SearchFilterBox, SearchFilterBoxProps, SearchFilterField } from "../../../../shared/components/SearchFilterBox";
import { EventAlarmSearchCriteria, EventSources } from "../../../types/dto";
import { Col, Row } from "reactstrap";
import { contextService, lookupService } from "../../../../shared/services";
import { LookupDropDown } from "../../../../shared/components/LookupDropDown/LookupDropDown";
import CabinetList from "src/modules/cabinet/shared/Cabinet/CabinetList";
import { LookupItem } from "src/modules/shared/types/dto";
import SiteList from "src/modules/sites/shared/SiteList";

export class EventAlarmFilterBox extends SearchFilterBox<EventAlarmSearchCriteria> {
    excludedPortalEvents: LookupItem[] = [];
    excludedCabinetEvents: LookupItem[] = [];

    constructor(props: SearchFilterBoxProps) {
        super(props, {
            contextCustomerId: contextService.getCurrentCustomerId(),
            eventSource: 'any',
            event: 'any',
            cabinet: 'any',
            site: 'any'
        });

        this.onCustomerChange = this.onCustomerChange.bind(this);
        this.onEventSourceChange = this.onEventSourceChange.bind(this);
        this.filterPortalEvents = this.filterPortalEvents.bind(this);
        this.filterCabinetEvents = this.filterCabinetEvents.bind(this);

        this.excludedPortalEvents = lookupService.getList("LIST_EXCLUDED_PORTAL_EVENTS_FOR_RULES");
        this.excludedCabinetEvents = lookupService.getList("LIST_EXCLUDED_CABINET_EVENTS_FOR_EVENT_RULES");
    }

    onCustomerChange(event: any) {
        let name = event.target.name;
        let value = event.target.value;

        let e = { target: { name: name, value: value } };

        this.setState({
            ...this.state,
            [name]: value,
            eventSource: 'any',
            event: 'any',
            cabinet: 'any',
            site: 'any'
        }, () => super.handleChange(e));
    }

    onEventSourceChange(event: any) {
        let name = event.target.name;
        let value = event.target.value;

        let e = { target: { name: name, value: value } };

        this.setState({
            ...this.state,
            [name]: value,
            event: 'any',
            cabinet: 'any',
            site: 'any'
        }, () => super.handleChange(e));
    }

    filterPortalEvents(item: LookupItem) {
        return this.excludedPortalEvents && !this.excludedPortalEvents.some(i => i.value == item.value);
    }

    filterCabinetEvents(item: LookupItem) {
        return this.excludedCabinetEvents && !this.excludedCabinetEvents.some(i => i.value == item.value);
    }

    getFields(): JSX.Element {
        const { state } = this;

        return (
            <Row className="filter-fields">
                <Col lg={6} xl={2}>
                    <SearchFilterField titleKey="TEXT_EVENT_SOURCE">
                        <LookupDropDown name="eventSource" lookupKey="LIST_EVENT_SOURCES" value={state.eventSource}
                            allowAny={true} textAny="TEXT_ANY_EVENT_SOURCE" onChange={this.onEventSourceChange} />
                    </SearchFilterField>
                </Col>
                <Col lg={6} xl={2}>
                    <SearchFilterField titleKey="TEXT_EVENT">
                        <LookupDropDown name="event" value={state.event} onChange={this.handleChange}
                            allowAny={true} textAny="TEXT_ANY_EVENT"
                            filter={state.eventSource == EventSources.Web ? this.filterPortalEvents : this.filterCabinetEvents}
                            lookupKey={state.eventSource == "any" ? "" : state.eventSource == EventSources.Web ?
                                "LIST_PORTAL_EVENTS" : "LIST_CABINET_HIGH_PRIORITY_EVENTS"}
                            additionalLookups={(state.eventSource == EventSources.Site || state.eventSource == EventSources.Cabinet) ?
                                ["LIST_CABINET_LOW_PRIORITY_EVENTS"] : []} />
                    </SearchFilterField>
                </Col>
                {
                    state.eventSource == EventSources.Cabinet &&
                    <Col lg={6} xl={2}>
                        <SearchFilterField titleKey="TEXT_CABINET">
                            <CabinetList key={state.contextCustomerId} customerId={state.contextCustomerId} name="cabinet"
                                value={state.cabinet} onChange={this.handleChange} allowAny={true} textAny="TEXT_ANY_CABINET" />
                        </SearchFilterField>
                    </Col>
                }
                {
                    state.eventSource == EventSources.Site &&
                    <Col lg={6} xl={2}>
                        <SearchFilterField titleKey="TEXT_SITE">
                            <SiteList key={state.contextCustomerId} customerId={state.contextCustomerId} name="site"
                                allowAny={true} value={state.site} onChange={this.handleChange} />
                        </SearchFilterField>
                    </Col>
                }
            </Row>
        );
    }

    validateCriteria(criteria: EventAlarmSearchCriteria): boolean {
        return criteria.contextCustomerId.length > 0 && criteria.eventSource.length > 0 &&
            criteria.event.length > 0 && criteria.cabinet.length > 0 && criteria.site.length > 0;
    }
}



// WEBPACK FOOTER //
// ./src/modules/eventAlarms/components/RuleEngine/EventAlarmManagement/EventAlarmFilterBox.tsx