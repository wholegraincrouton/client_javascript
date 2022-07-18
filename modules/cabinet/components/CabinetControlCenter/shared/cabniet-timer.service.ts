import { store } from "src/redux/store";
import { CabinetTwinPropertyDto } from "src/modules/cabinet/types/dto";
import { VirtualCabinetItem } from "src/modules/cabinet/types/store";
import { cabinetConfigService } from "src/modules/cabinet/components/CabinetControlCenter/shared/cabinet-configuration-service";
import { dateTimeUtilService } from "src/modules/shared/services/datetime-util.service";

var doorTimerReference: any;
var inactivityTimerReference: any;
var cabinetDisplayTimerReference: any;
var globalTimerReference: any;
var witnessTimeoutTimer: any;

export const cabinetTimerService = {
    registerDoorOpenTimer,
    unRegisterDoorOpenTimer,
    registerInactivityTimer,
    unRegisterInactivityTimer,
    resetInactivityTimer,
    getCabinetTimeOutInSecondsByKey,
    startCabinetTimer,
    endCabinetDisplayTimer,
    registerGlobalTimer,
    unRegisterGlobalTimer,
    registerWitnessTimeoutTimer,
    unRegisterWitnessTimeoutTimer,
    getCabinetSyncTimeInSeconds
}

function registerDoorOpenTimer(signOutFuncCallback: () => any, doorTimeOutInSeconds: number, dispatch: any) {
    if (doorTimerReference == undefined) {
        doorTimerReference = setTimeout(() => { signOutFuncCallback()(dispatch); }, doorTimeOutInSeconds * 1000);
    }
}

function startCabinetTimer(timerEllapsedCallback: () => any, dispatch: any) {
    if (cabinetDisplayTimerReference == undefined)
        cabinetDisplayTimerReference = setInterval(() => { timerEllapsedCallback()(dispatch) }, 1000);
}

function endCabinetDisplayTimer() {
    if (cabinetDisplayTimerReference != undefined) {
        clearInterval(cabinetDisplayTimerReference);
        cabinetDisplayTimerReference = undefined;
    }
}

function unRegisterDoorOpenTimer() {
    if (doorTimerReference != undefined) {
        clearTimeout(doorTimerReference);
        doorTimerReference = undefined;
    }
}

function registerInactivityTimer(inActivityFuncCallback: () => any, dispatch: any) {
    if (inactivityTimerReference == undefined) {
        inactivityTimerReference = setTimeout(() => { inActivityFuncCallback()(dispatch); }, getCabinetTimeOutInSecondsByKey('NO_ACTIVITY_TIMEOUT') * 1000);
    }
}

function unRegisterInactivityTimer() {
    if (inactivityTimerReference != undefined) {
        clearTimeout(inactivityTimerReference);
        inactivityTimerReference = undefined;
    }
}

function registerGlobalTimer(timerEllapsedCallback: () => any, globalTimeOut: number, dispatch: any) {
    if (globalTimerReference == undefined) {
        globalTimerReference = setTimeout(() => { timerEllapsedCallback()(dispatch) }, globalTimeOut * 1000);
    }
}

function unRegisterGlobalTimer() {
    if (globalTimerReference != undefined) {
        clearTimeout(globalTimerReference);
        globalTimerReference = undefined;
    }
}

function resetInactivityTimer(inActivityFuncCallback: () => any, dispatch: any) {
    unRegisterInactivityTimer();
    registerInactivityTimer(() => inActivityFuncCallback(), dispatch);
}

function registerWitnessTimeoutTimer(time: number, onTimeoutExceed: (item: VirtualCabinetItem) => any, dispatch: any) {
    if (witnessTimeoutTimer == undefined) {
        witnessTimeoutTimer = setTimeout((item: VirtualCabinetItem) => {
            onTimeoutExceed(item)(dispatch);
        }, time * 1000);
    }
}

function unRegisterWitnessTimeoutTimer() {
    if (witnessTimeoutTimer) {
        clearTimeout(witnessTimeoutTimer);
        witnessTimeoutTimer = undefined;
    }

}

function getCabinetTimeOutInSecondsByKey(key: string) {
    var cabinetConfigs: CabinetTwinPropertyDto[] = store.getState().cabinetSimulation.cabinetConfigurations;
    var configObj = cabinetConfigs.find(obj => {
        return obj.key === key
    });

    if (configObj != undefined && configObj.value != null)
        return dateTimeUtilService.getTimeInSeconds(configObj.value);
    else
        return 60;
}

function getCabinetSyncTimeInSeconds(key: string) {
    var item = cabinetConfigService.getCabinetConfiguration(key);
    if (item != null) {
        var timeInSeconds = dateTimeUtilService.getTimeInSeconds(item.value);
        return timeInSeconds * 1000;
    }
    else
        return 10000;
}


// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetControlCenter/shared/cabniet-timer.service.ts