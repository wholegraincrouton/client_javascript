import * as React from "react";
import { Button, ButtonProps, Row, Col } from "reactstrap";

import "./action-button.css";
import { localise } from "../../services";
import { permissionService } from "../../services/permission.service";

interface BaseButtonProps extends ButtonProps {
}

interface NewButtonProps extends BaseButtonProps {
    permissionKeySuffix?: string;
    considerContextCustomer?: boolean;
    labelKey?: string;
}

export const NewButton = (props: NewButtonProps) => {
    const { permissionKeySuffix, considerContextCustomer, labelKey, canAddNew, btnColor, btnIcon, btnWidth, ...rest } = props;

    var action = permissionKeySuffix == undefined ? 'NEW' : permissionKeySuffix;
    var color = btnColor == undefined ? 'secondary' : btnColor;
    var icon = btnIcon == undefined ? 'fa-plus' : btnIcon;
    var width = btnWidth == undefined ? 'auto' : btnWidth;
    var hasPermissionForAddNew = (considerContextCustomer) ?
        permissionService.isActionPermittedForCustomer(action) :
        permissionService.canPermissionGrant(action);

    return <ActionButton style={{ width: width }} textKey={labelKey || "BUTTON_NEW"} disabled={canAddNew == false}
        isPermissionAllowed={hasPermissionForAddNew} color={color} icon={icon} {...rest} />
}

export const BackButton = (props: BaseButtonProps) => {
    return <ActionButton textKey="BUTTON_BACK" color="danger" icon="ty ty-ic_reply" {...props} />
}

export const SaveButton = (props: BaseButtonProps) => {
    return <ActionButton textKey="BUTTON_SAVE" color="primary" icon="fa-save" {...props} />
}

export const DeleteButton = (props: BaseButtonProps) => {
    return <ActionButton textKey="BUTTON_DELETE" color="secondary" icon="fa-trash-alt" {...props} />
}

export const BulkDeleteButton = (props: BaseButtonProps) => {
    return <ActionButton textKey="BUTTON_BULKDELETE" color="secondary" icon="fa-trash-alt" {...props} />
}

export const YesButton = (props: BaseButtonProps) => {
    return <ActionButton textKey="BUTTON_YES" color="primary" icon="fa-check" className="short" {...props} />
}

export const NoButton = (props: BaseButtonProps) => {
    return <ActionButton textKey="BUTTON_NO" color="secondary" icon="fa-times" className="short" {...props} />
}

export const OKButton = (props: BaseButtonProps) => {
    return <ActionButton textKey="BUTTON_OK" color="primary" icon="fa-check" className="short" {...props} />
}

interface ActionButtonProps extends ButtonProps {
    textKey: string;
    icon?: string;
    isPermissionAllowed?: any;
    disableDefaultMargin?: boolean;
    switchIconSide?: boolean;
}

export const ActionButton = (props: ActionButtonProps) => {
    const { textKey, icon, className, disableDefaultMargin, isPermissionAllowed, switchIconSide, ...buttonProps } = props;
    const margin = disableDefaultMargin ? "" : "m-1";

    if (isPermissionAllowed == undefined || isPermissionAllowed) {
        return (
            <Button {...buttonProps as any} className={`${margin} action-button ${className}`}>
                {
                    icon ?
                        switchIconSide ?
                            <Row>
                                <Col className="pr-0">{localise(props.textKey)}</Col>
                                <Col xs="auto"><i className={`fas ${icon} pl-0`} /></Col>
                            </Row>
                            :
                            <Row>
                                <Col xs="auto"><i className={`fas ${icon} pr-0`} /></Col>
                                <Col className="pl-0">{localise(props.textKey)}</Col>
                            </Row>
                        :
                        localise(props.textKey)
                }
            </Button>
        );
    }
    else {
        return null;
    }
}



// WEBPACK FOOTER //
// ./src/modules/shared/components/ActionButtons/ActionButtons.tsx