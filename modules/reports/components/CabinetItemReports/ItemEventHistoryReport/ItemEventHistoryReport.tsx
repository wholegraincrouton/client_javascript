import * as React from "react";
import * as qs from "query-string";
import * as moment from 'moment';
import { History } from 'history';
import { Row, Col, CardBody, Card, Label } from "reactstrap";
import { ItemEventHistoryReportGrid } from "./ItemEventHistoryReportGrid";
import { ItemEventHistoryDetail, ItemEventViewFilters, ItemEventHistory, ColumnOption } from "../../../types/dto";
import ItemEventHistoryReportFilter from "./ItemEventHistoryReportFilter";
import { TimeDurations } from "src/modules/shared/types/dto";
import { dateTimeUtilService } from "src/modules/shared/services/datetime-util.service";
import { reportService } from "../../../services/report.service";
import { contextService, localise } from "src/modules/shared/services";
import { Location } from "src/modules/shared/types/dto";
import { MapPopover } from "src/modules/shared/components/MapPopover/MapPopover";
import { DefaultDateTimeFormats } from "src/modules/shared/constants/datetime.constants";
import { CustomColumnMappingsDialog } from "src/modules/shared/components/CustomColumnMappingsDialog/CustomColumnMappingsDialog";
import { columnConfigurationService } from "src/modules/shared/services/column-configuration.service";
import { ColumnOptionsToggle } from "src/modules/shared/components/CustomColumnMappingsDialog/ToggleColumnOptions";

interface Props {
    history: History;
}

interface State {
    ItemEventsList?: ItemEventHistoryDetail[];
    filters: ItemEventViewFilters;
    showFilter: boolean;
    selectedPeriod: string;
    cabinetName: string;
    cabinetGroupName: string;
    cabinetLocation: Location;
    itemName: string;
    multiCustody: boolean;
    periodString: string;
    showManageColumns: boolean;
    columnOptions: ColumnOption[];
    exportColumns: string[];
}

const reportName = "TEXT_ITEM_HISTORY";
const currentPath = "/reports/overview";

export class ItemEventHistoryReport extends React.Component<Props, State> {

    columns: string[] = ["TEXT_EVENT_DATETIME", "TEXT_ITEM_NUM", "TEXT_CABINET_NAME", "TEXT_EVENT_TYPE", "TEXT_EVENT_NAME", "TEXT_USER_NAME", "TEXT_JOB_TITLE"];

    constructor(props: Props) {
        super(props);
        const criteria = qs.parse(this.props.history.location.search);

        let selectedStartDate: Date;
        let selectedEndDate: Date;

        let selectedSite = criteria.sId as string || 'any';
        let selectedCabinetId = criteria.cId as string || 'any';
        let selectedItemIndex = criteria.iNo as string || '-1';
        let userId = criteria.userId ? criteria.userId as string : 'any';
        let selectedPeriod = criteria.period ? criteria.period as string : TimeDurations.Weekly;
        let selectedStartDateString = criteria.sDate as string || undefined;
        let selectedEndDateString = criteria.eDate as string || undefined;
        let selectedEvent = criteria.eCode ? criteria.eCode as string : 'any';

        if (selectedPeriod == TimeDurations.Custom && selectedStartDateString && selectedEndDateString) {
            selectedStartDate = new Date(selectedStartDateString);
            selectedEndDate = new Date(selectedEndDateString);
        }
        else {
            selectedStartDate = dateTimeUtilService.getStartTimeForFilters(selectedPeriod);
            selectedEndDate = new Date();
        }

        let tempColumnData: ColumnOption[] = [];
        this.columns.forEach(column => {
            let data: ColumnOption = {
                isHidden: false,
                columnName: column
            }
            tempColumnData.push(data);
        });

        this.state = {
            filters: {
                selectedSite: selectedSite,
                selectedCabinetId: selectedCabinetId,
                selectedItemIndex: parseInt(selectedItemIndex),
                multiCustody: 'any',
                selectedEvent: selectedEvent,
                userId: userId,
                jobTitle: '',
                startDate: selectedStartDate,
                endDate: selectedEndDate,
                period: selectedPeriod
            },
            selectedPeriod: selectedPeriod,
            cabinetName: '',
            cabinetGroupName: '',
            cabinetLocation: {},
            itemName: '',
            ItemEventsList: [],
            multiCustody: true,
            showFilter: false,
            periodString: '',
            showManageColumns: false,
            columnOptions: tempColumnData,
            exportColumns: this.columns
        }
        this.performSearch = this.performSearch.bind(this);
        this.manageColumns = this.manageColumns.bind(this);
        this.onColumnChanges = this.onColumnChanges.bind(this);
        this.setColumnsByArray = this.setColumnsByArray.bind(this);
    }

    componentDidMount() {
        this.performSearch(this.state.filters);

        columnConfigurationService.getColumnsByReportName(reportName)
            .then((result) => {
                if (result && result.length > 0)
                    this.setColumnsByArray(result);
            });
    }

