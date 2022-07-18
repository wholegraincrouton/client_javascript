import * as React from "react";
import { Input } from "reactstrap";
import { localise } from "src/modules/shared/services";
import { StoreState } from "src/redux/store";
import { dashBoardActions } from "../actions/dashboard-actions";
import { connect } from "react-redux";
import { CabinetBasicDetails } from "src/modules/cabinet/types/dto";

interface ItemProps {
    customerId: string;
    onChange?: (event?: any) => void;
    cabinetId: string;
    value: string;
    cabinets: CabinetBasicDetails[];
    loadCabinets: (customerId: string) => void;
    disable: boolean;
}

class CabinetItemNameFilterList extends React.Component<ItemProps> {

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
        const { value, cabinets, cabinetId, disable } = this.props;

        const selectedCabinet = cabinets.find(cabinet => cabinet.id == cabinetId);

        const selectedItemList = selectedCabinet && selectedCabinet.items;

        const selectedItem = selectedItemList && value != "any" && selectedItemList.find(item => item.name == value);

        return (
            <Input disabled={disable} type="select" value={selectedItem && selectedItem.name || (value == "any" && value) || ''} name="cabinetItemName"
                onChange={this.handleChange} >
                {<option value="any"> {localise("TEXT_ANY")} </option>}
                <option value="" className="d-none"></option>
                {selectedItemList && selectedItemList.map((l, key) => <option value={l.name} key={key}>{l.name}</option>)}
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

export default connect(mapStateToProps, mapDispatchToProps)(CabinetItemNameFilterList);





// WEBPACK FOOTER //
// ./src/modules/dashboard/shared/CabinetItemNameFilterList.tsx