import * as React from 'react';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { OKButton, SaveButton } from '../ActionButtons/ActionButtons';

export interface NotificationDialogProps {
    visible?: boolean;
    title?: string;
    message?: string;
    hasSave?: boolean;
    okClick: () => void;
    close: () => void;
}

export default class NotificationDialog extends React.Component<NotificationDialogProps> {
    constructor(props: NotificationDialogProps) {
        super(props);

        this.closeDialog = this.closeDialog.bind(this);
        this.ok = this.ok.bind(this);
    }

    closeDialog() {
        this.props.close();
    }

    ok() {
        this.props.okClick();
        this.props.close();
    }

    render() {
        const { visible, title, message, hasSave } = this.props;
        return (
            <div className="dialog-box">
                {visible && <Dialog title={title} onClose={this.closeDialog}>
                    <p>{message}</p>
                    <DialogActionsBar>
                        {
                            hasSave ? <SaveButton onClick={this.ok} /> : <OKButton onClick={this.ok} />
                        }
                    </DialogActionsBar>
                </Dialog>}
            </div>
        );
    }
}




// WEBPACK FOOTER //
// ./src/modules/shared/components/Notification-dialog/NotificationDialog.tsx