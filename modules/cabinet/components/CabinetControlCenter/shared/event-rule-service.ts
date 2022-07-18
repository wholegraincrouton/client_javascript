import { CabinetSimulationState, CabinetEvent } from "src/modules/cabinet/types/store";
import { store } from "src/redux/store";
import { EventRule, DurationTimeConstants, CabinetEventNameConst, CabinetRelayStatus, SimulationMode, AlarmTypes } from "src/modules/cabinet/types/dto";
import * as constants from "../../../constants/cabinet-control-center.constants";
import { cabinetControlCenterService } from "src/modules/cabinet/services/cabinetControlCenter.service";
import { lookupService } from "src/modules/shared/services/lookup.service";
import { dateTimeUtilService } from "src/modules/shared/services/datetime-util.service";
import { cabinetResourceService } from "./cabinet-resource-service";

var buzzerTimeOutReference: any;
var popupmsgTimeOutReference: any;
var alarmReferences: any[];
var relayReferences: any[] = [];
const anyItemIndex = '-1';

export const eventRuleService = {
  queueEvent,
  startAlarm,
  generateUniqueId,
  turnOffBuzzer,
  stopAlarm
};

function queueEvent(eventCode: string, eventDetails: any) {
  let cabinetSimulationState: CabinetSimulationState = store.getState().cabinetSimulation;

  if (SimulationMode.VirtualCabinet == cabinetSimulationState.simulationMode) {
    var customerId = cabinetSimulationState.customerId;

    var highPriorityList = lookupService.getList("LIST_CABINET_HIGH_PRIORITY_EVENTS", customerId);
    var isHighPriority = highPriorityList.some(item => item.value == eventCode);

    let event: CabinetEvent = {
      id: generateUniqueId(),
      eventCode: eventCode,
      isHighPriority: isHighPriority,
      eventTime: new Date(),
      context: eventDetails
    };

    executeRules(event);

    store.dispatch({ type: constants.QUEUE_EVENT, event, isHighPriority });
  }
}

