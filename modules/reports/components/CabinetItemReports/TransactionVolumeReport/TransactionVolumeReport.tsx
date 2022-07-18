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
import { DailyTransactionData, TransactionVolumeFilters } from 'src/modules/reports/types/dto';
import { TransactionVolumeFilterBox } from './TransactionVolumeFilterBox';
import { TransactionVolumeChart } from './TransactionVolumeChart';
import { reportService } from '../../../services/report.service';

interface Props {
    history: History;
    customerId?: string;
    cabinetGroupId?: string;
    cabinetId?: string;
}

interface State {
    transactionsList?: DailyTransactionData[];
    showFilter: boolean;
    periodString?: string;
    selectedSite: string;
    selectedCabinetId: string;
    startDate?: Date;
    endDate?: Date;
    selectedPeriod?: string;
}

export class TransactionVolumeReport extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.onToggleFilter = this.onToggleFilter.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.getAvgTransactionVolume = this.getAvgTransactionVolume.bind(this);
        this.getTotalVolume = this.getTotalVolume.bind(this);
        this.getMaxTransactionVolume = this.getMaxTransactionVolume.bind(this);
        this.getMinTransactionVolume = this.getMinTransactionVolume.bind(this);

        this.state = {
            showFilter: true,
            transactionsList: [],
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

        let filters: TransactionVolumeFilters = {
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

    onSearch(filters: TransactionVolumeFilters) {
        let periodString = `${moment(filters.startDate).format('dddd Do MMMM YYYY').toUpperCase()} - ${moment(filters.endDate).format('dddd Do MMMM YYYY').toUpperCase()}`;
        let startMoment = moment(filters.startDate).format('DD/MM/YYYY');
        let endMoment = moment(filters.endDate).format('DD/MM/YYYY');
        const customerId = contextService.getCurrentCustomerId();

        reportService.getDailyTransactionsList(customerId, filters.selectedSite, filters.selectedCabinetId,
            filters.selectedRole, filters.selectedUser, startMoment, endMoment)
            .then((dailyTransactionsList: DailyTransactionData[]) => {
                this.setState({ transactionsList: dailyTransactionsList, periodString: periodString });
            });
    }

    //#region Calculation Methods

    getTotalVolume(transactionData: DailyTransactionData[]) {

        let values = transactionData.map(td => {
            return td.totalVolume;
        });
        let total = 0;
        values.forEach(count => {
            total += count
        });
        return total;
    }

    getAvgTransactionVolume(transactionData: DailyTransactionData[]) {

        let days = transactionData.length;
        let total = this.getTotalVolume(transactionData);
        if (total == 0) { return 0 }
        else {
            let average = total / days;
            return Math.floor(average * 100) / 100;
        }
    }

    getMaxTransactionVolume(transactionData: DailyTransactionData[]) {
        let values = transactionData.map(td => {
            return td.totalVolume;
        });
        if (values.length == 0) { return 0 }
        else {
            return Math.max(...values);
        }
    }

    getMinTransactionVolume(transactionData: DailyTransactionData[]) {
        let values = transactionData.map(td => {
            return td.totalVolume;
        });
        if (values.length == 0) { return 0 }
        else {
            return Math.min(...values);
        }
    }

    //#endregion

    render() {
        const { history } = this.props;
        const { selectedSite, selectedCabinetId, transactionsList,
            periodString, selectedPeriod, showFilter } = this.state;
        const customerId = contextService.getCurrentCustomerId();

        let total = this.getTotalVolume(transactionsList || []);
        let averageValue = this.getAvgTransactionVolume(transactionsList || []);
        let maxValue = this.getMaxTransactionVolume(transactionsList || []);
        let minValue = this.getMinTransactionVolume(transactionsList || []);

        let search = qs.parse(history.location.search);

        return (
            <div className="report chart-report transaction-volume-report">
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
                            <TransactionVolumeFilterBox selectedCustomerId={customerId}
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
                            transactionsList && transactionsList.length > 0 ?
                                <Row>
                                    <Col>
                                        <Row>
                                            <Col className="stat-box bg-color-chart-blue" md={6} xl={3}>
                                                <Row>
                                                    <Col className="stat-label"><span>{localise('TEXT_TOTAL_VOLUME').toUpperCase()}:</span></Col>
                                                    <Col className="stat-value"><span>{total}</span></Col>
                                                </Row>
                                            </Col>
                                            <Col className="stat-box bg-color-chart-blue" md={6} xl={3}>
                                                <Row>
                                                    <Col className="stat-label">
                                                        <span>{localise('TEXT_DAILY_AVG')}:<div className="sub-label">({localise('TEXT_VOLUME')})</div></span>
                                                    </Col>
                                                    <Col className="stat-value"><span>{averageValue}</span></Col>
                                                </Row>
                                            </Col>
                                            <Col className="stat-box bg-color-chart-blue" md={6} xl={3}>
                                                <Row>
                                                    <Col className="stat-label"><span>{localise('TEXT_DAY_HIGH')}:</span></Col>
                                                    <Col className="stat-value"><span>{maxValue}</span></Col>
                                                </Row>
                                            </Col>
                                            <Col className="stat-box bg-color-chart-blue" md={6} xl={3}>
                                                <Row>
                                                    <Col className="stat-label"><span>{localise('TEXT_DAY_LOW')}:</span></Col>
                                                    <Col className="stat-value"><span>{minValue}</span></Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                        <TransactionVolumeChart transactionData={transactionsList} average={averageValue} />
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
// ./src/modules/reports/components/CabinetItemReports/TransactionVolumeReport/TransactionVolumeReport.tsx