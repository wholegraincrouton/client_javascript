import * as React from "react";
import Label from "reactstrap/lib/Label";
import Button from "reactstrap/lib/Button";
import { localise } from "src/modules/shared/services";

export interface Props {
    notificationMessage: string;
    actionButtonText?: string;
    action?: () => void;
}

export class NotificationPanel extends React.Component<Props>{
    constructor(props: Props) {
        super(props);
        this.onActionButtonClick = this.onActionButtonClick.bind(this);
    }

    onActionButtonClick() {
        if (this.props.action != undefined)
            this.props.action();
    }

    render() {
        const { actionButtonText, notificationMessage } = this.props;
        return <>
            <Label>
                {notificationMessage}
            </Label>
            {actionButtonText != undefined && <Button name="btnOK" value="OK" id="btnOKNotification" color='primary' onClick={this.onActionButtonClick}>
                {localise(actionButtonText)}
            </Button>}
        </>
    }
}


// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetControlCenter/TouchPanelMenuItem/NotificationPanel.tsx