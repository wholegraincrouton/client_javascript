import { connect } from 'react-redux';
import { StoreState } from "src/redux/store"
import ConfirmDialog from "./ConfirmDialog";
import { confirmDialogService } from '../../services';

const mapStateToProps = (state: StoreState) => {
    return {
        visible: state.confirmDialog.visible,
        message: state.confirmDialog.message,
        title: state.confirmDialog.title,
        yesClick: confirmDialogService.dialogYes,
        noClick: confirmDialogService.dialogNo,
        close: confirmDialogService.hideDialog
    }
};

const GlobalConfirmDialog = connect(mapStateToProps)(ConfirmDialog);
export default GlobalConfirmDialog;





// WEBPACK FOOTER //
// ./src/modules/shared/components/ConfirmDialog/GlobalConfirmDialog.tsx