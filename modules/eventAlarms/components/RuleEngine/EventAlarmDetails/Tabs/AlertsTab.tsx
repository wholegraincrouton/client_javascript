import * as React from "react";
import { Row, Col, Label } from "reactstrap";
import { localise } from "src/modules/shared/services";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import { UserGrid } from "src/modules/shared/components/UserGrid/UserGrid";
import { RoleGrid } from "src/modules/shared/components/RoleGrid/RoleGrid";
import { AlertConfig, AlertType } from "src/modules/eventAlarms/types/dto";
import { permissionService } from 'src/modules/shared/services/permission.service';

interface Props {
    alertType: AlertType;
    hasDefaultTemplate: boolean;
}

interface State {
    alertConfig: AlertConfig;
}

export class AlertsTab extends React.Component<DetailFormProps & Props, State> {
    constructor(props: DetailFormProps & Props) {
        super(props);
        this.onTemplateChange = this.onTemplateChange.bind(this);
        this.onUsersChange = this.onUsersChange.bind(this);
        this.onRolesChange = this.onRolesChange.bind(this);
        this.changeConfig = this.changeConfig.bind(this);

        let alertConfig = (props.alertType == AlertType.SMS ?
            props.item.smsAlertConfiguration : props.item.emailAlertConfiguration) as AlertConfig;
        let roles = (alertConfig && alertConfig.roles) || [];

        this.state = {
            alertConfig: {
                alertType: props.alertType,
                template: (alertConfig && alertConfig.template) || '',
                users: (alertConfig && alertConfig.users) || [],
                roles: roles
            }
        }
    }

    onTemplateChange(event: any) {
        const { alertConfig } = this.state;
        let templateKey = event.target.value;

        let newAlertConfig: AlertConfig = {
            ...alertConfig,
            template: templateKey,
            users: !templateKey ? [] : this.state.alertConfig.users,
            roles: !templateKey ? [] : this.state.alertConfig.roles
        };
        this.changeConfig(newAlertConfig);
    }

    onUsersChange(users: string[]) {
        const { alertConfig } = this.state;

        let newAlertConfig: AlertConfig = {
            ...alertConfig,
            users: users
        };
        this.changeConfig(newAlertConfig);
    }

    onRolesChange(roles: string[]) {
        const { alertConfig } = this.state;

        let newAlertConfig: AlertConfig = {
            ...alertConfig,
            roles: roles
        };
        this.changeConfig(newAlertConfig);
    }

    changeConfig(alertConfig: AlertConfig) {
        const { props } = this;
        props.change(props.alertType == AlertType.SMS ? "smsAlertConfiguration" : "emailAlertConfiguration", alertConfig);

        this.setState({
            alertConfig: alertConfig
        });
    }

    render() {
        const { props} = this;
        const { alertConfig } = this.state;
        const { item } = this.props;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');
        
        return (
            <Row>
                <Col>
                    <Row className="form-group mb-2">
                        <Col xl={5} lg={7}>
                            <Label>{localise("TEXT_TEMPLATE")}</Label>
                            <LookupDropDown {...props} lookupKey={props.alertType == AlertType.SMS ? "LIST_SMS_TEMPLATES" : "LIST_EMAIL_TEMPLATES"}
                                value={alertConfig.template} onChange={this.onTemplateChange} allowBlank={true} textBlank="TEXT_NA" disabled={props.hasDefaultTemplate || !isPermittedToEdit} />
                            <small className="text-muted">
                                {localise(props.alertType == AlertType.SMS ? "REMARK_SMS_TEMPLATE" : "REMARK_EMAIL_TEMPLATE")}
                            </small>
                        </Col>
                    </Row>
                    <Row className="form-group mb-2">
                        <Col>
                            <Row>
                                <Col>
                                    <Label className="mb-0">{localise("TEXT_USERS")}</Label>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <small className="text-muted">
                                        {localise(props.alertType == AlertType.SMS ? "REMARK_SMS_USERS" : "REMARK_EMAIL_USERS")}
                                    </small>
                                </Col>
                            </Row>
                            <UserGrid customerId={props.item.customerId} userList={alertConfig.users} onChange={this.onUsersChange}
                                readonly={!alertConfig.template || !isPermittedToEdit} showContextUser={props.item.eventSource && props.item.eventSource.isItemEvent}
                                columns={['description', 'designation']} />
                        </Col>
                    </Row>
                    <Row className="form-group mb-2">
                        <Col>
                            <Row>
                                <Col>
                                    <Label className="mb-0">{localise("TEXT_ROLES")}</Label>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <small className="text-muted">
                                        {localise(props.alertType == AlertType.SMS ? "REMARK_SMS_ROLES" : "REMARK_EMAIL_ROLES")}
                                    </small>
                                </Col>
                            </Row>
                            <RoleGrid customerId={props.item.customerId} roleList={alertConfig.roles} onChange={this.onRolesChange}
                                readonly={!alertConfig.template || !isPermittedToEdit} />
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/eventAlarms/components/RuleEngine/EventAlarmDetails/Tabs/AlertsTab.tsx