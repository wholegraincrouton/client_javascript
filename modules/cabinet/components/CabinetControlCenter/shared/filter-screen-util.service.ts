import * as moment from 'moment';

export const filterScreenCommonService = {
    getLastAccessedByText
}

function getLastAccessedByText(name?: string, date?: Date) {
    let timeText: string = "";

    if (date) {
        const diffDuration = moment.duration(moment(new Date()).diff(date));

        if (diffDuration.days() > 1) {
            timeText = `(${diffDuration.days()}d ${diffDuration.hours()}h)`;
        }
        else {
            timeText = `(${diffDuration.hours()}h ${diffDuration.minutes()}m)`;
        }
    }

    return `${name ? name : ""} ${timeText}`;
}



// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetControlCenter/shared/filter-screen-util.service.ts