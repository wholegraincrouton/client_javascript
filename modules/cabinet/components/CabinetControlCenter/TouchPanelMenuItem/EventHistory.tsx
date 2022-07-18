import * as React from "react";
import { CabinetEvent } from "src/modules/cabinet/types/store";
import { Row, Col, Button } from "reactstrap";
import { Grid, GridColumn, GridCellProps } from "@progress/kendo-react-grid";
import { localise, lookupService } from "src/modules/shared/services";
import { dateTimeUtilService } from "src/modules/shared/services/datetime-util.service";
import { cabinetConfigService } from "../shared/cabinet-configuration-service";

export interface Props {
    cabinetId: string;
    eventHistory?: CabinetEvent[];
    hasMoreEvents?: boolean;
    pageToken?: string;
    loadEvents: (filter: string, cabinetId: string,
        isLoadMore: boolean, pageToken?: string) => void;
    clearEventHistory: () => void;
    timeOffset?: number;
}

export default class EventHistory extends React.Component<Props> {
    pageSize: number = 10;

    constructor(props: Props) {
        super(props);
        this.onLoadMore = this.onLoadMore.bind(this);
        this.onDurationClick = this.onDurationClick.bind(this);
    }

    componentWillUnmount() {
        this.props.clearEventHistory();
    }

    onLoadMore() {
        this.props.loadEvents("", this.props.cabinetId, true, this.props.pageToken);
    }

    getTimeCell() {
        let offset = this.props.timeOffset;

        return class extends React.Component<GridCellProps> {
            constructor(props: GridCellProps) {
                super(props);
            }

            getDisplayDate() {
                return dateTimeUtilService.getDateDisplayTextByTimeZone(this.props.dataItem["eventTime"],
                    cabinetConfigService.getDateTimeFormatConfigurationValue(), offset);
            }

            render() {
                return (
                    <td>
                        ({this.getDisplayDate()})
                    </td>
                );
            }
        }
    }

    onDurationClick(e: any) {
        this.props.clearEventHistory();
        this.props.loadEvents(e.target.value, this.props.cabinetId, false);
    }

    render() {
        return (
            <div>
                <Row className="button-row">
                    {
                        lookupService.getList("LIST_EVENT_HISTORY_DURATIONS").map((l, key) =>
                            <Col key={key} style={{ textAlign: "center", marginBottom: "5px" }}>
                                <Button name={l.value} value={l.value} onClick={this.onDurationClick}>{l.text}</Button>
                            </Col>
                        )
                    }
                </Row>
                <Row className="mt-2">
                    <Col className="grid-column">
                        {
                            this.props.eventHistory && this.props.eventHistory.length > 0 ?
                                <Grid scrollable={"scrollable"} data={this.props.eventHistory}>
                                    <GridColumn field={"eventTriggeredOn"} title={localise("TEXT_TIME")} cell={this.getTimeCell()} />
                                    <GridColumn field={"eventCode"} title={localise("TEXT_EVENT_TYPE")} />
                                    <GridColumn field={"eventTriggeredByUserName"} title={localise("TEXT_USER")} />
                                </Grid>
                                :
                                <div>
                                    <hr />
                                    <div className="text-muted text-center">{localise("ERROR_SEARCH_RESULT")}</div>
                                </div>
                        }
                    </Col>
                </Row>
                {
                    this.props.hasMoreEvents &&
                    <Row className="mt-2" style={{ marginLeft: '50%' }}>
                        <i style={{ cursor: "pointer" }} className="fas fa-chevron-down fa-lg loadmore" onClick={this.onLoadMore}></i>
                    </Row>
                }
            </div>
        );
    }
}


// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetControlCenter/TouchPanelMenuItem/EventHistory.tsx