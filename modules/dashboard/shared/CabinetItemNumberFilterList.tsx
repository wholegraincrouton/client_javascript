import * as React from "react";
import { Input } from "reactstrap";
import { localise } from "src/modules/shared/services";
import { StoreState } from "src/redux/store";
import { dashBoardActions } from "../actions/dashboard-actions";
import { connect } from "react-redux";
import { CabinetBasicDetails } from "src/modules/cabinet/types/dto";

interface ItemProps {
    name?: string;
    customerId: string;
    onChange?: (event?: any) => void;
    cabinetId: string;
    value: Number;
    anyAllowed: boolean;
    cabinets: CabinetBasicDetails[];
    loadCabinets: (customerId: string) => void;
    disable: boolean;
}

class CabinetItemNumberFilterList extends React.Component<ItemProps> {

    constructor(props: ItemProps) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event: any) {
        this.props.onChange && this.props.onChange(event);
    }

    componentDidMount() {
        this.props.customerId && this.props.loadCabinets(this.props.customerId);
    }

    render() {
        const { value, cabinets, cabinetId, disable, anyAllowed: anyNotAllowed, name } = this.props;

        const selectedCabinet = cabinets.find(cabinet => cabinet.id == cabinetId);

        const selectedItemList = selectedCabinet && selectedCabinet.items;

        const selectedItem = selectedItemList && value != -1 && selectedItemList.find(item => item.number == value);

        return (
            <Input disabled={disable} type="select" value={selectedItem && selectedItem.number || (value == -1 && value.toString()) || ''} name={name || "cabinetItemNumber"}
                onChange={this.handleChange} >
                {anyNotAllowed && <option value="-1" > {localise("TEXT_ANY")} </option>}
                <option value="" className="d-none"></option>
                {selectedItemList && selectedItemList.map((l, key) => <option value={l.number} key={key}>{l.number}</option>)}
            </Input>
        )
    }
}

const mapStateToProps = (store: StoreState) => {
    const { cabinets } = store.dashboard;
    return {
        cabinets
    };
}

const mapDispatchToProps = (dispatch: any) => {

    return {
        loadCabinets: (customerId: string) => dispatch(dashBoardActions.loadCabinets(customerId))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CabinetItemNumberFilterList);





// WEBPACK FOOTER //
// ./src/modules/dashboard/shared/CabinetItemNumberFilterList.tsx