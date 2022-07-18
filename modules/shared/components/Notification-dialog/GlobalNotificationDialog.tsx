import { connect } from 'react-redux';
import { StoreState } from "src/redux/store"
import NotificationDialog from "./NotificationDialog";
import { notificationDialogService } from '../../services';

const mapStateToProps = (state: StoreState) => {
    return {
        visible: state.notificationDialog.visible,
        message: state.notificationDialog.message,
        title: state.notificationDialog.title,
        hasSave: state.notificationDialog.hasSave,
        okClick: notificationDialogService.dialogOK,
        close: notificationDialogService.hideDialog
    }
};

const GlobalNotificationDialog = connect(mapStateToProps)(NotificationDialog);
export default GlobalNotificationDialog;





// WEBPACK FOOTER //
// ./src/modules/shared/components/Notification-dialog/GlobalNotificationDialog.tsx