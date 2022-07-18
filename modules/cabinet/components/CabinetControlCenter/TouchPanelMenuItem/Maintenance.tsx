import * as React from "react";
import Row from "reactstrap/lib/Row";
import Button from "reactstrap/lib/Button";
import { connect } from "react-redux";
import { StoreState } from "../../../../../redux/store";
import { cabinetControlCenterActions } from "src/modules/cabinet/actions/cabinet-control-center.actions";
import { TouchScreenMode } from "src/modules/cabinet/types/dto";
import { History } from "history";
import { navService, localise } from "src/modules/shared/services";
import { cabinetPermissionService } from "src/modules/cabinet/components/CabinetControlCenter/shared/cabinet-permission-service";

export interface Props {
  touchScreenMode?: TouchScreenMode;
  loggedInUserAlternateId?: string;
  switchTouchScreenMode: (touchScreenMode: TouchScreenMode, callbackFunction: () => void) => void;
  history: History;
}

export class Maintenance extends React.Component<Props> {

  constructor(props: Props) {
    super(props);
    this.onAlarmManagementClick = this.onAlarmManagementClick.bind(this);
  }

  onAlarmManagementClick() {
    this.props && this.props.switchTouchScreenMode(TouchScreenMode.ALARM_MANAGEMENT, () => this.onDataLoadCallBackFunc());
  }

  onDataLoadCallBackFunc() {
    navService.goBackToListPage("/cabinet/cabinetmanagement", this.props.history);
  }

  render() {
    var loggedInUserAlternateId = this.props.loggedInUserAlternateId;
    return <>
      {
        cabinetPermissionService.canPermissionGrant("DEV_CAB_NAV_ALARM_MENU", loggedInUserAlternateId) &&
        <Row>
          <Button name="btnAlarmManagement" className="menu-button bg-blue border-blue mb-2"
            onClick={this.onAlarmManagementClick} value="AlarmManagement">
            {localise("BUTTON_ALARM_MANAGEMENT_MENU")} </Button>
        </Row>
      }
    </>
  }
}

const mapStateToProps = (store: StoreState) => {
  const { touchScreenMode, loggedInUserAlternateId } = store.cabinetSimulation;
  return { touchScreenMode, loggedInUserAlternateId };
};


const mapDispatchToProps = (dispatch: any) => {
  return {
    switchTouchScreenMode: (touchScreenMode: TouchScreenMode, callbackFunction: () => any) => dispatch(cabinetControlCenterActions.switchTouchScreenMode(touchScreenMode, callbackFunction))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Maintenance)



// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetControlCenter/TouchPanelMenuItem/Maintenance.tsx