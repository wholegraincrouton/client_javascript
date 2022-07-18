import * as React from "react";
import Label from "reactstrap/lib/Label";
import FormGroup from "reactstrap/lib/FormGroup";
import { localise } from "../../services";
import { CopyButton } from "../CopyButton/CopyButton";
import { Col, Row } from "reactstrap";

interface FormFieldContentProps {
    input?: any;
    labelKey?: string;
    remarksKey?: string;
    inputComponent: any;
    required?: boolean;
    disabled?: boolean;
    meta?: { touched: any, error: any, warning: any };
    disableRequiredToken?: boolean;
    tooltip?: string;
    showCopyButton?: boolean;
    copyValue?: string;
    className?: string;
}

const FormFieldContent = (props: FormFieldContentProps) => {

    const { meta, input, showCopyButton, className } = props;
    const Component = props.inputComponent;

    return (
        <FormGroup className={className}>
            {
                props.labelKey &&
                <Row>
                    <Col>
                        <Label className="system-label">
                            {props.labelKey && localise(props.labelKey)}
                            {props.required && !props.disableRequiredToken && (' *')}
                        </Label>
                    </Col>
                </Row>
            }
            <Row className="form-input-row">
                <Col xs={showCopyButton ? 11 : 12} className={`${showCopyButton ? 'pr-0' : ''}`}>
                    <Component {...input} title={props.tooltip} disabled={props.disabled}
                        onChange={(param: any) => input && input.onChange(param.target.value)} />
                </Col>
                {
                    showCopyButton &&
                    <Col xs={1} className='pl-0'>
                        <CopyButton style={{ height: 35, width: 48, fontSize: 12 }} value={props.copyValue} />
                    </Col>
                }
            </Row>
            {
                props.remarksKey &&
                <Row>
                    <Col>
                        {
                            meta && (!meta.error || !meta.touched) &&
                            <small className="text-muted">{localise(props.remarksKey)}</small>
                        }
                        {
                            meta && meta.touched && meta.error &&
                            <small className="text-danger">{meta.error}</small>
                        }
                    </Col>
                </Row>
            }
        </FormGroup>)
}

export default FormFieldContent



// WEBPACK FOOTER //
// ./src/modules/shared/components/Form/FormFieldContent.tsx