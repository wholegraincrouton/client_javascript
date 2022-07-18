import * as React from "react";
import { GridColumn as Column, Grid, GridCellProps, GridEvent } from "@progress/kendo-react-grid";
import { localise, lookupService, contextService } from "src/modules/shared/services";
import { DateTimeFormatCell } from "src/modules/shared/components/DataGrid";
import { MultiCustodyCell } from "src/modules/shared/components/DataGrid/Cells/MultiCustodyCell";
import { EventTypeCell } from "src/modules/shared/components/DataGrid/Cells/EventTypeCell";
import { EventDetail } from "../../../types/dto";
import { NavLink } from "react-router-dom";
import * as qs from "query-string";
import { GetJobTitle } from "src/modules/reports/components/shared/GridCells/JobTitleCell";
import { GetCabinetAddress } from "src/modules/reports/components/shared/GridCells/GetCabinetAddress";
import { GetCabinetEventName } from "../../shared/GridCells/GetCabinetEventName";

interface Props {
    eventList?: EventDetail[];
    selectedCustomerId?: string;
    selectedSite?: string;
    selectedEventCode?: string;
    selectedCabinetId?: string;
    selectedMultiCustodyState: string;
    selectedItemNumber: number;
    selectedUserId?: string;
    selectedPeriod: string;
    startDate: Date;
    endDate: Date;
    callPath?: string;
    onScrollEnd(): void;
    selectedColumns: string[];
}

