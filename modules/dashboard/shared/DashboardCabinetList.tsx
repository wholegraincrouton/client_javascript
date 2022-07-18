import * as React from "react";
import { Input } from "reactstrap";
import { StoreState } from "src/redux/store";
import { dashBoardActions } from "../actions/dashboard-actions";
import { connect } from "react-redux";
import { CabinetBasicDetails } from "src/modules/cabinet/types/dto";
import { localise } from "src/modules/shared/services";

interface CabinetProps {
    customerId: string;
    site: string;
    onChange?: (event?: any) => void;
    value?: string;
    cabinets: CabinetBasicDetails[];
    loadCabinets: (customerId: string) => void;
    updateCabinetSummary: (site: string, cabinetId: string) => void;
    hideAny?: boolean;
}

class DashboardCabinetList extends React.Component<CabinetProps> {

    constructor(props: CabinetProps) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event: any) {
        this.props.onChange && this.props.onChange(event);
        this.props.updateCabinetSummary(this.props.site, event.target.value);
    }

    componentDidMount() {
        this.props.customerId && this.props.loadCabinets(this.props.customerId);
    }

    render() {
        const { cabinets, value, site, hideAny } = this.props;

        const selectedItem = cabinets && cabinets.find(item => item.id == value);

        let filteredList: CabinetBasicDetails[] = cabinets;

        if (site && site != 'any')
            filteredList = filteredList.filter(c => c.site == site);
        
        return (
            <Input type="select" value={selectedItem && selectedItem.id || (value == "any" && value) || ''} name="cabinet"
                onChange={this.handleChange} >
                {(hideAny ==  undefined || !hideAny) && <option value="any"> {localise("TEXT_ANY_CABINET")} </option>}
                <option value="" className="d-none"></option>
                {filteredList.map((l, key) => <option value={l.id} key={key}>{l.name}</option>)}
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
        loadCabinets: (customerId: string) => dispatch(dashBoardActions.loadCabinets(customerId)),
        updateCabinetSummary: (site: string, cabinetId: string) => dispatch(dashBoardActions.updateCabinetSummaryByCabinet(site, cabinetId)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardCabinetList);





// WEBPACK FOOTER //
// ./src/modules/dashboard/shared/DashboardCabinetList.tsx