import * as React from 'react';
import * as moment from 'moment';
import * as qs from "query-string";
import { History } from 'history';
import { Card, CardBody, Row, Col, Label } from 'reactstrap';
import { localise, contextService } from 'src/modules/shared/services';
import { dateTimeUtilService } from 'src/modules/shared/services/datetime-util.service';
import { dashboardService } from 'src/modules/dashboard/services/dashboard.service';
import { BackButton } from 'src/modules/shared/components/ActionButtons/ActionButtons';
import { TimeDurations } from 'src/modules/shared/types/dto';
import { FilterToggle } from '../../shared/FilterToggle';
import { OverdueReturnsData, OverdueReturnsFilters } from 'src/modules/reports/types/dto';
import { OverdueReturnsFilterBox } from './OverdueReturnsFilterBox';
import { OverdueReturnsChart } from './OverdueReturnsChart';
import { reportService } from '../../../services/report.service';

interface Props {
    history: History;
    customerId?: string;
    selectedSite?: string;
    cabinetId?: string;
}

interface State {
    overdueReturnsData?: OverdueReturnsData[];
    showFilter: boolean;
    periodString?: string;
    selectedSite: string;
    selectedCabinetId: string;
    startDate?: Date;
    endDate?: Date;
    selectedPeriod?: string;
}

