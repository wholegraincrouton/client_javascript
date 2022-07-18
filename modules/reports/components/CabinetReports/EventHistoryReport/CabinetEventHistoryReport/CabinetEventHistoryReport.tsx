import * as React from "react";
import { Row, Col, CardBody, Card, Label } from "reactstrap";
import { History } from 'history';
import * as qs from "query-string";
import { TimeDurations } from "src/modules/shared/types/dto";
import { dateTimeUtilService } from "src/modules/shared/services/datetime-util.service";
import { reportService } from "../../../../services/report.service";
import { ColumnOption, EventDetail, EventHistoryCabinetView } from "../../../../types/dto";
import { contextService, localise } from "src/modules/shared/services";
import * as moment from 'moment';
import CabinetEventHistoryReportFilter from "./CabinetEventHistoryReportFilter";
import { CabinetEventHistoryReportGrid } from "./CabinetEventHistoryReportGrid";
import { MapPopover } from "src/modules/shared/components/MapPopover/MapPopover";
import { Location } from "src/modules/shared/types/dto";
import { CustomColumnMappingsDialog } from "src/modules/shared/components/CustomColumnMappingsDialog/CustomColumnMappingsDialog";
import { columnConfigurationService } from "src/modules/shared/services/column-configuration.service";
import { ColumnOptionsToggle } from "src/modules/shared/components/CustomColumnMappingsDialog/ToggleColumnOptions";

interface Props {
    history: History;
}

interface State {
    selectedSite: string;
    selectedCabinetId: string;
    selectedItemNumber: number;
    selectedMulticustodyState: string;
    selectedUserId: string;
    selectedEvent: string;
    eventDetails?: EventDetail[];
    cabinetName?: string;
    cabinetLocation?: Location;
    cabinetGroupName?: string;
    selectedPeriod: string;
    startDate: Date;
    endDate: Date;
    jobTitle: string
    periodString: string;
    showManageColumns: boolean;
    columnOptions: ColumnOption[];
    exportColumns: string[];
}

const reportName = "TEXT_CABINET_HISTORY";

export class CabinetEventHistoryReport extends React.Component<Props, State> {
    columns: string[] = ["TEXT_EVENT_DATETIME", "TEXT_EVENT_TYPE", "TEXT_EVENT_NAME", "TEXT_ITEM_NUM", "TEXT_ITEM_NAME", "TEXT_MULTICUSTODY", "TEXT_USER_NAME", "TEXT_JOB_TITLE"];

    constructor(props: Props) {
        super(props);
        this.setStateFromQueryString();
        this.performSearch = this.performSearch.bind(this);
        this.manageColumns = this.manageColumns.bind(this);
        this.onColumnChanges = this.onColumnChanges.bind(this);
        this.setColumnsByArray = this.setColumnsByArray.bind(this);
    }

    setStateFromQueryString() {
        const criteria = qs.parse(this.props.history.location.search);

        let selectedCustomStartDate = new Date();
        let selectedCustomEndDate = new Date();

        let userId = criteria.userId as string;
        let selectedSite = criteria.site as string;
        let selectedCabinetId = criteria.cabinetId as string;
        let selectedPeriod = criteria.period as string;
        let selectedCustomStartDateString = criteria.sDate as string || undefined;
        let selectedCustomEndDateString = criteria.eDate as string || undefined;
        let itemNumber = criteria.iNo as string || '';
        let eventCode = criteria.eCode as string || '';
        let multiCustodyState = criteria.mCus as string;

        if (selectedPeriod == TimeDurations.Custom && selectedCustomStartDateString && selectedCustomEndDateString) {
            selectedCustomStartDate = new Date(selectedCustomStartDateString);
            selectedCustomEndDate = new Date(selectedCustomEndDateString);
        }
        else {
            selectedCustomStartDate = dateTimeUtilService.getStartTimeForFilters(selectedPeriod);
            selectedCustomEndDate = new Date();
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
            selectedUserId: userId,
            selectedSite: selectedSite,
            selectedCabinetId: selectedCabinetId,
            selectedPeriod: selectedPeriod || TimeDurations.Weekly,
            startDate: selectedCustomStartDate,
            endDate: selectedCustomEndDate,
            eventDetails: [],
            periodString: '',
            jobTitle: '',
            selectedEvent: eventCode,
            selectedMulticustodyState: multiCustodyState,
            selectedItemNumber: itemNumber != '' ? parseInt(itemNumber, 10) : -1,
            showManageColumns: false,
            columnOptions: tempColumnData,
            exportColumns: this.columns
        };
    }

