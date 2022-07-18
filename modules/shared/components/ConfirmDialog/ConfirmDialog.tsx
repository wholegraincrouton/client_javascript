import * as React from 'react';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { YesButton, NoButton } from '../ActionButtons/ActionButtons';

export interface ConfirmDialogProps {
    visible?: boolean;
    title?: string;
    message?: string;
    yesClick: () => void;
    noClick: () => void;
    close: () => void;
}

export default class ConfirmDialog extends React.Component<ConfirmDialogProps> {
    constructor(props: ConfirmDialogProps) {
        super(props);

        this.closeDialog = this.closeDialog.bind(this);
        this.yes = this.yes.bind(this);
        this.no = this.no.bind(this);
    }

    closeDialog() {
        this.props.close();
    }

    yes() {
        this.props.yesClick();
        this.props.close();
    }

    no() {
        this.props.noClick();
        this.props.close();
    }

    render() {
        const { visible, title, message } = this.props;
        return (
            <div className="dialog-box">
                {visible && <Dialog title={title} onClose={this.closeDialog}>  
                    <p>{message}</p>
                    <DialogActionsBar>
                        <YesButton onClick={this.yes} />
                        <NoButton  onClick={this.no} />
                    </DialogActionsBar>
                </Dialog>}
            </div>
        );
    }
}




// WEBPACK FOOTER //
// ./src/modules/shared/components/ConfirmDialog/ConfirmDialog.tsx