import { withRouter } from 'react-router-dom'
import * as React from 'react';
import { ActionButton } from '../../../shared/components/ActionButtons/ActionButtons';
import { permissionService } from '../../../shared/services';

interface Props {
    isProvisioned: boolean;
    isVirtualCabinet: boolean;
    history: any;
    location: any;
    match: any;
}

export const CabinetControlCenterButton = withRouter<Props>(({ history, match, location, isProvisioned, isVirtualCabinet }) => {
    let linkedRealCabinet = isProvisioned && !isVirtualCabinet;
    const virtualCabinetAllowed = permissionService.isActionPermittedForCustomer("CONNECT", undefined, "VIRTUALCABINET");
    const mirrorModeAllowed = permissionService.isActionPermittedForCustomer("MIRROR");


    return <>
        {linkedRealCabinet && <ActionButton onClick={() => {
            history.push('/cabinet/cabinetmanagement/' + match.params.id + '/controlCenter' + location.search);
        }}
            isPermissionAllowed={mirrorModeAllowed} textKey="BUTTON_CONNECT" color="secondary" icon="fa-mobile-alt"
        />}

        {!linkedRealCabinet && <ActionButton onClick={() => {
            history.push('/cabinet/cabinetmanagement/' + match.params.id + '/controlCenter' + location.search);
        }}
            isPermissionAllowed={virtualCabinetAllowed} textKey="BUTTON_VIRTUAL_CABINET" color="secondary" icon="fa-mobile-alt"
        />}
    </>
})


// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetControlCenter/CabinetControlCenterButton.tsx