import * as React from "react";
import { Row, Col, Label, Button, Card, CardHeader, CardBody, CardFooter } from "reactstrap";
import {
    SimulationMode, CabinetDoorStatus, CabinetPowerStatus, CabinetNetworkStatus,
    CabinetItemStatus, CabinetRelayStatus, TouchScreenMode
} from "../../../types/dto";
import { VirtualCabinetItem, VirtualCabinetRelay } from "../../../types/store";
import './key-panel.css'
import { localise, navService } from "../../../../shared/services";
import { touchScreenCommonService } from "../shared/touch-screen-util.service";
import { History } from "history"
import { cabinetPermissionService } from "../shared/cabinet-permission-service";

export interface Props {
    linked?: boolean;
    userLoggedIn?: boolean;
    loggedInUserId?: string;
    loggedInUserName?: string;
    simulationMode?: SimulationMode;
    doorStatus?: CabinetDoorStatus;
    history: History;
    powerStatus?: CabinetPowerStatus;
    networkStatus?: CabinetNetworkStatus;
    items?: VirtualCabinetItem[];
    relays?: VirtualCabinetRelay[];
    toggleDoor: (status: CabinetDoorStatus, callbackFunction: () => any, userId?: string) => void;
    togglePower: (status: CabinetPowerStatus, userId?: string) => void;
    toggleNetwork: (status: CabinetNetworkStatus, userId?: string) => void;
    toggleItem: (item: VirtualCabinetItem, status: CabinetItemStatus, userId?: string, userName?: string) => void;
    blinkItemIndex?: number;
    touchScreenMode?: TouchScreenMode;
    canOpenDoor?: boolean;
    showPanel?: boolean;
}

