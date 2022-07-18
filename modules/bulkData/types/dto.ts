export enum BulkDataOperationType {
    Import = "IMPORT",
    Export = "EXPORT"
}

export enum BulkDataOperationStatus {
    Queued = "QUEUED",
    Running = "RUNNING",
    Complete = "COMPLETE",
    CompleteWithErrors = "COMPLETE_WITH_ERRORS",
    Failed = "FAILED"
}

export interface SheetError {
    sheetName?: string;
    entityType?: string;
    errorRows: RowError[];
    totalProcessedRowCount: number;
    successObjectsCount: number;
    errorMessages?: string[];
}

export interface RowError {
    rowIndex: number;
    errorMessage?: string;
    errorCells: CellError[];
}

export interface CellError {
    value?: string;
    columnName?: string;
    hasRequiredError: boolean;
    hasDataFormatError: boolean;
    rowIndex: number;
    colIndex: number;
}


// WEBPACK FOOTER //
// ./src/modules/bulkData/types/dto.ts