    componentDidMount() {
        const { selectedUserId: selectedUserId, selectedSite, selectedCabinetId,
            startDate, endDate, jobTitle, selectedEvent, selectedItemNumber } = this.state;
        const selectedCustomerId = contextService.getCurrentCustomerId();

        this.performSearch(selectedCustomerId, selectedUserId, selectedSite, selectedCabinetId, selectedItemNumber,
            'any', startDate, endDate, jobTitle, selectedEvent);

        columnConfigurationService.getColumnsByReportName(reportName)
            .then((result) => {
                if (result && result.length > 0)
                    this.setColumnsByArray(result);
            });
    }

    performSearch(customerId: string, userId: string, cabinetGroupId: string, cabinetId: string, itemNumber: Number,
        multiCustody: string, startDate: Date, endDate: Date, jobTitle: string, eventCode: string) {

        let periodString = `${moment(startDate).format('dddd Do MMMM YYYY').toUpperCase()} - ${moment(endDate).format('dddd Do MMMM YYYY').toUpperCase()}`;
        let fromDate = moment(startDate).format('DD/MM/YYYY');
        let toDate = moment(endDate).format('DD/MM/YYYY');

        reportService.getCabinetEventHistory(customerId, cabinetGroupId, cabinetId, itemNumber,
            userId, multiCustody, fromDate, toDate, jobTitle, eventCode)
            .then((eventDetailsOfCabinet: EventHistoryCabinetView) => {
                this.setState({
                    ...this.state,
                    cabinetName: eventDetailsOfCabinet.cabinetName,
                    cabinetGroupName: eventDetailsOfCabinet.cabinetGroup,
                    cabinetLocation: eventDetailsOfCabinet.cabinetLocation,
                    eventDetails: eventDetailsOfCabinet.cabinetEvents,
                    selectedPeriod: this.state.selectedPeriod,
                    periodString: periodString
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
        const { selectedSite, selectedCabinetId, selectedPeriod, startDate, endDate,
            jobTitle, cabinetGroupName, selectedUserId: userId, cabinetName,
            selectedEvent, selectedItemNumber, cabinetLocation, selectedMulticustodyState, showManageColumns, exportColumns } = this.state;
        const selectedCustomerId = contextService.getCurrentCustomerId();

        let longitude = cabinetLocation && cabinetLocation.longitude;
        let latitude = cabinetLocation && cabinetLocation.latitude;
        let callPath = qs.parse(this.props.history.location.search).callPath as string;

        return (
            <div className="report cabinet-event-history-report">
                <Card>
                    <CardBody>
                        <CabinetEventHistoryReportFilter selectedJobTitle={jobTitle} periodString={this.state.periodString}
                            selectedMulticustodyState={selectedMulticustodyState} selectedItemNumber={selectedItemNumber}
                            selectedEvent={selectedEvent} selectedUserId={userId} selectedCustomerId={selectedCustomerId}
                            selectedSite={selectedSite} selectedCabinetId={selectedCabinetId}
                            history={this.props.history} performSearch={this.performSearch}
                            periodDurationValue={selectedPeriod} customStartDate={startDate} customEndDate={endDate}
                            callPath={callPath} selectedColumns={exportColumns} />
                    </CardBody>
                </Card>
                {
                    cabinetName && cabinetGroupName &&
                    <Card className="data-card">
                        <CardBody>
                            <Row className="mt-2">
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
                                        longitude && latitude &&
                                        <MapPopover imageURL="/images/cabinetLocationIcon.png" location={[longitude, latitude]} />
                                    }
                                </Col>
                            </Row>
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
                                <CabinetEventHistoryReportGrid eventList={this.state.eventDetails} selectedColumns={exportColumns} />
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </div>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetReports/EventHistoryReport/CabinetEventHistoryReport/CabinetEventHistoryReport.tsx