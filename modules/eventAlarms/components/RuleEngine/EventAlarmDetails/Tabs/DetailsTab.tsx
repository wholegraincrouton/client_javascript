import * as React from "react";
import { Row, Col, Label, Input } from "reactstrap";
import { FormField, FormAuditField } from "src/modules/shared/components/Form";
import { localise, contextService, lookupService } from "src/modules/shared/services";
import CabinetList from "src/modules/cabinet/shared/Cabinet/CabinetList";
import { EventSources, EventSource } from "src/modules/eventAlarms/types/dto";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import { cabinetService } from "src/modules/cabinet/services/cabinet.service";
import { CabinetItem } from "src/modules/cabinet/types/dto";
import { ListItem, LookupItem } from "src/modules/shared/types/dto";
import { permissionService } from 'src/modules/shared/services/permission.service';
import SiteList from "src/modules/sites/shared/SiteList";

interface State {
    eventSource: EventSource;
    items?: CabinetItem[];
}

export class DetailsTab extends React.Component<DetailFormProps, State> {
    itemEvents: LookupItem[] = [];
    excludedPortalEvents: LookupItem[] = [];
    excludedCabinetEvents: LookupItem[] = [];

    constructor(props: DetailFormProps) {
        super(props);
        this.onEventSourceChange = this.onEventSourceChange.bind(this);
        this.onDeviceChange = this.onDeviceChange.bind(this);
        this.onItemCheckboxChange = this.onItemCheckboxChange.bind(this);
        this.onItemChange = this.onItemChange.bind(this);
        this.filterPortalEvents = this.filterPortalEvents.bind(this);
        this.filterCabinetEvents = this.filterCabinetEvents.bind(this);

        this.itemEvents = lookupService.getList("LIST_CABINET_ITEM_EVENTS");
        this.excludedPortalEvents = lookupService.getList("LIST_EXCLUDED_PORTAL_EVENTS_FOR_RULES");
        this.excludedCabinetEvents = lookupService.getList("LIST_EXCLUDED_CABINET_EVENTS_FOR_EVENT_RULES");

        let eventSource: EventSource = JSON.parse(props.initialValues["eventSource"] || "{}");


        this.state = {
            eventSource: {
                type: props.isNew ? EventSources.Web : eventSource.type,
                id: eventSource.id,
                isItemEvent: eventSource.isItemEvent,
                itemNumber: eventSource.itemNumber
            }
        }
    }

    componentDidMount() {
        const { eventSource } = this.state;
        if (eventSource.type == EventSources.Cabinet && eventSource.id) {
            cabinetService.getCabinet(eventSource.id).then((cabinet) => {
                this.setState({
                    ...this.state,
                    items: cabinet.items
                });
            });
        }
    }

    validateEventSource(value: string) {
        try {
            let eventSource: EventSource = JSON.parse(value || "{}");
            return (eventSource.type == EventSources.Site && eventSource.id == undefined) ||
                (eventSource.type == EventSources.Cabinet && (eventSource.id == undefined ||
                    (eventSource.id != undefined && eventSource.isItemEvent && eventSource.itemNumber == undefined))) ?
                localise("ERROR_FIELD_REQUIRED") : undefined;
        } catch (e) {
            return undefined;
        }
    }

    onEventSourceChange(event: any, inputProps: any) {
        const { props: formProps } = this;
        formProps.change("eventCode", "");
        this.setState({
            ...this.state,
            eventSource: { type: event.target.value, id: undefined, isItemEvent: false, itemNumber: undefined },
            items: undefined
        });

        let eventSource: EventSource = {
            type: event.target.value,
            id: undefined,
            isItemEvent: false,
            itemNumber: undefined
        };

        let e = {
            target: {
                value: JSON.stringify(eventSource)
            }
        };
        inputProps.onChange(e);
    }

    onDeviceChange(event: any, inputProps: any) {
        let cabinetId = event.target.value;

        if (this.state.eventSource.type == EventSources.Cabinet) {
            cabinetService.getCabinet(cabinetId).then((cabinet) => {
                this.setState({
                    ...this.state,
                    eventSource: {
                        ...this.state.eventSource,
                        id: cabinetId,
                        isItemEvent: false,
                        itemNumber: undefined
                    },
                    items: cabinet.items
                });
            });
        }
        else {
            this.setState({
                ...this.state,
                eventSource: {
                    ...this.state.eventSource,
                    id: cabinetId,
                    isItemEvent: false,
                    itemNumber: undefined
                },
                items: undefined
            });
        }

        let eventSource: EventSource = {
            type: this.state.eventSource.type,
            id: cabinetId,
            isItemEvent: false,
            itemNumber: undefined
        };

        let e = {
            target: {
                value: JSON.stringify(eventSource)
            }
        };
        inputProps.onChange(e);
    }

    onItemCheckboxChange(event: any, inputProps: any) {
        let value = !this.state.eventSource.isItemEvent;
        this.setState({
            ...this.state,
            eventSource: {
                ...this.state.eventSource,
                isItemEvent: value,
                itemNumber: undefined
            },
        });

        let eventSource: EventSource = {
            type: this.state.eventSource.type,
            id: this.state.eventSource.id,
            isItemEvent: value,
            itemNumber: undefined
        };

        let e = {
            target: {
                value: JSON.stringify(eventSource)
            }
        };
        inputProps.onChange(e);
    }

    onItemChange(event: any, inputProps: any) {
        this.setState({
            ...this.state,
            eventSource: { ...this.state.eventSource, itemNumber: event.target.value }
        });

        let eventSource: EventSource = {
            type: this.state.eventSource.type,
            id: this.state.eventSource.id,
            isItemEvent: true,
            itemNumber: event.target.value
        };

        let e = {
            target: {
                value: JSON.stringify(eventSource)
            }
        };
        inputProps.onChange(e);
    }

