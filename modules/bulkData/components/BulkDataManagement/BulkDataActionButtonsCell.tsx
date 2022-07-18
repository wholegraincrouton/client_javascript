import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";
import { apiService, localise } from "src/modules/shared/services";
import { BulkDataOperationType } from "../../types/dto";
import { SummaryPopup } from "../BulkDataImport/SummaryPopup/SummaryPopup";

export function BulkDataActionButtonsCell() {
    return class extends React.Component<GridCellProps> {
        constructor(props: GridCellProps) {
            super(props);
            this.onDownloadClick = this.onDownloadClick.bind(this);
        }

        onDownloadClick() {
            let apiAction = (this.props.dataItem['operationTypeCode'] == BulkDataOperationType.Export) ?
                'GetExportFileURL' : 'GetImportFileURL';
            apiService.get('bulkData', apiAction, undefined, { id: this.props.dataItem['id'] })
                .then((url: string) => {
                    window.location.href = url;
                });
        }

        getActionButtons() {
            let typeCode = this.props.dataItem['operationTypeCode'];
            let blobReference = this.props.dataItem['blobReference'];
            let logBlobReference = this.props.dataItem['logBlobReference'];

            return <>
                {
                    blobReference
                    &&
                    <span>
                        <i title={localise("TEXT_DOWNLOAD")} className="fa fa-download download-icon color-blue"
                            onClick={this.onDownloadClick} aria-hidden="true"></i>
                    </span>
                }
                {
                    logBlobReference && typeCode == BulkDataOperationType.Import
                    &&
                    <span>
                        <SummaryPopup item={this.props.dataItem} />
                    </span>
                }
            </>
        }

        render() {
            return (
                <td>
                    {this.getActionButtons()}
                </td>
            );
        }
    }
}



// WEBPACK FOOTER //
// ./src/modules/bulkData/components/BulkDataManagement/BulkDataActionButtonsCell.tsx