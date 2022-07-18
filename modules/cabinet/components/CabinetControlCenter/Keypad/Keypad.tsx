import * as React from "react";
import { Form, Row, Col, Label, Input, Button } from "reactstrap";
import { localise } from "../../../../shared/services";

export interface Props {
    label: string;
    controlId: string;
    remark: string;
    inputType: string;
    onTextEnter: (value: any) => void;
}

export interface State {
    value: string
}

export default class Keypad extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = { value: '' };

        this.keyClick = this.keyClick.bind(this);
        this.backSpace = this.backSpace.bind(this);
    }

    keyClick(e: any) {
        e.preventDefault();
        let val = e.target.value;
        this.setState({ value: this.state.value + val });
    }

    backSpace(e: any) {
        e.preventDefault();
        this.setState({ value: this.state.value.slice(0, -1) });
    }

    generateKeypad() {
        let keys = [];
        for (let r = 0; r <= 2; r++) {
            let cols = []
            for (let c = 1; c <= 3; c++) {
                let index = (2 - r) * 3 + c;
                cols.push(<Col key={'c-' + index}> <Button value={index} onClick={this.keyClick}>{index}</Button></Col>)
            }
            keys.push(<Row key={'r-' + r} className="key-pad-row"> {cols} </Row>);
        }
        return keys;
    }

    render() {
        const { label, controlId, remark, onTextEnter, inputType } = this.props;
        const { value } = this.state;
        return (
            <Form className="form-btn-keypad" onSubmit={(e: any) => { e.preventDefault(); onTextEnter({ target: { value, name: controlId } }); }} >
                <Row className="user-id-row mb-1">
                    <Col>
                        <Label className="system-label">{label}</Label>
                        <Input type={inputType == "password" ? "password" : "text"} placeholder={label} name={controlId} value={value} />
                        <small className="text-muted remarks"> {remark} </small>
                    </Col>
                </Row>
                {this.generateKeypad()}
                <Row className="key-pad-row">
                    <Col><Button onClick={this.keyClick} value="*"> * </Button></Col>
                    <Col><Button onClick={this.keyClick} value="0"> 0 </Button></Col>
                    <Col><Button onClick={this.backSpace}><i className="fas fa-sm fa-arrow-left" /></Button></Col>
                </Row>
                <Row>
                    <Col className="btn-keypad-enter text-center mt-3 p-0">
                        <Button type="submit" color="primary" > {localise('BUTTON_ENTER')} </Button>
                    </Col>
                </Row>
            </Form>
        )
    }
}


// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetControlCenter/Keypad/Keypad.tsx