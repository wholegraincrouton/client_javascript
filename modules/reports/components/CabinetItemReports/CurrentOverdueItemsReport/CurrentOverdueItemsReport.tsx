import * as React from "react";
import * as qs from "query-string";
import * as moment from 'moment';
import { History } from 'history';
import { GridColumn, Grid, GridCellProps, GridEvent } from "@progress/kendo-react-grid";
import { localise, accountSessionService, contextService } from "src/modules/shared/services";
import { ColumnOption, OverdueItem } from "src/modules/reports/types/dto";
import { MultiCustodyCell } from "src/modules/shared/components/DataGrid/Cells/MultiCustodyCell";
import { Row, Col, Card, CardBody, Button } from "reactstrap";
import { BackButton, ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { dashboardService } from "src/modules/dashboard/services/dashboard.service";
import { PopOver } from "src/modules/shared/components/PopOver/PopOver";
import { UserProfileImageConstants } from "src/modules/users/types/dto";
import { Location } from "src/modules/shared/types/dto";
import { CabinetLocationCell } from "src/modules/reports/components/shared/GridCells/CabinetLocationCell";
import { dateTimeUtilService } from "src/modules/shared/services/datetime-util.service";
import { reportService } from "../../../services/report.service";
import "../../reports.css";
import { alertActions } from "src/modules/shared/actions/alert.actions";
import { CustomColumnMappingsDialog } from "src/modules/shared/components/CustomColumnMappingsDialog/CustomColumnMappingsDialog";
import { columnConfigurationService } from "src/modules/shared/services/column-configuration.service";
import { ColumnOptionsToggle } from "src/modules/shared/components/CustomColumnMappingsDialog/ToggleColumnOptions";

interface Props {
    history: History;
}

interface State {
    overdueItems: OverdueItem[];
    continuationToken?: string;
    hasMore: boolean;
    showManageColumns: boolean;
    columnOptions: ColumnOption[];
    exportColumns: string[];
    isSearchInvoked: boolean;
}

const hourInMiliSeconds = 1000 * 60 * 60;
const dayInMiliSeconds = 1000 * 60 * 60 * 24;
const reportName = "TEXT_CURRENT_OVERDUE_ITEMS";

export default class CurrentOverdueItemsReport extends React.Component<Props, State> {
    columns: string[] = ["TEXT_ITEM_NUMBER", "TEXT_MULTICUSTODY", "TEXT_KEY_DETAILS", "TEXT_OVERDUE_REASON", "TEXT_CABINET_LOCATION", "TEXT_TRANSACTION_DETAILS", "TEXT_USER_DETAILS"];
    
    constructor(props: Props) {
        super(props);
        this.search = this.search.bind(this);
        this.scrollHandler = this.scrollHandler.bind(this);
        this.manageColumns = this.manageColumns.bind(this);
        this.onColumnChanges = this.onColumnChanges.bind(this);
        this.setColumnsByArray = this.setColumnsByArray.bind(this);

        let tempColumnData: ColumnOption[] = [];
        this.columns.forEach(column => {
            let data: ColumnOption = {
                isHidden: false,
                columnName: column
            }
            tempColumnData.push(data);
        });

        this.state = {
            overdueItems: [],
            hasMore: false,
            showManageColumns: false,
            columnOptions: tempColumnData,
            exportColumns: this.columns,
            isSearchInvoked: false
        };
    }

    componentDidMount() {
        this.search();
        columnConfigurationService.getColumnsByReportName(reportName)
            .then((result) => {
                if (result && result.length > 0)
                    this.setColumnsByArray(result);
            });
    }

    manageColumns() {
        const { showManageColumns } = this.state;
        this.setState({ ...this.state, showManageColumns: !showManageColumns })
    }

    onColumnChanges(value: any) {
        this.setColumnsByArray(value);
    }

    isColumnVisible(columnName: string) {
        const { exportColumns } = this.state;
        return exportColumns.some(s => s == columnName);
    }

    setColumnsByArray(columns: string[]) {
        let options: ColumnOption[] = this.state.columnOptions;
        let selectedColumnsArray: string[] = [];

        if (columns && columns.length > 0) {
            options.forEach(column => column.isHidden = !columns.some(val => val == column.columnName));
        }
        selectedColumnsArray = options.filter(data => !data.isHidden).map(c => c.columnName);

        this.setState({ ...this.state, exportColumns: selectedColumnsArray, columnOptions: options, showManageColumns: false });
    }

    search() {
        const { continuationToken } = this.state;
        let selectedSite = dashboardService.getSelectedSite();
        let selectedCabinetId = dashboardService.getSelectedCabinet();
        const selectedCustomerId = contextService.getCurrentCustomerId();

        reportService.getCurrentOverdueItemList(selectedCustomerId, selectedSite, selectedCabinetId, continuationToken, 10)
            .then((response: any) => {
                this.setState({
                    overdueItems: [...this.state.overdueItems, ...response.results],
                    continuationToken: response.continuationToken,
                    hasMore: response.continuationToken != null,
                    isSearchInvoked: false
                })
            });
    }

    onRowRender(tr: any) {
        var component = tr;
        component = React.cloneElement(tr, { ...tr.props, className: tr.props.className + ' non-selectable-row' }, tr.props.children);
        return component;
    }

    //#region Cells

    keyDetailsCell() {
        return class extends React.Component<GridCellProps> {
            render() {
                let itemName = this.props.dataItem["itemName"];
                let cabinetName = this.props.dataItem["cabinetName"];
                let cabinetLocation: Location = this.props.dataItem["cabinetLocation"]
                let cabinetAddress = cabinetLocation.address;

                return (
                    <td>
                        <Row>
                            <Col>
                                {itemName}
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <small className="text-muted"> {cabinetName} </small>
                            </Col>
                        </Row>
                        {
                            cabinetAddress &&
                            <Row>
                                <Col>
                                    <small className="text-muted"> {cabinetAddress} </small>
                                </Col>
                            </Row>
                        }
                    </td>
                );
            }
        }
    }

    overdueReasonCell() {
        return class extends React.Component<GridCellProps> {
            constructor(props: GridCellProps) {
                super(props);
            }

            render() {
                let isShiftEnded = this.props.dataItem["isShiftEnded"];
                return (
                    <td>
                        {isShiftEnded ? localise("TEXT_USER_SHIFT_ENDED") : localise("TEXT_ITEM_TIME_EXPIRED")}
                    </td>
                );
            }
        }
    }

    transactionDetailsCell() {
        return class extends React.Component<GridCellProps> {
            constructor(props: GridCellProps) {
                super(props);
                this.getWidthPrecentageString = this.getWidthPrecentageString.bind(this);
                this.getBarWidthStringsTuple = this.getBarWidthStringsTuple.bind(this);
            }

            getWidthPrecentageString(widthNumber: number) {
                let widthString = widthNumber.toString() + "%";
                return widthString;
            }

            // Param fullLength:- give as a decimal total length of retrieved and overdue bar
            getBarWidthStringsTuple(fullLength: number, retrieveOverdueTimeDifference: number, retrieveTimeDifference: number) {
                let widthString_tuple = [];
                let firstBarWidthNumber = fullLength * (retrieveOverdueTimeDifference / retrieveTimeDifference);
                let secondBarWidthNumber = fullLength - firstBarWidthNumber;
                widthString_tuple[0] = this.getWidthPrecentageString(firstBarWidthNumber * 100);
                widthString_tuple[1] = this.getWidthPrecentageString(secondBarWidthNumber * 100);
                widthString_tuple[2] = this.getWidthPrecentageString((1 - fullLength) * 100);
                return widthString_tuple;
            }

            render() {
                let firstBarWidthPercentage: string = "0%";
                let secondBarWidthPercentage: string = "0%";
                let thirdBarWidthPercentage: string = "0%";
                let firstBarTimeDuration = "";
                let secondBarTimeDuration = "";
                let firstBarTime = "";
                let secondBarTime = "";

                let itemRetrievedTimeUtc: Date = this.props.dataItem["itemRetrievedTimeUtc"];
                let itemoverdueTimeUtc: Date = this.props.dataItem["itemoverdueTimeUtc"];
                let dateTimeNowLocal = new Date();

                itemoverdueTimeUtc = new Date(itemoverdueTimeUtc);
                itemoverdueTimeUtc.setDate(new Date(itemoverdueTimeUtc).getDate() + 1);

                let itemRetrievedLocalTimeMoment = moment.utc(itemRetrievedTimeUtc).add(accountSessionService.getLoggedInUserTimeZoneOffsetInMinutues(), 'm');
                let itemOverdueLocalTimeMoment = moment.utc(itemoverdueTimeUtc).add(accountSessionService.getLoggedInUserTimeZoneOffsetInMinutues(), 'm');
                let nowLocalTimeMoment = moment.utc(dateTimeNowLocal).add(accountSessionService.getLoggedInUserTimeZoneOffsetInMinutues(), 'm');

                firstBarTimeDuration = dateTimeUtilService.getDisplayTimeDurationString(itemOverdueLocalTimeMoment, itemRetrievedLocalTimeMoment);
                secondBarTimeDuration = dateTimeUtilService.getDisplayTimeDurationString(nowLocalTimeMoment, itemOverdueLocalTimeMoment);
                firstBarTime = itemRetrievedLocalTimeMoment.format(dateTimeUtilService.getTimeFormat());
                secondBarTime = itemOverdueLocalTimeMoment.format(dateTimeUtilService.getTimeFormat());

                let retrieveTimeDifference = nowLocalTimeMoment.diff(itemRetrievedLocalTimeMoment); // dateTimeNowLocal.getTime() - itemRetrievedTimeUtc.getTime();
                let retrieveOverdueTimeDifference = itemOverdueLocalTimeMoment.diff(itemRetrievedLocalTimeMoment); // itemoverdueTimeUtc.getTime() - itemRetrievedTimeUtc.getTime();

                if ((retrieveTimeDifference / hourInMiliSeconds) < 24) {
                    let barWidthStringTuple = this.getBarWidthStringsTuple(0.5, retrieveOverdueTimeDifference, retrieveTimeDifference);
                    firstBarWidthPercentage = barWidthStringTuple[0];
                    secondBarWidthPercentage = barWidthStringTuple[1];
                    thirdBarWidthPercentage = barWidthStringTuple[2];
                }
                else if ((retrieveTimeDifference / hourInMiliSeconds) >= 24 && (retrieveTimeDifference / dayInMiliSeconds) < 7) {
                    let barWidthStringTuple = this.getBarWidthStringsTuple(0.75, retrieveOverdueTimeDifference, retrieveTimeDifference);
                    firstBarWidthPercentage = barWidthStringTuple[0];
                    secondBarWidthPercentage = barWidthStringTuple[1];
                    thirdBarWidthPercentage = barWidthStringTuple[2];
                }
                else if ((retrieveTimeDifference / dayInMiliSeconds) >= 7) {
                    let barWidthStringTuple = this.getBarWidthStringsTuple(1, retrieveOverdueTimeDifference, retrieveTimeDifference);
                    firstBarWidthPercentage = barWidthStringTuple[0];
                    secondBarWidthPercentage = barWidthStringTuple[1];
                    thirdBarWidthPercentage = barWidthStringTuple[2];
                }

                let firstBarStyle = { "width": firstBarWidthPercentage };
                let secondBarStyle = { "width": secondBarWidthPercentage };
                let thirdBarStyle = { "width": thirdBarWidthPercentage };

                return (
                    <td>
                        <div className="progress">
                            <div className="progress-bar progress-bar-bottom-text" role="progressbar" style={firstBarStyle}></div>
                            <div className="progress-bar progress-bar-bottom-text" role="progressbar" style={secondBarStyle}>
                                <small title={secondBarTime}> {secondBarTime} </small>
                            </div>
                            <div className="progress-bar progress-bar-bottom-text" role="progressbar" style={thirdBarStyle}></div>
                        </div>
                        <div className="progress">
                            <div className="progress-bar bg-blue overflow" role="progressbar" style={firstBarStyle}>
                                <small title={firstBarTimeDuration}> {firstBarTimeDuration} </small>
                            </div>
                            <div className="progress-bar progress-bar-danger" role="progressbar" style={secondBarStyle}>
                                <small title={secondBarTimeDuration}> {secondBarTimeDuration} </small>
                            </div>
                            <div className="progress-bar progress-bar-bottom-text" role="progressbar" style={thirdBarStyle}></div>
                        </div>
                        <div className="progress">
                            <div className="progress-bar progress-bar-bottom-text overflow" role="progressbar" style={firstBarStyle}>
                                <small title={firstBarTime}> {firstBarTime} </small>
                            </div>
                            <div className="progress-bar progress-bar-bottom-text" role="progressbar" style={secondBarStyle}></div>
                            <div className="progress-bar progress-bar-bottom-text" role="progressbar" style={thirdBarStyle}></div>
                        </div>
                    </td>
                );
            }
        }
    }

    userDetailsCell() {
        interface State {
            isPopoverOpen: boolean;
        };
        return class extends React.Component<GridCellProps, State> {
            constructor(props: GridCellProps) {
                super(props);
                this.state = {
                    isPopoverOpen: false
                }
                this.onUserDetailClick = this.onUserDetailClick.bind(this);
                this.sendReminderSms = this.sendReminderSms.bind(this);
                this.getPopOverBody = this.getPopOverBody.bind(this);
            }

            onUserDetailClick() {
                let previousValue = this.state.isPopoverOpen;
                this.setState({ isPopoverOpen: !previousValue });
            }

            sendReminderSms(userId: string, cabinetName: string, userName: string, itemIndex: string, itemName: string) {
                if (userId != null) {
                    reportService.sendOverdueAlertSMS(userId, cabinetName, userName, itemIndex, itemName)
                        .then(() => {
                            alertActions.showSuccess('TEXT_OVERDUE_SMS_SENT');
                        });
                }
            }

            getPopOverBody(data: any) {
                let userName = data["userName"];
                let jobTitle = data["userJobTitle"];
                let mobileNumber = data["mobileNumber"];
                let email = data["email"];
                let userId = data["userId"];
                let userImageUrl = data["userImageBlobUrl"] || UserProfileImageConstants.DefaultImagePath;
                let cabinetName = data["cabinetName"];
                let itemIndex = data["itemIndex"];
                let itemName = data["itemName"];

                return (
                    <>
                        <Row>
                            <Col sm={3} md={3} lg={3} xl={3} className="col align-self-center">
                                <img className="avatar-image-popover" src={userImageUrl} />
                            </Col>
                            <Col sm={9} md={9} lg={9} xl={9}>
                                <Row>
                                    <Col> {userName} </Col>
                                </Row>
                                <Row>
                                    <Col> {jobTitle} </Col>
                                </Row>
                                <Row>
                                    <Col> {mobileNumber} </Col>
                                </Row>
                                <Row>
                                    <Col> {email} </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row style={{ marginTop: 10 }}>
                            <Col className="text-center">
                                <ActionButton color="primary" disabled={mobileNumber == null || mobileNumber == undefined}
                                    title={mobileNumber == null || mobileNumber == undefined ? localise("TEXT_NO_MOBILENUMBER_FOR_USER") : undefined}
                                    textKey={localise("TEXT_SEND_REMINDER_SMS")} onClick={() => this.sendReminderSms(userId, cabinetName, userName, itemIndex, itemName)} />
                            </Col>
                        </Row>
                    </>
                );
            }

            render() {
                let userName = this.props.dataItem["userName"];
                let userImageUrl = this.props.dataItem["userImageBlobUrl"] || UserProfileImageConstants.DefaultImagePath;
                let { isPopoverOpen } = this.state;
                let divId = "userdiv" + this.props.dataIndex.toString();
                return (
                    <td onClick={() => this.onUserDetailClick()}>
                        <div id={divId} >
                            <Row>
                                <Col xl={4} className="pt-2 text-center">
                                    <img className="avatar-image clickable" src={userImageUrl} />
                                </Col>
                                <Col xl={8} className="pt-2">
                                    <span>{userName}</span>
                                </Col>
                            </Row>
                        </div>
                        {
                            <PopOver trigger="legacy" target={divId} isOpen={isPopoverOpen}
                                body={this.getPopOverBody(this.props.dataItem)} ></PopOver>
                        }
                    </td>
                );
            }
        }
    }

    scrollHandler = (event: GridEvent) => {
        const { hasMore, isSearchInvoked } = this.state;
        const e = event.nativeEvent;
        
        if (e.target.scrollTop + 10 >= e.target.scrollHeight - e.target.clientHeight && hasMore && !isSearchInvoked) {
            this.search();
            this.setState({ ...this.state, isSearchInvoked: true });
        }
    };

    //#endregion

    render() {
        const { history } = this.props;
        const { overdueItems, hasMore, showManageColumns, exportColumns } = this.state;

        let search = qs.parse(history.location.search);

        return (
            <div className="report current-overdue-items-report">
                <Card>
                    <CardBody>
                        {
                            search.showBackButton &&
                            <Row className="mb-3">
                                <Col>
                                    <BackButton onClick={history.goBack} />
                                </Col>
                            </Row>
                        }
                        <Row>
                            <Col>
                                <span className="badge badge-pill badge-light">
                                    <i className="fas fa-square-full fa-lg color-blue" />
                                    &nbsp;&nbsp;{localise("TEXT_SCHEDULED_TRANSACTION_PERIOD")}
                                </span>
                            </Col>
                            <Col>
                                <span className="badge badge-pill badge-light">
                                    <i className="fas fa-square-full fa-lg color-dark-red" />
                                    &nbsp;&nbsp;{localise("TEXT_OVERDUE_PERIOD")}
                                </span>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        {
                            !showManageColumns &&
                            <Row>
                                <Col><ColumnOptionsToggle toggleColumnOptions={this.manageColumns} /></Col>
                            </Row>
                        }
                        {
                            showManageColumns &&
                            <CustomColumnMappingsDialog titleKey={reportName} columns={this.columns} selectedColumns={exportColumns} onColumnChanges={this.onColumnChanges} closeDialog={this.manageColumns}></CustomColumnMappingsDialog>
                        }
                        <Row>
                            <Col>
                                <Grid rowRender={this.onRowRender} data={overdueItems} onScroll={this.scrollHandler}>
                                    {this.isColumnVisible("TEXT_ITEM_NUMBER") && <GridColumn field="itemIndex" title={localise("TEXT_ITEM_NUMBER")} />}
                                    {this.isColumnVisible("TEXT_MULTICUSTODY") && <GridColumn field="multiCustody" title={localise("TEXT_MULTICUSTODY")} cell={MultiCustodyCell()} />}
                                    {this.isColumnVisible("TEXT_KEY_DETAILS") && <GridColumn field="itemName" title={localise("TEXT_KEY_DETAILS")} cell={this.keyDetailsCell()} />}
                                    {this.isColumnVisible("TEXT_OVERDUE_REASON") && <GridColumn field="isTimerExpired" title={localise("TEXT_OVERDUE_REASON")} cell={this.overdueReasonCell()} />}
                                    {this.isColumnVisible("TEXT_CABINET_LOCATION") && <GridColumn field="cabinetLocation" title={localise("TEXT_CABINET_LOCATION")} cell={CabinetLocationCell()} />}
                                    {this.isColumnVisible("TEXT_TRANSACTION_DETAILS") && <GridColumn field="itemoverdueTimeUtc" title={localise("TEXT_TRANSACTION_DETAILS")} cell={this.transactionDetailsCell()} />}
                                    {this.isColumnVisible("TEXT_USER_DETAILS") && <GridColumn field="userName" title={localise("TEXT_USER_DETAILS")} cell={this.userDetailsCell()} />}
                                </Grid>
                            </Col>
                        </Row>
                        {
                            hasMore &&
                            <Row>
                                <Col>
                                    <Button color="link" className="show-more" onClick={this.search}>
                                        {localise("BUTTON_SHOW_MORE")}
                                    </Button>
                                </Col>
                            </Row>
                        }
                    </CardBody>
                </Card>
            </div>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetItemReports/CurrentOverdueItemsReport/CurrentOverdueItemsReport.tsx