    performSearch(filters: ItemEventViewFilters) {
        let startDate = moment(filters.startDate).format(DefaultDateTimeFormats.DateFormat);
        let endDate = moment(filters.endDate).format(DefaultDateTimeFormats.DateFormat);
        let periodString = `${moment(filters.startDate).format('dddd Do MMMM YYYY').toUpperCase()} - ${moment(filters.endDate).format('dddd Do MMMM YYYY').toUpperCase()}`;
        const selectedCustomerId = contextService.getCurrentCustomerId();

        reportService.getItemEventHistory(selectedCustomerId, filters.selectedSite,
            filters.selectedCabinetId, filters.selectedItemIndex, filters.selectedEvent, filters.multiCustody,
            filters.userId, filters.jobTitle, startDate, endDate)
            .then((ItemHistory: ItemEventHistory) => {
                this.setState({
                    ...this.state,
                    cabinetName: ItemHistory.cabinetName,
                    cabinetLocation: ItemHistory.cabinetLocation,
                    multiCustody: ItemHistory.multiCustody,
                    itemName: ItemHistory.itemName,
                    ItemEventsList: ItemHistory.itemEvents,
                    periodString: periodString,
                    cabinetGroupName: ItemHistory.cabinetGroup,
                    filters: {
                        ...this.state.filters,
                        selectedCabinetId: filters.selectedCabinetId,
                        selectedItemIndex: filters.selectedItemIndex,
                        period: filters.period
                    }
                });
            });
    }

    manageColumns() {
        const { showManageColumns } = this.state;
        this.setState({ ...this.state, showManageColumns: !showManageColumns })
    }

    onColumnChanges(value: any) {
        this.setColumnsByArray(value);
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

    render() {
        const { selectedSite, selectedCabinetId, selectedItemIndex,
            period, userId, selectedEvent, startDate, endDate } = this.state.filters;
        const { cabinetName, cabinetLocation, itemName, cabinetGroupName, multiCustody, showManageColumns, exportColumns } = this.state;
        const selectedCustomerId = contextService.getCurrentCustomerId();

        let longitude = cabinetLocation && cabinetLocation.longitude;
        let latitude = cabinetLocation && cabinetLocation.latitude;
        let callPath = qs.parse(this.props.history.location.search).callPath as string || currentPath;        

        return (
            <div className="report cabinet-item-event-history-report">
                <Card>
                    <CardBody>
                        <ItemEventHistoryReportFilter selectedEvent={selectedEvent} selectedUserId={userId}
                            selectedMulticustodyState={multiCustody ? 'yes' : 'no'} startDate={startDate}
                            selectedCustomerId={selectedCustomerId} endDate={endDate} periodString={this.state.periodString}
                            selectedSite={selectedSite} selectedCabinetId={selectedCabinetId}
                            history={this.props.history} performSearch={this.performSearch} itemIndex={selectedItemIndex}
                            periodDurationValue={period} callPath={callPath} selectedColumns={exportColumns} />
                    </CardBody>
                </Card>
                {
                    cabinetName && cabinetGroupName &&
                    <Card className="data-card">
                        <CardBody>
                            <Row className="mt-2 mb-2">
                                <Col lg={3}>
                                    <Label>{localise("TEXT_CABINET_NAME")} : {cabinetName}</Label>
                                </Col>
                                <Col lg={3}>
                                    <Label>{localise("TEXT_CABINET_GROUP_NAME")} : {cabinetGroupName}</Label>
                                </Col>
                                <Col lg={6}>
                                    <Label className="mr-2">
                                        {localise("TEXT_CABINET_ADDRESS")}
                                        &nbsp;:&nbsp;
                                        {(cabinetLocation && cabinetLocation.address) || localise('TEXT_NOT_FOUND')}
                                    </Label>
                                    {
                                        latitude && longitude &&
                                        <MapPopover imageURL="/images/cabinetLocationIcon.png" location={[longitude, latitude]} />
                                    }
                                </Col>
                            </Row>
                            {
                                itemName && selectedItemIndex != -1 &&
                                <Row>
                                    <Col lg={3}>
                                        <Label>{localise("TEXT_ITEM_NAME")} : {itemName}</Label>
                                    </Col>
                                    <Col lg={3}>
                                        <Label>{localise("TEXT_ITEM_NUM")} : {selectedItemIndex}</Label>
                                    </Col>
                                    <Col lg={6}>
                                        <Label>
                                            {localise("TEXT_MULTICUSTODY")}
                                            &nbsp;:&nbsp;
                                            {
                                                <span>
                                                    <i className={`far fa-${multiCustody ? "check" : "times"}-circle
                                                fa-lg color-${multiCustody ? "green" : "ash"}`} />
                                                </span>
                                            }
                                        </Label>
                                    </Col>
                                </Row>
                            }
                        </CardBody>
                    </Card>
                }
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
                                <ItemEventHistoryReportGrid ItemEventsList={this.state.ItemEventsList} selectedColumns={exportColumns} />
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </div>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetItemReports/ItemEventHistoryReport/ItemEventHistoryReport.tsx