export class KeyPanel extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
        this.toggleDoor = this.toggleDoor.bind(this);
        this.togglePower = this.togglePower.bind(this);
        this.toggleNetwork = this.toggleNetwork.bind(this);
        this.keyClick = this.keyClick.bind(this);
    }

    toggleDoor() {
        const { doorStatus, toggleDoor, loggedInUserId } = this.props;
        var newStatus = doorStatus == CabinetDoorStatus.Open ? CabinetDoorStatus.Close : CabinetDoorStatus.Open;
        toggleDoor(newStatus, () => { navService.goBackToListPage("/cabinet/cabinetmanagement", this.props.history) }, loggedInUserId);
    }

    togglePower(event: any) {
        const { togglePower, loggedInUserId } = this.props;
        togglePower(parseInt(event.target.value), loggedInUserId);
    }

    toggleNetwork(event: any) {
        const { toggleNetwork, loggedInUserId } = this.props;
        toggleNetwork(parseInt(event.target.value), loggedInUserId);
    }

    keyClick(e: any) {
        const { items, toggleItem, loggedInUserId, loggedInUserName } = this.props;
        let data = e.target.value.split(':');
        let index = data[0];

        if (items) {
            let item = items[index - 1];
            let newStatus = this.getNewItemStatus(item.currentStatus);
            toggleItem(item, newStatus, loggedInUserId, loggedInUserName);
        }
    }

    getNewItemStatus(status: CabinetItemStatus) {
        switch (status) {
            case CabinetItemStatus.Available:
                return CabinetItemStatus.Removed;
            case CabinetItemStatus.Removed:
            case CabinetItemStatus.Overdue:
                return CabinetItemStatus.Available;
        }
        return CabinetItemStatus.Disabled;
    }

    generateKeypad(readonly: boolean) {
        const { items } = this.props;

        if (items == undefined)
            return null;

        let divider = 5;
        if (items.length == 12) {
            divider = 4
        }

        let keys = [];
        let cols = [];
        for (let i = 1; i <= items.length; i++) {
            var key = items[i - 1];
            let buttonColor = touchScreenCommonService.getItemButtonColor(key);

            cols.push(
                <Col key={'c-' + i} className="">
                    <Button className={this.props.blinkItemIndex == i ? this.getItemBlinkCssClass(key) : ''} onClick={this.keyClick}
                        style={{ backgroundColor: buttonColor, borderColor: buttonColor, opacity: 100 }}
                        value={key.itemIndex + ':' + key.hardwareId} disabled={readonly || key.status == CabinetItemStatus.Disabled
                            || key.status == CabinetItemStatus.MultiCustody}>
                        {key.itemIndex}
                    </Button>
                </Col>)

            if (i > 0 && i % divider == 0) {
                keys.push(<Row key={'r-' + (i / divider)} className="key-panel-row"> {cols} </Row>);
                cols = [];
            }
        }

        if (cols.length > 0)
            keys.push(<Row key={'r-' + ((items.length + divider) / divider)} className="key-panel-row"> {cols} </Row>);

        return keys;
    }

    getItemBlinkCssClass(key: VirtualCabinetItem) {
        switch (key.status) {
            case CabinetItemStatus.Available:
                return 'blink-available';
            case CabinetItemStatus.Removed:
                return 'blink-unavailable';
            case CabinetItemStatus.Disabled:
                return 'blink-disable';
            case CabinetItemStatus.MultiCustody:
                return 'blink-multicustody';
            case CabinetItemStatus.Overdue:
                return 'blink-overdue';
            case CabinetItemStatus.itemGrouped:
                return 'blink-intelock';
        }
        return 'blink-unavailable';
    }

    generateRelays() {
        const { relays } = this.props;
        if (relays == undefined || relays.length == 0)
            return null;

        let buttons = []

        for (let i = 1; i <= relays.length; i++) {
            var relay = relays[i - 1];

            let buttonStyle = relay.status == CabinetRelayStatus.On ? 'primary' : 'dark';

            buttons.push(
                <Button className="cabinet-panel-button cabinet-relay-button" color={buttonStyle} value={relay.relayIndex} disabled={true}>
                    {relay.relayIndex}
                </Button>
            )
        }

        return buttons;
    }

    render() {
        const { doorStatus, powerStatus, networkStatus, simulationMode, userLoggedIn, showPanel } = this.props;

        let isMirrorMode = simulationMode == SimulationMode.Mirror;
        let cabinetitemsReadOnly = (!userLoggedIn && doorStatus == CabinetDoorStatus.Open);
        let canDoorOpen = cabinetPermissionService.canPermissionGrant('DEV_CAB_DOOR_OPEN');
        let canAccessUSB = cabinetPermissionService.canPermissionGrant('DEV_CAB_ACCESS_CABINET_USB_PORT');

        return (
            <Card className="vc-panel cabinet-panel">
                {
                    showPanel &&
                    <>
                        <CardHeader>
                            <Row>
                                <Col xs={6} md={4} lg={6}>
                                    <Label className="system-label mt-1">{localise('TEXT_DOOR')}</Label>
                                </Col>
                                <Col xs={6} md={8} lg={6} className="text-right">
                                    <Button className="cabinet-panel-button" color={doorStatus == CabinetDoorStatus.Open ? 'danger' : 'primary'}
                                        disabled={isMirrorMode || (!userLoggedIn && doorStatus != CabinetDoorStatus.Open) || userLoggedIn && !canDoorOpen}
                                        onClick={this.toggleDoor}>{doorStatus == CabinetDoorStatus.Open ? localise('BUTTON_CLOSE') : localise('BUTTON_OPEN')}</Button>
                                </Col>
                            </Row>
                        </CardHeader>
                        <CardBody>
                            <Row className="vc-usb-row">
                                <Col lg={4} className="cabinet-panel-label">
                                    <Label className="system-label mb-0">{localise('TEXT_CABINET_PANEL')}</Label>
                                </Col>
                                <Col className="usb-port-label">
                                    <Label>{localise('TEXT_USB_PORT')}</Label>
                                </Col>
                                <Col className="usb-port-button">
                                    <Button className="cabinet-panel-button"
                                        disabled={isMirrorMode} color={canAccessUSB ? 'success' : 'danger'}>
                                        {canAccessUSB ? localise('TEXT_ENABLED') : localise('TEXT_DISABLED')}
                                    </Button>
                                </Col>
                            </Row>
                            <Row className="vc-items-row">
                                <Col className="vc-items-container">
                                    {(doorStatus == CabinetDoorStatus.Open || isMirrorMode) && this.generateKeypad(cabinetitemsReadOnly || isMirrorMode)}
                                </Col>
                            </Row>
                        </CardBody>
                        <CardFooter>
                            <Row className="vc-toggle-row mb-2">
                                <Col lg={5} className="cabinet-hardware-label">
                                    <Label className="system-label">{localise('TEXT_CABINET_HARDWARE')}</Label>
                                </Col>
                            </Row>
                            <Row className="vc-button-row mb-2">
                                <Col className="pt-2 pr-0" lg={3}>
                                    <Label>{localise('TEXT_POWER')}</Label>
                                </Col>
                                <Col className="vc-button-column" lg={9}>
                                    <Button value={CabinetPowerStatus.NoPower} disabled={isMirrorMode || powerStatus == CabinetPowerStatus.NoPower}
                                        className="cabinet-panel-button" color={powerStatus == CabinetPowerStatus.NoPower ? 'primary' : 'dark'}
                                        onClick={this.togglePower}>{localise('BUTTON_NO_POWER')}</Button>
                                    <Button value={CabinetPowerStatus.AC} className="cabinet-panel-button" disabled={isMirrorMode}
                                        color={powerStatus == CabinetPowerStatus.AC || powerStatus == CabinetPowerStatus.AC_Battery ? 'primary' : 'dark'}
                                        onClick={this.togglePower}>{localise('BUTTON_AC')}</Button>
                                    <Button value={CabinetPowerStatus.Battery} className="cabinet-panel-button"
                                        color={powerStatus == CabinetPowerStatus.Battery || powerStatus == CabinetPowerStatus.AC_Battery ||
                                            powerStatus == CabinetPowerStatus.Battery_POE ? 'primary' : 'dark'} disabled={isMirrorMode}
                                        onClick={this.togglePower}>{localise('BUTTON_BATTERY')}</Button>
                                    <Button value={CabinetPowerStatus.POE} className="cabinet-panel-button" disabled={isMirrorMode}
                                        color={powerStatus == CabinetPowerStatus.POE || powerStatus == CabinetPowerStatus.Battery_POE ? 'primary' : 'dark'}
                                        onClick={this.togglePower}>{localise('BUTTON_POE')}</Button>
                                </Col>
                            </Row>
                            <Row className="vc-button-row mb-2">
                                <Col className="pt-2 pr-0" lg={3}>
                                    <Label> {localise('TEXT_NETWORK')} </Label>
                                </Col>
                                <Col className="vc-button-column" lg={9}>
                                    <Button value={CabinetNetworkStatus.NoCommunication} className="cabinet-panel-button"
                                        color={networkStatus == CabinetNetworkStatus.NoCommunication ? 'primary' : 'dark'}
                                        disabled={isMirrorMode || networkStatus == CabinetNetworkStatus.NoCommunication}
                                        onClick={this.toggleNetwork}> {localise('BUTTON_NO_COMMUNICATION')} </Button>

                                    <Button value={CabinetNetworkStatus.LAN} className="cabinet-panel-button"
                                        color={networkStatus == CabinetNetworkStatus.LAN ? 'primary' : 'dark'}
                                        disabled={isMirrorMode} onClick={this.toggleNetwork}> {localise('BUTTON_LAN')} </Button>

                                    <Button value={CabinetNetworkStatus.WIFI} className="cabinet-panel-button"
                                        color={networkStatus == CabinetNetworkStatus.WIFI ? 'primary' : 'dark'}
                                        disabled={isMirrorMode} onClick={this.toggleNetwork}> {localise('BUTTON_WIFI')} </Button>

                                    <Button value={CabinetNetworkStatus.LTE_4G} className="cabinet-panel-button"
                                        color={networkStatus == CabinetNetworkStatus.LTE_4G ? 'primary' : 'dark'}
                                        disabled={isMirrorMode} onClick={this.toggleNetwork}> {localise('BUTTON_4G')} </Button>
                                </Col>
                            </Row>
                            <Row className="vc-button-row">
                                <Col className="pt-2 pr-0" lg={3}>
                                    <Label> {localise('TEXT_RELAY')} </Label>
                                </Col>
                                <Col className="vc-button-column" lg={9}>
                                    {this.generateRelays()}
                                </Col>
                            </Row>
                        </CardFooter>
                    </>
                }
            </Card>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetControlCenter/KeyPanel/KeyPanel.tsx