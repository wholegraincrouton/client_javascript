import * as React from "react";
import { History } from "history";
import { Card, CardBody, Row, Col } from "reactstrap";
import { BackButton } from "../../../shared/components/ActionButtons/ActionButtons";
import { localise, navService, lookupService, confirmDialogService } from "../../../shared/services";
import { cabinetPermissionService } from "./shared/cabinet-permission-service";
import { cabinetTimerService } from "./shared/cabniet-timer.service";
import { filterScreenCommonService } from "./shared/filter-screen-util.service";
import { eventRuleService } from "./shared/event-rule-service";
import { cabinetControlCenterService } from "../../services/cabinetControlCenter.service";
import TouchScreen from "./TouchScreen";
import KeyPanel from "./KeyPanel/KeyPanelContainer";
import CabinetControlCenterHeader from "./CabinetControlCenterHeader";
import CabinetControlCenterFilter from "./CabinetControlCenterFilter";
import CabinetControlCenterEventFilter from "./CabinetControlCenterEventFilter/CabinetControlCenterEventFilter";
import { VirtualCabinetItem, CabinetEvent, CabinetItemEvent } from "../../types/store";
import {
    SimulationMode, CabinetDoorStatus, CabinetPowerStatus, CabinetTwinPropertyDto,
    CabinetItemStatus, CabinetConst, CabinetKeypadStatus, CabinetNetworkStatus,
    CabinetRelayStatus, TouchScreenMode, Alarm, CabinetProvisioningStatus, AlarmTypes, CabinetAlarmStatus
} from "../../types/dto";
import "./cabinet-control-center.css";
import { dateTimeUtilService } from "src/modules/shared/services/datetime-util.service";

export interface Props {
    cabinetId?: string;
    hardwareId?: string;
    provisioningKey?: string;
    provisioningStatus?: CabinetProvisioningStatus;
    itemCount?: number;
    linked?: boolean;
    userLoggedIn?: boolean;
    loggedInUser?: string;
    doorStatus?: CabinetDoorStatus;
    simulationMode?: SimulationMode;
    powerStatus?: CabinetPowerStatus;
    networkStatus?: CabinetNetworkStatus;
    items?: VirtualCabinetItem[];
    loadData: (cabinetId: string, callbackFunction: () => any) => void;
    unloadCabinet: () => void;
    autoProvision: (provKey: string, hardwareId: string, itemCount: number,
        items: VirtualCabinetItem[], callbackFunction: () => any) => void;
    match: any;
    location: any;
    loadCabinetTwin?: (cabinetId: string, callbackFunction: () => any) => void;
    loadCabinetEvents: (primaryFilter: string, secondaryFilter: string, cabinetId: string,
        isLoadMore: boolean, pageToken?: string) => void;
    loadCabinetItemEvents: (cabinetId: string, itemIndex: number,
        isLoadMore: boolean, pageToken?: string) => void;
    loadTouchScreenCabinetEvents: (filter: string, cabinetId: string,
        isLoadMore: boolean, pageToken?: string) => void;
    clearCabinetEventHistory: () => void;
    clearCabinetItemEventHistory: () => void;
    clearTouchScreenCabinetEventHistory: () => void;
    eventHistory?: CabinetEvent[];
    itemHistory?: CabinetItemEvent[];
    touchScreenEventHistory?: CabinetEvent[];
    cabinetEventContinuationToken?: string;
    cabinetItemEventContinuationToken?: string;
    touchScreenCabinetEventContinuationToken?: string;
    cabinetConfigurations?: CabinetTwinPropertyDto[],
    cabinetStatus?: CabinetTwinPropertyDto[],
    history: History;
    touchScreenMode?: TouchScreenMode;
    switchTouchScreenMode: (touchScreenMode: TouchScreenMode, callbackFunction: () => any) => void;
    isMultiCustodyLogin?: boolean;
    multiCustodyWitnessCount?: number;
    multiCustodyLoginSuccessCount?: number;
    item?: VirtualCabinetItem;
    touchScreenPopupMessage?: string;
    alarms?: Alarm[];
    timeOffset?: number;
}

export interface State {
    filterView?: string;
    filterData?: any;
}

