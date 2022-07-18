import * as React from "react";
import * as qs from "query-string";
import { History } from 'history';
import { lookupService, contextService } from "src/modules/shared/services";
import "./../device-updates.css";

interface Props {
    history: History;
    cabinetCount: number;
    tooltipText: string;
    getDeviceUpdateStatus: () => void;
}

export class DeviceUpdateStatusIcon extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
        this.onIconClick = this.onIconClick.bind(this);
    }

    componentDidMount() {
        this.props.getDeviceUpdateStatus();
    }

    onIconClick() {
        const { history } = this.props;
        const customerId = contextService.getCurrentCustomerId();

        history.push({
            pathname: "/cabinet/deviceupdatemanagement/new",
            search: qs.stringify({
                ['contextCustomerId']: customerId
            })
        });
    }

    getManifestList(manifestList: string[]) {
        let list = lookupService.getList("LIST_DEVICE_UPDATE_MANIFEST_TYPES");
        let manifestTextList: string[] = [];

        manifestList.forEach(m => {
            let item = list.find(l => l.value == m);
            if (item) {
                manifestTextList.push(item.text || '');
            }
        });

        return manifestTextList.join(", ");
    }

    render() {
        const { cabinetCount, tooltipText } = this.props;
        const allowNavigate = cabinetCount > 0;

        return (
            <div className="device-update-status-icon">
                <i className={"ty ty-ic_cabinet" + (allowNavigate ? " active-icon" : "")} aria-hidden="true" title={tooltipText}
                    onClick={allowNavigate ? this.onIconClick : () => { return; }} />
            </div>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/deviceUpdates/components/DeviceUpdateStatusIcon/DeviceUpdateStatusIcon.tsx