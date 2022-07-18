import * as React from "react";
import { GridCellProps } from "@progress/kendo-react-grid";
import { contextService, localise } from "src/modules/shared/services";
import { dateTimeUtilService } from "src/modules/shared/services/datetime-util.service";

export function DateTimeFormatCell(dateTimeFormat?: string, allowNull?: boolean, timeOffset?: number, highlightField?: string, nullValue?: string) {
    return class extends React.Component<GridCellProps> {
        constructor(props: GridCellProps) {
            super(props);
        }

        render() {
            if (!dateTimeFormat) {
                dateTimeFormat = contextService.getCurrentDateTimeFormat();
            }
            
            return (
                <td className={highlightField && this.props.dataItem[highlightField] ? "highlight-cell" : ""}>
                    {
                        allowNull && !this.props.dataItem[this.props.field || ''] ?
                            localise(nullValue || "TEXT_NA") : timeOffset ?
                                dateTimeUtilService.getDateDisplayTextByTimeZone(this.props.dataItem[this.props.field || ''], dateTimeFormat, timeOffset) :
                                dateTimeUtilService.getDateDisplayTextByUserTimeZone(this.props.dataItem[this.props.field || ''], dateTimeFormat)
                    }
                </td>
            );
        }
    }
}


// WEBPACK FOOTER //
// ./src/modules/shared/components/DataGrid/Cells/DateTimeFormatCell.tsx