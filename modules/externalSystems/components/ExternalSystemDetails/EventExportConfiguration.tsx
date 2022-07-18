import * as React from 'react';
import { Row, Col, Label } from 'reactstrap';
import { localise, lookupService, permissionService } from 'src/modules/shared/services';
import { DateTimePicker } from '@progress/kendo-react-dateinputs';
import { Grid, GridColumn, GridCellProps, GridSelectionChangeEvent, GridHeaderSelectionChangeEvent } from '@progress/kendo-react-grid';
import { TempEventDetail, IntegrationStatus } from '../../types/dto';
import { LookupItem } from 'src/modules/shared/types/dto';
import { ActionButton } from 'src/modules/shared/components/ActionButtons/ActionButtons';
import * as moment from 'moment';
import "./external-system-detail.css"
import { externalSystemsService } from '../../services/externalSystems.service';
import { DefaultDateTimeFormats } from 'src/modules/shared/constants/datetime.constants';
import { DetailFormProps } from 'src/modules/shared/components/DetailPage';
import { dateTimeUtilService } from 'src/modules/shared/services/datetime-util.service';

interface Props {
    exportEventFromDate: string;
    onChange: (date: string) => void;
    onEventDataChange: (data: TempEventDetail[]) => void;
    exportEventDetails: string[];
    integrationStatus: string;
    isDirty: boolean;
    externalSystemId: string;
}

interface State {
    exportDate: Date;
    exportEventDetails: TempEventDetail[];
    isButtonDisabled: boolean;
    totalCount: number;
}

export class EventExportConfiguration extends React.Component<Props & DetailFormProps, State>{
    constructor(props: any) {
        super(props);
        this.onExportDateChange = this.onExportDateChange.bind(this);
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.onHeaderSelectionChange = this.onHeaderSelectionChange.bind(this);
        this.onTestSyncButtonClick = this.onTestSyncButtonClick.bind(this);

        var initialEvents = lookupService.getMergedList(["LIST_CABINET_HIGH_PRIORITY_EVENTS", "LIST_CABINET_LOW_PRIORITY_EVENTS"]);
        var highPriorityEvents = lookupService.getList("LIST_CABINET_HIGH_PRIORITY_EVENTS").map(e => (e.value));

        this.state = {
            exportDate: props.exportEventFromDate ? new Date(props.exportEventFromDate) : new Date(),
            totalCount: initialEvents.length,
            exportEventDetails: initialEvents.map((item, index: number) => {
                let event = props.exportEventDetails && props.exportEventDetails.find((i: any) => i.eventKey == item.value);

                return {
                    rowSelected: props.exportEventDetails ? props.exportEventDetails.some((e: any) => e.eventKey == item.value) : highPriorityEvents.includes(item.value),
                    index: index,
                    eventName: item.text,
                    eventKey: item.value,
                    includeEventContext: (event && event.includeEventContext) || false,
                    remark: item.remark
                };
            }),
            isButtonDisabled: false
        }
    }

    onExportDateChange(date: any) {
        const { onChange } = this.props;
        this.setState({
            exportDate: date
        })
        var formatDate = moment(date).format(DefaultDateTimeFormats.DateTimeFormat);
        onChange(formatDate);

    }

    onSelectionChange(event: GridSelectionChangeEvent) {
        const { onEventDataChange } = this.props;
        const { exportEventDetails } = this.state;

        const exportEvent = exportEventDetails.find(item => item.index == event.dataItem.index);

        if (exportEvent) {
            exportEvent.rowSelected = !exportEvent.rowSelected;
        }

        onEventDataChange(exportEventDetails.filter(e => e.rowSelected));

        this.setState({
            ...this.state,
            exportEventDetails: exportEventDetails
        })
    }

    onHeaderSelectionChange(event: GridHeaderSelectionChangeEvent) {
        const { onEventDataChange } = this.props;
        const { exportEventDetails } = this.state;

        const isSelected = event.nativeEvent.target.checked;
        exportEventDetails.forEach(item => item.rowSelected = isSelected);

        onEventDataChange(exportEventDetails.filter(r => r.rowSelected));

        this.setState({
            ...this.state,
            exportEventDetails: exportEventDetails
        })
    }

