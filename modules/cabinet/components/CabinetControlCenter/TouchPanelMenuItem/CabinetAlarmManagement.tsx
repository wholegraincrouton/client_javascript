import * as React from "react";
import {
  CabinetAlarmFilterMode,
  CabinetAlarmDto,
  SimulationMode
} from "src/modules/cabinet/types/dto";
import { Input } from "reactstrap";
import { localise, accountSessionService, contextService } from "src/modules/shared/services";
import Row from "reactstrap/lib/Row";
import Col from "reactstrap/lib/Col";
import { Grid, GridColumn, GridCellProps } from "@progress/kendo-react-grid";
import { cabinetControlCenterService } from "src/modules/cabinet/services/cabinetControlCenter.service";
import {
  DateTimeFormatCell,
  LookupTextCell
} from "src/modules/shared/components/DataGrid";
import * as moment from "moment";
import { setInterval } from "timers";
import { eventRuleService } from "src/modules/cabinet/components/CabinetControlCenter/shared/event-rule-service";
import { cabinetConfigService } from "../shared/cabinet-configuration-service";
import { CabinetSimulationState } from "src/modules/cabinet/types/store";
import { store } from "src/redux/store";


export interface Props {
  cabinetId: string;
  timeOffset?: number;
}

export interface LocalState {
  filterMode: string;
  lastViewedRecordsCount: number;
  alarms: CabinetAlarmDto[];
  refreshToken: number;
}

export class CabinetAlarmManagement extends React.Component<Props, LocalState> {
  pageSize: number = 5;
  cabinetSimulation: CabinetSimulationState = store.getState().cabinetSimulation;

  constructor(props: Props) {
    super(props);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.scrollUp = this.scrollUp.bind(this);
    this.scrollDown = this.scrollDown.bind(this);
    this.closeAlarm = this.closeAlarm.bind(this);

    this.state = {
      filterMode: CabinetAlarmFilterMode.Active,
      lastViewedRecordsCount: 0,
      alarms: [],
      refreshToken: Date.now()
    };
  }

  componentDidMount() {
    setInterval(() => {
      this.setState({ ...this.state, refreshToken: Date.now() });
    }, 1000);
    cabinetControlCenterService
      .getAlarms(this.props.cabinetId, true)
      .then((data: CabinetAlarmDto[]) => {
        this.setState({
          ...this.state,
          filterMode: CabinetAlarmFilterMode.Active,
          lastViewedRecordsCount: 0,
          alarms: data
        });
      });
  }

  componentWillUnmount() {
    clearInterval(this.state.refreshToken);
  }

  handleFilterChange(e: any) {
    const { cabinetId } = this.props;
    let status = e.target.value;
    let isActive = status == CabinetAlarmFilterMode.Active ? true : false;

    cabinetControlCenterService
      .getAlarms(cabinetId, isActive)
      .then((data: CabinetAlarmDto[]) => {
        this.setState({ ...this.state, filterMode: status, alarms: data, lastViewedRecordsCount: 0 });
      });
  }

  scrollUp() {
    var lastViewRecordCount = this.state.lastViewedRecordsCount;
    if (lastViewRecordCount - this.pageSize >= 0)
      this.setState({
        ...this.state,
        lastViewedRecordsCount: lastViewRecordCount - this.pageSize
      });
  }

  scrollDown() {
    var lastViewRecordCount = this.state.lastViewedRecordsCount;
    var items = this.state.alarms;
    if (
      lastViewRecordCount + this.pageSize <
      (items == undefined ? 0 : items.length)
    )
      this.setState({
        ...this.state,
        lastViewedRecordsCount: lastViewRecordCount + this.pageSize
      });
  }

  closeAlarm(alarm: string) {
    eventRuleService.stopAlarm(alarm);
    var alarms = this.state.alarms;

    var index = alarms.findIndex(a => a.alarmName == alarm);
    if (index > -1) alarms.splice(index, 1);

    this.setState({
      ...this.state,
      alarms: alarms
    });
  }

