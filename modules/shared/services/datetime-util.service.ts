import * as moment from 'moment';
import { accountSessionService, configService, contextService } from '.';
import { DefaultDateTimeFormats } from '../constants/datetime.constants';
import { TimeDurations } from '../types/dto';

export const dateTimeUtilService = {
    convertToLocalTime,
    getLocalTimeDisplayTextByUserTimeZone,
    getDateDisplayTextByUserTimeZone,
    getDateDisplayTextByTimeZone,
    getDateDisplayText,
    getTimeInSeconds,
    getStartTimeForFilters,
    getDisplayTimeDurationString,
    getKendoDateTimeFormat,
    getKendoDateFormat,
    getKendoTimeFormat,
    getDateFormat,
    getTimeFormat,
    getTimeFormatWithoutSeconds
}

function getLocalTimeDisplayTextByUserTimeZone(date: any) {
    var localTime = getDateDisplayTextByUserTimeZone(date, 'HH.mm');
    return localTime;
}

function convertToLocalTime(time: Date) {
    let utcTime = moment.utc(time, 'HH:mm').toDate();

    // 1st January 1901 is an arbitrary date which acts as a common ground for time comparisons, 
    // since we cannot compare only times in Javascript.
    let localTime = new Date(1, 1, 1, utcTime.getHours(), utcTime.getMinutes());
    return localTime;
}

function getDateDisplayTextByUserTimeZone(dateToDisplay: any, dateTimeFormat?: string) {
    let offsetInMinutes = accountSessionService.getLoggedInUserTimeZoneOffsetInMinutues();
    return getDateDisplayTextByTimeZone(dateToDisplay, dateTimeFormat, offsetInMinutes);
}

function getDateDisplayTextByTimeZone(dateToDisplay: any, dateTimeFormat?: string, offset?: number) {
    var date = moment.utc(new Date(dateToDisplay)).add(offset, 'm');

    return date.format(dateTimeFormat || configService.getDateTimeFormatConfigurationValue().momentDateTimeFormat);
}

function getDateDisplayText(dateToDisplay: any, dateTimeFormat?: string) {
    var date = moment(new Date(dateToDisplay));
    return date.format(dateTimeFormat || configService.getDateTimeFormatConfigurationValue().momentDateTimeFormat);
}

function getTimeInSeconds(time: string) {
    var totalSeconds = 0;
    var timeComponentList: string[] = time.split(":");
    if (timeComponentList.length == 3) {
        var hours = parseInt(timeComponentList[0]);
        var mint = parseInt(timeComponentList[1]);
        var secs = parseInt(timeComponentList[2]);

        if (hours != NaN && hours > 0) {
            totalSeconds = hours * 3600;
        }

        if (mint != NaN && mint > 0) {
            totalSeconds = totalSeconds + (mint * 60);
        }

        if (secs != NaN && secs > 0) {
            totalSeconds += secs;
        }

    }
    return totalSeconds;
}

function getDisplayTimeDurationString(timeOne: moment.Moment, timeTwo: moment.Moment) {
    let difference = timeOne.diff(timeTwo);
    let duration = moment.duration(difference);
    let days = duration.asDays(); // Total number of days [can go beyond 30. use asDays() instead days()]
    let hours = duration.asHours();
    let minutes = duration.asMinutes();

    let month = duration.months();
    let day = duration.days();
    let hour = duration.hours();
    let minute = duration.minutes();

    let durationString = "";
    if (days > 30) { // If more that 30 days show the month
        durationString = `${month}M: ${day}d: ${hour}h: ${minute}m`;
    }
    else if (hours > 24) { // If more that 24 hours show the days
        durationString = `${day}d: ${hour}h: ${minute}m`;
    }
    else if (minutes > 60) { // If more that 60 minutes show the hours
        durationString = `${hour}h: ${minute}m`;
    }
    else if (minute >= 1) { // If the current minute is 1 or more. Avoid showing seconds
        durationString = `${minute}m`;
    }
    return durationString;
}

function getStartTimeForFilters(duration: any) {
    let startDay = new Date();
    let dayValue;

    switch (duration) {
        case TimeDurations.Weekly:
            dayValue = moment(new Date()).subtract(6, 'days')
            startDay = moment(dayValue).toDate();
            break;
        case TimeDurations.Fortnightly:
            dayValue = moment(new Date()).subtract(13, 'days')
            startDay = moment(dayValue).toDate();
            break;
        case TimeDurations.Monthly:
            dayValue = moment(new Date()).subtract(1, 'months')
            startDay = moment(dayValue).toDate();
            break;
        case TimeDurations.Quarterly:
            dayValue = moment(new Date()).subtract(3, 'months')
            startDay = moment(dayValue).toDate();
            break;
        case TimeDurations.Custom:
            dayValue = moment(new Date()).subtract(6, 'days')
            startDay = moment(dayValue).toDate();
            break;
        default:
            dayValue = moment(new Date()).subtract(6, 'days')
            startDay = moment(dayValue).toDate();
            break;
    }

    return startDay;
}

function getKendoDateTimeFormat() {
    return (contextService.getCurrentDateTimeFormat() || DefaultDateTimeFormats.DateTimeFormat)
        .replace('DD', 'dd').replace('YYYY', 'yyyy').replace('A', 'a').replace(':ss', '');
}

function getKendoDateFormat() {
    return (contextService.getCurrentDateFormat() || DefaultDateTimeFormats.DateFormat)
        .replace('DD', 'dd').replace('YYYY', 'yyyy');
}

function getKendoTimeFormat() {
    return (contextService.getCurrentTimeFormat() || DefaultDateTimeFormats.TimeFormat)
        .replace('A', 'a').replace(':ss', '');
}

function getDateFormat() {
    return (contextService.getCurrentDateFormat() || DefaultDateTimeFormats.DateFormat);
}

function getTimeFormat() {
    return (contextService.getCurrentTimeFormat() || DefaultDateTimeFormats.TimeFormat);
}

function getTimeFormatWithoutSeconds() {
    return (contextService.getCurrentTimeFormat() || DefaultDateTimeFormats.TimeFormat).replace(':ss', '');
}


// WEBPACK FOOTER //
// ./src/modules/shared/services/datetime-util.service.ts