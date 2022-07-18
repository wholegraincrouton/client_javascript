import * as React from "react";
import { History } from 'history';
import { ActiveAlarm } from "../../../types/dto";
import { Grid, GridColumn, GridSelectionChangeEvent, GridHeaderSelectionChangeEvent } from "@progress/kendo-react-grid";
import { localise, confirmDialogService, contextService } from "src/modules/shared/services";
import { CardBody, Card, Row, Col } from "reactstrap";
import { AlarmStatusHeaderBar } from "../../shared/AlarmStatusHeaderBar";
import { ActionButton, BackButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { cabinetService } from "src/modules/cabinet/services/cabinet.service";
import { CabinetBasicDetails } from "src/modules/cabinet/types/dto";
import { alarmsService } from "src/modules/eventAlarms/services/alarms.service";
import { CabinetLocationCell } from "../../shared/GridCells/CabinetLocationCell";
import { reportService } from "../../../services/report.service";
import { LookupTextCell, DateTimeFormatCell } from "src/modules/shared/components/DataGrid";
import { CabinetDetailCell } from "../../shared/GridCells/CabinetDetailCell";
import { AlarmActivityCell } from "../../shared/GridCells/AlarmActivityCell";
import { NameCell } from "src/modules/shared/components/DataGrid/Cells/NameCell";
import '../../reports.css';

interface Props {
    history: History;
}

interface State {
    activeAlarms: ActiveAlarm[];
}

export class ActiveAlarmsReport extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.onSearch = this.onSearch.bind(this);
        this.onRowRender = this.onRowRender.bind(this);
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.onHeaderSelectionChange = this.onHeaderSelectionChange.bind(this);
        this.onCloseAlarms = this.onCloseAlarms.bind(this);

        this.state = {
            activeAlarms: []
        }
    }

    componentDidMount() {
        this.performSearch();
    }

    onSearch() {
        this.performSearch();
    }

    performSearch() {
        const customerId = contextService.getCurrentCustomerId();

        reportService.getActiveAlarms().then((activeAlarms: any) => {
            cabinetService.getCabinets(customerId).then((cabinetDetails: CabinetBasicDetails[]) => {
                activeAlarms.forEach((alarm: ActiveAlarm) => {
                    let cabinet = cabinetDetails.find(c => c.id == alarm.cabinetId);

                    if (cabinet == undefined) {
                        cabinetService.getCabinetBasicDetails(customerId, alarm.cabinetId)
                            .then((cabinetDetails: CabinetBasicDetails) => {
                                cabinet = cabinetDetails;
                            });
                    }

                    if (cabinet && cabinet.cabinetLocation != undefined) {
                        alarm.cabinetName = cabinet.name;
                        alarm.cabinetLocation = {
                            longitude: cabinet.cabinetLocation.longitude,
                            latitude: cabinet.cabinetLocation.latitude,
                            address: cabinet.cabinetLocation.address
                        };
                    }
                });

                this.setState({
                    activeAlarms: activeAlarms
                });
            });
        });
    }

    onRowRender(tr: React.ReactElement<HTMLTableRowElement>, props: any) {
        return React.cloneElement(tr, {
            ...tr.props,
            className: `${tr.props.className} non-selectable-row ${!props.dataItem.canCloseFromPortal ? 'hide-check-box' : ''}`
        }, tr.props.children);
    }

    onSelectionChange(event: GridSelectionChangeEvent) {
        let activeAlarms = this.state.activeAlarms;
        let alarmId = event.dataItem.id;
        let alarm = activeAlarms.find(a => a.id == alarmId);
        if (alarm) {
            alarm.selected = !alarm.selected;
        }

        this.setState({ ...this.state, activeAlarms: activeAlarms });
    }

    onHeaderSelectionChange(event: GridHeaderSelectionChangeEvent) {
        const checked = event.nativeEvent.target.checked;
        let activeAlarms = this.state.activeAlarms;
        activeAlarms.forEach(a => {
            if (a.canCloseFromPortal) {
                a.selected = checked;
            }
        });
        this.setState({ ...this.state, activeAlarms: activeAlarms });
    }

    onCloseAlarms() {
        confirmDialogService.showDialog("CONFIRMATION_CLOSE_ALARMS",
            () => {
                let { activeAlarms } = this.state;
                let alarmIdsToClose = activeAlarms.filter(a => a.selected).map(a => a.id);
                alarmsService.closeAlarms(alarmIdsToClose).then(() => {
                    alarmIdsToClose.forEach((id: string) => {
                        activeAlarms = activeAlarms.filter(function (alarm) {
                            return alarm.id !== id;
                        });
                    });
                    this.setState({ ...this.state, activeAlarms: activeAlarms });
                });
            });
    }

    render() {
        const { history } = this.props;
        const selectedCount = this.state.activeAlarms.filter(a => a.selected).length;
        const closeableCount = this.state.activeAlarms.filter(a => a.canCloseFromPortal).length;
        const allItemsSelected = selectedCount > 0 && closeableCount == selectedCount;

        return (
            <div className="report active-alarms-report">
                <Card>
                    <CardBody>
                        <Row className="mb-3">
                            <Col>
                                <BackButton onClick={history.goBack} />
                            </Col>
                        </Row>
                        <AlarmStatusHeaderBar />
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        {
                            closeableCount > 0 &&
                            <Row className="mb-2">
                                <Col>
                                    <ActionButton disabled={selectedCount == 0} textKey="TEXT_CLOSE_SELECTED_ALARMS"
                                        onClick={this.onCloseAlarms} color="danger" icon="fa-times" />
                                </Col>
                            </Row>
                        }
                        <Row className="data-grid-container">
                            <Col>
                                <Grid data={this.state.activeAlarms}
                                    className="max-grid-height"
                                    onSelectionChange={this.onSelectionChange}
                                    onHeaderSelectionChange={this.onHeaderSelectionChange}
                                    selectedField="selected"
                                    rowRender={this.onRowRender}>
                                    <GridColumn field="selected" width="auto" className="checkbox-grid-column"
                                        headerClassName={`checkbox-grid-column ${closeableCount == 0 ? " hide-check-box" : ""}`}
                                        headerSelectionValue={allItemsSelected} />
                                    <GridColumn field="cabinetName" title={localise("TEXT_CABINET_DETAILS")} cell={CabinetDetailCell()} />
                                    <GridColumn field="cabinetLocation" title={localise("TEXT_CABINET_LOCATION")}
                                        cell={CabinetLocationCell()} />
                                    <GridColumn field="name" title={localise("TEXT_ALARM_NAME")} cell={LookupTextCell("LIST_ALARMS")} />
                                    <GridColumn field="startTime" title={localise("TEXT_ALARM_START_TIME")} cell={DateTimeFormatCell()} />
                                    <GridColumn field="startedUserName" title={localise("TEXT_ALARM_START_USER")} cell={NameCell()} />
                                    <GridColumn field="escalationInterval" title={localise("TEXT_ALARM_ACTIVITY")} cell={AlarmActivityCell()} />
                                </Grid>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </div>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/reports/components/AlarmReports/ActiveAlarmsReport/ActiveAlarmsReport.tsx