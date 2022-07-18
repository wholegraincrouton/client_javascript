import * as React from "react";
import { Card, CardBody, Row, Col } from "reactstrap";
import { InjectedFormProps } from "redux-form";
import { BackButton, SaveButton, DeleteButton } from "../ActionButtons/ActionButtons";
import { FormDescriptionHeader } from "../Form";
import { permissionService } from "../../services/permission.service";
import { History } from 'history';

export interface DetailFormCustomProps {
    item: any;
    body?: any;
    header?: DetailFormHeaderComponent;
    onBackClick?: () => void;
    onDeleteClick?: () => void;
    isNew: boolean;
    reload: () => void;
    readonly?: boolean;
    history: History;
    hideDescriptionHeader?: boolean;
    hideDeleteButton?: boolean;
    saveCallback?: (values: any) => void;
}

export type DetailFormProps = DetailFormCustomProps & InjectedFormProps<{}, DetailFormCustomProps>
export type DetailFormBodyComponent = any;
export type DetailFormHeaderComponent = any;

export const DetailForm =
    (props: DetailFormProps) => {
        const BodyComponent = props.body;
        const HeaderComponent = props.header;
        const canDelete = permissionService.isActionPermittedForCustomer("DELETE", props.item.customerId)
        return (
            <div className="detail-form">
                <Card className="page-fixed-content compact mt-2">
                    <CardBody>
                        <Row>
                            <Col>
                                <BackButton onClick={props.onBackClick} />
                                {!props.readonly && <SaveButton onClick={props.handleSubmit} disabled={!props.dirty} />}
                            </Col>
                            <Col xs="auto" className="cabinet-details-section-button">
                                {HeaderComponent && <HeaderComponent {...props} />}
                                {!props.readonly && !props.hideDeleteButton && canDelete && <DeleteButton onClick={props.onDeleteClick} disabled={props.isNew} />}
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
                <Card className="page-fill-content content-scroll">
                    <CardBody>
                        {!props.hideDescriptionHeader && <FormDescriptionHeader showRequiredLabel={!props.readonly} />}
                        {BodyComponent && <BodyComponent {...props} />}
                    </CardBody>
                </Card>
            </div>
        )
    }


// WEBPACK FOOTER //
// ./src/modules/shared/components/DetailPage/DetailForm.tsx