import * as React from 'react';
import * as moment from 'moment';
import * as qs from "query-string";
import { History } from 'history';
import { Card, CardBody, Row, Col, Label } from 'reactstrap';
import { contextService, localise } from 'src/modules/shared/services';
import { dateTimeUtilService } from 'src/modules/shared/services/datetime-util.service';
import { dashboardService } from 'src/modules/dashboard/services/dashboard.service';
import { BackButton } from 'src/modules/shared/components/ActionButtons/ActionButtons';
import { TimeDurations } from 'src/modules/shared/types/dto';
import { FilterToggle } from '../../shared/FilterToggle';
import { OnTimeReturnsData, OnTimeReturnsFilters } from 'src/modules/reports/types/dto';
import { OnTimeReturnsFilterBox } from './OnTimeReturnsFilterBox';
import { OnTimeReturnsChart } from './OnTimeReturnsChart';
import { reportService } from '../../../services/report.service';

interface Props {
    history: History;
}

interface State {
    onTimeReturnsList?: OnTimeReturnsData[];
    showFilter: boolean;
    periodString?: string;
    selectedSite: string;
    selectedCabinetId: string;
    startDate?: Date;
    endDate?: Date;
    selectedPeriod?: string;
}

export class OnTimeReturnsReport extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.onToggleFilter = this.onToggleFilter.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.getTotalTransactions = this.getTotalTransactions.bind(this);
        this.getTotalOnTimeReturns = this.getTotalOnTimeReturns.bind(this);
        this.getAvgOnTimeReturns = this.getAvgOnTimeReturns.bind(this);
        this.getAvgPercentageOnTimeReturns = this.getAvgPercentageOnTimeReturns.bind(this);
        this.getMinOnTimeReturnsPercentage = this.getMinOnTimeReturnsPercentage.bind(this);
        this.getMaxOnTimeReturnsPercentage = this.getMaxOnTimeReturnsPercentage.bind(this);

        this.state = {
            showFilter: true,
            onTimeReturnsList: [],
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
        let filters: OnTimeReturnsFilters = {
            selectedSite: dashboardService.getSelectedSite(),
            selectedCabinetId: dashboardService.getSelectedCabinet(),
            selectedRole: "any",
            selectedUser: "any",
            startDate: dateTimeUtilService.getStartTimeForFilters(selectedPeriod),
            endDate: new Date
        };

        this.onSearch(filters);
    }

    onToggleFilter() {
        const { showFilter } = this.state;
        this.setState({ ...this.state, showFilter: !showFilter });
    }

    onSearch(filters: OnTimeReturnsFilters) {
        let periodString = `${moment(filters.startDate).format('dddd Do MMMM YYYY').toUpperCase()} - ${moment(filters.endDate).format('dddd Do MMMM YYYY').toUpperCase()}`;
        let startMoment = moment(filters.startDate).format('DD/MM/YYYY');
        let endMoment = moment(filters.endDate).format('DD/MM/YYYY');
        const customerId = contextService.getCurrentCustomerId();

        reportService.getOnTimeReturnsList(customerId, filters.selectedSite, filters.selectedCabinetId,
            filters.selectedRole, filters.selectedUser, startMoment, endMoment)
            .then((returnsList: OnTimeReturnsData[]) => {
                this.setState({ onTimeReturnsList: returnsList, periodString: periodString });
            });
    }

    //#region Calculation Methods

    getTotalOnTimeReturns(transactionData: OnTimeReturnsData[]) {

        let values = transactionData.map(td => {
            return td.onTimeReturnCount;
        });
        let total = 0;
        values.forEach(count => {
            total += count
        });
        return total;
    }

    getAvgOnTimeReturns(transactionData: OnTimeReturnsData[]) {

        let days = transactionData.length;
        let total = this.getTotalOnTimeReturns(transactionData);
        if (total == 0) { return 0 }
        else {
            let average = total / days;
            return Math.floor(average * 100) / 100;
        }
    }

    getTotalTransactions(transactionData: OnTimeReturnsData[]) {

        let values = transactionData.map(td => {
            return td.totalVolume;
        });
        let total = 0;
        values.forEach(count => {
            total += count
        });
        return total;
    }

    getAvgPercentageOnTimeReturns(transactionData: OnTimeReturnsData[]) {
        let avg: number;
        let totalOnTimeReturns = this.getTotalOnTimeReturns(transactionData);
        let totalTransactions = this.getTotalTransactions(transactionData);

        if (totalOnTimeReturns == 0 || totalTransactions == 0) { return 0 }
        else {
            avg = (totalOnTimeReturns / totalTransactions) * 100;
            if (avg % 1 == 0) { }
            return avg.toFixed(2)
        }
    }

    getMaxOnTimeReturnsPercentage(transactionData: OnTimeReturnsData[]) {
        let max: number;
        let percentage = transactionData.map(td => {
            if (td.onTimeReturnCount == 0 || td.totalVolume == 0) {
                return 0;
            }
            else {
                return ((td.onTimeReturnCount / td.totalVolume) * 100);
            }
        });
        if (percentage.length == 0) { return 0 }
        else {
            max = Math.max(...percentage);
            return max.toFixed(2)
        }
    }

    getMinOnTimeReturnsPercentage(transactionData: OnTimeReturnsData[]) {
        let min: number;
        let percentage = transactionData.map(td => {
            if (td.onTimeReturnCount == 0 || td.totalVolume == 0) {
                return 0;
            }
            else {
                return ((td.onTimeReturnCount / td.totalVolume) * 100);
            }
        });
        if (percentage.length == 0) { return 0 }
        else {
            min = Math.min(...percentage);
            return min.toFixed(2)
        }
    }

    //#endregion

    render() {
        const { history } = this.props;
        const { showFilter, onTimeReturnsList: ontimeReturnsList, periodString, selectedSite, selectedCabinetId, selectedPeriod } = this.state;
        const customerId = contextService.getCurrentCustomerId();

        let averageValue = this.getAvgOnTimeReturns(ontimeReturnsList || []);
        let avgpercent = this.getAvgPercentageOnTimeReturns(ontimeReturnsList || []);
        let maxValue = this.getMaxOnTimeReturnsPercentage(ontimeReturnsList || []);
        let minValue = this.getMinOnTimeReturnsPercentage(ontimeReturnsList || []);
        let total = this.getTotalOnTimeReturns(ontimeReturnsList || []);

        let search = qs.parse(history.location.search);

        return (
            <div className="report chart-report on-time-returns-report">
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
                            <OnTimeReturnsFilterBox selectedCustomerId={customerId}
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
                        {
                            ontimeReturnsList && ontimeReturnsList.length > 0 ?
                                <Row>
                                    <Col>
                                        <Row>
                                            <Col className="stat-box bg-color-chart-green" md={6} lg={4}>
                                                <Row>
                                                    <Col className="stat-label"><span>{localise('TEXT_TOTAL_VOLUME').toUpperCase()}:</span></Col>
                                                    <Col className="stat-value"><span>{total}</span></Col>
                                                </Row>
                                            </Col>
                                            <Col className="stat-box bg-color-chart-green" md={6} lg={4}>
                                                <Row>
                                                    <Col className="stat-label"><span>{localise('TEXT_DAILY_AVG')}:<div className="sub-label">({localise('TEXT_VOLUME')})</div></span></Col>
                                                    <Col className="stat-value"><span>{averageValue}</span></Col>
                                                </Row>
                                            </Col>
                                            <Col className="stat-box bg-color-chart-green" md={6} lg={4}>
                                                <Row>
                                                    <Col className="stat-label"><span>{localise('TEXT_DAILY_AVG')}:<div className="sub-label">(% {localise('TEXT_OF')} {localise('TEXT_TOTAL')})</div></span></Col>
                                                    <Col className="stat-value"><span>{avgpercent.toString().replace(/\.00$/, '')}%</span></Col>
                                                </Row>
                                            </Col>
                                            <Col className="stat-box bg-color-chart-green" md={6} lg={4}>
                                                <Row>
                                                    <Col className="stat-label"><span>{localise('TEXT_DAY_HIGH')}:<div className="sub-label">(% {localise('TEXT_OF')} {localise('TEXT_TOTAL')})</div></span></Col>
                                                    <Col className="stat-value"><span>{maxValue.toString().replace(/\.00$/, '')}%</span></Col>
                                                </Row>
                                            </Col>
                                            <Col className="stat-box bg-color-chart-green" md={6} lg={4}>
                                                <Row>
                                                    <Col className="stat-label"><span>{localise('TEXT_DAY_LOW')}:<div className="sub-label">(% {localise('TEXT_OF')} {localise('TEXT_TOTAL')})</div></span></Col>
                                                    <Col className="stat-value"><span>{minValue.toString().replace(/\.00$/, '')}%</span></Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                        <OnTimeReturnsChart transactionData={ontimeReturnsList} />
                                    </Col>
                                </Row>
                                :
                                <div className="text-muted text-center">{localise("ERROR_SEARCH_RESULT")}</div>
                        }
                    </CardBody>
                </Card>
            </div>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetItemReports/OnTimeReturnsReport/OnTimeReturnsReport.tsx