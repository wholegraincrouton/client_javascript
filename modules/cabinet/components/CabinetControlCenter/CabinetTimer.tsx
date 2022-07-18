import * as React from "react";
import { StoreState } from "src/redux/store";
import { connect } from "react-redux";
export interface Props {
    cabinetTimerTimeInSeconds?: number;
}

class CabinetTimer extends React.Component<Props> {

    constructor(props: Props) {
        super(props);
    }

    render() {
        var timeInSeconds = this.props.cabinetTimerTimeInSeconds != undefined ? this.props.cabinetTimerTimeInSeconds : 0;
        var minutes = Math.floor(timeInSeconds / 60);
        var seconds = timeInSeconds - (minutes * 60);
        var minFormat = (minutes < 10 ? '0' : '') + minutes;
        var secFormat = (seconds < 10 ? '0' : '') + seconds;
        return (
            <div className="vc-timer-block">
                <img className="header-icon" src="/images/svg/virtual-cabinet/vc-timer.svg" alt="" />
                <h4>
                    {minFormat}:{secFormat}
                </h4>
            </div>
        );
    }
}

const mapStateToProps = (store: StoreState) => {
    const { cabinetTimerTimeInSeconds } = store.cabinetSimulation
    return { cabinetTimerTimeInSeconds };
}

export default connect(mapStateToProps)(CabinetTimer)





// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetControlCenter/CabinetTimer.tsx