    onTestSyncButtonClick(event: any) {
        event.preventDefault();
        this.setState({
            ...this.state,
            isButtonDisabled: true
        });

        setTimeout(() => this.setState({ ...this.state, isButtonDisabled: false }), 10000);


        externalSystemsService.updateTestEventEpoch(this.props.externalSystemId);
    }

    render() {
        const { isDirty, integrationStatus, item } = this.props;
        const { totalCount, exportEventDetails, isButtonDisabled } = this.state;
        const allItemsSelected = exportEventDetails.every(item => item.rowSelected);
        const selectedCount = exportEventDetails.filter(r => r.rowSelected).length;
        const isTestSyncButtonDisabled = isDirty || integrationStatus == IntegrationStatus.Inactive || isButtonDisabled || !item.isMiddlewareConnected;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');

        return <>
            <div className="event-export-tab">
                <Row style={{ marginTop: 10 }}>
                    <Col xl={6}>
                        <Row>
                            <Col>
                                <Label className="system-label">{localise('TEXT_EXPORT_FROM')}*</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <DateTimePickerFrom exportStart={this.state.exportDate} onChange={this.onExportDateChange} isPermittedToEdit={isPermittedToEdit} />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <small className="text-muted"> {localise("REMARK_EXPORT_FROM")} </small>
                            </Col>
                        </Row>
                    </Col>
                    <Col xl={6} className="test-export">
                        <Row style={{ marginTop: 20 }}>
                            <Col>
                                <ActionButton color="primary" textKey="BUTTON_TEST_SYNC_EVENTS" icon="fa-undo-alt"
                                    onClick={this.onTestSyncButtonClick} disabled={isTestSyncButtonDisabled || !isPermittedToEdit} />
                            </Col>
                        </Row>
                        <Row>
                            <Col><small className="text-muted"> {localise("REMARK_TEST_SYNC_EVENTS_BUTTON")} </small></Col>
                        </Row>
                    </Col>
                </Row>
                <Row style={{ marginTop: 30 }}>
                    <Col>
                        <Row>
                            <Col>
                                <small className="text-muted"> {localise("TEXT_EXPORT_EVENT_DESCRIPTION")} </small>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <small className="grid-selection-count">({selectedCount}/{totalCount} {localise("TEXT_SELECTED")})</small>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Grid data={this.state.exportEventDetails}
                                    selectedField="rowSelected"
                                    onSelectionChange={this.onSelectionChange}
                                    onHeaderSelectionChange={this.onHeaderSelectionChange}
                                    className={isPermittedToEdit ? "non-sortable" : "disabled-grid"}>
                                    <GridColumn field="rowSelected" width="auto" className="checkbox-grid-column"
                                        headerClassName="checkbox-grid-column" headerSelectionValue={allItemsSelected} />
                                    <GridColumn sortable={false} field="eventName" title={localise("TEXT_EVENT_NAME")} />
                                    <GridColumn sortable={false} field="priority" title={localise("TEXT_PRIORITY")} cell={GetPriorityCell()} />
                                    <GridColumn sortable={false} field="remark" title={localise("TEXT_DESCRIPTION")} />
                                </Grid>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>
        </>
    }
}

export function GetPriorityCell() {
    return class extends React.Component<GridCellProps> {
        constructor(props: GridCellProps) {
            super(props);
        }

        displayPriority() {
            let itemList = lookupService.getList("LIST_CABINET_HIGH_PRIORITY_EVENTS").map((i: LookupItem) => (
                i.value || ''
            ))
            return itemList.includes(this.props.dataItem["eventKey"]) ? localise("TEXT_HIGH_PRIORITY") : localise("TEXT_LOW_PRIORITY");
        }

        render() {
            return (
                <td>
                    {this.displayPriority()}
                </td>
            );
        }
    }
}

const DateTimePickerFrom = (props: any) => {
    return <div>
        <DateTimePicker {...props} value={props.exportStart} disabled={!props.isPermittedToEdit}
            format={dateTimeUtilService.getKendoDateTimeFormat()}
            onChange={(event: any) => {
                props.onChange(event.target.value);
            }}
        />
    </div>
}


// WEBPACK FOOTER //
// ./src/modules/externalSystems/components/ExternalSystemDetails/EventExportConfiguration.tsx