export class OverdueReturnsReport extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.onToggleFilter = this.onToggleFilter.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.getTotalOverdueReturns = this.getTotalOverdueReturns.bind(this);
        this.getAvgOverdueReturns = this.getAvgOverdueReturns.bind(this);
        this.getTotalOverdueTimeInMins = this.getTotalOverdueTimeInMins.bind(this);
        this.getMinOverdueTime = this.getMinOverdueTime.bind(this);
        this.getMaxOverdueTime = this.getMaxOverdueTime.bind(this);

        this.state = {
            showFilter: true,
            overdueReturnsData: [],
            selectedSite: dashboardService.getSelectedSite(),
            selectedCabinetId: dashboardService.getSelectedCabinet(),
            startDate: new Date(),
            endDate: new Date(),
            selectedPeriod: TimeDurations.Weekly
        }
    }

    componentDidMount() {
        const criteria = qs.parse(this.props.history.location.search);
        let selectedPeriod = criteria.selectedPeriod as string;
        let filters: OverdueReturnsFilters = {
            selectedSite: dashboardService.getSelectedSite(),
            selectedCabinetId: dashboardService.getSelectedCabinet(),
            selectedRole: "any",
            selectedUser: "any",
            startDate: dateTimeUtilService.getStartTimeForFilters(selectedPeriod),
            endDate: new Date()
        };
        this.onSearch(filters);
    }

    onToggleFilter() {
        const { showFilter } = this.state;
        this.setState({ ...this.state, showFilter: !showFilter });
    }

    onSearch(filters: OverdueReturnsFilters) {
        let periodString = `${moment(filters.startDate).format('dddd Do MMMM YYYY').toUpperCase()} - ${moment(filters.endDate).format('dddd Do MMMM YYYY').toUpperCase()}`;
        let startMoment = moment(filters.startDate).format('DD/MM/YYYY');
        let endMoment = moment(filters.endDate).format('DD/MM/YYYY');
        const customerId = contextService.getCurrentCustomerId();

        reportService.getOverdueReturnsList(customerId, filters.selectedSite, filters.selectedCabinetId,
            filters.selectedRole, filters.selectedUser, startMoment, endMoment)
            .then((ReturnsList: OverdueReturnsData[]) => {
                this.setState({ overdueReturnsData: ReturnsList, periodString: periodString });
            });
    }

    //#region Calculation Methods

    getTotalOverdueReturns(transactionData: OverdueReturnsData[]) {

        let values = transactionData.map(td => {
            return td.overdueReturnCount;
        });
        let total = 0;
        if (values.length != 0) {
            values.forEach(count => {
                total += count
            });
            return total;
        }
        else return 0;

    }

    getAvgOverdueReturns(transactionData: OverdueReturnsData[]) {

        let days = transactionData.length;
        let total = this.getTotalOverdueReturns(transactionData);
        if (total == 0) { return 0 }
        else {
            let average = total / days;
            return Math.floor(average * 100) / 100;
        }
    }

    getTotalOverdueTimeInMins(transactionData: OverdueReturnsData[]) {
        if (transactionData.length > 0) {
            let mins = transactionData.map(td => {
                return td.overdueTimeInMinutes;
            });
            let totalMins = 0;
            mins.forEach(count => {
                totalMins += count
            });

            return Math.round(totalMins / transactionData.length);
        }
        else { return 0 }

    }

    getMaxOverdueTime(transactionData: OverdueReturnsData[]) {
        let totalMins = transactionData.map(td => {
            if (td.overdueReturnCount == 0) {
                return 0;
            }
            else {
                return td.overdueTimeInMinutes;
            }
        });

        if (totalMins.length == 0) { return 0 }
        else {
            return Math.floor(Math.max(...totalMins));
        }
    }

    getMinOverdueTime(transactionData: OverdueReturnsData[]) {
        let totalMins = transactionData.map(td => {
            if (td.overdueReturnCount == 0) {
                return 0;
            }
            else {
                return td.overdueTimeInMinutes;
            }
        });

        if (totalMins.length == 0) { return 0 }
        else {
            return Math.floor(Math.min(...totalMins));
        }
    }

    //#endregion

    render() {
        const { history } = this.props;
        const { showFilter, overdueReturnsData, periodString, selectedSite, selectedCabinetId, selectedPeriod } = this.state;
        const customerId = contextService.getCurrentCustomerId();

        let total = this.getTotalOverdueReturns(overdueReturnsData || []);
        let totalMins = this.getTotalOverdueTimeInMins(overdueReturnsData || []);
        let averageVolume = this.getAvgOverdueReturns(overdueReturnsData || []);
        let minValue = this.getMinOverdueTime(overdueReturnsData || []);
        let maxValue = this.getMaxOverdueTime(overdueReturnsData || []);

        let search = qs.parse(history.location.search);

        return (
            <div className="report chart-report overdue-returns-report">
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
                        {
                            showFilter &&
                            <OverdueReturnsFilterBox selectedCustomerId={customerId}
                            selectedSite={selectedSite} selectedCabinetId={selectedCabinetId}
                                periodDurationValue={selectedPeriod} onSearch={this.onSearch} />
                        }
                        <Row>
                            <Col md={9}>
                                <Label className="mb-0">{localise('TEXT_PERIOD').toUpperCase()}: {periodString}</Label>
                            </Col>
                            <Col md={3}>
                                <FilterToggle toggleFilter={this.onToggleFilter} showFilter={showFilter} />
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <Row>
                            <Col>
                                {
                                    overdueReturnsData && overdueReturnsData.length > 0 ?
                                        <Row>
                                            <Col>
                                                <Row>
                                                    <Col className="stat-box bg-color-chart-red" md={6} lg={4}>
                                                        <Row>
                                                            <Col className="stat-label"><span>{localise('TEXT_TOTAL_VOLUME').toUpperCase()}:</span></Col>
                                                            <Col className="stat-value"><span>{total}</span></Col>
                                                        </Row>
                                                    </Col>
                                                    <Col className="stat-box bg-color-chart-red" md={6} lg={4}>
                                                        <Row>
                                                            <Col className="stat-label"><span>{localise('TEXT_DAILY_AVG')}:<div className="sub-label">({localise('TEXT_VOLUME')})</div></span></Col>
                                                            <Col className="stat-value"><span>{averageVolume}</span></Col>
                                                        </Row>
                                                    </Col>
                                                    <Col className="stat-box bg-color-chart-red" md={6} lg={4}>
                                                        <Row>
                                                            <Col className="stat-label"><span>{localise('TEXT_DAILY_AVG')}:<div className="sub-label">({localise('TEXT_OVERDUE_TIME')})</div></span></Col>
                                                            <Col className="stat-value"><span>{Math.floor(totalMins / 60) > 0 ? `${Math.floor(totalMins / 60)}h ` : ""}{Math.round(totalMins % 60) >= 0 ? ` ${Math.round(totalMins % 60)}m` : ""}
                                                                <div className="minutes"> {Math.floor(totalMins / 60) > 0 ? `( ${totalMins}m ) ` : ""}</div></span></Col>
                                                        </Row>
                                                    </Col>
                                                    <Col className="stat-box bg-color-chart-red" md={6} lg={4}>
                                                        <Row>
                                                            <Col className="stat-label"><span>{localise('TEXT_DAY_HIGH')}:<div className="sub-label">({localise('TEXT_OVERDUE_TIME')})</div></span></Col>
                                                            <Col className="stat-value"><span> {Math.floor(maxValue / 60) > 0 ? `${Math.floor(maxValue / 60)}h ` : ""}{Math.round(maxValue % 60) >= 0 ? ` ${Math.round(maxValue % 60)}m` : ""}
                                                                <div className="minutes"> {Math.floor(maxValue / 60) > 0 ? `( ${maxValue}m ) ` : ""}</div></span></Col>
                                                        </Row>
                                                    </Col>
                                                    <Col className="stat-box bg-color-chart-red" md={6} lg={4}>
                                                        <Row>
                                                            <Col className="stat-label"><span>{localise('TEXT_DAY_LOW')}:<div className="sub-label">({localise('TEXT_OVERDUE_TIME')})</div></span></Col>
                                                            <Col className="stat-value"><span>{Math.floor(minValue / 60) > 0 ? `${Math.floor(minValue / 60)}h ` : ""}{Math.round(minValue % 60) >= 0 ? ` ${Math.round(minValue % 60)}m` : ""}
                                                                <div className="minutes"> {Math.floor(minValue / 60) > 0 ? `( ${minValue}m )` : ""}</div></span></Col>
                                                        </Row>
                                                    </Col>
                                                </Row>
                                                <OverdueReturnsChart transactionData={overdueReturnsData} />
                                            </Col>
                                        </Row>
                                        :
                                        <div className="text-muted text-center">{localise("ERROR_SEARCH_RESULT")}</div>
                                }
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </div>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetItemReports/OverdueReturnsReport/OverdueReturnsReport.tsx