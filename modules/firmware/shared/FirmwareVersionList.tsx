import * as React from "react";
import { Input } from "reactstrap";
import { localise } from "src/modules/shared/services";
import { Firmware } from "../types/dto";
import { VirtualCabinetConstatnts } from "src/modules/cabinet/types/dto";
import { firmwareService } from "../services/firmware.service";

interface FirmwareVersionProps {
    name: string;
    value: string;
    onChange: (event: any) => void;
    disabled?: boolean;
    allowAny?: boolean;
    allowVC?: boolean;
    textAny?: string;
    filterActive?: boolean;
}

interface State {
    list: Firmware[];
}

export default class FirmwareVersionList extends React.Component<FirmwareVersionProps, State> {
    constructor(props: FirmwareVersionProps) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.state = { list: [] };
    }

    handleChange(event: any) {
        this.props.onChange(event);
    }

    componentDidMount() {
        firmwareService.getFirmwareList(this.props.filterActive || false)
            .then((firmware) => {
                this.setState({
                    ...this.state,
                    list: firmware
                });
            });
    }

    render() {
        const { name, disabled, value, allowAny, allowVC } = this.props;
        const { list } = this.state;

        return (
            <div className="firmwareVersionList">
                <Input type="select" value={value} name={name}
                    onChange={this.handleChange} disabled={disabled}>
                    <option value="" className="d-none"></option>
                    {allowAny && <option value="any">{localise("TEXT_ANY")}</option>}
                    {allowVC && <option value={VirtualCabinetConstatnts.VcFirmwareVersion}>{localise("TEXT_VIRTUAL_CABINET")}</option>}
                    {list.map(f => <option key={f.version} value={f.version}>{f.version}</option>)}
                </Input>
            </div>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/firmware/shared/FirmwareVersionList.tsx