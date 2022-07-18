import { store } from "src/redux/store";
import { CabinetTwinPropertyDto } from "src/modules/cabinet/types/dto";

export const cabinetConfigService = {
    getCabinetConfiguration,
    getDateTimeFormatConfigurationValue
}

function getCabinetConfiguration(key: string) {
    let configList: CabinetTwinPropertyDto[] = store.getState().cabinetSimulation.cabinetConfigurations;
    let item = configList.find(i => {
        return i.key === key
    });
    return item;
}

function getDateTimeFormatConfigurationValue(): string {

    let momentDateTimeFormat = "DD/MM/YYYY hh:mm A";

    let config = getCabinetConfiguration("DATE_TIME_FORMAT");
    if (config) {
        switch (config.value) {
            case "DD_MM_YYYY_HH_MM_AMPM_BACKSLASH":
                momentDateTimeFormat = "DD/MM/YYYY hh:mm A";
                break;
            case "YYYY_MM_DD_HH_MM_AMPM_BACKSLASH":
                momentDateTimeFormat = "YYYY/MM/DD hh:mm A";
                break;
            case "DD_MM_YYYY_HH_MM_AMPM_DASH":
                momentDateTimeFormat = "DD-MM-YYYY hh:mm A";
                break;
            case "YYYY_MM_DD_HH_MM_AMPM_DASH":
                momentDateTimeFormat = "YYYY-MM-DD hh:mm A";
                break;
            case "DD_MM_YYYY_HH_MM_BACKSLASH":
                momentDateTimeFormat = "DD/MM/YYYY HH:mm";
                break;
            case "YYYY_MM_DD_HH_MM_BACKSLASH":
                momentDateTimeFormat = "YYYY/MM/DD HH:mm";
                break;
            case "DD_MM_YYYY_HH_MM_DASH":
                momentDateTimeFormat = "DD-MM-YYYY HH:mm";
                break;
            case "YYYY_MM_DD_HH_MM_DASH":
                momentDateTimeFormat = "YYYY-MM-DD HH:mm";
                break;
        }
    }
    return momentDateTimeFormat;
}






// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetControlCenter/shared/cabinet-configuration-service.ts