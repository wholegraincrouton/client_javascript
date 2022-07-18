import * as React from "react";
import { Row, Col, Label, Input, Card, CardBody } from "reactstrap";
import { localise, confirmDialogService, lookupService, configService, permissionService } from "src/modules/shared/services";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { NewButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { AlarmConfig } from "src/modules/eventAlarms/types/dto";
import UserList from "src/modules/shared/components/UserList/UserList";
import { Grid, GridColumn, GridCellProps } from "@progress/kendo-react-grid";
import { EventSource } from "src/modules/eventAlarms/types/dto";
import { LookupItem, EventAlarmMapping } from "src/modules/shared/types/dto";

interface Props {
    defaultCloseEvents?: string[];
}

interface State {
    alarmConfig: AlarmConfig;
    closeEvents: GridEvent[];
    isItemEvent : boolean;
}

interface GridEvent {
    id: number;
    eventCode?: string;
    description?: string;
    isDefault: boolean;
}

export class AlarmTab extends React.Component<DetailFormProps & Props, State> {
    
    eventAlarmMappingList: EventAlarmMapping[] = [];
    
    constructor(props: DetailFormProps & Props) {
        super(props);

        //#region Bind event handlers

        this.onAlarmChange = this.onAlarmChange.bind(this);
        this.toggleCloseFromWeb = this.toggleCloseFromWeb.bind(this);
        this.toggleListOnCabinet = this.toggleListOnCabinet.bind(this);
        this.toggleShouldEscalate = this.toggleShouldEscalate.bind(this);
        this.onEscalationIntervalChange = this.onEscalationIntervalChange.bind(this);
        this.onUserChange = this.onUserChange.bind(this);
        this.onEventAdd = this.onEventAdd.bind(this);
        this.onEventChange = this.onEventChange.bind(this);
        this.onEventRemove = this.onEventRemove.bind(this);
        this.changeConfig = this.changeConfig.bind(this);
        this.filterAlarms = this.filterAlarms.bind(this);

        //#endregion

        this.eventAlarmMappingList = JSON.parse(configService.getConfigurationValue('EVENT_ALARM_MAPPINGS'));

        //#region Set initial state

        const alarmConfig = props.item.alarmConfiguration as AlarmConfig;
        let eventSource: EventSource = JSON.parse(props.initialValues["eventSource"] || "{}");
        this.state = {
            isItemEvent : eventSource.isItemEvent ? eventSource.isItemEvent : false,
            alarmConfig: {
                alarmName: (alarmConfig && alarmConfig.alarmName) || '',
                escalationAlertUsers: (alarmConfig && alarmConfig.escalationAlertUsers) || [],
                canCloseFromWeb: (alarmConfig && alarmConfig.canCloseFromWeb) || false,
                canHandleFromCabinet: (alarmConfig && alarmConfig.canHandleFromCabinet) || false,
                sendEscalationAlert: (alarmConfig && alarmConfig.sendEscalationAlert) || false,
                escalationInterval: (alarmConfig && alarmConfig.escalationInterval) || '',
                closeEvents: (alarmConfig && alarmConfig.closeEvents) || []
            },
            closeEvents: (alarmConfig && alarmConfig.closeEvents &&
                alarmConfig.closeEvents.map((e) => {
                    return {
                        id: alarmConfig.closeEvents.indexOf(e),
                        eventCode: e,
                        isDefault: (props.defaultCloseEvents &&
                            props.defaultCloseEvents.some(ev => ev == e)) || false
                    };
                })) || []
        }

        //#endregion
    }

    onAlarmChange(e: any) {
        const { alarmConfig, closeEvents } = this.state;
        let value = e.target.value;

        let newConfig: AlarmConfig = {
            ...alarmConfig,
            alarmName: value,
            canCloseFromWeb: !value ? false : alarmConfig.canCloseFromWeb,
            canHandleFromCabinet: !value ? false : alarmConfig.canHandleFromCabinet,
            sendEscalationAlert: !value ? false : alarmConfig.sendEscalationAlert,
            escalationInterval: value ? alarmConfig.escalationInterval : '',
            escalationAlertUsers: value ? alarmConfig.escalationAlertUsers : [],
            closeEvents: value ? alarmConfig.closeEvents : []
        };
        this.changeConfig(newConfig, value ? closeEvents : []);
    }

    toggleCloseFromWeb() {
        const { alarmConfig } = this.state;

        let newConfig: AlarmConfig = {
            ...alarmConfig,
            canCloseFromWeb: !alarmConfig.canCloseFromWeb,
        };
        this.changeConfig(newConfig);
    }

    toggleListOnCabinet() {
        const { alarmConfig } = this.state;

        let newConfig: AlarmConfig = {
            ...alarmConfig,
            canHandleFromCabinet: !alarmConfig.canHandleFromCabinet,
        };
        this.changeConfig(newConfig);
    }

    toggleShouldEscalate() {
        const { alarmConfig } = this.state;

        let newConfig: AlarmConfig = {
            ...alarmConfig,
            sendEscalationAlert: !alarmConfig.sendEscalationAlert,
            escalationInterval: '',
            escalationAlertUsers: []
        };
        this.changeConfig(newConfig);
    }

    onEscalationIntervalChange(e: any) {
        const { alarmConfig } = this.state;
        let value = e.target.value;

        let newConfig: AlarmConfig = {
            ...alarmConfig,
            escalationInterval: value
        };
        this.changeConfig(newConfig);
    }

    onUserChange(id: any, index: number) {
        const { alarmConfig } = this.state;
        const { props } = this;
        let users = alarmConfig.escalationAlertUsers;

        if (!id && index == 2) {
            users = [users[0], users[1]];
        }
        else if (!id && index == 1) {
            users = [users[0]];
        }
        else {
            users[index] = id;
        }

        let newConfig: AlarmConfig = {
            ...alarmConfig,
            escalationAlertUsers: users
        };

        props.change("escalationUsers", JSON.stringify(users));
        this.changeConfig(newConfig);
    }

    onEventAdd() {
        const { alarmConfig, closeEvents } = this.state;
        let events = [...closeEvents, { id: closeEvents.length, isDefault: false }];

        this.changeConfig({
            ...alarmConfig,
            closeEvents: events.map(e => e.eventCode || '')
        }, events);
    }

    onEventChange(e: any, id: number) {
        const { alarmConfig, closeEvents } = this.state;
        let event = closeEvents.find(e => e.id == id);

        if (event)
            event.eventCode = e.target.value;

        this.changeConfig({
            ...alarmConfig,
            closeEvents: closeEvents.map(e => e.eventCode || '')
        }, closeEvents);
    }

    onEventRemove(event: GridEvent) {
        confirmDialogService.showDialog('CONFIRMATION_ALARM_CLOSE_EVENT_REMOVE',
            () => {
                const { alarmConfig, closeEvents } = this.state;
                let index = closeEvents.indexOf(event);
                closeEvents.splice(index, 1);
                closeEvents.forEach(e => {
                    if (e.id > index)
                        e.id = e.id - 1;
                });

                this.changeConfig({
                    ...alarmConfig,
                    closeEvents: closeEvents.map(e => e.eventCode || '')
                }, closeEvents);
            });
    }

    changeConfig(alarm: AlarmConfig, closeEvents?: GridEvent[]) {
        const { props } = this;
        props.change("alarmConfiguration", alarm);

        this.setState({
            ...this.state,
            alarmConfig: alarm,
            closeEvents: closeEvents || this.state.closeEvents
        });
    }

    filterAlarms(el: LookupItem){
        const eventCode = this.props? this.props.item.eventCode : "";
        let eventObj = this.eventAlarmMappingList.find(e => e.eventCode == eventCode);
        if(eventObj){
            return eventObj.alarms.includes(el.value || '');
        }
        return false;
    }

    render() {
        const { item } = this.props;
        const { alarmConfig, closeEvents } = this.state;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');

        return (
            <Row>
                <Col>
                    <Row className="form-group mb-3">
                        <Col xl={5} lg={7}>
                            <Label>{localise("TEXT_ALARM")}*</Label>                            
                            <LookupDropDown lookupKey="LIST_ALARMS" filter={this.filterAlarms} value={alarmConfig.alarmName} allowBlank={true}
                                textBlank="TEXT_NA" onChange={this.onAlarmChange} disabled={!isPermittedToEdit} />
                            <small className="text-muted">{localise("REMARK_ALARM_SELECT")}</small>
                        </Col>
                    </Row>
                    <Row className="form-group mb-3">
                        <Col>
                            <Row>
                                <Col>
                                    <Label className="mb-0">{localise("TEXT_ALARM_LISTING_CLOSING")}</Label>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <small className="text-muted">{localise("REMARK_ALARM_LISTING_CLOSING")}</small>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Row>
                                        <Col>
                                            <Label check>
                                                <Input type="checkbox" checked={alarmConfig.canCloseFromWeb} onChange={this.toggleCloseFromWeb}
                                                    disabled={!alarmConfig.alarmName || !isPermittedToEdit} />
                                                <small className="text-muted alarm-option">{localise("REMARK_ALARM_CLOSE_WEB")}</small>
                                            </Label>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Label check>
                                                <Input type="checkbox" checked={alarmConfig.canHandleFromCabinet} onChange={this.toggleListOnCabinet}
                                                    disabled={!alarmConfig.alarmName || !isPermittedToEdit} />
                                                <small className="text-muted alarm-option">{localise("REMARK_ALARM_CLOSE_CABINET")}</small>
                                            </Label>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row className="form-group mb-3">
                        <Col>
                            <Row>
                                <Col>
                                    <Label className="mb-0">{localise("TEXT_ALARM_ESCALATION")}</Label>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <small className="text-muted">{localise("REMARK_ALARM_ESCALATION")}</small>
                                </Col>
                            </Row>
                            <Row className="mb-1">
                                <Col lg={4} md={6}>
                                    <Label check>
                                        <Input type="checkbox" checked={alarmConfig.sendEscalationAlert} onChange={this.toggleShouldEscalate}
                                            disabled={!alarmConfig.alarmName || !isPermittedToEdit} />
                                        <small className="text-muted alarm-option">{localise("TEXT_SEND_ESCALATION_ALERTS")}</small>
                                    </Label>
                                </Col>
                                <Col lg={4} md={6}>
                                    <LookupDropDown lookupKey="LIST_ESCALATION_INTERVALS" value={alarmConfig.escalationInterval} textBlank="TEXT_NA"
                                        disabled={!alarmConfig.alarmName || !alarmConfig.sendEscalationAlert || !isPermittedToEdit} onChange={this.onEscalationIntervalChange} />
                                    <small className="text-muted">{localise("REMARK_ESCALATION_TIME_INTERVAL")}</small>
                                </Col>
                            </Row>
                            <Row>
                                <Col lg={4} md={6}>
                                    <Label className="user-label">{localise("TEXT_USER")} 1</Label>
                                    <UserList customerId={item.customerId} value={alarmConfig.escalationAlertUsers[0]} onChange={(id) => this.onUserChange(id, 0)}
                                        disabled={!alarmConfig.alarmName || !alarmConfig.sendEscalationAlert || !alarmConfig.escalationInterval || !isPermittedToEdit} textBlank="TEXT_NA" />
                                    <small className="text-muted">{localise("REMARK_ESCALATION_ALERT_USER_1")}</small>
                                </Col>
                                <Col lg={4} md={6}>
                                    <Label className="user-label">{localise("TEXT_USER")} 2</Label>
                                    <UserList customerId={item.customerId} value={alarmConfig.escalationAlertUsers[1]} onChange={(id) => this.onUserChange(id, 1)}
                                        disabled={!alarmConfig.alarmName || !alarmConfig.sendEscalationAlert || !alarmConfig.escalationInterval ||
                                            !alarmConfig.escalationAlertUsers[0] || !isPermittedToEdit} allowBlank={true} textBlank="TEXT_NA" />
                                    <small className="text-muted">{localise("REMARK_ESCALATION_ALERT_USER_2")}</small>
                                </Col>
                                <Col lg={4} md={6}>
                                    <Label className="user-label">{localise("TEXT_USER")} 3</Label>
                                    <UserList customerId={item.customerId} value={alarmConfig.escalationAlertUsers[2]} onChange={(id) => this.onUserChange(id, 2)}
                                        disabled={!alarmConfig.alarmName || !alarmConfig.sendEscalationAlert || !alarmConfig.escalationInterval ||
                                            !alarmConfig.escalationAlertUsers[0] || !alarmConfig.escalationAlertUsers[1] || !isPermittedToEdit} allowBlank={true} textBlank="TEXT_NA" />
                                    <small className="text-muted">{localise("REMARK_ESCALATION_ALERT_USER_3")}</small>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row className="form-group mb-1">
                        <Col>
                            <Row>
                                <Col>
                                    <Label>{localise("TEXT_ALARM_CLOSING_EVENTS")}</Label>
                                </Col>
                            </Row>
                            <Row className="mb-2">
                                <Col>
                                    <small className="text-muted">{localise("REMARK_ALARM_CLOSING_EVENTS")}</small>
                                </Col>
                                <Col className="text-right">
                                    <NewButton onClick={this.onEventAdd} disabled={!alarmConfig.alarmName ||
                                        closeEvents.some(e => !e.eventCode) || !isPermittedToEdit} />
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    {
                                        closeEvents.length > 0 ?
                                            <Grid data={closeEvents} sortable={false}>
                                                <GridColumn field="eventCode" title={localise("TEXT_EVENT")}
                                                    cell={GetEventCell(this.onEventChange, item.eventCode, this.state.isItemEvent)} />
                                                <GridColumn field="description" title={localise("TEXT_DESCRIPTION")}
                                                    cell={GetDescriptionCell()} />
                                                <GridColumn width="60px" cell={GetDeleteCell(this.onEventRemove)} />
                                            </Grid>
                                            :
                                            <Card className="mb-0">
                                                <CardBody>
                                                    <div className="text-muted text-center">{localise("ERROR_SEARCH_RESULT")}</div>
                                                </CardBody>
                                            </Card>
                                    }
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}

function GetEventCell(onChange: any, parentEvent: string, isItemEvent : boolean) {
    return class extends React.Component<GridCellProps> {
        render() {
            let lookupKey =  isItemEvent ? 'LIST_CABINET_ITEM_EVENTS' : 'LIST_CABINET_HIGH_PRIORITY_EVENTS';
            let additionalLookup = isItemEvent ? '' : 'LIST_CABINET_LOW_PRIORITY_EVENTS';
            return (                
                <td>
                    <LookupDropDown lookupKey={lookupKey} disabled={this.props.dataItem['isDefault']}
                        value={this.props.dataItem['eventCode']} onChange={(e) => onChange(e, this.props.dataItem['id'])}
                        filter={(e) => { return (e.value != parentEvent) }} additionalLookups={[additionalLookup]} />
                    <div id='errorDiv' />
                </td>
            )
        }
    };
}

function GetDescriptionCell() {
    return class extends React.Component<GridCellProps> {
        render() {
            return (
                <td>
                    {
                        this.props.dataItem['eventCode'] &&
                        <span>
                            {lookupService.getRemarkFromMultipleLookups(["LIST_CABINET_HIGH_PRIORITY_EVENTS",
                                "LIST_CABINET_LOW_PRIORITY_EVENTS"], this.props.dataItem['eventCode'])}
                        </span>
                    }
                </td>
            )
        }
    };
}

function GetDeleteCell<T>(deleteHandler: (item: T) => void) {
    return class extends React.Component<GridCellProps> {
        render() {
            const item = this.props.dataItem;

            return (
                <td className="pl-4">
                    {
                        !item.isDefault &&
                        <i className="fa fa-times text-danger" aria-hidden="true"
                            onClick={(e: any) => { e.preventDefault(); e.stopPropagation(); deleteHandler(item); }} />
                    }
                </td>
            );
        }
    }
}



// WEBPACK FOOTER //
// ./src/modules/eventAlarms/components/RuleEngine/EventAlarmDetails/Tabs/AlarmTab.tsx