import * as React from "react";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Row, Col, Label, Card, CardBody, Button } from "reactstrap";
import { BackButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { localise, apiService, lookupService } from "src/modules/shared/services";
import { MiddlewareLogEvent, MiddlewareLogEventPlaceholders, MiddlewareLogContinuationToken } from "../../types/dto";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { DateTimeFormatCell } from "src/modules/shared/components/DataGrid";

interface Props {
    middlewareId: string;
    onBackClick: () => void;
}

interface State {
    logEvents: MiddlewareLogEvent[];
    continuationToken?: MiddlewareLogContinuationToken;
    hasMore: boolean;
}

export class EventLogPopup extends React.Component<Props, State> {
    eventLookup = lookupService.getList("LIST_MIDDLEWARE_LOG_TYPES");
    integrationSystemLookup = lookupService.getList("LIST_INTEGRATION_SYSTEMS");

    constructor(props: Props) {
        super(props);
        this.getLogs = this.getLogs.bind(this);
        this.getEventNameCell = this.getEventNameCell.bind(this);
        this.getEventDescriptionCell = this.getEventDescriptionCell.bind(this);

        this.state = {
            logEvents: [],
            hasMore: false
        }
    }

    componentDidMount() {
        this.getLogs();
    }

    getLogs() {
        const { middlewareId } = this.props;
        const { logEvents, continuationToken } = this.state;

        let queryParams = {
            middlewareId,
            nextPartitionKey: continuationToken == undefined ? undefined : continuationToken.nextPartitionKey,
            nextRowKey: continuationToken == undefined ? undefined : continuationToken.nextRowKey,
            nextTableName: continuationToken == undefined ? undefined : continuationToken.nextTableName,
            targetLocation: continuationToken == undefined ? undefined : continuationToken.targetLocation,
        }

        apiService.get('middlewarelog', 'GetMiddlewareLogEvents', undefined, queryParams)
            .then((result: any) => {
                logEvents.push(...result.logs);

                this.setState({
                    ...this.state,
                    logEvents: logEvents,
                    continuationToken: result.nextPartitionKey == undefined ? undefined : {
                        nextPartitionKey: result.nextPartitionKey,
                        nextRowKey: result.nextRowKey,
                        nextTableName: result.nextTableName,
                        targetLocation: result.targetLocation,
                    },
                    hasMore: result.nextPartitionKey != undefined
                });
            });
    }

    getEventNameCell(data: any) {
        const event = data.dataItem as MiddlewareLogEvent;
        var eventLookupItem = this.eventLookup.find(e => e.value == event.type);

        return (
            <td>
                {eventLookupItem && eventLookupItem.text}
            </td>
        );
    }

    getEventDescriptionCell(data: any) {
        const event = data.dataItem as MiddlewareLogEvent;
        var eventLookupItem = this.eventLookup.find(e => e.value == event.type);

        let description = eventLookupItem && eventLookupItem.remark || "";

        if (description.includes(MiddlewareLogEventPlaceholders.Count))
            description = description.replace(MiddlewareLogEventPlaceholders.Count, event.recordCount.toString());

        if (description.includes(MiddlewareLogEventPlaceholders.ExternalSystem)) {
            let integrationSystemLookupItem = this.integrationSystemLookup.find(i => i.value == event.integrationSystem);

            if (integrationSystemLookupItem)
                description = description.replace(MiddlewareLogEventPlaceholders.ExternalSystem, integrationSystemLookupItem.text || "");
        }

        return (
            <td>
                {`${description}${event.message != null ? `\n${event.message}` : '' }`}
            </td>
        );
    }

    render() {
        const { logEvents, hasMore } = this.state;

        return (
            <div className="middleware-event-log-dialog">
                <Dialog>
                    <div className="ty-modal-header">
                        <Row>
                            <Col>
                                <BackButton onClick={this.props.onBackClick} />
                            </Col>
                        </Row>
                    </div>
                    <div className="ty-modal-body">
                        <Row>
                            <Col>
                                <Row className="mb-2">
                                    <Col>
                                        <Row>
                                            <Col>
                                                <Label className="system-label mb-0">{localise('TEXT_EVENT_LOG')}</Label>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <small className="text-muted">{localise('REMARK_EXCHANGE_EVENT_LOG')}</small>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        {
                                            logEvents.length > 0 ?
                                                <>
                                                    <Grid data={logEvents}>
                                                        <GridColumn field="type" title={localise("TEXT_EVENT_NAME")} cell={this.getEventNameCell} />
                                                        <GridColumn field="type" title={localise("TEXT_EVENT_DESCRIPTION")} cell={this.getEventDescriptionCell} />
                                                        <GridColumn field="datetime" title={localise("TEXT_EVENT_DATETIME")} cell={DateTimeFormatCell()} width={150} />
                                                    </Grid>
                                                    {
                                                        hasMore &&
                                                        <Button color="link" className="show-more" onClick={this.getLogs}>
                                                            {localise("BUTTON_SHOW_MORE")}
                                                        </Button>
                                                    }
                                                </>
                                                :
                                                <Card>
                                                    <CardBody>
                                                        <div className="text-muted text-center">{localise("ERROR_SEARCH_RESULT")}</div>
                                                    </CardBody>
                                                </Card>
                                        }
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </div>
                </Dialog>
            </div>
        );
    }
}


// WEBPACK FOOTER //
// ./src/modules/externalSystems/components/ExternalSystemDetails/EventLogPopup.tsx