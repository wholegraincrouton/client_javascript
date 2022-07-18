import { store } from "src/redux/store";
import { VirtualCabinetAccessDefinitionSnapshot, CabinetSimulationState } from "src/modules/cabinet/types/store";

let userClaimList: string[] = [];

export const cabinetPermissionService =
{
    canPermissionGrant,
    clearPermissions,
    canMultiCustodyWitnessLogin,
    canLoginToVirtualCabinet,
    canEnrolCardAtCabinet
}

function clearPermissions() {
    userClaimList = [];
}

function canPermissionGrant(permission: string, alternateUserId?: string) {

    if (userClaimList.length == 0) {
        userClaimList = getUserClaimList(alternateUserId);
    }

    var canAccess = userClaimList.indexOf(permission) > -1
    return canAccess;
}

function canLoginToVirtualCabinet(alternateUserId?: string) {

    var canLogin = false;

    var cabinetSimulationState: CabinetSimulationState = store.getState().cabinetSimulation;

    var configurations = cabinetSimulationState.cabinetConfigurations;
    var authMethod = configurations && configurations.find(c => c.key == "AUTH_METHOD");

    if (authMethod && (authMethod.value == "ANY" || authMethod.value == "PIN")) {
        canLogin = canPermissionGrant("DEV_CAB_LOGIN", alternateUserId);
    }
    else if (authMethod && authMethod.value == "CARD") {
        canLogin = canPermissionGrant("DEV_CAB_LOGIN", alternateUserId) && canPermissionGrant("DEV_CAB_SUPER_ACCESS", alternateUserId);
    }

    return canLogin;
}

function canEnrolCardAtCabinet(alternateUserId?: string) {
    let accessDefinitions: VirtualCabinetAccessDefinitionSnapshot = store.getState().cabinetSimulation.accessDefinitionSnapshot;

    let user = accessDefinitions.users.find(u => u.userId == alternateUserId);

    let canEnrol = user && user.enrolCardAtCabinet;

    return canEnrol;
}

function canMultiCustodyWitnessLogin(alternateUserId?: string) {
    // This is not to override the loggedin users claimlist since it is frequently needed.
    let witnessUserClaimList = getUserClaimList(alternateUserId);
    var canAccess = witnessUserClaimList.indexOf("DEV_CAB_MULTI_CUSTODY_WITNESS") > -1
    return canAccess;
}

function getUserClaimList(alternateUserId?: string) {

    var claimList: string[] = [];

    var claims: VirtualCabinetAccessDefinitionSnapshot = store.getState().cabinetSimulation.accessDefinitionSnapshot;

    var user = claims && claims.users.find(function (virtualCabinetUser) {
        return virtualCabinetUser.userId == alternateUserId;
    });

    if (user != null) {
        user.claimConstraintIds && user.claimConstraintIds.forEach((userClaimId: string) => {
            var claimConstraint = claims.claimConstraints.find(function (claimConstraint) {
                return claimConstraint.id == userClaimId;
            });
            if (claimConstraint != undefined) {
                claimList = claimList.concat(claimConstraint && claimConstraint.claimList);
            }
        });
    }
    return claimList.filter(function (value: string, index: number, self: any) {
        return self.indexOf(value) === index;
    });
}







// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetControlCenter/shared/cabinet-permission-service.ts