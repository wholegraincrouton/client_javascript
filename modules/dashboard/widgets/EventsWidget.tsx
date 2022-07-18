import * as React from 'react';
import CardBody from 'reactstrap/lib/CardBody';
import Card from 'reactstrap/lib/Card';
import Col from 'reactstrap/lib/Col';
import Row from 'reactstrap/lib/Row';
import { contextService, localise, permissionService } from 'src/modules/shared/services';
import Label from 'reactstrap/lib/Label';
import { History } from 'history';
import CardHeader from 'reactstrap/lib/CardHeader';
import { Button } from 'reactstrap';
import { PopOver } from 'src/modules/shared/components/PopOver/PopOver';
import { CabinetItemEventSummary, DateTimeDetailedInfo } from 'src/modules/dashboard/types/dto';
import { TimeDurationPicker } from 'src/modules/shared/components/TimeDurationPicker/TimeDurationPicker';
import { dashboardService } from 'src/modules/dashboard/services/dashboard.service';
import * as qs from "query-string";

interface Props {
    data: CabinetItemEventSummary;
    history: History;
    customerId?: string;
    onTimeDurationChange: (timeDuration: string) => void;
}

export default class EventsWidget extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
        this.navigateToCurrentOverdueItems = this.navigateToCurrentOverdueItems.bind(this);
        this.navigateToCurrentItemStatus = this.navigateToCurrentItemStatus.bind(this);
        this.navigateToTodaysEvents = this.navigateToTodaysEvents.bind(this);
        this.navigateToTotalTransactionVolume = this.navigateToTotalTransactionVolume.bind(this);
        this.navigateToOnTimeReturnsHistory = this.navigateToOnTimeReturnsHistory.bind(this);
        this.navigateToOverdueReturnsHistory = this.navigateToOverdueReturnsHistory.bind(this);
        this.navigateToEventHistory = this.navigateToEventHistory.bind(this);
        this.navigateToItemEventsHistory = this.navigateToItemEventsHistory.bind(this);
    }

    //#region Redirects

    navigateToCurrentOverdueItems() {
        this.props.history.push({
            pathname: "/reports/overview/current_overdue_items_report",
            search: qs.stringify({ ['showBackButton']: true })
        });
    }

    navigateToCurrentItemStatus() {
        this.props.history.push({
            pathname: "/reports/overview/current_item_status_report",
            search: qs.stringify({ ['showBackButton']: true })
        });
    }

    navigateToTodaysEvents() {
        this.props.history.push({
            pathname: "/reports/overview/todays_events_report",
            search: qs.stringify({ ['showBackButton']: true })
        });
    }

    navigateToTotalTransactionVolume() {
        this.props.history.push({
            pathname: "/reports/overview/total_transaction_volume_report",
            search: qs.stringify({ ['showBackButton']: true })
        });
    }

    navigateToOnTimeReturnsHistory() {
        this.props.history.push({
            pathname: "/reports/overview/on_time_returns_history_report",
            search: qs.stringify({ ['showBackButton']: true })
        });
    }

    navigateToOverdueReturnsHistory() {
        this.props.history.push({
            pathname: "/reports/overview/overdue_returns_history_report",
            search: qs.stringify({
                ['contextCustomerId']: contextService.getCurrentCustomerId(),
                ['cabinetGroupId']: dashboardService.getSelectedCabinetGroup(),
                ['cabinetId']: dashboardService.getSelectedCabinet(),
                ['selectedPeriod']: dashboardService.getItemEventsSelectedTimeDuration(),
                ['showBackButton']: true
            })
        });
    }

    navigateToEventHistory() {
        this.props.history.push({
            pathname: "/reports/overview/cabinet_history_report",
            search: qs.stringify({
                ['contextCustomerId']: contextService.getCurrentCustomerId(),
                ['cabinetGroupId']: dashboardService.getSelectedCabinetGroup(),
                ['cabinetId']: dashboardService.getSelectedCabinet(),
                ['selectedPeriod']: dashboardService.getItemEventsSelectedTimeDuration(),
                ['showBackButton']: true
            })
        });
    }

    navigateToItemEventsHistory(){
        this.props.history.push({
            pathname: "/reports/overview/item_events_history",
            search: qs.stringify({
                ['contextCustomerId']: contextService.getCurrentCustomerId(),
                ['cabinetId']: dashboardService.getSelectedCabinet(),
                ['selectedPeriod']: dashboardService.getItemEventsSelectedTimeDuration(),
                ['showBackButton']: true
            })
        });
    }

    //#endregion

    render() {
        const { data: displayData, onTimeDurationChange } = this.props;

        let data = displayData || {
            availableItemCount: 0,
            currentTotalOnTimeReturn: 0,
            currentTotalOverdueCount: 0,
            currentTotalVolume: 0,
            overdueCount: 0,
            previousTotalOnTimeReturnCount: 0,
            previousTotalOverdueCount: 0,
            previousTotalVolume: 0,
            unAvailableItemCount: 0,
            currentTotalOverDueTime: {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0
            },
            previousTotalOverDueTime: {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0
            }
        };

        const canViewItemReports =
            permissionService.checkIfPermissionExistsForCustomer('NAV_REPORTS') &&
            permissionService.checkIfPermissionExistsForCustomer('ITEM_REPORTS_VIEW');

        const canViewCabinetReports =
            permissionService.checkIfPermissionExistsForCustomer('NAV_REPORTS') &&
            permissionService.checkIfPermissionExistsForCustomer('CABINET_REPORTS_VIEW');

        //#region Calculations

        const currentOnTimePercentage = data.currentTotalOnTimeReturn == 0 ? 0 : Math.round(data.currentTotalOnTimeReturn / data.currentTotalVolume * 100);
        const previousOnTimePercentage = data.previousTotalOnTimeReturnCount == 0 ? 0 : Math.round(data.previousTotalOnTimeReturnCount / data.previousTotalVolume * 100);

        const currentAverageOverdueTimeSeconds = data.currentTotalOverdueCount == 0 ? 0 : (data.currentTotalOverDueTime.days * 86400 +
            data.currentTotalOverDueTime.hours * 3600 + data.currentTotalOverDueTime.minutes * 60 +
            data.currentTotalOverDueTime.seconds) / data.currentTotalOverdueCount;
        const previousAverageOverdueTimeSeconds = data.previousTotalOverdueCount == 0 ? 0 : (data.previousTotalOverDueTime.days * 86400 +
            data.previousTotalOverDueTime.hours * 3600 + data.previousTotalOverDueTime.minutes * 60 +
            data.previousTotalOverDueTime.seconds) / data.previousTotalOverdueCount;
        const averageOverdueTimeChangeSeconds = Math.abs(previousAverageOverdueTimeSeconds - currentAverageOverdueTimeSeconds);

        const currentAverageOverdueTime: DateTimeDetailedInfo = {
            days: 0,
            hours: Math.floor(currentAverageOverdueTimeSeconds / 3600),
            minutes: Math.floor((currentAverageOverdueTimeSeconds % 3600) / 60),
            seconds: currentAverageOverdueTimeSeconds % 60
        };
        const previousAverageOverdueTime: DateTimeDetailedInfo = {
            days: 0,
            hours: Math.floor(previousAverageOverdueTimeSeconds / 3600),
            minutes: Math.floor((previousAverageOverdueTimeSeconds % 3600) / 60),
            seconds: previousAverageOverdueTimeSeconds % 60
        };
        const averageOverdueTimeChange = {
            days: 0,
            hours: Math.floor(averageOverdueTimeChangeSeconds / 3600),
            minutes: Math.floor((averageOverdueTimeChangeSeconds % 3600) / 60),
            seconds: averageOverdueTimeChangeSeconds % 60
        };

        //#endregion

        return (
            <Card className={`data-grid-container compact${data.overdueCount > 0 ? " has-overdue" : ""} mb-lg-2`}>
                <CardHeader>
                    <Row>
                        <Col>
                            <Label id="lblTotal"><b>{localise('TEXT_EVENTS')}</b></Label>
                        </Col>
                    </Row>
                </CardHeader>
                <CardBody>
                    <Row>
                        <Col sm={6} lg={12} xl={6} className="status-column">
                            <Row className="subtitle-row">
                                <Col xs={10} className="subtitle-column">
                                    <Label className="sub-title">{localise("TEXT_CURRENT_ITEM_STATUS")}</Label>
                                </Col>
                                {
                                    (canViewItemReports || canViewCabinetReports) &&
                                    <Col xs={2} className="text-right menu">
                                        <Button id="leftPopover"><i className="fa fa-ellipsis-h" /></Button>
                                        <PopOver placement="bottom-end" target="leftPopover" container="leftPopover" trigger="focus"
                                            header={localise("TEXT_CURRENT_ITEM_STATUS")}
                                            body={
                                                <Row>
                                                    <Col>
                                                        <ul className="pl-4 mb-1">
                                                            {
                                                                canViewItemReports &&
                                                                <li className="hover-blue clickable mb-1" onClick={this.navigateToCurrentOverdueItems}>
                                                                    {localise("TEXT_CURRENT_OVERDUE_ITEMS")}
                                                                </li>
                                                            }
                                                            {
                                                                canViewItemReports &&
                                                                <li className="hover-blue clickable mb-1" onClick={this.navigateToCurrentItemStatus}>
                                                                    {localise("TEXT_CURRENT_ITEM_STATUS")}
                                                                </li>
                                                            }
                                                            {
                                                                canViewCabinetReports &&
                                                                <li className="hover-blue clickable mb-1" onClick={this.navigateToTodaysEvents}>
                                                                    {localise("TEXT_TODAYS_EVENTS")}
                                                                </li>
                                                            }
                                                        </ul>
                                                    </Col>
                                                </Row>
                                            } />
                                    </Col>
                                }
                            </Row>
                            <Row className="content-row pr-2">
                                <Col>
                                    <Row className={`status-tile ml-1 mt-1 ${data.overdueCount > 0 ? "has-overdue" : ""} ${canViewItemReports ? "clickable" : ""}`}
                                        onClick={canViewItemReports ? this.navigateToCurrentOverdueItems : undefined}>
                                        <Col xs={5}>
                                            <Label className="status-text mt-2">{localise("TEXT_OVERDUE").toUpperCase()}</Label>
                                        </Col>
                                        <Col xs={7} className="text-right">
                                            <Label className="status-count">{data.overdueCount}</Label>
                                        </Col>
                                    </Row>
                                    <Row className={`status-tile ml-1 mt-2 ${data.unAvailableItemCount > 0 ? "has-out" : ""} ${canViewItemReports ? "clickable" : ""}`}
                                        onClick={canViewItemReports ? this.navigateToCurrentItemStatus : undefined}>
                                        <Col xs={5}>
                                            <Label className="status-text mt-2">{localise("TEXT_OUT").toUpperCase()}</Label>
                                        </Col>
                                        <Col xs={7} className="text-right">
                                            <Label className="status-count">{data.unAvailableItemCount}</Label>
                                        </Col>
                                    </Row>
                                    <Row className={`status-tile ml-1 mt-2 ${data.availableItemCount > 0 ? "has-in" : ""} ${canViewItemReports ? "clickable" : ""}`}
                                        onClick={canViewItemReports ? this.navigateToCurrentItemStatus : undefined}>
                                        <Col xs={5}>
                                            <Label className="status-text mt-2">{localise("TEXT_IN").toUpperCase()}</Label>
                                        </Col>
                                        <Col xs={7} className="text-right">
                                            <Label className="status-count mb-0">{data.availableItemCount}</Label>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Col>
                        <Col sm={6} lg={12} xl={6} className="stats-column mt-2 mt-sm-0 mt-lg-2 mt-xl-0">
                            <Row className="subtitle-row">
                                <Col xs={10} className="subtitle-column">
                                    <Row>
                                        <Col lg={7}>
                                            <Label className="sub-title">{localise("TEXT_ITEM_TRANSACTIONS")}</Label>
                                        </Col>
                                        <Col lg={5} className="time-picker-column pt-lg-1 pt-xl-0">
                                            <TimeDurationPicker onChange={onTimeDurationChange}
                                                value={dashboardService.getItemEventsSelectedTimeDuration()} />
                                        </Col>
                                    </Row>
                                </Col>
                                {
                                    (canViewItemReports || canViewCabinetReports) &&
                                    <Col xs={2} className="text-right pl-0 menu">
                                        <Button id="rightPopover"><i className="fa fa-ellipsis-h" /></Button>
                                        <PopOver placement="bottom-end" target="rightPopover" container="rightPopover" trigger="focus"
                                            header={localise("TEXT_ITEM_TRANSACTIONS")}
                                            body={
                                                <Row>
                                                    <Col>
                                                        <ul className="pl-4 mb-1">
                                                            {
                                                                canViewCabinetReports &&
                                                                <li className="hover-blue clickable mb-1" onClick={this.navigateToItemEventsHistory}>
                                                                    {localise("TEXT_ITEM_HISTORY")}
                                                                </li>
                                                            }
                                                            {
                                                                canViewCabinetReports &&
                                                                <li className="hover-blue clickable mb-1" onClick={this.navigateToEventHistory}>
                                                                    {localise("TEXT_CABINET_HISTORY")}
                                                                </li>
                                                            }
                                                            {
                                                                canViewItemReports &&
                                                                <li className="hover-blue clickable mb-1" onClick={this.navigateToTotalTransactionVolume}>
                                                                    {localise("TEXT_TOTAL_TRANSACTION_VOLUME")}
                                                                </li>
                                                            }
                                                            {
                                                                canViewItemReports &&
                                                                <li className="hover-blue clickable mb-1" onClick={this.navigateToOnTimeReturnsHistory}>
                                                                    {localise("TEXT_ON_TIME_RETURNS_HISTORY")}
                                                                </li>
                                                            }
                                                            {
                                                                canViewItemReports &&
                                                                <li className="hover-blue clickable mb-1" onClick={this.navigateToOverdueReturnsHistory}>
                                                                    {localise("TEXT_OVERDUE_RETURNS_HISTORY")}
                                                                </li>
                                                            }
                                                        </ul>
                                                    </Col>
                                                </Row>
                                            } />
                                    </Col>
                                }
                            </Row>
                            <Row className="content-row pl-lg-2 pl-xl-0">
                                <Col>
                                    <Row className={`stat-row  ${canViewItemReports ? "clickable" : ""}`}
                                        onClick={canViewItemReports ? this.navigateToTotalTransactionVolume : undefined}>
                                        <Col>
                                            <Row>
                                                <Col className="pr-0">
                                                    <Label className="stat-title mb-0">{localise("TEXT_TOTAL_VOLUME")}</Label>
                                                </Col>
                                                <Col className="text-right">
                                                    <Label className="stat-previous-title mb-0">{localise("TEXT_PREVIOUS")} + {localise("TEXT_CHANGE")}</Label>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col xs={5}>
                                                    <Label className="stat-count">{data.currentTotalVolume}</Label>
                                                </Col>
                                                <Col xs={3} className="text-right pl-0 pr-0">
                                                    <Label className="stat-previous">{data.previousTotalVolume}</Label>
                                                </Col>
                                                <Col xs={4} className="text-right pl-0">
                                                    <Label className="stat-change">
                                                        {Math.abs(data.previousTotalVolume - data.currentTotalVolume)}
                                                        <i className={`ml-2 fa fa-${data.previousTotalVolume > data.currentTotalVolume ? "caret-down" :
                                                            data.previousTotalVolume < data.currentTotalVolume ? "caret-up" :
                                                                "minus"}`} />
                                                    </Label>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                    <hr />
                                    <Row className={`stat-row  ${canViewItemReports ? "clickable" : ""}`}
                                        onClick={canViewItemReports ? this.navigateToOnTimeReturnsHistory : undefined}>
                                        <Col>
                                            <Row>
                                                <Col className="pr-0">
                                                    <Label className="stat-title mb-0">{localise("TEXT_ON_TIME_RETURNS")}</Label>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col xs={5}>
                                                    <Label className="stat-count">{currentOnTimePercentage}%</Label>
                                                </Col>
                                                <Col xs={3} className="text-right pl-0 pr-0">
                                                    <Label className="stat-previous">{previousOnTimePercentage}%</Label>
                                                </Col>
                                                <Col xs={4} className="text-right pl-0">
                                                    <Label className="stat-change">
                                                        {Math.abs(previousOnTimePercentage - currentOnTimePercentage)}%
                                                        <i className={`ml-2 fa fa-${previousOnTimePercentage > currentOnTimePercentage ? "caret-down" :
                                                            previousOnTimePercentage < currentOnTimePercentage ? "caret-up" :
                                                                "minus"}`} />
                                                    </Label>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                    <hr />
                                    <Row className={`stat-row  ${canViewItemReports ? "clickable" : ""}`}
                                        onClick={canViewItemReports ? this.navigateToOverdueReturnsHistory : undefined}>
                                        <Col>
                                            <Row>
                                                <Col className="pr-0">
                                                    <Label className="stat-title mb-0">{localise("TEXT_AVERAGE_OVERDUE_TIME")}</Label>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col xs={5}>
                                                    <Label className="stat-count">
                                                        {currentAverageOverdueTime.hours > 0 ? `${currentAverageOverdueTime.hours}h ` : ""}
                                                        {currentAverageOverdueTime.minutes}m
                                                    </Label>
                                                </Col>
                                                <Col xs={3} className="text-right pl-0 pr-0">
                                                    <Label className="stat-previous">
                                                        {previousAverageOverdueTime.hours > 0 ? `${previousAverageOverdueTime.hours}h ` : ""}
                                                        {previousAverageOverdueTime.minutes}m
                                                    </Label>
                                                </Col>
                                                <Col xs={4} className="text-right pl-0">
                                                    <Label className="stat-change">
                                                        {averageOverdueTimeChange.hours > 0 ? `${averageOverdueTimeChange.hours}h ` : ""}
                                                        {averageOverdueTimeChange.minutes}m
                                                        <i className={`ml-2 fa fa-${previousAverageOverdueTimeSeconds > currentAverageOverdueTimeSeconds ? "caret-down" :
                                                            previousAverageOverdueTimeSeconds < currentAverageOverdueTimeSeconds ? "caret-up" :
                                                                "minus"}`} />
                                                    </Label>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/dashboard/widgets/EventsWidget.tsx