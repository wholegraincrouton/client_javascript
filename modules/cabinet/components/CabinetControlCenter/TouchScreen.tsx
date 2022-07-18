import * as React from "react";
import { SimulationMode, TouchScreenMode, CabinetDoorStatus, KeypadOptions, CabinetPowerStatus, CabinetNetworkStatus, Alarm, CabinetAlarmStatus } from "../../types/dto";
import { Button, Row, Card, CardBody, CardHeader, CardFooter } from "reactstrap";
import { localise, configService } from "../../../shared/services";
import { VirtualCabinetItem, CabinetItemEvent, CabinetEvent } from "../../types/store";
import ItemActivityControl from "./TouchPanelMenuItem/ItemActivity/ItemActivityControl";
import { touchScreenCommonService } from "./shared/touch-screen-util.service";
import MenuPanel from "./TouchPanelMenuItem/MenuPanel";
import Col from "reactstrap/lib/Col";
import ItemHistory from "./TouchPanelMenuItem/ItemHistory";
import EventHistory from "./TouchPanelMenuItem/EventHistory";
import CabinetTimer from "./CabinetTimer";
import { History } from "history";
import { NotificationPanel } from "./TouchPanelMenuItem/NotificationPanel";
import CabinetLogin from "./TouchPanelMenuItem/CabinetLogin/CabinetLogin";
import AboutCabinet from "./TouchPanelMenuItem/AboutCabinet";
import Maintenance from "src/modules/cabinet/components/CabinetControlCenter/TouchPanelMenuItem/Maintenance";
import { CabinetAlarmManagement } from "src/modules/cabinet/components/CabinetControlCenter/TouchPanelMenuItem/CabinetAlarmManagement";

export interface Props {
    cabinetId?: string;
    linked: boolean,
    simulationMode: SimulationMode,
    userLoggedIn?: boolean,
    doorStatus?: CabinetDoorStatus;
    loggedInUser?: string,
    autoProvision?: () => void
    touchScreenMode?: TouchScreenMode;
    onReturn?: () => void;
    items?: VirtualCabinetItem[];
    isMultiCustodyLogin?: boolean;
    multiCustodyWitnessCount?: number;
    multiCustodyLoginSuccessCount?: number;
    item?: VirtualCabinetItem;
    itemHistory?: CabinetItemEvent[];
    touchScreenEventHistory?: CabinetEvent[];
    hasMoreItemEvents?: boolean;
    hasMoreTouchScreenCabinetEvents?: boolean;
    itemPageToken?: string;
    eventPageToken?: string;
    touchScreenPopupMessage?: string;
    loadItemEvents: (cabinetId: string, itemIndex: number,
        isLoadMore: boolean, pageToken?: string) => void;
    loadTouchScreenCabinetEvents: (filter: string, cabinetId: string,
        isLoadMore: boolean, pageToken?: string) => void;
    clearItemEventHistory: () => void;
    clearTouchScreenEventHistory: () => void;
    history: History;
    cabinetPowerStatus?: CabinetPowerStatus;
    cabinetNetworkStatus?: CabinetNetworkStatus;
    alarms?: Alarm[];
    timeOffset?: number;
}

export interface State {
    keypadOptions?: KeypadOptions;
}

