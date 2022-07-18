import * as React from "react";
import { SearchFilterBox, SearchFilterBoxProps, SearchFilterField } from "../../../../shared/components/SearchFilterBox";
import { EventPrioritySearchCriteria, EventPriorities } from "../../../types/dto";
import { Col, Row } from "reactstrap";
import { contextService, lookupService } from "../../../../shared/services";
import { LookupDropDown } from "../../../../shared/components/LookupDropDown/LookupDropDown";
import AutoCompleteSearchField from "src/modules/shared/components/AutoCompleteSearchField/AutoCompleteSearchField";

export class EventPriorityFilterBox extends SearchFilterBox<EventPrioritySearchCriteria> {
    eventTextList: string[] = [];
    constructor(props: SearchFilterBoxProps) {
        super(props, {
            contextCustomerId: contextService.getCurrentCustomerId(),
            priority: 'any',
            event: ''
        });
    }

    componentDidMount() {
        this.getData();
        super.componentDidMount();
    }

    componentDidUpdate(prevProps: any, prevState: any) {
        const prevCustomerId = prevProps.customerId;
        const prevPriority = prevState.priority;
        let customerId = contextService.getCurrentCustomerId();

        if (customerId != prevCustomerId || this.state.priority != prevPriority) {
            this.getData();
        }        
    }

    getData() {
        let customerId = contextService.getCurrentCustomerId();
        var lookupItems: any[] = [];
        this.eventTextList = [];

        switch (this.state.priority) {
            case EventPriorities.Any:
                lookupItems = lookupService.getListByCustomer(["LIST_CABINET_HIGH_PRIORITY_EVENTS", "LIST_CABINET_LOW_PRIORITY_EVENTS"], customerId);
                break;
            case EventPriorities.High:
                lookupItems = lookupService.getListByCustomer(["LIST_CABINET_HIGH_PRIORITY_EVENTS"], customerId);
                break;
            case EventPriorities.Low:
                lookupItems = lookupService.getListByCustomer(["LIST_CABINET_LOW_PRIORITY_EVENTS"], customerId);
                break;
        }

        lookupItems.forEach(item => {
            this.eventTextList.push(item.text);
        });             
    }

    getFields(): JSX.Element {
        const { state } = this;
        return (
            <Row className="filter-fields">
                <Col lg={6} xl={2}>
                    <SearchFilterField titleKey="TEXT_PRIORITY">
                        <LookupDropDown name="priority" lookupKey="LIST_EVENT_PRIORITIES" value={state.priority}
                            allowAny={true} textAny="TEXT_ANY_PRIORITY" onChange={this.handleChange} />
                    </SearchFilterField>
                </Col>
                <Col lg={6} xl={2}>
                    <SearchFilterField titleKey="TEXT_EVENT">
                        <AutoCompleteSearchField name="event" value={state.event} onChange={this.handleChange} data={this.eventTextList} />
                    </SearchFilterField>
                </Col>
            </Row>
        );
    }

    validateCriteria(criteria: EventPrioritySearchCriteria): boolean {
        return criteria.contextCustomerId.length > 0 && criteria.priority.length > 0;
    }

    handleChange(event: any) {
        const { name, value } = event.target;      
        this.setState(Object.assign({ ...this.state as any }, { [name]: value }));
    }
}



// WEBPACK FOOTER //
// ./src/modules/eventAlarms/components/Priority/EventPriorityManagement/EventPriorityFilterBox.tsx