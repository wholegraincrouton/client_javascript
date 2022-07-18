import * as React from "react";
import { Row, Col, Label } from "reactstrap";
import { localise, permissionService } from "src/modules/shared/services";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { EventActionGrid } from "../EventActionGrid";
import { ActionConfig } from "src/modules/eventAlarms/types/dto";

interface Props {
    defaultActions?: ActionConfig[];
}

export class ActionsTab extends React.Component<DetailFormProps & Props> {
    constructor(props: DetailFormProps & Props) {
        super(props);
        this.onActionsChange = this.onActionsChange.bind(this);
    }

    onActionsChange(actions: ActionConfig[]) {
        const { props } = this;
        props.change("eventActions", actions);
    }

    render() {
        const { props } = this;
        const { item } = this.props;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');

        return (
            <Row className="form-group mb-2">
                <Col>
                    <Row>
                        <Col>
                            <Label className="mb-0">{localise("TEXT_ACTIONS_AT_CABINET")}</Label>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <small className="text-muted">{localise("REMARK_ACTIONS_AT_CABINET")}</small>
                        </Col>
                    </Row>
                    <EventActionGrid customerId={props.item.customerId} actions={props.item.eventActions || []}
                        onChange={this.onActionsChange} defaultActions={props.defaultActions} readonly={!isPermittedToEdit} />
                </Col>
            </Row>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/eventAlarms/components/RuleEngine/EventAlarmDetails/Tabs/ActionsTab.tsx