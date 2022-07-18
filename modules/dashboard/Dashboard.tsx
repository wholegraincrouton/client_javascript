import * as React from 'react';
import DashboardFilter from './DashboardFilter';
import { DashboardFilterDetails, CabinetAlarmSummary, CabinetSnapshot, CabinetItemEventSummary } from './types/dto';
import Row from 'reactstrap/lib/Row';
import Col from 'reactstrap/lib/Col';
import { CabinetMapWidget } from './widgets/CabinetMapWidget';
import { connect } from 'react-redux';
import { dashBoardActions } from './actions/dashboard-actions';
import { StoreState } from 'src/redux/store';
import { History } from 'history';
import { dashboardService } from './services/dashboard.service';
import AlarmsWidget from './widgets/AlarmsWidget';
import EventsWidget from './widgets/EventsWidget';
import { TimeDurations } from 'src/modules/shared/types/dto';
import { dateTimeUtilService } from 'src/modules/shared/services/datetime-util.service';
import * as moment from 'moment';

interface Props {
    customerId: string;
    history: History;
    cabinetAlarmSummary: CabinetAlarmSummary;
    cabinetSnapshotList: CabinetSnapshot[];
    itemEventSummary: CabinetItemEventSummary;
    loadItemEventStats: (customerId: string, site: string, cabinetId: string, from: Date, end: Date) => void;
    loadAlarmStats: (customerId: string, site: string, cabinetId: string, from: string, end: string) => void;
    loadCabinetSnapshotSummaryList: (customerId: string, site: string, cabinetId: string) => void;
    saveDashboardFilters: (site: string, cabinetId: string, eventsTimeDuration: string, alarmsTimeDuration: string) => void
}

interface DateFilters {
    fromDate: string,
    toDate: string
}

class Dashboard extends React.Component<Props> {
    selectedCabinetId: string;
    selectedSite: string;
    selectedEventsTimeDuration: string;
    selectedAlarmsTimeDuration: string;

    constructor(props: any) {
        super(props);
        this.onFilterChange = this.onFilterChange.bind(this);
        this.onItemWidgetTimeDurationChange = this.onItemWidgetTimeDurationChange.bind(this);
        this.onAlarmWidgetTimeDurationChange = this.onAlarmWidgetTimeDurationChange.bind(this);
        this.performSearch = this.performSearch.bind(this);
    }

    componentDidMount() {
        this.getData();
    }

    componentDidUpdate(previousProps: any) {
        const previousCustomerId = previousProps.customerId;
        const customerId = this.props.customerId;

        if (customerId != previousCustomerId) {
            this.getData();
        }
    }

    getData() {
        this.selectedSite = dashboardService.getSelectedSite();
        this.selectedCabinetId = dashboardService.getSelectedCabinet();
        this.selectedEventsTimeDuration = dashboardService.getItemEventsSelectedTimeDuration();
        this.selectedAlarmsTimeDuration = dashboardService.getAlarmsSelectedTimeDuration();

        this.props.saveDashboardFilters(this.selectedSite, this.selectedCabinetId,
            this.selectedEventsTimeDuration, this.selectedAlarmsTimeDuration);

        this.performSearch(this.selectedSite, this.selectedCabinetId, this.selectedEventsTimeDuration, this.selectedAlarmsTimeDuration);
    }

    onFilterChange(filter: DashboardFilterDetails) {
        this.selectedSite = filter.selectedSite;
        this.selectedCabinetId = filter.selectedCabinetId;
        this.performSearch(filter.selectedSite, filter.selectedCabinetId, filter.selectedItemEventsTimeDuration, filter.selectedAlarmsTimeDuration);
        this.props.saveDashboardFilters(filter.selectedSite, filter.selectedCabinetId,
            filter.selectedItemEventsTimeDuration, filter.selectedAlarmsTimeDuration);
    }

    onItemWidgetTimeDurationChange(timeDuration: string) {
        const { customerId } = this.props;
        this.props.loadItemEventStats(customerId, this.selectedSite,
            this.selectedCabinetId, this.getFromDate(timeDuration), new Date());
        this.props.saveDashboardFilters(this.selectedSite, this.selectedCabinetId,
            timeDuration, this.selectedAlarmsTimeDuration);
    }

