import * as React from "react";
import { Input } from "reactstrap";
import { siteService } from "../services/site.service";
import { Site } from "../types/dto";
import { localise } from "src/modules/shared/services";

interface SiteProps {
    customerId: string;
    onChange?: (event?: any) => void;
    name?: string;
    value?: string;
    disabled?: boolean;
    allowAny?: boolean;
}

interface State {
    list: Site[];
}

export default class SiteList extends React.Component<SiteProps, State> {
    constructor(props: SiteProps) {
        super(props);
        this.handleSiteChange = this.handleSiteChange.bind(this);

        this.state = { list: [] };
    }

    handleSiteChange(event: any) {
        this.props.onChange && this.props.onChange(event);
    }

    componentDidMount() {
        this.loadData();        
    }

    loadData() {
        var scope = this;

        if (this.props.customerId && this.props.customerId != "*") {
            siteService.getSites(this.props.customerId).then((sites) => {
                scope.setState({ list: sites });
            });
        }
    }

    render() {
        
        const { allowAny, name, disabled, value } = this.props;
        const selectedSite = this.state.list.find(site => site.id == value);
        
        return (
            <Input type="select" value={(selectedSite && selectedSite.id) || (allowAny && value == "any" && value) || ''} name={name}
                onChange={this.handleSiteChange} disabled={disabled}>
                <option value="" className="d-none"></option>
                {allowAny && <option value="any"> {localise("TEXT_ANY_SITE")} </option>}
                {this.state.list.map((l, key) => <option value={l.id} key={key}>{l.name}</option>)}
            </Input>
        )
    }
}



// WEBPACK FOOTER //
// ./src/modules/sites/shared/SiteList.tsx