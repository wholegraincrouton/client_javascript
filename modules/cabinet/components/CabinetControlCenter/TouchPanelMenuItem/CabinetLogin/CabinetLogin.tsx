import * as React from "react";
import { Row, Col, Button, Form, Label, Input } from "reactstrap";
import { connect } from "react-redux";
import { SimulationMode, TouchScreenMode, KeypadOptions } from "src/modules/cabinet/types/dto";
import Keypad from "../../Keypad/Keypad";
import { localise, navService } from "src/modules/shared/services";
import { StoreState } from "src/redux/store";
import { cabinetControlCenterActions } from "src/modules/cabinet/actions/cabinet-control-center.actions";
import { History } from "history";

export interface Props {
    login: (userId: string, pin: string, cabinetId: string, customerId: string, simulationMode: SimulationMode, redirectBackToCabinetList: () => void) => void;
    multiCustodyLogin: (userId: string, pin: string, cabinetId: string, customerId: string, previousTouchScreenMode: TouchScreenMode) => void;
    onChangeKeyPad: (keypadOptions: KeypadOptions) => void;
    keypadOptions?: KeypadOptions;
    loginError?: string;
    cabinetId?: string;
    customerId?: string;
    simulationMode: SimulationMode;
    isMultiCustodyLogin?: boolean;
    previousTouchScreenMode?: TouchScreenMode;
    history: History;
}

export interface State {
    userId?: string;
    pin?: string;
}

export class CabinetLogin extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            userId: '',
            pin: ''
        };

        this.login = this.login.bind(this);
        this.onTextEnter = this.onTextEnter.bind(this);
        this.mouseDown = this.mouseDown.bind(this);
        this.redirectBackToCabinetList = this.redirectBackToCabinetList.bind(this);
    }

    login(e: any) {
        e.preventDefault();
        const { userId, pin } = this.state;
        const { cabinetId, login, multiCustodyLogin, customerId, simulationMode, isMultiCustodyLogin, previousTouchScreenMode } = this.props;
        (userId != undefined && pin != undefined && cabinetId != undefined && customerId != undefined) &&
            ((isMultiCustodyLogin && multiCustodyLogin(userId, pin, cabinetId, customerId, previousTouchScreenMode != undefined ? previousTouchScreenMode : TouchScreenMode.MAIN_MENU))
                || (!isMultiCustodyLogin && login(userId, pin, cabinetId, customerId, simulationMode, this.redirectBackToCabinetList)));
    }

    redirectBackToCabinetList() {
        navService.goBackToListPage("/cabinet/cabinetmanagement", this.props.history);
    }

    onTextEnter(e: any) {
        const { name, value } = e.target;
        this.setState({
            [name]: value,
        });
        this.props.onChangeKeyPad({ on: false, controlId: '', label: '', remark: '', type: '' });
    }

    mouseDown(controlId: string, label: string, remark: string, type: string) {
        this.props.onChangeKeyPad({ on: true, controlId, label, remark, type });
    }

    render() {
        const { keypadOptions } = this.props;
        const { userId, pin } = this.state;
        return (
            keypadOptions && keypadOptions.on ?
                <Keypad label={keypadOptions.label} controlId={keypadOptions.controlId}
                    remark={keypadOptions.remark} onTextEnter={this.onTextEnter} inputType={keypadOptions.type} />
                :
                <Form onSubmit={this.login} className="form-cabinet-login">
                    <Row className="mb-3">
                        <Col>
                            <Label className="system-label">{localise("TEXT_USERID")}</Label>
                            <Input placeholder={localise("TEXT_USERID")} name="userId" value={userId}
                                onMouseDown={() => { this.mouseDown("userId", localise("TEXT_USERID"), localise("REMARK_USERID"), "text") }} maxLength={100} />
                            <small className="text-muted remarks"> {localise("REMARK_USERID")} </small>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col>
                            <Label className="system-label">{localise("TEXT_PIN")}</Label>
                            <Input type="password" placeholder={localise("TEXT_PIN")} name="pin" value={pin}
                                onMouseDown={() => { this.mouseDown("pin", localise("TEXT_PIN"), localise("REMARK_PIN"), "password") }} maxLength={100} />
                            <small className="text-muted remarks"> {localise("REMARK_PIN")} </small>
                        </Col>
                    </Row>
                    {this.props.isMultiCustodyLogin &&
                        <Row className="mb-1">
                            <Col className="text-center">
                                {localise("TEXT_MULTICUSTODY_DESCRIPTION")}
                            </Col>
                        </Row>
                    }
                    <Row className="mb-1 btn-vc-login">
                        <Col className="text-center">
                            <Button type="submit" color='primary'> {localise("BUTTON_LOGIN")} </Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="text-center text-danger">
                            {this.props.loginError}
                        </Col>
                    </Row>
                </Form>
        );
    }
}

const mapStateToProps = (store: StoreState) => {
    const { loginError, cabinetId, customerId, previousTouchScreenMode } = store.cabinetSimulation;
    return { customerId, cabinetId, loginError, previousTouchScreenMode };
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        login: (userId: string, pin: string, cabinetId: string, customerId: string, simulationMode: SimulationMode, redirectBackToCabinetList: () => void) =>
            dispatch(cabinetControlCenterActions.loginToCabinet(userId, pin, cabinetId, customerId, simulationMode, redirectBackToCabinetList)),
        multiCustodyLogin: (userId: string, pin: string, cabinetId: string, customerId: string, previousTouchScreenMode: TouchScreenMode) =>
            dispatch(cabinetControlCenterActions.multiCustodyLogin(userId, pin, cabinetId, customerId, previousTouchScreenMode))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CabinetLogin)


// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetControlCenter/TouchPanelMenuItem/CabinetLogin/CabinetLogin.tsx