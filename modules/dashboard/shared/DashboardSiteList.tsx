import * as React from "react";
import { Input } from "reactstrap";
import { StoreState } from "src/redux/store";
import { dashBoardActions } from "../actions/dashboard-actions";
import { connect } from "react-redux";
import { ListItem } from "src/modules/shared/types/dto";
import { localise } from "src/modules/shared/services";

interface SiteProps {
    customerId: string;
    onChange?: (event?: any) => void;
    value?: string;
    sites?: ListItem[],
    loadSites: (customerId: string) => void;
    updateCabinetSummary:(site : string) =>void;
}

class DashboardSiteList extends React.Component<SiteProps> {

    constructor(props: SiteProps) {
        super(props);      

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event: any) {
        this.props.onChange && this.props.onChange(event);
        this.props.updateCabinetSummary(event.target.value);
    }

    componentDidMount() {
        this.props.customerId && this.props.loadSites(this.props.customerId);
    }
 
    render() {
        const { sites, value } = this.props;

        const selectedItem = sites && sites.find(item => item.id == value);

        return (
            <Input type="select" value={selectedItem && selectedItem.id || (value == "any" && value) || ''} name="sites"
                onChange={this.handleChange} >
                {<option value="any"> {localise("TEXT_ANY_SITE")} </option>}
                <option value="" className="d-none"></option>
                {sites &&  sites.map((l, key) => <option value={l.id} key={key}>{l.name}</option>)}
            </Input>
        )
    }
}

const mapStateToProps = (store: StoreState) => {
    const { sites } = store.dashboard;
    return {
        sites
    };
}

const mapDispatchToProps = (dispatch: any) => {

    return {
        loadSites: (customerId : string) => dispatch(dashBoardActions.loadSites(customerId)),
        updateCabinetSummary: (site : string) => dispatch(dashBoardActions.updateCabinetSummaryBySite(site)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardSiteList); 





// WEBPACK FOOTER //
// ./src/modules/dashboard/shared/DashboardSiteList.tsx