    getDateRange(timeDuration: string) {
        let alarmDateFilters: DateFilters = {
            fromDate: moment(dateTimeUtilService.getStartTimeForFilters(timeDuration)).format('DD/MM/YYYY'),
            toDate: moment(new Date()).format('DD/MM/YYYY')
        }
        return alarmDateFilters;
    }

    onAlarmWidgetTimeDurationChange(timeDuration: string) {
        const { customerId } = this.props;
        var range = this.getDateRange(timeDuration);
        this.props.loadAlarmStats(customerId, this.selectedSite,
            this.selectedCabinetId, range.fromDate, range.toDate);
        this.props.saveDashboardFilters(this.selectedSite, this.selectedCabinetId,
            this.selectedEventsTimeDuration, timeDuration);
    }

    performSearch(site: string, cabinetId: string, itemEventsTimeDuration: string, alarmTimeDuration: string) {
        const { customerId } = this.props;
        this.props.loadItemEventStats(customerId, site, cabinetId, this.getFromDate(itemEventsTimeDuration), new Date());
        var range = this.getDateRange(alarmTimeDuration);
        this.props.loadAlarmStats(customerId, site, cabinetId, range.fromDate, range.toDate);
        this.props.loadCabinetSnapshotSummaryList(customerId, site, cabinetId);
    }

    getFromDate(timeDuration: string) {
        let pastDate = new Date();
        switch (timeDuration) {
            case (TimeDurations.Weekly):
                pastDate.setDate(pastDate.getDate() - 6);
                break;
            case (TimeDurations.Fortnightly):
                pastDate.setDate(pastDate.getDate() - 13);
                break;
            case (TimeDurations.Monthly):
                pastDate.setMonth(pastDate.getMonth() - 1);
                break;
            case (TimeDurations.Quarterly):
                pastDate.setMonth(pastDate.getMonth() - 3);
                break;
        }
        return pastDate;
    }

    render() {
        const { customerId, cabinetSnapshotList, cabinetAlarmSummary, history, itemEventSummary } = this.props;

        return (
            <div className="dashboard">
                <DashboardFilter customerId={customerId} onSearchFilterChange={this.onFilterChange} />
                <Row>
                    <Col lg={6} className="dashboard-widget item-events-widget">
                        <EventsWidget data={itemEventSummary} history={history} customerId={customerId}
                            onTimeDurationChange={this.onItemWidgetTimeDurationChange} />
                    </Col>
                    <Col lg={6} className="dashboard-widget alarms-widget">
                        <AlarmsWidget history={history} data={cabinetAlarmSummary && cabinetAlarmSummary}
                            customerId={customerId} onTimeDurationChange={this.onAlarmWidgetTimeDurationChange} />
                    </Col>
                </Row>
                <Row>
                    <Col className="dashboard-widget map-widget">
                        <CabinetMapWidget site={this.selectedSite} cabinetId={this.selectedCabinetId}
                            history={history} customerId={customerId} cabinetList={cabinetSnapshotList} />
                    </Col>
                </Row>
            </div>
        );
    }
}

const mapStateToProps = (store: StoreState) => {
    const { cabinetAlarmSummary, cabinetSnapshotList, itemEventSummary } = store.dashboard;

    return {
        customerId: store.customer,
        cabinetAlarmSummary,
        cabinetSnapshotList,
        itemEventSummary
    };
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        loadItemEventStats: (customerId: string, site: string, cabinetId: string, from: Date, end: Date) =>
            dispatch(dashBoardActions.loadItemEventStats(customerId, site, cabinetId, from, end)),
        loadAlarmStats: (customerId: string, site: string, cabinetId: string, from: string, end: string) =>
            dispatch(dashBoardActions.loadAlarmStats(customerId, site, cabinetId, from, end)),
        loadCabinetSnapshotSummaryList: (customerId: string, site: string, cabinetId: string) =>
            dispatch(dashBoardActions.loadCabinetSnapshotSummaryList(customerId, site, cabinetId)),
        saveDashboardFilters: (site: string, cabinetId: string, eventsTimeDuration: string, alarmsTimeDuration: string) =>
            dispatch(dashBoardActions.saveDashboardFilters(site, cabinetId, eventsTimeDuration, alarmsTimeDuration))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);



// WEBPACK FOOTER //
// ./src/modules/dashboard/Dashboard.tsx