import * as React from "react";
import * as qs from "query-string";
import * as moment from 'moment';
import { Row, Col, CardBody, Card, Label } from "reactstrap";
import { History } from 'history';
import UserEventHistoryReportFilter from "./UserEventHistoryReportFilter";
import { UserEventHistoryReportGrid } from "./UserEventHistoryReportGrid";
import { TimeDurations } from "src/modules/shared/types/dto";
import { dateTimeUtilService } from "src/modules/shared/services/datetime-util.service";
import { reportService } from "../../../../services/report.service";
import { ColumnOption, EventDetail, EventHistoryUserView } from "../../../../types/dto";
import { UserProfileImageConstants } from "src/modules/users/types/dto";
import { contextService, localise } from "src/modules/shared/services";
import { CustomColumnMappingsDialog } from "src/modules/shared/components/CustomColumnMappingsDialog/CustomColumnMappingsDialog";
import { columnConfigurationService } from "src/modules/shared/services/column-configuration.service";
import { ColumnOptionsToggle } from "src/modules/shared/components/CustomColumnMappingsDialog/ToggleColumnOptions";

interface Props {
    history: History;
}

interface State {
    selectedSite: string;
    selectedCabinetId: string;
    selectedUserId: string;
    selectedItemNumber: number;
    selectedMulticustodyState: string;
    selectedEvent: string;
    eventDetails?: EventDetail[];
    userName?: string;
    mobileNumber?: string;
    email?: string;
    userImageBlobUrl?: string;
    jobTitle?: string;
    selectedPeriod: string;
    startDate: Date;
    endDate: Date;
    periodString: string;
    showManageColumns: boolean;
    columnOptions: ColumnOption[];
    exportColumns: string[];
}

const reportName = "TEXT_ITEM_RECORDS";

export class UserEventHistoryReport extends React.Component<Props, State> {
    columns: string[] = ["TEXT_EVENT_DATETIME", "TEXT_EVENT_TYPE", "TEXT_EVENT_NAME", "TEXT_ITEM_NUM", "TEXT_ITEM_NAME", "TEXT_MULTICUSTODY", "TEXT_SITE_NAME", "TEXT_CABINET_NAME", "TEXT_CABINET_ADDRESS"];

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
        let selectedEvent = criteria.eCode as string;
        let multiCustodyState = criteria.mCus as string;
        let selectedCustomStartDateString = criteria.sDate as string || undefined;
        let selectedCustomEndDateString = criteria.eDate as string || undefined;
        let itemNumber = criteria.iNo as string || '';

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
            selectedEvent: selectedEvent || 'any',
            selectedMulticustodyState: multiCustodyState || 'any',
            selectedItemNumber: itemNumber != '' ? parseInt(itemNumber, 10) : -1,
            showManageColumns: false,
            columnOptions: tempColumnData,
            exportColumns: this.columns
        };
    }

    componentDidMount() {
        const { selectedUserId: selectedUserId, selectedSite, selectedCabinetId,
            startDate, endDate, selectedEvent, selectedItemNumber, selectedMulticustodyState } = this.state;
        const selectedCustomerId = contextService.getCurrentCustomerId();

        this.performSearch(selectedCustomerId, selectedUserId, selectedSite, selectedCabinetId, selectedItemNumber,
            selectedMulticustodyState, startDate, endDate, selectedEvent);

        columnConfigurationService.getColumnsByReportName(reportName)
            .then((result) => {
                if (result && result.length > 0)
                this.setColumnsByArray(result);
            });
    }

    performSearch(customerId: string, userId: string, site: string, cabinetId: string, itemNumber: Number,
        multiCustody: string, startDate: Date, endDate: Date, eventCode: string) {

        let periodString = `${moment(startDate).format('dddd Do MMMM YYYY').toUpperCase()} - ${moment(endDate).format('dddd Do MMMM YYYY').toUpperCase()}`;
        let fromDate = moment(startDate).format('DD/MM/YYYY');
        let toDate = moment(endDate).format('DD/MM/YYYY');

        reportService.getUserEventHistory(customerId, site, cabinetId, itemNumber,
            userId, multiCustody, fromDate, toDate, eventCode)
            .then((eventDetailsOfuser: EventHistoryUserView) => {
                this.setState({
                    ...this.state,
                    userName: eventDetailsOfuser.name,
                    jobTitle: eventDetailsOfuser.jobTitle,
                    email: eventDetailsOfuser.email,
                    mobileNumber: eventDetailsOfuser.mobile,
                    userImageBlobUrl: eventDetailsOfuser.userImageBlobUrl,
                    eventDetails: eventDetailsOfuser.userEvents,
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
        let callPath = qs.parse(this.props.history.location.search).callPath as string;

        const { selectedSite, selectedCabinetId, selectedPeriod, startDate, endDate,
            userName, jobTitle, mobileNumber, email, userImageBlobUrl, selectedUserId: userId,
            selectedEvent, selectedItemNumber, selectedMulticustodyState, showManageColumns, exportColumns } = this.state;
        const selectedCustomerId = contextService.getCurrentCustomerId();

        return (
            <div className="report user-event-history-report">
                <Card>
                    <CardBody>
                        <UserEventHistoryReportFilter selectedItemNumber={selectedItemNumber}
                            selectedMulticustodyState={selectedMulticustodyState} periodString={this.state.periodString}
                            selectedUserId={userId} selectedEvent={selectedEvent} selectedCustomerId={selectedCustomerId}
                            selectedSite={selectedSite} selectedCabinetId={selectedCabinetId}
                            history={this.props.history} performSearch={this.performSearch}
                            periodDurationValue={selectedPeriod} customStartDate={startDate}
                            customEndDate={endDate} callPath={callPath} />
                    </CardBody>
                </Card>
                <Card className="data-card">
                    <CardBody>
                        <Row className="mt-1">
                            <Col>
                                <img className="avatar-image mr-2" src={userImageBlobUrl || UserProfileImageConstants.DefaultImagePath} />
                                <Label>{localise("TEXT_NAME")} : {userName}</Label>
                            </Col>
                            <Col className="pt-2">
                                <Label>{localise("TEXT_DESIGNATION")} : {jobTitle}</Label>
                            </Col>
                            <Col className="pt-2">
                                <Label>{localise("TEXT_MOBILE_NUMBER")} : {mobileNumber || localise('TEXT_NOT_FOUND')}</Label>
                            </Col>
                            <Col className="pt-2">
                                <Label>{localise("TEXT_EMAIL")} : {email || localise('TEXT_NOT_FOUND')}</Label>
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
                                <UserEventHistoryReportGrid eventList={this.state.eventDetails} selectedColumns={exportColumns} />
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </div>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetReports/EventHistoryReport/UserEventHistoryReport/UserEventHistoryReport.tsx