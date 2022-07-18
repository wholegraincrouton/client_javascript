import * as React from "react";
import { EventPriority } from "src/modules/eventAlarms/types/dto";
import { FormGroup, Label, Card, CardBody, Row, Col, Input } from "reactstrap";
import { localise, contextService, globalDirtyService, apiService, lookupService } from "src/modules/shared/services";
import { BackButton, SaveButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { FormDescriptionHeader } from "src/modules/shared/components/Form";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import { DataUpdateResult } from "src/modules/shared/types/dto";
import { alertActions } from "src/modules/shared/actions/alert.actions";
import "./../event-priority.css"
import { permissionService } from 'src/modules/shared/services/permission.service';

interface Props {
    item: EventPriority;
    onBackClick: () => void;
}

interface State {
    item: EventPriority;
    isDirty: boolean;
    showValidationErrors: boolean;
}

export class EventPriorityDetails extends React.Component<Props, State> {
    originalItem: EventPriority;

    constructor(props: Props) {
        super(props);
        this.onBackClick = this.onBackClick.bind(this);
        this.onPriorityChange = this.onPriorityChange.bind(this);
        this.onRemarkChange = this.onRemarkChange.bind(this);
        this.onSaveClick = this.onSaveClick.bind(this);
        this.isPageDirty = this.isPageDirty.bind(this);
        this.originalItem = props.item;

        this.state = {
            item: props.item,
            isDirty: false,
            showValidationErrors: false
        }

        contextService.setCurrentSection("EVENT_PRIORITIES");
    }

    onBackClick() {
        const { onBackClick } = this.props;
        const { isDirty } = this.state;

        if (onBackClick) {
            if (isDirty) {
                globalDirtyService.showDirtyConfirmation(() => onBackClick())
                return;
            }
            onBackClick();
        }
    }

    onPriorityChange(e: any) {
        let item = {
            ...this.state.item,
            priority: e.target.value
        };

        this.setState({
            ...this.state,
            item: item,
            isDirty: this.isPageDirty(item)
        });
    }

    onRemarkChange(e: any) {
        let item = {
            ...this.state.item,
            remark: e.target.value
        };

        this.setState({
            ...this.state,
            item: item,
            isDirty: this.isPageDirty(item),
            showValidationErrors: false
        });
    }

    onSaveClick() {
        const { item } = this.state;

        if (!item.remark) {
            this.setState({
                ...this.state,
                showValidationErrors: true
            });
            return;
        }

        apiService.put<DataUpdateResult>("EventPriority", undefined, item)
            .then(() => {
                alertActions.showSuccess('TEXT_SAVE_SUCCESS');
                this.originalItem = item;

                this.setState({
                    ...this.state,
                    isDirty: false
                });
            });
    }

    isPageDirty(currentItem: EventPriority) {
        return (JSON.stringify(currentItem) != JSON.stringify(this.originalItem))
    }

    render() {
        const { item, isDirty, showValidationErrors } = this.state;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer('UPDATE')

        return (
            <>
                <Card className="page-fixed-content compact mt-2">
                    <CardBody>
                        <Row>
                            <Col>
                                <BackButton onClick={this.onBackClick} />
                                <SaveButton onClick={this.onSaveClick} disabled={!isDirty || !isPermittedToEdit} />
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
                <Card className="page-fill-content content-scroll">
                    <CardBody>
                        <FormDescriptionHeader showRequiredLabel={true} />
                        <div className="priority-form">
                            <FormGroup>
                                <Label className="system-label">{localise("TEXT_EVENT")}</Label>
                                <Input value={lookupService.getTextFromMultipleLookups(["LIST_CABINET_HIGH_PRIORITY_EVENTS",
                                    "LIST_CABINET_LOW_PRIORITY_EVENTS", "LIST_CABINET_ITEM_EVENTS"], item.event)} disabled={true} />
                                <div><small className="text-muted">{localise("REMARK_EVENT")}</small></div>
                            </FormGroup>
                            <FormGroup>
                                <Label className="system-label">{localise("TEXT_PRIORITY")}</Label>
                                <LookupDropDown lookupKey="LIST_EVENT_PRIORITIES" value={item.priority}
                                    onChange={this.onPriorityChange} disabled={!isPermittedToEdit}/>
                                <div><small className="text-muted">{localise("REMARK_PRIORITY")}</small></div>
                            </FormGroup>
                            <FormGroup>
                                <Label className="system-label">{localise("TEXT_REMARK")}*</Label>
                                <Input value={item.remark} onChange={this.onRemarkChange} disabled={!isPermittedToEdit}/>
                                <div>
                                    {
                                        !showValidationErrors ?
                                            <small className="text-muted">{localise("REMARK_REMARK")}</small>
                                            :
                                            <small className="text-danger">{localise("ERROR_FIELD_REQUIRED")}</small>
                                    }
                                </div>
                            </FormGroup>
                        </div>
                    </CardBody>
                </Card>
            </>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/eventAlarms/components/Priority/EventPriorityDetails/EventPriorityDetails.tsx