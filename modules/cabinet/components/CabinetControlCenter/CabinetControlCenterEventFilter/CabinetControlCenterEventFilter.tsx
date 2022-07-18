import * as React from "react";
import Row from "reactstrap/lib/Row";
import Col from "reactstrap/lib/Col";
import Label from "reactstrap/lib/Label";
import Input from "reactstrap/lib/Input";
import { localise, lookupService } from "../../../../shared/services";
import { LookupDropDown } from "../../../../shared/components/LookupDropDown/LookupDropDown";
import { Grid, GridColumn, GridCellProps } from "@progress/kendo-react-grid";
import { CabinetEvent } from "../../../types/store";
import { CabinetEventNameConst } from "../../../types/dto";
import { filterScreenCommonService } from "../shared/filter-screen-util.service";

interface Props {
    show?: boolean;
    eventHistory?: CabinetEvent[];
    hasMoreEvents?: boolean;
    pageToken?: string;
    cabinetId: string;
    loadEvents: (primaryFilter: string, secondaryFilter: string, cabinetId: string,
        isLoadMore: boolean, pageToken?: string) => void;
    clearEventHistory: () => void;
}

interface State {
    primaryFilter: string;
    secondaryFilter: string;
}

export default class CabinetControlCenterEventFilter extends React.Component<Props, State> {
    constructor(props: any) {
        super(props);

        this.state = {
            primaryFilter: '',
            secondaryFilter: ''
        };

        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleDropdownChange = this.handleDropdownChange.bind(this);
        this.onLoadMore = this.onLoadMore.bind(this);
    }

    componentWillUnmount() {
        this.props.clearEventHistory();
    }

    handleTextChange(event: any) {
        let filter = event.target.value;
        let secondaryFilter = this.state.secondaryFilter || '';

        this.setState({
            ...this.state,
            primaryFilter: filter
        });
        this.props.loadEvents(filter, secondaryFilter, this.props.cabinetId, false);
    }

    handleDropdownChange(event: any) {
        let filter = this.state.primaryFilter || '';
        let secondaryFilter = event.target.value;

        this.setState({
            ...this.state,
            secondaryFilter: secondaryFilter
        });
        this.props.loadEvents(filter, secondaryFilter, this.props.cabinetId, false);
    }

    onLoadMore() {
        let filter = this.state.primaryFilter;
        let secondaryFilter = this.state.secondaryFilter;

        this.props.loadEvents(filter, secondaryFilter, this.props.cabinetId, true, this.props.pageToken);
    }

    render() {
        return (
            <>
                {
                    this.props.show &&
                    <Row>
                        <Col>
                            <Row>
                                <Col className="primary-filter-column">
                                    <Row>
                                        <Col>
                                            <Label className="system-label">
                                                {localise("TEXT_EVENT")}
                                            </Label>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Input maxLength={50} onChange={this.handleTextChange} />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <small className="text-muted">
                                                {localise("REMARK_FILTER_EVENT")}
                                            </small>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col>
                                    <Row>
                                        <Col>
                                            <Label className="system-label">
                                                {localise("TEXT_TIME")}
                                            </Label>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <LookupDropDown lookupKey={"LIST_TRIGGERED"} onChange={this.handleDropdownChange}
                                                allowAll={false} />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <small className="text-muted">
                                                {localise("REMARK_SELECT_TRIGGER")}
                                            </small>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row>
                                <Col className="grid-column">
                                    {
                                        this.props.eventHistory && this.props.eventHistory.length > 0 ?
                                            <Grid data={this.props.eventHistory}>
                                                <GridColumn field={"eventCode"} title={localise("TEXT_EVENT_NAME")} />
                                                <GridColumn field={"eventDetails"} title={localise("TEXT_DESCRIPTION")}
                                                    cell={this.getEventDiscriptionCell()} />
                                                <GridColumn field={"eventTriggeredByUserName"} title={localise("TEXT_TRIGGERED_BY")}
                                                    cell={this.getEventTriggeredByCell()} />
                                            </Grid>
                                            :
                                            <div>
                                                <hr />
                                                <div className="text-muted text-center">{localise("ERROR_SEARCH_RESULT")}</div>
                                            </div>
                                    }
                                </Col>
                            </Row>
                            <Row className="mt-2" style={{ marginLeft: '50%' }}>
                                {
                                    this.props.hasMoreEvents &&
                                    <i style={{ cursor: "pointer" }} className="fas fa-chevron-down fa-lg loadmore" onClick={this.onLoadMore}></i>
                                }
                            </Row>
                        </Col>
                    </Row>
                }
            </>
        );
    }

    getEventDiscriptionCell() {
        return class extends React.Component<GridCellProps> {
            constructor(props: GridCellProps) {
                super(props);
            }

            getEventLocalisedDescription(eventCode: string, eventDetails?: any) {

                var eventText = lookupService.getTextFromMultipleLookups(["LIST_CABINET_HIGH_PRIORITY_EVENTS",
                    "LIST_CABINET_LOW_PRIORITY_EVENTS", "LIST_CABINET_ITEM_EVENTS"], eventCode);

                switch (eventCode) {
                    case CabinetEventNameConst.ItemForced:
                    case CabinetEventNameConst.ItemOverdue:
                    case CabinetEventNameConst.ItemRetrieved:
                    case CabinetEventNameConst.MultiCustodyItemRetreived:
                    case CabinetEventNameConst.ItemReturnOverrideWithinValidTime:
                    case CabinetEventNameConst.ItemReturnOverrideAfterValidTime:
                    case CabinetEventNameConst.ItemReturnedWithinValidTime:
                    case CabinetEventNameConst.ItemReturnedAfterValidTime:
                    case CabinetEventNameConst.MultiCustodyItemReturnWithinValidTime:
                    case CabinetEventNameConst.MultiCustodyItemReturnAfterValidTime:
                    case CabinetEventNameConst.MulticustodyItemReturnOverrideWithinValidTime:
                    case CabinetEventNameConst.MulticustodyItemReturnOverrideAfterValidTime:
                        if (eventDetails != undefined)
                            return `${eventDetails.itemName} - ${eventText}`;
                        else
                            return eventText;
                    default:
                        return eventText;
                }
            }

            getDisplayText() {
                let eventDetails = this.props.dataItem['eventDetails'];
                let eventCode = this.props.dataItem['eventCode'];

                return this.getEventLocalisedDescription(eventCode, eventDetails);
            }

            render() {
                return (
                    <td>
                        {this.getDisplayText()}
                    </td>
                );
            }
        }
    }

    getEventTriggeredByCell() {
        return class extends React.Component<GridCellProps> {
            constructor(props: GridCellProps) {
                super(props);
            }

            getDisplayText() {
                return filterScreenCommonService.getLastAccessedByText(
                    this.props.dataItem['eventTriggeredByUserName'], this.props.dataItem['eventTime']);
            }

            render() {
                return (
                    <td>
                        {this.getDisplayText()}
                    </td>
                );
            }
        }
    }
}


// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetControlCenter/CabinetControlCenterEventFilter/CabinetControlCenterEventFilter.tsx