function executeRules(event: CabinetEvent) {
  var rules = extractRules(event.eventCode);
  var itemId = event.context && event.context.itemIndex;
  if (rules) {

    if (itemId != undefined) {

      let itemRules = rules.filter(r => r.item == itemId);
      // If no Specific items, then evaulate Any
      if (itemRules.length == 0) {
        itemRules = rules.filter(r => r.item == anyItemIndex);
      }

      // merge item = null to execute actions which are mainly associated to close alarms (those do not have item)
      rules = itemRules.concat(rules.filter(r => r.item == null));
    }

    rules.forEach(rule => {
      if (itemId == undefined || rule.item == undefined ||
        rule.item == '-1' || (rule.item && parseInt(rule.item) == itemId)) {
        switch (rule.action) { 
          case "ALARM_AC_POWER_DISCONNECTED_START": {
            startAlarm(rule, event, AlarmTypes.AcPowerDisconnected);
            break;
          }          
          case "ALARM_CABINET_CU_TAMPERED_START": {
            startAlarm(rule, event, AlarmTypes.CabinetControlUnitTampered);
            break;
          }
          case "ALARM_CABINET_DOOR_TAMPERED_START": {
            startAlarm(rule, event, AlarmTypes.CabinetDoorTampered);
            break;
          }
          case "ALARM_CABINET_REMOVED_FROM_WALL_START": {
            startAlarm(rule, event, AlarmTypes.CabinetRemovedFromWall);
            break;
          }
          case "ALARM_DOOR_LEFT_OPEN_START": {
            startAlarm(rule, event, AlarmTypes.DoorLeftOpen);
            break;
          }
          case "ALARM_DURESS_START": {
            startAlarm(rule, event, AlarmTypes.Duress);
            break;
          }
          case "ALARM_LOW_BATTERY_START": {
            startAlarm(rule, event, AlarmTypes.LowBattery);
            break;
          }
          case "ALARM_EXTREME_LOW_BATTERY_START": {
            startAlarm(rule, event, AlarmTypes.ExtremeLowBattery);
            break;
          }
          case "ALARM_BATTERY_DISCONNECTED_START": {
            startAlarm(rule, event, AlarmTypes.BatteryDisconnected);
            break;
          }
          case "ALARM_KEY_FORCEFUL_RETRIEVE_START": {
            startAlarm(rule, event, AlarmTypes.KeyForcefulRetrieve);
            break;
          }
          case "ALARM_GROUND_CONNECTION_DISCONNECTED_START": {
            startAlarm(rule, event, AlarmTypes.GroundConnectionDisconnected);
            break;
          }
          case "ALARM_ITEM_OVERDUE_START": {
            startAlarm(rule, event, AlarmTypes.ItemOverdue);
            break;
          }
          case "ALARM_AC_POWER_DISCONNECTED_END": {
            stopAlarm(AlarmTypes.AcPowerDisconnected, event);
            break;
          }
          case "ALARM_CABINET_CU_TAMPERED_END": {
            stopAlarm(AlarmTypes.CabinetControlUnitTampered, event);
            break;
          }
          case "ALARM_CABINET_DOOR_TAMPERED_END": {
            stopAlarm(AlarmTypes.CabinetDoorTampered, event);
            break;
          }
          case "ALARM_CABINET_REMOVED_FROM_WALL_END": {
            stopAlarm(AlarmTypes.CabinetRemovedFromWall, event);
            break;
          }
          case "ALARM_DOOR_LEFT_OPEN_END": {
            stopAlarm(AlarmTypes.DoorLeftOpen, event);
            break;
          }
          case "ALARM_DURESS_END": {
            stopAlarm(AlarmTypes.Duress, event);
            break;
          }
          case "ALARM_LOW_BATTERY_END": {
            stopAlarm(AlarmTypes.LowBattery, event);
            break;
          }
          case "ALARM_EXTREME_LOW_BATTERY_END": {
            stopAlarm(AlarmTypes.ExtremeLowBattery, event);
            break;
          }
          case "ALARM_BATTERY_DISCONNECTED_END": {
            stopAlarm(AlarmTypes.BatteryDisconnected, event);
            break;
          }
          case "ALARM_KEY_FORCEFUL_RETRIEVE_END": {
            stopAlarm(AlarmTypes.KeyForcefulRetrieve, event);
            break;
          }
          case "ALARM_GROUND_CONNECTION_DISCONNECTED_END": {
            stopAlarm(AlarmTypes.GroundConnectionDisconnected, event);
            break;
          }
          case "ALARM_ITEM_OVERDUE_END": {
            stopAlarm(AlarmTypes.ItemOverdue, event);
            break;
          }
          case "BUZZER_ON": {
            turnOnBuzzer(rule);
            break;
          }
          case "BUZZER_OFF": {
            turnOffBuzzer(rule);
            break;
          }
          case "TOUCH_SCREEN_POPUP_SHOW": {
            showTouchScreenPopup(rule);
            break;
          }
          case "TOUCH_SCREEN_POPUP_CLEAR": {
            hideTouchScreenPopup();
            break;
          }
          case "RELAY_ON_1": {
            turnOnRelay(1, rule, event);
            break;
          }
          case "RELAY_ON_2": {
            turnOnRelay(2, rule, event);
            break;
          }
          case "RELAY_OFF_1": {
            turnOffRelay(1, event);
            break;
          }
          case "RELAY_OFF_2": {
            turnOffRelay(2, event);
            break;
          }
          default: {
          }
        }
      }
    });
  }
}

function extractRules(eventName: string) {
  let virtualCabinetState: CabinetSimulationState = store.getState()
    .cabinetSimulation;

  let eventActions = virtualCabinetState.cabinetEventActions;

  var rules = undefined;

  if (eventActions) {
    var eventAction = eventActions.find(ea => ea.event == eventName);
    rules = eventAction && eventAction.rules;
  }

  return rules;
}

function turnOnRelay(relayIndex: number, ruleDetails: EventRule, event: CabinetEvent) {
  let duration = dateTimeUtilService.getTimeInSeconds(ruleDetails.duration);
  let virtualCabinetState: CabinetSimulationState = store.getState().cabinetSimulation;
  var userId = virtualCabinetState.loggedInUserId;
  let relays = virtualCabinetState.relays;

  if (relays == undefined || relays.find(r => r.relayIndex == relayIndex && r.status == CabinetRelayStatus.Off) != undefined) {

    store.dispatch({ type: constants.TOGGLE_RELAY, action: { index: relayIndex, status: CabinetRelayStatus.On } });
    queueEvent(CabinetEventNameConst.RelayOn, { relayIndex: relayIndex, parentEventCode: event.eventCode, userId: userId }); // Queue Relay On event

    if (ruleDetails.duration != DurationTimeConstants.Indefinite) {
      relayReferences[relayIndex] = setTimeout(() => {
        turnOffRelay(relayIndex, undefined);
      }, duration * 1000);
    } else {
      relayReferences[relayIndex] = {};
    }
  }
}