export default class TouchScreen extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {};
        this.onChangeKeyPad = this.onChangeKeyPad.bind(this);
        this.onBackClick = this.onBackClick.bind(this);
    }

    onChangeKeyPad(keypadOptions: KeypadOptions) {
        this.setState({ ...this.state, keypadOptions: keypadOptions });
    }

    onBackClick() {
        if (this.state.keypadOptions && this.state.keypadOptions.on) {
            this.setState({ ...this.state, keypadOptions: { on: false, controlId: '', label: '', remark: '', type: '' } });
        }
        else {
            this.props.onReturn && this.props.onReturn();
        }
    }

    render() {
        let { keypadOptions } = this.state;

        let { linked, simulationMode, autoProvision, userLoggedIn, cabinetId, isMultiCustodyLogin,
            cabinetPowerStatus, cabinetNetworkStatus, multiCustodyWitnessCount, multiCustodyLoginSuccessCount,
            item, itemHistory, touchScreenEventHistory, touchScreenMode, alarms, hasMoreItemEvents,
            hasMoreTouchScreenCabinetEvents, itemPageToken, eventPageToken, loadItemEvents, loadTouchScreenCabinetEvents,
            clearItemEventHistory, clearTouchScreenEventHistory, doorStatus, history, touchScreenPopupMessage, timeOffset } = this.props;

        let screenSubtitle = (item && item.name) || touchScreenCommonService.getScreenSubtitle(touchScreenMode);

        if (cabinetId == undefined)
            return null;

        const logoURL = configService.getConfigurationValue('URL_IMG_LOGO_PRODUCT_BG_WHITE_HORIZONTAL', '*', '*');

        return (
            <Card className="vc-panel screen-panel">
                <CardHeader>
                    <Row>
                        <Col>
                            {
                                ((touchScreenMode == TouchScreenMode.LOGIN_SCREEN && keypadOptions && keypadOptions.on) ||
                                    !(touchScreenMode == TouchScreenMode.MAIN_MENU || touchScreenMode == TouchScreenMode.DISPLAY_NOTIFICATION ||
                                        touchScreenMode == TouchScreenMode.LOGIN_SCREEN)) &&
                                <img className="header-icon" src="/images/svg/virtual-cabinet/vc-back.svg" onClick={this.onBackClick} />
                            }
                            {
                                alarms && alarms.find(a => a.status == CabinetAlarmStatus.Active && a.canListAtCabinet) != undefined &&
                                <img className="header-icon" src="/images/svg/virtual-cabinet/vc-notification.svg" />
                            }
                            <img className="header-icon" src={`/images/svg/virtual-cabinet/vc-${
                                cabinetNetworkStatus == undefined || cabinetNetworkStatus == CabinetNetworkStatus.NoCommunication ? "disconnect" : "connect"}.svg`} />
                        </Col>
                        <Col className="text-center">
                            <img className="header-logo" src={logoURL} />
                        </Col>
                        <Col className="text-right">
                            {
                                (cabinetPowerStatus && (cabinetPowerStatus == CabinetPowerStatus.AC || cabinetPowerStatus == CabinetPowerStatus.AC_Battery)) ?
                                    <span><i className="fas fa-plug color-blue mr-2" /></span> :
                                    (cabinetPowerStatus && (cabinetPowerStatus == CabinetPowerStatus.POE || cabinetPowerStatus == CabinetPowerStatus.Battery_POE)) ?
                                        <img className="header-icon" src="/images/svg/virtual-cabinet/vc-poe.svg" /> : <></>
                            }
                            <img className="header-icon vc-battry" src="/images/svg/virtual-cabinet/vc-battry.svg" />
                            <span className="vc-time">11.30</span>
                        </Col>
                    </Row>
                    <Row className="bg-blue p-1">
                        <h5 className="m-0">{touchScreenCommonService.getScreenTitle(this.props.touchScreenMode)}</h5>
                    </Row>
                </CardHeader>
                <CardBody>
                    <div>
                        {
                            linked &&
                            <div>
                                {
                                    screenSubtitle &&
                                    <Row className={this.props.touchScreenMode == TouchScreenMode.ITEM_HISTORY_ITEM ? "" : "mb-3"}>
                                        <Col className="text-center">
                                            <span> {screenSubtitle} </span>
                                        </Col>
                                    </Row>
                                }
                                {
                                    touchScreenPopupMessage &&
                                    <Row className={"mb-3"}>
                                        <Col className="text-center">
                                            <span> {touchScreenPopupMessage} </span>
                                        </Col>
                                    </Row>
                                }
                                {
                                    isMultiCustodyLogin &&
                                    <Row className="mb-3">
                                        <Col className="text-center">
                                            <h5><span> {localise('TEXT_USER')} {multiCustodyLoginSuccessCount != undefined ? multiCustodyLoginSuccessCount + 1 : 1}/{multiCustodyWitnessCount}</span></h5>
                                        </Col>
                                    </Row>
                                }
                            </div>
                        }
                        {
                            linked && userLoggedIn && !isMultiCustodyLogin &&
                            (this.props.touchScreenMode == TouchScreenMode.MAIN_MENU && <MenuPanel history={this.props.history} />) ||
                            ((this.props.touchScreenMode == TouchScreenMode.RETURN_ITEM ||
                                this.props.touchScreenMode == TouchScreenMode.RETRIEVE_ITEM ||
                                this.props.touchScreenMode == TouchScreenMode.RETURN_OVERRIDE ||
                                this.props.touchScreenMode == TouchScreenMode.ITEM_HISTORY) && <ItemActivityControl history={this.props.history} />) ||
                            (this.props.touchScreenMode == TouchScreenMode.ITEM_HISTORY_ITEM && item &&
                                <ItemHistory cabinetId={cabinetId} item={item} itemHistory={itemHistory} hasMoreEvents={hasMoreItemEvents}
                                    pageToken={itemPageToken} loadItemEvents={loadItemEvents} clearEventHistory={clearItemEventHistory} timeOffset={timeOffset} />) ||
                            (this.props.touchScreenMode == TouchScreenMode.EVENT_HISTORY &&
                                <EventHistory cabinetId={cabinetId} eventHistory={touchScreenEventHistory} hasMoreEvents={hasMoreTouchScreenCabinetEvents}
                                    pageToken={eventPageToken} loadEvents={loadTouchScreenCabinetEvents} clearEventHistory={clearTouchScreenEventHistory} timeOffset={timeOffset} />) ||
                            (this.props.touchScreenMode == TouchScreenMode.MAINTENANCE && <Maintenance history={this.props.history} />) ||
                            (this.props.touchScreenMode == TouchScreenMode.ALARM_MANAGEMENT && <CabinetAlarmManagement cabinetId={cabinetId} timeOffset={timeOffset} />) ||
                            (this.props.touchScreenMode == TouchScreenMode.ABOUT_CABINET && <AboutCabinet />)
                        }
                        {
                            linked && ((!userLoggedIn && (simulationMode != SimulationMode.VirtualCabinet ||
                                doorStatus == CabinetDoorStatus.Close)) || isMultiCustodyLogin) &&
                            <CabinetLogin keypadOptions={keypadOptions} onChangeKeyPad={this.onChangeKeyPad}
                                simulationMode={simulationMode} history={history} isMultiCustodyLogin={isMultiCustodyLogin} />
                        }
                        {
                            linked && simulationMode == SimulationMode.VirtualCabinet && !userLoggedIn && doorStatus == CabinetDoorStatus.Open &&
                            <NotificationPanel notificationMessage={localise("ERROR_CABINET_DOOR_OPEN")} />
                        }
                        {
                            !linked && simulationMode == SimulationMode.VirtualCabinet &&
                            <Button className="start-button" color='primary' onClick={autoProvision}>{localise('BUTTON_START')}</Button>
                        }
                        {
                            (!linked && simulationMode != SimulationMode.VirtualCabinet) && localise('ERROR_CABINET_IS_NOT_CONNECTED')
                        }
                    </div>
                </CardBody>
                <CardFooter>
                    <div className="card-footer-top bg-blue"></div>
                    {linked && userLoggedIn && simulationMode == SimulationMode.VirtualCabinet && doorStatus == CabinetDoorStatus.Open &&
                        <div className="card-footer-bottom">
                            {
                                <Row>
                                    <Col className="text-center">
                                        <CabinetTimer />
                                    </Col>
                                </Row>
                            }
                        </div>
                    }
                    {linked && simulationMode == SimulationMode.Mirror &&
                        <Row>
                            <Col className="text-center message-red">
                                {localise('TEXT_CABINET_IN_MIRROR_MODE')}
                            </Col>
                        </Row>
                    }
                </CardFooter>
            </Card>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetControlCenter/TouchScreen.tsx