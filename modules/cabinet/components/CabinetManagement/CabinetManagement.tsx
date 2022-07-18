import * as React from "react";
import { GridColumn } from "@progress/kendo-react-grid";
import { SortDescriptor } from "@progress/kendo-data-query";
import { CabinetSearchCriteria, CabinetProvisioningStatus } from "../../types/dto";
import { SearchPage, SearchPageContainer } from "../../../shared/components/SearchPage";
import { CabinetFilterBox } from "./CabinetFilterBox";
import { DataGrid, LookupTextCell } from "../../../shared/components/DataGrid";
import { GridCellProps } from "@progress/kendo-react-grid";
import { localise, configService, contextService } from "../../../shared/services";
import { dateTimeUtilService } from "src/modules/shared/services/datetime-util.service";
import { LocationAddressCell } from "src/modules/shared/components/DataGrid/Cells/LocationAddressCell";
import "../cabinets.css";

const gridName = "CabinetGrid";
const apiController = "cabinet";

class CabinetManagemnet extends SearchPage<CabinetSearchCriteria>{
    routePath: string = "/cabinets/cabinetmanagement";
    defaultSort: SortDescriptor = { field: "name", dir: "asc" };

    NonSortableHeaderCell(headerText: string) {
        return (<span>{localise(headerText)}</span>);
    }

    render() {
        return (
            <>
                <CabinetFilterBox history={this.props.history} onNewClick={this.goToAddNewPage} customerId={contextService.getCurrentCustomerId()} />

                <div className="largeScreen">
                    <DataGrid history={this.props.history} name={gridName} onRowClick={this.goToDetailPage}>
                        <GridColumn field="name" title={localise("TEXT_CABINET_NAME")} />
                        <GridColumn field="itemCount" width={100} title={localise("TEXT_ITEMS")} />
                        <GridColumn field="remark" title={localise("TEXT_DESCRIPTION")} />
                        <GridColumn field="siteName" title={localise("TEXT_SITE")} />
                        <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_FIRMWARE_VERSION")} sortable={false} field="firmwareVersion" cell={CabinetFieldValueCell()} />
                        <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_CHASSIS_NUMBER")} sortable={false} field="chassisSerialNumber" cell={CabinetFieldValueCell()} />
                        <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_CONNECTIVITY_STATUS")} sortable={false} field="lastDisconnectedOnUtc" cell={CabinetFieldValueCell()} />
                        <GridColumn field="address" title={localise("TEXT_ADDRESS")} cell={LocationAddressCell()} sortable={false} />
                        <GridColumn field="area" title={localise("TEXT_AREA")} cell={LookupTextCell("LIST_AREAS")} />
                    </DataGrid>
                </div>
                <div className="smallScreen">
                    <DataGrid history={this.props.history} name={gridName} onRowClick={this.goToDetailPage}>
                        <GridColumn field="name" title={localise("TEXT_CABINET_NAME")} />
                        <GridColumn field="itemCount" width={100} title={localise("TEXT_ITEMS")} />
                        <GridColumn headerCell={() => this.NonSortableHeaderCell("TEXT_CONNECTIVITY_STATUS")} sortable={false} field="lastDisconnectedOnUtc" cell={CabinetFieldValueCell()} />
                    </DataGrid>
                </div>
            </>
        )
    }
}

function CabinetFieldValueCell() {
    return class extends React.Component<GridCellProps> {
        constructor(props: GridCellProps) {
            super(props);
            this.getOfflineText = this.getOfflineText.bind(this);
        }

        getOfflineText(value: Date) {
            let thresholdConfig = configService.getConfigurationValue("CABINET_OFFLINE_TIME_THRESHOLD", undefined, contextService.getCurrentCustomerId());
            let isThresholdExceeded = (new Date().getTime() - new Date(value).getTime()) >
                dateTimeUtilService.getTimeInSeconds(thresholdConfig != '' ? thresholdConfig : "03:00:00") * 1000;
            return (
                <span className={isThresholdExceeded ? "text-red" : ""}>
                    {`${localise("TEXT_OFFLINE")} | ${localise("TEXT_LAST_CONNECTED_ON")} ${dateTimeUtilService.getDateDisplayTextByUserTimeZone(value)}`}
                </span>
            );
        }

        render() {
            let provisioningStatus: CabinetProvisioningStatus = this.props.dataItem["provisioningStatus"];
            let isVirtualCabinet: boolean = this.props.dataItem["isVirtualCabinet"];
            let field = this.props.field || '';
            let value = this.props.dataItem[field];
            return (
                <td>
                    {
                        provisioningStatus == CabinetProvisioningStatus.Deprovisioned ? localise("TEXT_NOT_PROVISIONED")
                            : isVirtualCabinet ? localise("TEXT_VIRTUAL_CABINET")
                                : field == "lastDisconnectedOnUtc" ?
                                    value == null ? localise("TEXT_ONLINE")
                                        : this.getOfflineText(value)
                                    : value
                    }
                </td>
            );
        }
    }
}

export default SearchPageContainer(CabinetManagemnet, gridName, apiController);


// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetManagement/CabinetManagement.tsx