export class EventHistoryReportGrid extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    onRowRender(tr: any) {
        var component = tr;
        component = React.cloneElement(tr, { ...tr.props, className: tr.props.className + ' non-selectable-row' }, tr.props.children);
        return component;
    }

    scrollHandler = (event: GridEvent) => {
        const e = event.nativeEvent;
        if (e.target.scrollTop + 10 >= e.target.scrollHeight - e.target.clientHeight) {
            this.props.onScrollEnd();
        }
    };

    isColumnVisible(columnName: string) {
        const { selectedColumns } = this.props;
        return selectedColumns.some(s => s == columnName);
    }

    render() {
        const { eventList } = this.props

        return (
            <Grid resizable className="item-status-grid" rowRender={this.onRowRender} data={eventList}
                onScroll={this.scrollHandler}>
                {this.isColumnVisible("TEXT_EVENT_DATETIME") && <Column field="eventTime" title={localise("TEXT_EVENT_DATETIME")} cell={DateTimeFormatCell()} />}
                {this.isColumnVisible("TEXT_EVENT_TYPE") && <Column field="eventCode" title={localise("TEXT_EVENT_TYPE")} cell={EventTypeCell()} />}
                {this.isColumnVisible("TEXT_EVENT_NAME") && <Column field="eventCode" title={localise("TEXT_EVENT_NAME")} cell={GetCabinetEventName()} />}
                {this.isColumnVisible("TEXT_ITEM_NUM") && <Column field="itemNumber" title={localise("TEXT_ITEM_NUM")} cell={this.getItemNumber(this.props)} />}
                {this.isColumnVisible("TEXT_ITEM_NAME") && <Column field="itemName" title={localise("TEXT_ITEM_NAME")} cell={this.getItemName(this.props)} />}
                {this.isColumnVisible("TEXT_MULTICUSTODY") && <Column field="multiCustody" title={localise("TEXT_MULTICUSTODY")} cell={MultiCustodyCell()} />}
                {this.isColumnVisible("TEXT_SITE_NAME") && <Column field="siteName" title={localise("TEXT_SITE_NAME")} />}
                {this.isColumnVisible("TEXT_CABINET_NAME") && <Column field="cabinetName" title={localise("TEXT_CABINET_NAME")} cell={this.getCabinet(this.props)} />}
                {this.isColumnVisible("TEXT_CABINET_ADDRESS") && <Column field="cabinetAddress" title={localise("TEXT_CABINET_ADDRESS")} cell={GetCabinetAddress()} />}
                {this.isColumnVisible("TEXT_USER_NAME") && <Column field="userName" title={localise("TEXT_USER_NAME")} cell={this.getUserName(this.props)} />}
                {this.isColumnVisible("TEXT_JOB_TITLE") && <Column field="jobTitle" title={localise("TEXT_JOB_TITLE")} cell={GetJobTitle('userId')} />}
            </Grid>
        );
    }


    getCabinet(props: Props) {
        return class extends React.Component<GridCellProps> {

            customerId = contextService.getCurrentCustomerId();

            constructor(props: GridCellProps) {
                super(props);
            }

            format() {
                let cabinetName = this.props.dataItem["cabinetName"];
                let userId = props.selectedUserId;
                let cabinetId = this.props.dataItem["cabinetId"];
                let itemNumber = props.selectedItemNumber;
                let eventCode = props.selectedEventCode;
                let site = props.selectedSite;
                let multiCustodyState = props.selectedMultiCustodyState;
                let callPath = props.callPath;

                switch (cabinetName) {
                    case null:
                        return <div>{localise("TEXT_NA")}</div>
                    default:
                        var param = qs.stringify({
                            ['contextCustomerId']: this.customerId,
                            ['site']: site,
                            ['cabinetId']: cabinetId,
                            ['userId']: userId,
                            ['iNo']: itemNumber,
                            ['period']: props.selectedPeriod,
                            ['sDate']: props.startDate,
                            ['eDate']: props.endDate,
                            ['eCode']: eventCode,
                            ['mCus']: multiCustodyState,
                            ['callPath']: callPath
                        });

                        return <div>
                            < NavLink to={"/reports/overview/cabinet_events_history?" + param} activeClassName="active" >
                                {cabinetName}
                            </NavLink >
                        </div >
                }
            }

            render() {
                return (<td>
                    {this.format()}
                </td>
                );
            }
        }
    }

    getItemNumber(props: Props) {
        return class extends React.Component<GridCellProps> {
            customerId = contextService.getCurrentCustomerId();

            constructor(props: GridCellProps) {
                super(props);
            }

            format() {
                let itemNumber = this.props.dataItem["itemNumber"];
                let cabinetId = this.props.dataItem["cabinetId"];
                let site = props.selectedSite;
                let userId = props.selectedUserId;
                let eventCode = props.selectedEventCode;
                let callPath = props.callPath;

                switch (itemNumber) {
                    case 0:
                        return <div>{localise("TEXT_NA")}</div>
                    default:
                        var param = qs.stringify({
                            ['contextCustomerId']: this.customerId,
                            ['sId']: site,
                            ['cId']: cabinetId,
                            ['iNo']: itemNumber,
                            ['userId']: userId,
                            ['period']: props.selectedPeriod,
                            ['sDate']: props.startDate,
                            ['eDate']: props.endDate,
                            ['eCode']: eventCode,
                            ['callPath']: callPath
                        });
                }

                return <div>
                    < NavLink to={"/reports/overview/item_events_history?" + param} activeClassName="active" >
                        {itemNumber}
                    </NavLink >
                </div >
            }

            render() {
                return (<td>
                    {this.format()}
                </td>
                );
            }
        }
    }

    getItemName(props: Props) {
        return class extends React.Component<GridCellProps> {
            customerId = contextService.getCurrentCustomerId();
            constructor(props: GridCellProps) {
                super(props);
            }

            format() {
                let itemName = this.props.dataItem["itemName"];
                let itemNumber = this.props.dataItem["itemNumber"];
                let cabinetId = this.props.dataItem["cabinetId"];
                let site = props.selectedSite;
                let userId = props.selectedUserId;
                let eventCode = props.selectedEventCode;
                let callPath = props.callPath;

                switch (itemName) {
                    case null:
                        return <div>{localise("TEXT_NA")}</div>
                    default:
                        var param = qs.stringify({
                            ['contextCustomerId']: this.customerId,
                            ['sId']: site,
                            ['cId']: cabinetId,
                            ['iNo']: itemNumber,
                            ['userId']: userId,
                            ['period']: props.selectedPeriod,
                            ['sDate']: props.startDate,
                            ['eDate']: props.endDate,
                            ['eCode']: eventCode,
                            ['callPath']: callPath
                        });

                        return <div>
                            < NavLink to={"/reports/overview/item_events_history?" + param} activeClassName="active" >
                                {itemName}
                            </NavLink >
                        </div >
                }
            }

            render() {
                return (<td>
                    {this.format()}
                </td>
                );
            }
        }
    }


    getUserName(props: Props) {
        return class extends React.Component<GridCellProps> {
            customerId = contextService.getCurrentCustomerId();

            constructor(props: GridCellProps) {
                super(props);
            }

            format() {
                let userName = this.props.dataItem["userName"];
                let userId = this.props.dataItem["userId"];
                let cabinetId = props.selectedCabinetId;
                let eventCode = props.selectedEventCode;
                let site = props.selectedSite;
                let itemNo = props.selectedItemNumber;
                let multiCustodyState = props.selectedMultiCustodyState;
                let callPath = props.callPath;

                switch (userName) {
                    case null:
                    case '':
                        return <div>{localise("TEXT_NA")}</div>
                    default:
                        var param = qs.stringify({
                            ['contextCustomerId']: this.customerId,
                            ['site']: site,
                            ['cabinetId']: cabinetId,
                            ['userId']: userId,
                            ['iNo']: itemNo,
                            ['period']: props.selectedPeriod,
                            ['sDate']: props.startDate,
                            ['eDate']: props.endDate,
                            ['eCode']: eventCode,
                            ['mCus']: multiCustodyState,
                            ['callPath']: callPath
                        });

                        return <div>
                            < NavLink to={"/reports/overview/user_event_history?" + param} activeClassName="active" >
                                {userName}
                            </NavLink >
                        </div >
                }
            }

            render() {
                return (<td>
                    {this.format()}
                </td>
                );
            }
        }
    }

    GetEventName() {
        return class extends React.Component<GridCellProps> {
            constructor(props: GridCellProps) {
                super(props);
            }

            format() {
                let value = this.props.dataItem["eventName"]
                switch (value) {
                    case null:
                        return <div>{localise("TEXT_NA")}</div>
                    default:
                        return <div>{lookupService.getTextFromMultipleLookups(["LIST_CABINET_ITEM_EVENTS", "LIST_CABINET_HIGH_PRIORITY_EVENTS",
                            "LIST_CABINET_LOW_PRIORITY_EVENTS"], value)}</div>
                }
            }

            render() {
                return (<td>
                    {this.format()}
                </td>
                );
            }
        }
    }


    IsMultiCustody() {
        return class extends React.Component<GridCellProps> {
            constructor(props: GridCellProps) {
                super(props);
            }

            getState() {
                switch (this.props.dataItem["multiCustody"]) {
                    case true:
                        return <div className="text-center"><i className="far fa-check-circle fa-lg color-green"></i></div>
                    default:
                        return <div></div>
                }
            }

            render() {
                return (<td>
                    {this.getState()}
                </td>
                );
            }
        }
    }
}



// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetReports/EventHistoryReport/EventHistoryReportGrid.tsx