  render() {
    const { timeOffset } = this.props;
    const { filterMode, alarms, lastViewedRecordsCount } = this.state;
    var itemsCount = alarms.length;
    const dateTimeFormat = contextService.getCurrentDateTimeFormat();

    return (
      <>
        <Input type="select" onChange={this.handleFilterChange}>
          <option value="active">{localise("TEXT_ACTIVE_ALARMS")}</option>
          <option value="closed">{localise("TEXT_CLOSED_ALARMS")}</option>
        </Input>


        <Row>
          <Col className="alarm-grid-column">
            <Grid data={alarms.slice(lastViewedRecordsCount, lastViewedRecordsCount + this.pageSize)}>
              <GridColumn
                field={"startDateTime"}
                title={localise("TEXT_START_DATETIME")}
                cell={DateTimeFormatCell(dateTimeFormat || cabinetConfigService.getDateTimeFormatConfigurationValue(), true, timeOffset)}
              />
              <GridColumn
                field={"alarmName"}
                title={localise("TEXT_ALARM")}
                cell={LookupTextCell("LIST_ALARMS")}
              />
              <GridColumn
                field={"elapsedTime"}
                title={localise("TEXT_ELAPSED_TIME")}
                cell={DisplayElapsedTime(timeOffset)}
              />
              {filterMode == CabinetAlarmFilterMode.Closed && (
                <GridColumn
                  field={"endDateTime"}
                  width="80px"
                  title={localise("TEXT_CLOSED_DATETIME")}
                  cell={DateTimeFormatCell(dateTimeFormat || cabinetConfigService.getDateTimeFormatConfigurationValue(), true, timeOffset)}
                />
              )}
              {this.cabinetSimulation.simulationMode == SimulationMode.VirtualCabinet && filterMode == CabinetAlarmFilterMode.Active && (
                <GridColumn
                  width="30px"
                  cell={(cellProps: any) => {
                    return (
                      <DeleteCell
                        {...cellProps}
                        handler={this.closeAlarm}
                        dataItem={cellProps.dataItem}
                        field="" />
                    );
                  }}
                />
              )}
            </Grid>
          </Col>
        </Row>
        <Row style={{ textAlign: "center" }}>
          <Col className="col-sm-12 col-md-6 offset-md-3">
            {lastViewedRecordsCount - this.pageSize >= 0 && (
              <i style={{ cursor: "pointer" }} className="fas fa-caret-up fa-3x" onClick={() => { this.scrollUp(); }} />)}
            {(itemsCount == undefined ? 0
              : itemsCount > lastViewedRecordsCount + this.pageSize) && (
                <i style={{ cursor: "pointer" }} className="fas fa-caret-down fa-3x" onClick={() => { this.scrollDown(); }} />)}
          </Col>
        </Row>
      </>
    );
  }
}

export function DisplayElapsedTime(offset?: number) {
  return class extends React.Component<GridCellProps, LocalState> {
    constructor(props: GridCellProps) {
      super(props);
    }

    getElapsedTime() {
      let offsetInMinutues = offset || accountSessionService.getLoggedInUserTimeZoneOffsetInMinutues();

      let startDateTime = this.props.dataItem["startDateTime"];
      let startMoment = moment
        .utc(new Date(startDateTime))
        .add(offsetInMinutues, "m");

      let endDateTime = this.props.dataItem["endDateTime"];
      let endMoment = endDateTime
        ? moment.utc(new Date(endDateTime)).add(offsetInMinutues, "m")
        : moment.utc(new Date()).add(offsetInMinutues, "m");

      let elapsedTime = moment.utc(endMoment.diff(startMoment));
      let currentTime = moment.utc(new Date()).add(offsetInMinutues, "m");

      let daysElapsed = currentTime.diff(startMoment, "days");

      let textParts = elapsedTime.format("HH:mm:ss").split(":");
      let withDaysElapsedTime = `${parseInt(textParts[0]) + daysElapsed * 24}:${
        textParts[1]
        }:${textParts[2]}`;

      return daysElapsed > 0
        ? withDaysElapsedTime
        : elapsedTime.format("HH:mm:ss");
    }
    render() {
      return <td>{this.getElapsedTime()}</td>;
    }
  };
}

interface propsx {
  handler: (alarmName: string) => any;
}

export default class DeleteCell extends React.Component<
  GridCellProps & propsx
  > {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <td
        onClick={() => {
          let alarmName = this.props.dataItem["alarmName"];
          this.props.handler(alarmName);
        }}
      >
        <i className="fa fa-times text-danger" aria-hidden="true" />
      </td>
    );
  }
}



// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetControlCenter/TouchPanelMenuItem/CabinetAlarmManagement.tsx