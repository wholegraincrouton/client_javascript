import { contextService, applicationService, apiService } from ".";
import { DateTimeFromatConfiguration, Configuration } from "../types/dto";

export const configService =
{
    getConfigurationValue,
    getDateTimeFormatConfigurationValue,
    getPortalVersion,
    getConfigurationsByCustomer,
    getKendoDateTimeFormatByCurrentFormat,
    getKendoTimeFormatByCurrentFormat,
    getKendoDateFormatByCurrentFormat
}

function getConfigurationValue(key: string, section?: string, customerId?: string) {
    const uiContext = contextService.getCurrentContext();
    const culture = uiContext.culture;
    section = section || uiContext.section;

    var matches = applicationService.configurations.filter(c =>
        c.key == key
        && (c.customerId == "*" || (customerId && c.customerId == customerId))
        && (c.culture == "*" || (culture && c.culture == culture))
        && (c.section == "*" || (section && c.section == section)));

    return matches[0] ? matches[0].value : '';
}

function getPortalVersion() {
    var version = applicationService.configurations.find(c =>
        c.key == "PORTAL_VERSION");
    if (version != undefined) {
        return version.value
    }
    return '';
}

function getDateTimeFormatConfigurationValue(): DateTimeFromatConfiguration {

    let config: DateTimeFromatConfiguration = {
        displayFormat: "DD/MM/YYYY hh:mm AM|PM",
        reportLongMomentDateFormat: "dddd, DD/MM/YY",
        momentDateFormat: "DD/MM/YY",
        momentTimeFormat: "HH:mm",
        momentDateTimeFormat: "DD/MM/YYYY hh:mm A",
        momentDateTimeWithSecondsFormat: "DD/MM/YYYY hh:mm:ss A",
        kendoDateTimeFormat: "dd/MM/yyyy hh:mm a",
        kendoDateFormat: "dd/MM/yyyy",
        kendoTimeFormat: "hh:mm a",
        kendoReactWrapperDateTimeFormat: "dd/MM/yyyy hh:mm tt",
        isSelected: true
    };

    let configValue = getConfigurationValue("DATE_TIME_FORMATS", '*', contextService.getCurrentCustomerId());
    if (configValue != '') {
        var configList: DateTimeFromatConfiguration[] = JSON.parse(configValue);
        let selectedConfig = configList.find(c => c.isSelected == true);
        config = selectedConfig || config;
    }
    return config;
}

function getConfigurationsByCustomer(customerId: string) {
    return apiService.get<Configuration[]>('application', 'GetPermittedConfigurations', undefined, { ignoreUIFilter: true })
        .then((data) => {
            return data.filter(l =>
                l.customerId == customerId
            );
        });
}

function getKendoDateTimeFormatByCurrentFormat(){
    return `${getKendoDateFormatByCurrentFormat()} ${getKendoTimeFormatByCurrentFormat()}`;
}

function getKendoTimeFormatByCurrentFormat() {
    let timeFormat_24H: string = "HH:mm:ss";

    let kendoTimeFormat_12H: string = "hh:mm tt";
    let kendoTimeFormat_24H: string = "HH:mm";
    
    return contextService.getCurrentTimeFormat() === timeFormat_24H ? 
        kendoTimeFormat_24H : kendoTimeFormat_12H;
}

function getKendoDateFormatByCurrentFormat() {
    let kendoDateFormat_DDMMYYYY: string = "dd/MM/yyyy";
    let kendoDateFormat_MMDDYYYY: string= "MM/dd/yyyy";
    let kendoDateFormat_YYYYMMDD: string = "yyyy/MM/dd";

    const currentFormat = {
        "DD/MM/YYYY": kendoDateFormat_DDMMYYYY,
        "MM/DD/YYYY": kendoDateFormat_MMDDYYYY,
        "YYYY/MM/DD": kendoDateFormat_YYYYMMDD,
        'default': kendoDateFormat_DDMMYYYY
    };

    let customerDateFormat = contextService.getCurrentDateFormat();

    return currentFormat[customerDateFormat]
}



// WEBPACK FOOTER //
// ./src/modules/shared/services/configuration.service.ts