import { apiService } from "../../shared/services";
import { CabinetItemDetails, Cabinet, CabinetBasicDetails, VirtualCabinetConstatnts } from "src/modules/cabinet/types/dto";
import { VirtualCabinetItem } from "../types/store";
import * as apiConstants from "src/modules/shared/constants/api.constants";

let managedCabinets: { customerId: string, cabinetList: CabinetBasicDetails[] }[] = [];
let customerCabinets: { customerId: string, cabinetList: CabinetBasicDetails[] }[] = [];

const service = apiConstants.DEVICES;

export const cabinetService =
{
    getCabinet,
    getCabinets,
    getCabinetBasicDetails,
    getCabinetItemsByCabinet,
    getCabinetsByGroup,
    provisionCabinet,
    initiateCabinetDeprovision,
    changeCabinetLockState,
    clearCabinetList,
    triggerCabinetLogUpload
};

function getCabinet(cabinetId: string) {
    return apiService.get<Cabinet>('cabinet', undefined, [cabinetId]);
}

function getCabinetBasicDetails(customerId: string, cabinetId: string) {
    return apiService.get<CabinetBasicDetails>('cabinet', 'GetCabinetBasicDetails', undefined, { cabinetId })
        .then((cabinet: CabinetBasicDetails) => {
            let customerSpecificCabinets = managedCabinets.find(cu => cu.customerId == customerId);
            if (customerSpecificCabinets != undefined) {
                customerSpecificCabinets.cabinetList.push(cabinet);
            }
            return cabinet;
        });
}

function getCabinets(customerId: string, includeDeletedData?: boolean, ignoreUserFilter?: boolean) {
    const cabinetList = ignoreUserFilter ? customerCabinets : managedCabinets;

    // Global variable to avoid api calls everytime.
    if (cabinetList == undefined || cabinetList.find(cu => cu.customerId == customerId) == undefined || includeDeletedData == true) {
        return getCabinetList(customerId, includeDeletedData, ignoreUserFilter);
    }
    else {
        var promise = new Promise<CabinetBasicDetails[]>(resolve => {
            let cabinets = cabinetList.find(cu => cu.customerId == customerId);
            resolve(cabinets != undefined ? cabinets.cabinetList : []);
        });
        return promise;
    }
}

function getCabinetList(customerId: string, includeDeletedData?: boolean, ignoreUserFilter?: boolean) {
    return apiService.get<CabinetBasicDetails[]>('cabinet', 'GetCabinetsByCustomer', undefined, { customerId, includeDeletedData, ignoreUserFilter })
        .then((data) => {
            let cabinetList = ignoreUserFilter ? customerCabinets : managedCabinets;

            if (cabinetList.find(cu => cu.customerId == customerId) == undefined && includeDeletedData != true) { // Avoid data duplication in race condition                
                cabinetList.push({ customerId: customerId, cabinetList: data });
            }
            return data;
        });
}

function getCabinetItemsByCabinet(cabinetId: string): Promise<CabinetItemDetails> {
    return apiService.get<CabinetItemDetails>('cabinet', 'GetCabinetItemsByCabinet', undefined, { cabinetId });
}

function getCabinetsByGroup(group: string): Promise<Cabinet[]> {
    return apiService.get<Cabinet[]>('cabinet', 'GetCabinetsByCabinetGroup', undefined, { group })
}

function provisionCabinet(provisioningKey: string, hardwareId: string, itemCount: number, items: VirtualCabinetItem[]) {
    let provisioningDto = {
        provisioningKey,
        hardwareId,
        itemCount,
        items,
        relayCount: 2,
        chassisSerialNumber: VirtualCabinetConstatnts.VcChassisNumber,
        firmwareVersion: VirtualCabinetConstatnts.VcFirmwareVersion
    };

    return apiService.post<any>('CabinetSimulator', 'ProvisionVirtualCabinet', provisioningDto, [], null, false, service);
}

function initiateCabinetDeprovision(cabinetId: string) {
    return apiService.post('CabinetSimulator', 'InitiateDeprovisionCabinet', cabinetId, undefined, null, false, service);
}

function changeCabinetLockState(cabinetId: string, lockState: string, userId: string) {
    let cabinetLockStateDto = {
        cabinetId,
        lockState,
        userId
    };
    return apiService.post<any>('CabinetSimulator', 'changeCabinetLockState', cabinetLockStateDto, [], null, false, service);
}

function clearCabinetList() {
    if (managedCabinets != undefined)
        managedCabinets = [];

    if (customerCabinets != undefined)
        customerCabinets = [];
}

function triggerCabinetLogUpload(cabinetId: string) {
    return apiService.post('CabinetSimulator', 'TriggerCabinetLogUpload', cabinetId, undefined, null, false, service);
}



// WEBPACK FOOTER //
// ./src/modules/cabinet/services/cabinet.service.ts