class CabinetControlCenter extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.autoProvision = this.autoProvision.bind(this);
        this.setFilterView = this.setFilterView.bind(this);
        this.onBack = this.onBack.bind(this);
        this.onReturn = this.onReturn.bind(this);
        this.onDisconnectClick = this.onDisconnectClick.bind(this);
        this.redirectBackToCabinetList = this.redirectBackToCabinetList.bind(this);
        this.onDeprovisionClick = this.onDeprovisionClick.bind(this);

        this.state = {};
    }

    componentWillUnmount() {
        this.props.unloadCabinet();
        cabinetControlCenterService.unRegisterCabinetEventSync();
        cabinetTimerService.unRegisterWitnessTimeoutTimer();
        cabinetTimerService.unRegisterDoorOpenTimer();
        cabinetTimerService.unRegisterInactivityTimer();
        cabinetTimerService.unRegisterGlobalTimer();
        cabinetPermissionService.clearPermissions();
        eventRuleService.turnOffBuzzer();
    }

    componentDidMount() {
        const { loadData, match } = this.props;
        let cabinetId = match.params.id;
        loadData(cabinetId, this.redirectBackToCabinetList);
    }

    autoProvision() {
        const { autoProvision, provisioningKey, hardwareId, itemCount, items } = this.props;
        provisioningKey && itemCount && items && hardwareId &&
            autoProvision(provisioningKey, hardwareId, itemCount, items, this.redirectBackToCabinetList);
    }

    setFilterView(view: string) {
        this.setState({
            ...this.state,
            filterView: view,
            filterData: view != "events" ?
                this.getFilterData(view) : this.state.filterData
        });
    }

    filterItems(state?: CabinetTwinPropertyDto, isItemView: boolean = true) {
        var cabinetStates: CabinetTwinPropertyDto[] = [];

        if (state == undefined)
            return cabinetStates;

        var itemStatus: any = state.value;

        const itemStatusArray: CabinetTwinPropertyDto[] = Object.keys(itemStatus).map(currentItemStatus => {
            var currentItem = this.props.items && this.props.items.find(function (item: VirtualCabinetItem) {
                return item.itemIndex.toString() == currentItemStatus
            });

            var ct: CabinetTwinPropertyDto = {
                key: currentItem && currentItem.name != undefined ? isItemView ?
                    currentItem.name != '' ? currentItem.name : currentItem.itemIndex.toString()
                    : localise(CabinetConst.STATE_DISPLAY_ITEM).concat('_', currentItem.itemIndex.toString()) : '',
                value: this.getCabinetItemStatusText(currentItem && currentItem.status || 0),
                lastAccessedBy: currentItem && (currentItem.status == CabinetItemStatus.itemGrouped
                    || currentItem.status == CabinetItemStatus.Available || currentItem.status == CabinetItemStatus.Disabled
                    || currentItem.status == CabinetItemStatus.MultiCustody) ?
                    '' : currentItem && filterScreenCommonService.getLastAccessedByText(currentItem.lastAccessedByUserName, currentItem.lastAccessedOn)
            }
            return ct;
        });

        return cabinetStates.concat(itemStatusArray);
    }

    filterCabinetRelays(state?: CabinetTwinPropertyDto) {
        var cabinetStates: CabinetTwinPropertyDto[] = [];

        if (state == undefined)
            return cabinetStates;

        var relayStatus: any = state.value;

        const relayStatusArray: CabinetTwinPropertyDto[] = Object.keys(relayStatus).map(currentItemStatus => {

            var currentItem = this.props.items && this.props.items.find(function (item: VirtualCabinetItem) {
                return item.itemIndex.toString() == currentItemStatus
            });

            var ct: CabinetTwinPropertyDto = {
                key: currentItem && currentItem.name != undefined ? localise(CabinetConst.STATE_DISPLAY_RELAY).concat('_', currentItem.itemIndex.toString()) : '',
                value: this.getRelayStatusText(relayStatus[currentItemStatus])
            }
            return ct;
        });
        cabinetStates = cabinetStates.concat(relayStatusArray);
        return cabinetStates;
    }

    filterMultiCustodyStatus(state?: CabinetTwinPropertyDto) {
        var cabinetStates: CabinetTwinPropertyDto[] = [];

        if (state == undefined)
            return cabinetStates;

        var multiCusStatus: any = state.value;

        const relayStatusArray: CabinetTwinPropertyDto[] = Object.keys(multiCusStatus).map(currentItemStatus => {

            var currentItem = this.props.items && this.props.items.find(function (item: VirtualCabinetItem) {
                return item.itemIndex.toString() == currentItemStatus
            });

            var ct: CabinetTwinPropertyDto = {
                key: currentItem && currentItem.name != undefined ? localise(CabinetConst.STATE_DISPLAY_MULTI_CUSTODY).concat('_', currentItem.itemIndex.toString()) : '',
                value: multiCusStatus[currentItemStatus]
            }
            return ct;
        });
        cabinetStates = cabinetStates.concat(relayStatusArray);
        return cabinetStates;
    }

    getCabinetItemStatusText(status: number) {
        switch (status) {
            case CabinetItemStatus.Available:
                return localise(CabinetConst.STATUS_ITEM_VALUE_AVAILABLE);
            case CabinetItemStatus.Disabled:
                return localise(CabinetConst.STATUS_ITEM_VALUE_DISABLED);
            case CabinetItemStatus.MultiCustody:
                return localise(CabinetConst.STATUS_ITEM_VALUE_MULTICUSTODY);
            case CabinetItemStatus.Removed:
                return localise(CabinetConst.STATUS_ITEM_VALUE_REMOVED);
            case CabinetItemStatus.Overdue:
                return localise(CabinetConst.STATUS_ITEM_VALUE_OVERDUE);
            case CabinetItemStatus.ForcedKey:
                return localise(CabinetConst.STATUS_ITEM_VALUE_FORCEDKEY);
            default:
                return localise(CabinetConst.STATUS_ITEM_VALUE_AVAILABLE); // default state. To handle 'ITEM_GROUPED' state which is the only confusion non standard state
        }
    }

    getKeyPadStatusText(status: number) {
        if (CabinetKeypadStatus.On == status) {
            return localise(CabinetConst.STATUS_VALUE_ON);
        }
        else
            return localise(CabinetConst.STATUS_VALUE_OFF);
    }

    getDoorStatusText(status: number) {
        if (CabinetDoorStatus.Open == status) {
            return localise(CabinetConst.STATUS_VALUE_OPEN);
        }
        else
            return localise(CabinetConst.STATUS_VALUE_CLOSE);
    }

    getPowerStatusText(status: number) {
        switch (status) {
            case CabinetPowerStatus.AC: {
                return localise(CabinetConst.STATUS_VALUE_POWER_AC);
            }
            case CabinetPowerStatus.Battery: {
                return localise(CabinetConst.STATUS_VALUE_POWER_BATTERY);
            }
            case CabinetPowerStatus.POE: {
                return localise(CabinetConst.STATUS_VALUE_POWER_POE);
            }
            case CabinetPowerStatus.AC_Battery: {
                return localise(CabinetConst.STATUS_VALUE_POWER_AC_BATTERY);
            }
            case CabinetPowerStatus.Battery_POE: {
                return localise(CabinetConst.STATUS_VALUE_POWER_BATTERY_POE);
            }
            default: {
                return localise(CabinetConst.STATUS_VALUE_NO_POWER);
            }
        }
    }

    getNetWorkStatusText(status: number) {
        switch (status) {
            case CabinetNetworkStatus.LAN: {
                return localise(CabinetConst.STATUS_VALUE_NETWORK_LAN);
            }
            case CabinetNetworkStatus.WIFI: {
                return localise(CabinetConst.STATUS_VALUE_NETWORK_WIFI);
            }
            case CabinetNetworkStatus.LTE_4G: {
                return localise(CabinetConst.STATUS_VALUE_NETWORK_4G);
            }
            default: {
                return localise(CabinetConst.STATUS_VALUE_NO_COMMUNICATION);
            }
        }
    }

    getRelayStatusText(status: number) {
        if (CabinetRelayStatus.On == status) {
            return localise(CabinetConst.STATUS_VALUE_ON);
        }
        else
            return localise(CabinetConst.STATUS_VALUE_OFF);
    }

    getAlarmStatusText(status: number) {
        return status == CabinetAlarmStatus.Active ?
            localise(CabinetConst.STATUS_VALUE_ACTIVE) :
            localise(CabinetConst.STATUS_VALUE_INACTIVE);
    }

    getFilterData(view: string) {
        switch (view) {
            case "configuration":
                if (this.props.cabinetConfigurations) {
                    this.props.cabinetConfigurations.forEach(c => {
                        (c as any).tooltip = lookupService.getRemark("LIST_CABINET_CONFIGURATION_KEYS", c.key);
                    })
                }
                
                // modify before return to resolve values
                let cabConfigs = this.props.cabinetConfigurations && this.props.cabinetConfigurations.map(c => {
                    let cabConfigObj: CabinetTwinPropertyDto = {
                        key: c.key,
                        value: c.value,
                        lastAccessedBy: c.lastAccessedBy
                    };
                    return cabConfigObj;
                })

                cabConfigs && cabConfigs.forEach((config: CabinetTwinPropertyDto) => {
                    switch (config.key) {
                        case "NO_ACTIVITY_TIMEOUT":
                        case "GLOBAL_SESSION_TIMEOUT":
                        case "HIGH_PRIORITY_EVENT_SYNC_INTERVAL":
                        case "LOW_PRIORITY_EVENT_SYNC_INTERVAL":
                        case "USER_FREEZE_PERIOD":
                        case "WITNESS_USER_TIMEOUT":
                        case "DOOR_TIMEOUT":
                            config.key = lookupService.getText('LIST_CABINET_CONFIGURATION_KEYS', config.key) || '';
                            config.value = dateTimeUtilService.getTimeInSeconds(config.value);
                            break;
                        case "NAME":
                            config.key = localise('TEXT_CABINET_NAME');
                            break;
                        case "CABINET_GROUP":
                            config.key = localise('TEXT_CABINET_GROUP_NAME');
                            break;
                        case "ITEM_GROUPS":
                            config.key = localise('TEXT_ITEM_GROUPS');
                            break;
                        case "TIME_ZONE":
                            config.key = localise('TEXT_TIMEZONE');
                            break;
                        case "DATAMASK":
                            config.key = localise('TEXT_DATA_MASK');
                            break;
                        case "DATAMASK_STATUS":
                            config.key = localise('TEXT_DATA_MASK_STATUS');
                            config.value = lookupService.getText('LIST_DATA_MASK_STATUS', config.value) || '';
                            break;
                        case "BUZZER_VOLUME":
                            config.key = localise('TEXT_BUZZER_VOLUME');
                            config.value = lookupService.getText('LIST_LEVELS', config.value) || '';
                            break;                        
                        default:
                            config.key = lookupService.getText('LIST_CABINET_CONFIGURATION_KEYS', config.key) || '';
                            break;
                    }
                });
                return cabConfigs;
            case "states":
                var cabinetStates: CabinetTwinPropertyDto[] = [];
                this.props.cabinetStatus && this.props.cabinetStatus.forEach((state: CabinetTwinPropertyDto) => {
                    switch (state.key) {
                        case CabinetConst.STATE_ITEM:
                            var itemStates = this.filterItems(state, false);
                            cabinetStates = cabinetStates.concat(itemStates);
                            break;
                        case CabinetConst.STATE_KEYPAD:
                            var itemTwinStatus: any = state.value;

                            const keyPadStatusArray: CabinetTwinPropertyDto[] = Object.keys(itemTwinStatus).map(keyPadIndex => {
                                var ct: CabinetTwinPropertyDto = {
                                    key: localise(CabinetConst.STATE_DISPLAY_KEYPAD).concat('_', keyPadIndex == 'HASH_KEY' ? '#' : keyPadIndex == 'ASTERISK_KEY' ? '*' : keyPadIndex),
                                    value: this.getKeyPadStatusText(itemTwinStatus[keyPadIndex])
                                }
                                return ct;
                            });
                            cabinetStates = cabinetStates.concat(keyPadStatusArray);
                            break;
                        case CabinetConst.STATE_DOOR:
                            cabinetStates.push({ key: localise(CabinetConst.STATE_DISPLAY_DOOR), value: this.getDoorStatusText(parseInt(state.value)) });
                            break;
                        case CabinetConst.STATE_POWER:
                            cabinetStates.push({ key: localise(CabinetConst.STATE_DISPLAY_POWER), value: this.getPowerStatusText(parseInt(state.value)) });
                            break;
                        case CabinetConst.STATE_NETWORK:
                            cabinetStates.push({ key: localise(CabinetConst.STATE_DISPLAY_NETWORK), value: this.getNetWorkStatusText(parseInt(state.value)) });
                            break;
                        case CabinetConst.STATE_RELAY:
                            var itemStates = this.filterCabinetRelays(state);
                            cabinetStates = cabinetStates.concat(itemStates);
                            break;
                        case CabinetConst.STATE_MULTI_CUSTODY:
                            var itemStates = this.filterMultiCustodyStatus(state);
                            cabinetStates = cabinetStates.concat(itemStates);
                            break;
                        case CabinetConst.STATE_ALARM:
                            cabinetStates.push({ key: localise(CabinetConst.STATE_DISPLAY_ALARM_AC_POWER_DISCONNECTED), value: this.getAlarmStatusText(state.value[AlarmTypes.AcPowerDisconnected]) });
                            cabinetStates.push({ key: localise(CabinetConst.STATE_DISPLAY_ALARM_CABINET_CONTROL_UNIT_TAMPERED), value: this.getAlarmStatusText(state.value[AlarmTypes.CabinetControlUnitTampered]) });
                            cabinetStates.push({ key: localise(CabinetConst.STATE_DISPLAY_ALARM_CABINET_DOOR_TAMPERED), value: this.getAlarmStatusText(state.value[AlarmTypes.CabinetDoorTampered]) });
                            cabinetStates.push({ key: localise(CabinetConst.STATE_DISPLAY_ALARM_CABINET_REMOVED_FROM_WALL), value: this.getAlarmStatusText(state.value[AlarmTypes.CabinetRemovedFromWall]) });
                            cabinetStates.push({ key: localise(CabinetConst.STATE_DISPLAY_ALARM_DOOR_LEFT_OPEN), value: this.getAlarmStatusText(state.value[AlarmTypes.DoorLeftOpen]) });
                            cabinetStates.push({ key: localise(CabinetConst.STATE_DISPLAY_ALARM_DURESS), value: this.getAlarmStatusText(state.value[AlarmTypes.Duress]) });
                            cabinetStates.push({ key: localise(CabinetConst.STATE_DISPLAY_ALARM_LOW_BATTERY), value: this.getAlarmStatusText(state.value[AlarmTypes.LowBattery]) });
                            cabinetStates.push({ key: localise(CabinetConst.STATE_DISPLAY_ALARM_ITEM_OVERDUE), value: this.getAlarmStatusText(state.value[AlarmTypes.ItemOverdue]) });
                            break;
                        default:
                            cabinetStates.push({ key: localise(state.key), value: state.value });
                            break;
                    }
                });
                return cabinetStates;
            case "items":
                var itemStatuses = this.props.cabinetStatus && this.props.cabinetStatus.find(function (item: CabinetTwinPropertyDto) {
                    return item.key == CabinetConst.STATE_ITEM
                });
                return this.filterItems(itemStatuses);
        }
        return [];
    }

    getFilterTitleKey(view?: string) {
        if (!this.props.userLoggedIn)
            return "";

        switch (view) {
            case "configuration":
                return "TEXT_CONFIGURATION";
            case "states":
                return "TEXT_STATES";
            case "events":
                return "TEXT_EVENTS";
            case "items":
                return "TEXT_ITEMS";
        }
        return "";
    }

    onBack() {
        this.unRegisterSync();
        this.props.history.goBack();
    }

    onDisconnectClick() {
        this.unRegisterSync();
        this.props.history.goBack();
    }

    onDeprovisionClick(cabinetId: string) {
        confirmDialogService.showDialog("CONFIRMATION_DEPROVISION",
            () => {
                cabinetControlCenterService.deprovisionCabinet(cabinetId);
                this.props.history.goBack();
            })
    }

    unRegisterSync() {
        cabinetControlCenterService.unRegisterCabinetEventSync();
    }

    redirectBackToCabinetList() {
        navService.goBackToListPage("/cabinet/cabinetmanagement", this.props.history);
    }

    onReturn() {
        if (this.props.touchScreenMode == TouchScreenMode.ITEM_HISTORY_ITEM)
            this.props.switchTouchScreenMode(TouchScreenMode.ITEM_HISTORY, () => this.redirectBackToCabinetList());
        else if (this.props.touchScreenMode == TouchScreenMode.LOGIN_SCREEN) { }
        else {
            this.props.switchTouchScreenMode(TouchScreenMode.MAIN_MENU, () => this.redirectBackToCabinetList());
        }
    }

    render() {
        const { linked, simulationMode, loggedInUser, userLoggedIn, cabinetId, eventHistory, itemHistory,
            touchScreenEventHistory, powerStatus, networkStatus, loadCabinetEvents, loadCabinetItemEvents,
            loadTouchScreenCabinetEvents, clearCabinetEventHistory, clearCabinetItemEventHistory, alarms,
            clearTouchScreenCabinetEventHistory, cabinetEventContinuationToken, cabinetItemEventContinuationToken,
            touchScreenCabinetEventContinuationToken, touchScreenMode, isMultiCustodyLogin, multiCustodyWitnessCount,
            multiCustodyLoginSuccessCount, item, history, doorStatus, touchScreenPopupMessage, provisioningStatus, timeOffset } = this.props;

        const hasMoreData = cabinetEventContinuationToken == undefined ||
            cabinetEventContinuationToken == null ? false : true;
        const hasMoreItemData = cabinetItemEventContinuationToken == undefined ||
            cabinetItemEventContinuationToken == null ? false : true;
        const hasMoreTouchScreenEventData = touchScreenCabinetEventContinuationToken == undefined ||
            touchScreenCabinetEventContinuationToken == null ? false : true;

        const { filterView } = this.state;

        var filterData = this.getFilterData(filterView != undefined ? filterView : '');

        return (
            <div className="cabinet-control-center">
                <Card className="page-fixed-content compact mt-2">
                    <CardBody>
                        <Row>
                            <Col>
                                {!userLoggedIn && <BackButton onClick={this.onBack} />}
                            </Col>
                            <Col xs="auto">
                                <CabinetControlCenterHeader onDisConnectClick={this.onDisconnectClick}
                                    onDeprovisionClick={this.onDeprovisionClick} onHeaderButtonClick={this.setFilterView}
                                    isUserLoggedIn={userLoggedIn} isProvisioned={linked} cabinetId={cabinetId}
                                    provisioningStatus={provisioningStatus} simulationMode={simulationMode} />
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
                <Card className="page-fill-content content-scroll">
                    <CardBody>
                        <Row>
                            <Col md={6} lg={5} xl={3}>
                                <h5 className="vc-panel-header">{localise("TEXT_TOUCH_SCREEN")}</h5>
                                <TouchScreen touchScreenMode={touchScreenMode}
                                    cabinetPowerStatus={powerStatus}
                                    alarms={alarms}
                                    cabinetNetworkStatus={networkStatus}
                                    simulationMode={simulationMode != undefined ? simulationMode : SimulationMode.VirtualCabinet}
                                    linked={linked != undefined ? linked : false}
                                    history={history}
                                    doorStatus={doorStatus}
                                    loggedInUser={loggedInUser}
                                    userLoggedIn={userLoggedIn}
                                    cabinetId={cabinetId}
                                    onReturn={this.onReturn}
                                    autoProvision={this.autoProvision}
                                    isMultiCustodyLogin={isMultiCustodyLogin}
                                    multiCustodyWitnessCount={multiCustodyWitnessCount}
                                    multiCustodyLoginSuccessCount={multiCustodyLoginSuccessCount}
                                    item={item}
                                    itemHistory={itemHistory}
                                    touchScreenEventHistory={touchScreenEventHistory}
                                    loadItemEvents={loadCabinetItemEvents}
                                    loadTouchScreenCabinetEvents={loadTouchScreenCabinetEvents}
                                    hasMoreItemEvents={hasMoreItemData}
                                    hasMoreTouchScreenCabinetEvents={hasMoreTouchScreenEventData}
                                    itemPageToken={cabinetItemEventContinuationToken}
                                    eventPageToken={touchScreenCabinetEventContinuationToken}
                                    clearItemEventHistory={clearCabinetItemEventHistory}
                                    clearTouchScreenEventHistory={clearTouchScreenCabinetEventHistory}
                                    touchScreenPopupMessage={touchScreenPopupMessage}
                                    timeOffset={timeOffset} />
                            </Col>
                            <Col md={6} lg={7} xl={4}>
                                <h5 className="vc-panel-header">{userLoggedIn && localise("TEXT_CABINET_PANEL")}</h5>
                                <KeyPanel history={history} showPanel={linked && ((SimulationMode.VirtualCabinet == simulationMode &&
                                    doorStatus == CabinetDoorStatus.Open) || userLoggedIn)} />
                            </Col>
                            <Col md={12} xl={5}>
                                <h5 className="vc-panel-header">{localise(this.getFilterTitleKey(filterView))}</h5>
                                <Card className="vc-panel filter-panel">
                                    <CardBody>
                                        {filterView && filterView == "events" &&
                                            <CabinetControlCenterEventFilter loadEvents={loadCabinetEvents} clearEventHistory={clearCabinetEventHistory}
                                                eventHistory={eventHistory} show={userLoggedIn} hasMoreEvents={hasMoreData}
                                                cabinetId={cabinetId || ""} pageToken={cabinetEventContinuationToken} />
                                        }
                                        {filterView && filterView != "events" &&
                                            <CabinetControlCenterFilter key={filterView} view={filterView} data={filterData} show={userLoggedIn} />
                                        }
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </div>
        );
    }
}

export default CabinetControlCenter;


// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetControlCenter/CabinetControlCenter.tsx