import React, { ReactElement } from "react";
import { Row, Col } from "reactstrap";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Stepper } from "@progress/kendo-react-layout";
import { ActionButton, SaveButton } from "../ActionButtons/ActionButtons";
import { localise } from "../../services";
import "./wizard-dialog.css";

interface Props {
    titleKey: string;
    steps: any[];
    stepCount: number;
    currentStep: number;
    onBackClick: () => void;
    onNextClick: () => void;
    onCancelClick: () => void;
    onSaveClick: () => void;
    component: ReactElement;
    className?: string;
}

export class WizardDialog extends React.Component<Props> {
    render() {
        const { titleKey, stepCount, steps, currentStep, component, className,
            onBackClick, onNextClick, onCancelClick, onSaveClick } = this.props;

        return (
            <Dialog className={`wizard-dialog ${className || ''}`} width={"60%"} height={"80%"}>
                <Row>
                    <Col xl={6} lg={3} className="title-column"><h3>{localise(titleKey)}</h3></Col>
                    <Col xl={6} lg={9} className="button-column text-lg-right text-center">
                        {
                            currentStep != 1 &&
                            <ActionButton className="btn-back" textKey="BUTTON_BACK" color="secondary"
                                icon="fa-solid fa-angle-left" onClick={onBackClick} disabled={currentStep == 1} />
                        }

                        <ActionButton className="btn-cancel" textKey="BUTTON_CANCEL" color="danger"
                            onClick={onCancelClick} />
                        {
                            currentStep == stepCount ?
                                <SaveButton className="btn-save" onClick={onSaveClick} />
                                :
                                <ActionButton className="btn-next" textKey="BUTTON_NEXT" color="primary"
                                    icon="fa-solid fa-angle-right" onClick={onNextClick} switchIconSide={true} disabled={currentStep == stepCount} />
                        }
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <Stepper items={steps} value={currentStep - 1} />
                        <Row className="step-info d-none">
                            <Col className="ml-3">
                                <h3 className="mb-1">{steps[currentStep - 1].label}</h3>
                                <p className="system-label mb-0">Step {currentStep} of {stepCount}</p>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <hr />
                <Row className="wizard-content pl-3 pr-3">
                    <Col>
                        {component}
                    </Col>
                </Row>
            </Dialog>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/shared/components/WizardDialog/WizardDialog.tsx