    filterPortalEvents(item: LookupItem) {
        return this.excludedPortalEvents && !this.excludedPortalEvents.some(i => i.value == item.value);
    }

    filterCabinetEvents(item: LookupItem) {
        const { eventSource } = this.state;
        return this.excludedCabinetEvents && !this.excludedCabinetEvents.some(i => i.value == item.value) &&
            (eventSource.isItemEvent || (this.itemEvents && !this.itemEvents.some(i => i.value == item.value)));
    }

    render() {
        const { item, isNew } = this.props;
        const { eventSource, items } = this.state;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');
        let itemList: ListItem[] = [];

        if (items) {
            for (let item of items) {
                if (item.name)
                    itemList.push({ id: item.number.toString(), name: item.name });
            }
        }

        return (
            <>
                <Row className="mb-3">
                    <Col>
                        <small className="text-muted"> {localise("TEXT_PAGE_DESCRIPTION")} </small>
                    </Col>
                    <Col md="auto">
                        <small className="text-muted"> {localise('TEXT_REQUIRED_FIELD')} </small>
                    </Col>
                </Row>

                <FormField name="eventSource" required={true} validate={this.validateEventSource} labelKey="TEXT_EVENT_SOURCE"
                    component={(props: any) =>
                        <Row className="event-source-row">
                            <Col className="web-column">
                                <Label>
                                    <Input {...props} type="radio" name="eventSource" value={EventSources.Web} disabled={!isNew}
                                        checked={eventSource.type == EventSources.Web} onChange={(e: any) => this.onEventSourceChange(e, props)} />
                                    {localise("TEXT_WEB")}
                                </Label>
                            </Col>
                            <Col className="cabinet-column">
                                <Label>
                                    <Input {...props} type="radio" name="eventSource" value={EventSources.Cabinet} disabled={!isNew}
                                        checked={eventSource.type == EventSources.Cabinet} onChange={(e: any) => this.onEventSourceChange(e, props)} />
                                    {localise("TEXT_CABINET")}
                                </Label>
                                <CabinetList {...props} customerId={contextService.getCurrentCustomerId()}
                                    value={eventSource.id} onChange={(e: any) => this.onDeviceChange(e, props)}
                                    disabled={!isNew || eventSource.type != EventSources.Cabinet} />
                                <small className="text-muted">{localise('REMARK_CABINET')}</small>
                                <br />
                                <Label className="item-checkbox-label" check>
                                    <Input type="checkbox" disabled={!isNew || eventSource.type != EventSources.Cabinet}
                                        checked={eventSource.isItemEvent} onChange={(e: any) => this.onItemCheckboxChange(e, props)} />
                                    <small className="text-muted">{localise('TEXT_ITEM_SPECIFIC_EVENT')}</small>
                                </Label>
                                {
                                    eventSource.isItemEvent &&
                                    <div>
                                        <Input type="select" onChange={(e: any) => this.onItemChange(e, props)} value={eventSource.itemNumber}
                                            className="item-input" disabled={!isNew}>
                                            <option value="" className="d-none"></option>
                                            <option value={-1}>{localise("TEXT_ANY")}</option>
                                            {
                                                itemList.map((i, key) => <option value={i.id} key={key}>{i.name}</option>)
                                            }
                                        </Input>
                                        <small className="text-muted">{localise('REMARK_SELECT_ITEM')}</small>
                                    </div>
                                }
                            </Col>
                            <Col className="cabinet-group-column">
                                <Label>
                                    <Input {...props} type="radio" name="eventSource" checked={eventSource.type == EventSources.Site}
                                        value={EventSources.Site} onChange={(e: any) => this.onEventSourceChange(e, props)}
                                        disabled={!isNew} />
                                    {localise("TEXT_SITE")}
                                </Label>
                                <SiteList {...props} customerId={contextService.getCurrentCustomerId()}
                                    value={eventSource.id} onChange={(e: any) => this.onDeviceChange(e, props)}
                                    disabled={!isNew || eventSource.type != EventSources.Site} />
                                <small className="text-muted">{localise('REMARK_SITE')}</small>
                            </Col>
                        </Row>
                    } />
                <FormField name="eventCode" labelKey="TEXT_EVENT" remarksKey="REMARK_EVENTS_EVENT" required={true}
                    component={(props: any) => <LookupDropDown {...props} disabled={!isNew}
                        lookupKey={eventSource.type == EventSources.Web ? "LIST_PORTAL_EVENTS" :
                            eventSource.isItemEvent ? "LIST_CABINET_ITEM_EVENTS" : "LIST_CABINET_HIGH_PRIORITY_EVENTS"}
                        filter={(eventSource.type == EventSources.Web && this.filterPortalEvents) ||
                            (eventSource.type != EventSources.Web && this.filterCabinetEvents)}
                        additionalLookups={eventSource.type != EventSources.Web &&
                            !eventSource.isItemEvent && ["LIST_CABINET_LOW_PRIORITY_EVENTS"]} />} />
                <FormField remarksKey="REMARK_EVENTS_REMARK" required={true} labelKey="TEXT_REMARK" name="remark" component={Input} disabled={ !isPermittedToEdit } />
                <FormAuditField updatedOnUtc={item.updatedOnUtc} updatedByName={item.updatedByName} />
            </>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/eventAlarms/components/RuleEngine/EventAlarmDetails/Tabs/DetailsTab.tsx