function turnOffRelay(relayIndex: number, event?: CabinetEvent) {
  let virtualCabinetState: CabinetSimulationState = store.getState().cabinetSimulation;
  var userId = virtualCabinetState.loggedInUserId;
  let relays = virtualCabinetState.relays;

  if (relays && relays.find(r => r.relayIndex == relayIndex && r.status == CabinetRelayStatus.On) != undefined) {
    store.dispatch({ type: constants.TOGGLE_RELAY, action: { index: relayIndex, status: CabinetRelayStatus.Off } });
    queueEvent(CabinetEventNameConst.RelayOff, { relayIndex: relayIndex, userId: userId, parentEventCode: event && event.eventCode }); // Queue Relay On event

    if (relayReferences && relayReferences[relayIndex]) {
      clearTimeout(relayReferences[relayIndex]);
      relayReferences[relayIndex] = undefined;
    }
  }
}

function startAlarm(ruleDetails: EventRule, event: CabinetEvent, alarmName: string) {

  if (!alarmReferences) alarmReferences = [];

  var cabinetId = store.getState().cabinetSimulation.cabinetId;
  if (cabinetId && cabinetId != "") {
    cabinetControlCenterService
      .isAlarmClosed(cabinetId, alarmName) // Check whether alarm has been closed from portal
      .then(isClosed => {
        if (isClosed) { // Start the alarm only if it is closed

          // TODO add alarm context startTime
          queueEvent(CabinetEventNameConst.AlarmStarted,
            {
              alarmCode: alarmName, parentEventCode: event.eventCode,
              parentEventItemId: ruleDetails.item != undefined ? parseInt(ruleDetails.item) : null, severityLevel: 1,
              userId: event.context && event.context.userId
            }); // Queue AlarmStart event

          // Alarm running indefinite
          alarmReferences[alarmName] = {};
        }
      })
  }
}

function stopAlarm(alarmName: string, event?: CabinetEvent) {
  let cabinetSimulate: CabinetSimulationState = store.getState().cabinetSimulation;
  var cabinetId = cabinetSimulate.cabinetId || "";
  var userId = cabinetSimulate.loggedInUserId;
  if (SimulationMode.VirtualCabinet == cabinetSimulate.simulationMode && cabinetId && cabinetId != "") {
    cabinetControlCenterService
      .isAlarmClosed(cabinetId, alarmName) // Check whether alarm has been closed from portal
      .then(isClosed => {
        if (!isClosed) {
          stopAlarmReferences(alarmName);
          if (event) { // Closed by event
            queueEvent(CabinetEventNameConst.AlarmClosed, { alarmCode: alarmName, parentEventCode: event.eventCode });
          }
          else { // Closed by cabinet user
            queueEvent(CabinetEventNameConst.AlarmClosed, { alarmCode: alarmName, userId: userId });
          }
        }
      })
      .catch();
  }
}

function stopAlarmReferences(alarmName: string) {
  //Note :- No escalation for alarm stop
  if (alarmReferences && alarmReferences[alarmName]) {
    clearTimeout(alarmReferences[alarmName]);
    alarmReferences[alarmName] = undefined;
  }
}

function turnOnBuzzer(ruleDetails: EventRule) {
  let duration = dateTimeUtilService.getTimeInSeconds(ruleDetails.duration);
  let audio = cabinetResourceService.getCabinetBuzzer();
  if (audio) {
  audio.loop = true;
  audio.play()
    .then();
  }

  if (buzzerTimeOutReference) clearTimeout(buzzerTimeOutReference);

  if (ruleDetails.duration != DurationTimeConstants.Indefinite)
    buzzerTimeOutReference = setTimeout(() => {
      turnOffBuzzer();
    }, duration * 1000); // turn off automatically
}

function turnOffBuzzer(ruleDetails?: EventRule) {
  let audio = cabinetResourceService.getCabinetBuzzer();
  if (audio) {
    audio.loop = false;
    audio.pause();
  }
}

function showTouchScreenPopup(ruleDetails: EventRule) {
  // This method does not have an escallation

  let duration = dateTimeUtilService.getTimeInSeconds(ruleDetails.duration);
  let msgContent = ruleDetails.messageContent;
  store.dispatch({
    type: constants.SHOW_TOUCHSCREEN_POPUP,
    message: msgContent
  });

  if (popupmsgTimeOutReference) clearTimeout(popupmsgTimeOutReference);

  if (ruleDetails.duration != DurationTimeConstants.Indefinite)
    popupmsgTimeOutReference = setTimeout(() => {
      hideTouchScreenPopup();
    }, duration * 1000);
}

function hideTouchScreenPopup() {
  store.dispatch({ type: constants.HIDE_TOUCHSCREEN_POPUP });
}

function generateUniqueId() {
  const uuidv4 = require("uuid/v4");
  let uniqueId = uuidv4();
  return uniqueId;
}



// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetControlCenter/shared/event-rule-service.ts