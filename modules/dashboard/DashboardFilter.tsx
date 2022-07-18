import * as React from "react";
import Row from "reactstrap/lib/Row";
import Col from "reactstrap/lib/Col";
import { SearchFilterField } from "src/modules/shared/components/SearchFilterBox";
import { DashboardFilterDetails } from "./types/dto";
import DashboardCabinetList from "./shared/DashboardCabinetList";
import { dashboardService } from "./services/dashboard.service";
import { localise } from "src/modules/shared/services";
import { store } from "src/redux/store";
import { Label } from "reactstrap";
import DashboardSiteList from "./shared/DashboardSiteList";

export interface Props {
    customerId: string;
    onSearchFilterChange: (dashboardFilterDetails: DashboardFilterDetails) => void
}

export interface State {
    selectedSite: string,
    selectedCabinetId: string,
}

class DashboardFilter extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.onSiteFilterChange = this.onSiteFilterChange.bind(this);
        this.onCabinetFilterChange = this.onCabinetFilterChange.bind(this);

        this.state = {
            selectedSite: 'any',
            selectedCabinetId: 'any',
        }
    }

    componentDidMount() {
        let selectedSite = dashboardService.getSelectedSite();

        let selectedCabinetId = dashboardService.getSelectedCabinet();

        this.setState({
            ...this.state,
            selectedSite: selectedSite == undefined ? 'any' : selectedSite,
            selectedCabinetId: selectedCabinetId == undefined ? 'any' : selectedCabinetId
        });
    }

    componentDidUpdate(prevProps: any) {
        const previousCustomerId = prevProps.customerId;
        const customerId = this.props.customerId;

        if (customerId != previousCustomerId) {
            this.setState({
                ...this.state,
                selectedSite: "any",
                selectedCabinetId: "any"
            });
        }

    }
    onSiteFilterChange(selectedSite: any) {
        let site = selectedSite.target.value;
        this.setState({ ...this.state, selectedSite: site, selectedCabinetId: 'any' });
        this.triggerOnFilterChange(this.state.selectedSite, 'any');
    }

    onCabinetFilterChange(selectedCabinet: any) {
        let cabinetId = selectedCabinet.target.value;
        this.setState({ ...this.state, selectedCabinetId: cabinetId });
        this.triggerOnFilterChange(this.state.selectedSite, cabinetId);
    }

    triggerOnFilterChange(site: string, cabinetId: string) {
        let dashboardFilterDetails: DashboardFilterDetails = {
            selectedSite: site,
            selectedCabinetId: cabinetId,
            selectedItemEventsTimeDuration: dashboardService.getItemEventsSelectedTimeDuration(),
            selectedAlarmsTimeDuration: dashboardService.getAlarmsSelectedTimeDuration(),
        }
        this.props.onSearchFilterChange(dashboardFilterDetails);
    }

    render() {
        const { customerId } = this.props;
        const { selectedCabinetId, selectedSite } = this.state;
        const { sitesCount, cabinetCount } = store.getState().dashboard;

        return (
            <Row className="dashboard-filter search-filter-box pt-2 mb-3">
                <Col md={6}>
                    <SearchFilterField titleKey="TEXT_SITE">
                        <DashboardSiteList key={customerId} value={selectedSite} customerId={customerId}
                            onChange={this.onSiteFilterChange} />
                    </SearchFilterField>
                    {
                        sitesCount != undefined &&
                        <Row className="pt-1 pl-2">
                            <Col>
                                <Label className={`mb-0 ${sitesCount ? "message-black" : "message-red"}`}>
                                    {
                                        sitesCount == 0 ? localise("ERROR_SITE_FILTER") :
                                            (selectedSite != 'any' || sitesCount == 1) ? `1 ${localise('REMARK_SITE_FILTER_SINGLE')}` :
                                                `${sitesCount} ${localise('REMARK_SITE_FILTER_MULTIPLE')}`
                                    }
                                </Label>
                            </Col>
                        </Row>
                    }
                </Col>
                <Col md={6}>
                    <SearchFilterField titleKey="TEXT_CABINET">
                        <DashboardCabinetList key={customerId} site={selectedSite} value={selectedCabinetId} customerId={customerId}
                            onChange={this.onCabinetFilterChange} />
                    </SearchFilterField>
                    {
                        cabinetCount != undefined &&
                        <Row className="pt-1 pl-2">
                            <Col>
                                <Label className={`mb-0 ${cabinetCount ? "message-black" : "message-red"}`}>
                                    {
                                        cabinetCount == 0 ? localise("ERROR_CABINET_FILTER") :
                                            (selectedCabinetId != 'any' || cabinetCount == 1) ? `1 ${localise('REMARK_CABINET_FILTER_SINGLE')}` :
                                                `${cabinetCount} ${localise('REMARK_CABINET_FILTER_MULTIPLE')}`
                                    }
                                </Label>
                            </Col>
                        </Row>
                    }
                </Col>
            </Row>
        );
    }
}

export default DashboardFilter


// WEBPACK FOOTER //
// ./src/modules/dashboard/DashboardFilter.tsx