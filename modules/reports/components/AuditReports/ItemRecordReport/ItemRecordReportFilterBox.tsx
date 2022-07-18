import { CabinetBasicDetails } from "src/modules/cabinet/types/dto";
import { ItemRecordReportFilter } from "src/modules/reports/types/dto";
import { SearchFilterBox, SearchFilterBoxProps, SearchFilterField } from "src/modules/shared/components/SearchFilterBox";
import { apiService, contextService } from "src/modules/shared/services";
import { cabinetService } from "src/modules/cabinet/services/cabinet.service";
import { siteService } from "src/modules/sites/services/site.service";
import { Site } from "src/modules/sites/types/dto";
import React from "react";
import { Col, Input, Row } from "reactstrap";
import DashboardSiteList from "src/modules/dashboard/shared/DashboardSiteList";
import DashboardCabinetList from "src/modules/dashboard/shared/DashboardCabinetList";
import CabinetItemNumberFilterList from "src/modules/dashboard/shared/CabinetItemNumberFilterList";
import CabinetItemNameFilterList from "src/modules/dashboard/shared/CabinetItemNameFilterList";
import UserListByRoles from "src/modules/dashboard/shared/UserList";
import { DateTimePicker } from "@progress/kendo-react-dateinputs";
import { dateTimeUtilService } from "src/modules/shared/services/datetime-util.service";
import { DefaultDateTimeFormats } from "src/modules/shared/constants/datetime.constants";
import moment from "moment";
import { ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { alertActions } from "src/modules/shared/actions/alert.actions";
import * as apiConstants from "src/modules/shared/constants/api.constants";

const service = apiConstants.REPORTS;

export class ItemRecordAuditFilterBox extends SearchFilterBox<ItemRecordReportFilter> {

    cabinetList: CabinetBasicDetails[] = [];
    siteList: Site[] = [];
    stringList: string[] = [];
    endTime = new Date();
    startTime = new Date();

    constructor(props: SearchFilterBoxProps) {
        super(props, {
            site: 'any',
            cabinetId: 'any',
            itemNo: -1,
            itemName: "any",
            otherDetails: '',
            actionBy: 'any',
            fromDate: '',
            toDate: '',
            selectedColumns: props.selectedColumns
        });

        this.handleChange = this.handleChange.bind(this);
        this.onSiteFilterChange = this.onSiteFilterChange.bind(this);
        this.onCabinetFilterChange = this.onCabinetFilterChange.bind(this);
        this.onCabinetItemNumberFilterChange = this.onCabinetItemNumberFilterChange.bind(this);
        this.onCabinetItemNameFilterChange = this.onCabinetItemNameFilterChange.bind(this);
        this.onUserFilterChange = this.onUserFilterChange.bind(this);
        this.onExportClick = this.onExportClick.bind(this);
    }

    componentDidMount(): void {
        this.getData();
        super.componentDidMount();
    }

    componentDidUpdate(previousProps: any): void {
        const previousCustomerId = previousProps.customerId;
        const customerId = contextService.getCurrentCustomerId();

        if (previousCustomerId != customerId) {
            this.getData();
        }

        const { selectedColumns } = this.props;
        
        if (selectedColumns != this.state.selectedColumns) {
            this.setState({ ...this.state, selectedColumns: selectedColumns });
        }
    }

    getData() {
        let customerId = contextService.getCurrentCustomerId();
        this.cabinetList = [];

        cabinetService.getCabinets(customerId).then(cabinets => {
            this.cabinetList = cabinets;
        });

        siteService.getSites(customerId).then(sites => {
            this.siteList = sites;
        });
    }

    getFields(): JSX.Element {
        const { site, cabinetId, itemNo, itemName, otherDetails, actionBy, fromDate, toDate, } = this.state;
        const customerId = contextService.getCurrentCustomerId();

        const dateTimeFormat = dateTimeUtilService.getKendoDateTimeFormat();

        return (
            <Row className="filter-fields event-filters">
                <Col md={6} lg={4} xl={3} className={`mt-2 mt-md-0`}>
                    <SearchFilterField titleKey="TEXT_SITE">
                        <DashboardSiteList key={customerId} value={site} customerId={customerId}
                            onChange={this.onSiteFilterChange} />
                    </SearchFilterField>
                </Col>
                <Col md={6} lg={4} xl={3} className={`mt-2 mt-md-0`}>
                    <SearchFilterField titleKey="TEXT_CABINET">
                        <DashboardCabinetList key={customerId} site={site} value={cabinetId} customerId={customerId}
                            onChange={this.onCabinetFilterChange} />
                    </SearchFilterField>
                </Col>
                <Col md={6} lg={4} xl={3} className={`mt-2 mt-md-0`}>
                    <SearchFilterField titleKey="TEXT_ITEM_NO">
                        <CabinetItemNumberFilterList anyAllowed={true} key={customerId} value={itemNo} customerId={customerId} cabinetId={cabinetId}
                            disable={false} onChange={this.onCabinetItemNumberFilterChange} />
                    </SearchFilterField>
                </Col>
                <Col md={6} lg={4} xl={3} className={`mt-2 mt-md-0`}>
                    <SearchFilterField titleKey="TEXT_ITEM_NAME">
                        <CabinetItemNameFilterList key={customerId} value={itemName} customerId={customerId}
                            cabinetId={cabinetId} disable={false} onChange={this.onCabinetItemNameFilterChange} />
                    </SearchFilterField>
                </Col>
                <Col md={6} lg={4} xl={3} className={`mt-2 mt-md-0`}>
                    <SearchFilterField titleKey="TEXT_OTHER_DETAILS">
                        <Input name="otherDetails" value={otherDetails} onChange={this.handleChange} data={this.stringList} />
                    </SearchFilterField>
                </Col>
                <Col md={6} lg={4} xl={3} className={`mt-2 mt-md-0`}>
                    <SearchFilterField titleKey="TEXT_ACTION_BY">
                        <UserListByRoles key={customerId} customerId={customerId} role={'any'}
                            value={actionBy} onChange={this.onUserFilterChange} name="userName" allowAny={true} textAny="TEXT_ANY_USER" />                    </SearchFilterField>
                </Col>
                <Col lg={6} className="date-filter">
                    <SearchFilterField titleKey="TEXT_START_DATETIME">
                        <DateTimePicker name="fromDate" value={new Date(fromDate)} format={dateTimeFormat}
                            onChange={(e: any) => this.onDateChange(e, 'fromDate')} />
                    </SearchFilterField>
                </Col>
                <Col lg={6} className="date-filter">
                    <SearchFilterField titleKey="TEXT_END_DATETIME" >
                        <DateTimePicker name="toDate" value={new Date(toDate)} format={dateTimeFormat}
                            onChange={(e: any) => this.onDateChange(e, 'toDate')} />
                    </SearchFilterField>
                </Col>
            </Row>
        )
    }

    handleChange(event: any): void {
        const { name, value } = event.target;
        this.setState(Object.assign(this.state, { [name]: value }));
    }

    onSiteFilterChange(selectedSite: any) {
        let site = selectedSite.target.value;
        this.setState({ ...this.state, site: site, cabinetId: 'any', itemNo: -1, itemName: 'any' });
    }

    onCabinetFilterChange(selectedCabinet: any) {
        let cabinetId = selectedCabinet.target.value;
        if (cabinetId == 'any') {
            this.setState({ ...this.state, cabinetId: cabinetId, itemNo: -1, itemName: "any" });
        }
        else {
            this.setState({ ...this.state, cabinetId: cabinetId, itemNo: -1, itemName: "any" });
        }
    }

    onCabinetItemNumberFilterChange(selectedCabinetItemNumber: any) {
        let itemNumber = selectedCabinetItemNumber.target.value;
        this.setState({ ...this.state, itemNo: itemNumber });
    }

    onCabinetItemNameFilterChange(selectedCabinetItemName: any) {
        let itemName = selectedCabinetItemName.target.value;
        this.setState({ ...this.state, itemName: itemName });
    }

    onUserFilterChange(selectedUser: any) {
        let user = selectedUser.value;
        this.setState({ ...this.state, actionBy: user });
    }

    onDateChange(event: any, name: string) {
        let time = moment(new Date()).format(DefaultDateTimeFormats.DateTimeFormat);
        if (event.target.value)
            time = moment(event.target.value).format(DefaultDateTimeFormats.DateTimeFormat);
        let e = {
            target: {
                value: time,
                name: name
            }
        }
        this.setState(Object.assign(this.state, { [name]: time }), () => super.handleChange(e));
    }

    getButtons(): JSX.Element[] {
        let buttons: JSX.Element[] = [];
        buttons.push(<ActionButton textKey="BUTTON_EXPORT" color="secondary" icon="fa-download"
            disableDefaultMargin={true} onClick={this.onExportClick} disabled={!this.props.recordsExist} />)
        return buttons;
    }

    onExportClick() {
        apiService.post('reports', 'item-records', this.state, ["export"], null, false, service)
            .then(() => {
                alertActions.showSuccess("TEXT_REPORT_EXPORT_SUCCESS");
            });
    }

    validateCriteria() { return true }
}


// WEBPACK FOOTER //
// ./src/modules/reports/components/AuditReports/ItemRecordReport/ItemRecordReportFilterBox.tsx