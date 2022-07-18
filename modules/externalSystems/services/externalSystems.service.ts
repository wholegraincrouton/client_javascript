import { UserFieldMap, TempUserFieldMap, ExternalSystemConfiguration, TempExternalSystemConfiguration } from "../types/dto";
import { lookupService, apiService } from "src/modules/shared/services";
import { DataMaskConfig } from "src/modules/shared/types/dto";

export const externalSystemsService = {
    processUserFieldMappings,
    updateTestEventEpoch,
    updateForceUserImportEpoch,
    getProcessedExternalSystemConfigurations,
    getProccessedDataMaskSettings,
    syncExternalData  
}

function processUserFieldMappings(userMappingList: UserFieldMap[]) {
    let mappedList: TempUserFieldMap[] = [];
    let userFields = lookupService.getList("LIST_SYSTEM_USER_FIELDS");
    let mandatoryUserFields = lookupService.getList("LIST_MANDATORY_SYSTEM_USER_FIELDS");
    userFields.map((lookupItem) => {
        let isMandatoryField = mandatoryUserFields.some(f => f.value == lookupItem.value);
        let savedUserFieldMapping = userMappingList.find(uf => uf.systemField == lookupItem.value);
        let newUserFieldMapping: TempUserFieldMap = {
            systemField: lookupItem.value || ''
        };

        if (savedUserFieldMapping) {
            newUserFieldMapping.isSelected = true;
            newUserFieldMapping.thirdPartyField = savedUserFieldMapping.thirdPartyField;
            newUserFieldMapping.tytonUserFieldText = isMandatoryField ? lookupItem.text + '*' : lookupItem.text || '';
            newUserFieldMapping.isMandatory = isMandatoryField;
            newUserFieldMapping.description = lookupItem.remark;
        }
        else {
            newUserFieldMapping.isSelected = isMandatoryField;
            newUserFieldMapping.isMandatory = isMandatoryField;
            newUserFieldMapping.systemField = lookupItem.value || '';
            newUserFieldMapping.tytonUserFieldText = isMandatoryField ? lookupItem.text + '*' : lookupItem.text || '';
            newUserFieldMapping.description = lookupItem.remark;
        }
        mappedList.push(newUserFieldMapping);
    })
    return mappedList;
}

function getProcessedExternalSystemConfigurations(integrationSystem: string, externalSystemConfigurations: ExternalSystemConfiguration[]) {
    let systems = lookupService.getList("LIST_INTEGRATION_SYSTEMS");
    let externalSystemLookup = systems.find(s => s.value == integrationSystem);
    let externalSystemSettingsLookupKey = externalSystemLookup && externalSystemLookup.childLookupKey;
    let externalSystemSettingsLookup = lookupService.getList(externalSystemSettingsLookupKey || '');
    let externalSystemConfigSetting = externalSystemSettingsLookup.find(s => s.value == "CONFIGURATIONS");
    let externalSystemConfigLookup = lookupService.getList(externalSystemConfigSetting && externalSystemConfigSetting.childLookupKey || '');

    let processedList: TempExternalSystemConfiguration[] = [];

    externalSystemConfigLookup.forEach(lookupItem => {
        let newConfig: TempExternalSystemConfiguration = {
            key: lookupItem.value || '',
            text: lookupItem.text,
            remark: lookupItem.remark,
            childLookup: lookupItem.childLookupKey,
            sortOrder: lookupItem.sortOrder
        }
        let savedConfig = externalSystemConfigurations.find(c => c.key == lookupItem.value);
        if (savedConfig) {
            newConfig.value = savedConfig.value;
        }
        processedList.push(newConfig);
    })
    return processedList;
}

function updateTestEventEpoch(externalSystemId: string) {
    return apiService.post<any>('externalSystem', 'updateTestEventEpoch', { externalSystemId });
}

function updateForceUserImportEpoch(externalSystemId: string) {
    return apiService.post<any>('externalSystem', 'updateForceUserImportEpoch', { externalSystemId });
}

function getProccessedDataMaskSettings(dataMasks: DataMaskConfig[], applicableDataMaskId?: string) {
    if (applicableDataMaskId && applicableDataMaskId != '') {
        var selectedDataMask = dataMasks.find(d => d.id == applicableDataMaskId);
        if (selectedDataMask) {
            selectedDataMask.isSelected = true;
        }
    }
    return dataMasks;
}

function syncExternalData(externalSystemId: string) {
    return apiService.post<any>('externalSystem', 'syncExternalData', { externalSystemId });
}



// WEBPACK FOOTER //
// ./src/modules/externalSystems/services/externalSystems.service.ts