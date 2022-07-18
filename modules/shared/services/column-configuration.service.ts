import { apiService } from ".";
import { alertActions } from "../actions/alert.actions";

export const columnConfigurationService = {
    getColumnsByReportName,
    setColumnConfigurationsForReport
}

function getColumnsByReportName(reportName: string): Promise<string[]> {
    return apiService.get<string[]>('ColumnConfiguration', 'GetColumnsByReportName', undefined, { reportName: reportName })
}

function setColumnConfigurationsForReport(columnList: string[], reportName: string) {
    apiService.put('ColumnConfiguration', 'SetColumnConfigurationsForReport', { reportName, columnList })
        .then(() => {
            alertActions.showSuccess("TEXT_COLUMN_FILTERS_SAVE_SUCCESS");
        });
}


// WEBPACK FOOTER //
// ./src/modules/shared/services/column-configuration.service.ts