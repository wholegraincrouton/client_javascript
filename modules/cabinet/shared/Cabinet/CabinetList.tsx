import * as React from "react";
import { Input } from "reactstrap";
import { cabinetService } from "../../services/cabinet.service";
import { localise } from "src/modules/shared/services";
import { CabinetBasicDetails } from "../../types/dto";

interface CabinetProps {
    customerId: string;
    cabinetGroupId?: string;
    onChange?: (event: any) => void;
    name?: string;
    value?: string;
    disabled?: boolean;
    allowAny?: boolean;
    textAny?: string;
    includeDeletedData?: boolean;
    site?: string;
}

interface State {
    list: CabinetBasicDetails[];
}

export default class CabinetList extends React.Component<CabinetProps, State> {
    constructor(props: CabinetProps) {
        super(props);
        this.handleChange = this.handleChange.bind(this);

        this.state = { list: [] };
    }

    handleChange(event: any) {
        this.props.onChange && this.props.onChange(event);
    }

    componentDidMount() {
        var scope = this;

        if (this.props.customerId && this.props.customerId != "*") {
            cabinetService.getCabinets(this.props.customerId, this.props.includeDeletedData).then((cabinets) => {
                scope.setState({ list: cabinets });
            });
        }        
    }

    render() {
        const { name, disabled, value, allowAny, cabinetGroupId, site } = this.props;

        let filteredList: CabinetBasicDetails[] = this.state.list;

        const selectedItem = allowAny && value == 'any' ? { id: 'any' } : this.state.list.find(item => item.id == value);
        if (cabinetGroupId && cabinetGroupId != 'any')
            filteredList = filteredList.filter(c => c.cabinetGroupId == cabinetGroupId); 

        if (site && site != 'any')
            filteredList = filteredList.filter(c => c.site === site);

        return (
            <Input type="select" value={(selectedItem && selectedItem.id) || (allowAny && value == "any" && value) || ''} name={name}
                onChange={this.handleChange} disabled={disabled}>
                <option value="" className="d-none"></option>
                {allowAny && <option value="any">{localise("TEXT_ANY_CABINET")}</option>}
                {filteredList.map((l, key) => <option value={l.id} key={key}>{l.name}</option>)}
            </Input>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/cabinet/shared/Cabinet/CabinetList.tsx