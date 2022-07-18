import * as React from "react";
import { Col, Input, Label, Row } from "reactstrap";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { UserGrid } from "src/modules/shared/components/UserGrid/UserGrid";
import { localise, permissionService } from "src/modules/shared/services";
import { ExternalSystem, ExternalSystemCustomFields } from "../../types/dto";

interface State {
    customFields: ExternalSystemCustomFields;
}

export class SineSettingsTab extends React.Component<DetailFormProps, State> {
    constructor(props: DetailFormProps) {
        super(props);
        this.onUsersChange = this.onUsersChange.bind(this);
        this.toggleCredentialGenerate = this.toggleCredentialGenerate.bind(this);

        let externalSystem = props.item as ExternalSystem;

        this.state = {
            customFields: {
                field1: externalSystem.customFields && externalSystem.customFields.field1,
                field2: externalSystem.customFields && externalSystem.customFields.field2,
                field3: externalSystem.customFields && externalSystem.customFields.field3
            }
        };
    }

    onUsersChange(users: string[]) {
        this.props.change("alertUsers", users);
    }

    toggleCredentialGenerate(e: any) {
        let customFields = { ...this.state.customFields };
        
        switch (e.target.name) {
            case "field1":
                customFields.field1 = !this.state.customFields.field1;
                break;
            case "field2":
                customFields.field2 = !this.state.customFields.field2;
                break;
            case "field3":
                customFields.field3 = !this.state.customFields.field3;
                break;
        }

        this.props.change("customFields", customFields);

        this.setState({
            ...this.state,
            customFields: customFields
        });
    }

    render() {
        const { item } = this.props;
        const { customFields } = this.state;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');
        
        return (
            <div className="sine-settings-tab">
                <Row className="mt-2 mb-2">
                    <Col>
                        <small className="text-muted"> {localise("REMARK_SETTINGS")} </small>
                    </Col>
                    <Col md="auto">
                        <small className="text-muted"> {localise('TEXT_REQUIRED_FIELD')} </small>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Row className="mb-3">
                            <Col>
                                <Label className="system-label mb-0">{localise("User Access Settings")}</Label>
                            </Col>
                        </Row>
                        <Row className="form-group mb-3">
                            <Col>
                                <Row>
                                    <Col className="ml-4">
                                        <Label className="mb-0">
                                            <Input type="checkbox" name="field1" checked={customFields.field1} onChange={this.toggleCredentialGenerate} 
                                                disabled={!isPermittedToEdit}/>
                                            {localise("TEXT_SINE_INVITED_USER_EMAIL_FLAG")}
                                        </Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col className="ml-1">
                                        <small className="text-muted">{localise('REMARK_SINE_INVITED_USER_EMAIL_FLAG')}</small>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row className="form-group mb-3">
                            <Col>
                                <Row>
                                    <Col className="ml-4">
                                        <Label className="mb-0">
                                            <Input type="checkbox" name="field2" checked={customFields.field2} onChange={this.toggleCredentialGenerate} 
                                                disabled={!isPermittedToEdit}/>
                                            {localise("TEXT_SINE_EXISTING_USER_EMAIL_FLAG")}
                                        </Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col className="ml-1">
                                        <small className="text-muted">{localise('REMARK_SINE_EXISTING_USER_EMAIL_FLAG')}</small>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row className="form-group mb-0">
                            <Col>
                                <Row>
                                    <Col className="ml-4">
                                        <Label className="mb-0">
                                            <Input type="checkbox" name="field3" checked={customFields.field3} onChange={this.toggleCredentialGenerate} 
                                                disabled={!isPermittedToEdit}/>
                                            {localise("TEXT_SINE_PIN_GENERATE_FLAG")}
                                        </Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col className="ml-1">
                                        <small className="text-muted">{localise('REMARK_SINE_PIN_GENERATE_FLAG')}</small>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <hr />
                <UserGrid customerId={item.customerId} userList={item.alertUsers} onChange={this.onUsersChange}
                    columns={['description', 'roles']} webOnly={true} required={true} readonly={!isPermittedToEdit}
                    title={localise('TEXT_ALERT_USERS_SINE')} remark={localise('REMARK_ALERT_USERS_SINE')} />
            </div>
        );
    }
}


// WEBPACK FOOTER //
// ./src/modules/externalSystems/components/ExternalSystemDetails/SineSettingsTab.tsx