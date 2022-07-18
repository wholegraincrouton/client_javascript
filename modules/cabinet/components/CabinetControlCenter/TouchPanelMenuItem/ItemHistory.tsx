import * as React from "react";
import { VirtualCabinetItem, CabinetItemEvent } from "src/modules/cabinet/types/store";
import { Row, Col } from "reactstrap";
import { Grid, GridColumn, GridCellProps } from "@progress/kendo-react-grid";
import { localise } from "src/modules/shared/services";
import { dateTimeUtilService } from "src/modules/shared/services/datetime-util.service";
import { cabinetConfigService } from "../shared/cabinet-configuration-service";

export interface Props {
    cabinetId: string;
    item: VirtualCabinetItem;
    itemHistory?: CabinetItemEvent[];
    hasMoreEvents?: boolean;
    pageToken?: string;
    loadItemEvents: (cabinetId: string, itemIndex: number,
        isLoadMore: boolean, pageToken?: string) => void;
    clearEventHistory: () => void;
    timeOffset?: number;
}

export default class ItemHistory extends React.Component<Props> {
    pageSize: number = 10;

    constructor(props: Props) {
        super(props);
        this.onLoadMore = this.onLoadMore.bind(this);
        this.props.loadItemEvents(props.cabinetId, props.item.itemIndex, false);
    }

    componentWillUnmount() {
        this.props.clearEventHistory();
    }

    onLoadMore() {
        const { cabinetId, item, pageToken, loadItemEvents } = this.props;
        loadItemEvents(cabinetId, item.itemIndex, true, pageToken);
    }

    getLastAccessedByCell() {
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
                        {this.props.dataItem["eventTriggeredByUserName"]}
                        <br />
                        ({this.getDisplayDate()})
                    </td>
                );
            }
        }
    }

    render() {
        return (
            <div>
                <Row className="mt-2">
                    <Col className="grid-column">
                        {
                            this.props.itemHistory && this.props.itemHistory.length > 0 ?
                                <Grid data={this.props.itemHistory}>
                                    <GridColumn field={"eventCode"} title={localise("TEXT_STATE")} />
                                    <GridColumn field={"eventTriggeredByUserName"} title={localise("TEXT_LAST_ACCESSED_BY")}
                                        cell={this.getLastAccessedByCell()} />
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
// ./src/modules/cabinet/components/CabinetControlCenter/TouchPanelMenuItem/ItemHistory.tsx