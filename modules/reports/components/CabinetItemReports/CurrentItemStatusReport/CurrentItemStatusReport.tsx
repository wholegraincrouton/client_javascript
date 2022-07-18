import * as React from "react";
import { Row, Col, CardBody, Card, Button } from "reactstrap";
import CurrentItemStatusReportFilter from "./CurrentItemStatusReportFilter";
import { ColumnOption, CurrentItemStatus } from "../../../../reports/types/dto";
import { CurrentItemStatusReportGrid } from "./CurrentItemStatusReportGrid";
import { dashboardService } from "../../../../dashboard/services/dashboard.service";
import { History } from 'history';
import { cabinetService } from "src/modules/cabinet/services/cabinet.service";
import { CabinetBasicDetails } from "src/modules/cabinet/types/dto";
import { userService } from "src/modules/users/services/user.service";
import { BasicUser } from "src/modules/shared/types/dto";
import { reportService } from "../../../services/report.service";
import { contextService, localise } from "src/modules/shared/services";
import { CurrentItemStatusFilters } from "src/modules/reports/types/dto";
import { CustomColumnMappingsDialog } from "src/modules/shared/components/CustomColumnMappingsDialog/CustomColumnMappingsDialog";
import { columnConfigurationService } from "src/modules/shared/services/column-configuration.service";
import { ColumnOptionsToggle } from "src/modules/shared/components/CustomColumnMappingsDialog/ToggleColumnOptions";

interface Props {
    history: History;
}

interface State {
    currentItemStatusList: CurrentItemStatus[],
    continuationToken?: string;
    hasMore: boolean;
    filters: CurrentItemStatusFilters;
    isSearchInvoked: boolean;
    showManageColumns: boolean;
    columnOptions: ColumnOption[];
    exportColumns: string[];
}

const reportName = "TEXT_CURRENT_ITEM_STATUS";


export class CurrentItemStatusReport extends React.Component<Props, State> {
    columns: string[] = ["TEXT_ITEM_NO", "TEXT_ITEM_NAME", "TEXT_STATUS", "TEXT_LAST_ACTIVITY", "TEXT_MULTICUSTODY", "TEXT_SITE_NAME", "TEXT_CABINET_NAME", "TEXT_CABINET_ADDRESS",
        "TEXT_USER_NAME", "TEXT_JOB_TITLE", "TEXT_RETRIEVAL_TIME", "TEXT_OVERDUE_ELAPSED_TIME"];

    constructor(props: Props) {
        super(props);
        this.performSearch = this.performSearch.bind(this);
        this.onScrollEnd = this.onScrollEnd.bind(this);
        this.onShowMoreClick = this.onShowMoreClick.bind(this);
        this.manageColumns = this.manageColumns.bind(this);
        this.onColumnChanges = this.onColumnChanges.bind(this);
        this.setColumnsByArray = this.setColumnsByArray.bind(this);

        let tempColumnData: ColumnOption[] = [];
        this.columns.forEach(column => {
            let data: ColumnOption = {
                isHidden: false,
                columnName: column
            }
            tempColumnData.push(data);
        });

        this.state = {
            currentItemStatusList: [],
            hasMore: false,
            filters: {
                selectedSite: '', cabinetId: '', itemNumber: -1,
                itemName: 'any', itemStatus: 'any', userId: 'any', jobTitle: ''
            },
            isSearchInvoked: false,
            showManageColumns: false,
            columnOptions: tempColumnData,
            exportColumns: this.columns
        }
    }

    componentDidMount() {
        let selectedSite = dashboardService.getSelectedSite();
        let selectedCabinetId = dashboardService.getSelectedCabinet();

        this.performSearch(selectedSite, selectedCabinetId, -1,
            'any', 'any', 'any', '');

        columnConfigurationService.getColumnsByReportName(reportName)
            .then((result) => {
                if (result && result.length > 0)
                    this.setColumnsByArray(result);
            });
    }

    performSearch(selectedSite: string, cabinetId: string, itemNumber: Number,
        itemName: string, itemStatus: string, userId: string, jobTitle: string, isShowMore: boolean = false) {
        const { continuationToken } = this.state;
        const customerId = contextService.getCurrentCustomerId();

        reportService.getCurrentItemStatusList(customerId, selectedSite, cabinetId,
            itemNumber, itemName, itemStatus, userId, jobTitle, isShowMore ? continuationToken : undefined, 10)
            .then((response: any) => {
                cabinetService.getCabinets(customerId)
                    .then((cabinets: CabinetBasicDetails[]) => {
                        userService.getUsers(customerId)
                            .then((users: BasicUser[]) => {
                                response.results.forEach((i: any) => {
                                    let cabinet = cabinets.find(c => c.id == i.cabinetId);

                                    if (cabinet) {
                                        i.cabinetName = cabinet.name;
                                        i.cabinetAddress = (cabinet.cabinetLocation && cabinet.cabinetLocation.address) || '';

                                        let item = cabinet.items && cabinet.items.find(it => it.number == i.itemNumber);

                                        if (item) {
                                            i.itemName = item.name || i.itemName;
                                        }
                                    }

                                    if (i.userId) {
                                        let user = users.find(u => u.id == i.userId);

                                        if (user) {
                                            i.userName = user.name || i.userName;
                                            i.jobTitle = user.designation || i.jobTitle;
                                        }
                                    }
                                });

                                this.setState({
                                    ...this.state,
                                    currentItemStatusList: isShowMore ?
                                        [...this.state.currentItemStatusList, ...response.results] : response.results,
                                    continuationToken: response.continuationToken,
                                    hasMore: response.continuationToken != null,
                                    filters: {
                                        selectedSite, cabinetId, itemNumber,
                                        itemName, itemStatus, userId, jobTitle,
                                    },
                                    isSearchInvoked: false
                                });
                            });
                    });
            });
    }

    onScrollEnd() {
        const { selectedSite, cabinetId, itemNumber,
            itemName, itemStatus, userId, jobTitle } = this.state.filters;

        if (this.state.hasMore && !this.state.isSearchInvoked) {
            this.performSearch(selectedSite, cabinetId, itemNumber,
                itemName, itemStatus, userId, jobTitle, true);

            this.setState({ ...this.state, isSearchInvoked: true });
        }
    }

    onShowMoreClick() {
        const { selectedSite, cabinetId, itemNumber,
            itemName, itemStatus, userId, jobTitle } = this.state.filters;

        this.performSearch(selectedSite, cabinetId, itemNumber,
            itemName, itemStatus, userId, jobTitle, true);
    }

    manageColumns() {
        const { showManageColumns } = this.state;
        this.setState({ ...this.state, showManageColumns: !showManageColumns })
    }

    onColumnChanges(value: any) {
        this.setColumnsByArray(value);
    }

    isColumnVisible(columnName: string) {
        const { exportColumns } = this.state;
        return exportColumns.some(s => s == columnName);
    }

    setColumnsByArray(columns: string[]) {
        let options: ColumnOption[] = this.state.columnOptions;
        let selectedColumnsArray: string[] = [];

        if (columns && columns.length > 0) {
            options.forEach(column => column.isHidden = !columns.some(val => val == column.columnName));
        }
        selectedColumnsArray = options.filter(data => !data.isHidden).map(c => c.columnName);

        this.setState({ ...this.state, exportColumns: selectedColumnsArray, columnOptions: options, showManageColumns: false });
    }

    render() {
        const { currentItemStatusList, hasMore, showManageColumns, exportColumns } = this.state;
        const customerId = contextService.getCurrentCustomerId();

        return (
            <div className="report current-item-status-report">
                <Card>
                    <CardBody>
                        <CurrentItemStatusReportFilter customerId={customerId} history={this.props.history} performSearch={this.performSearch} selectedColumns={exportColumns} />
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        {
                            !showManageColumns &&
                            <Row>
                                <Col><ColumnOptionsToggle toggleColumnOptions={this.manageColumns} /></Col>
                            </Row>
                        }
                        {
                            showManageColumns &&
                            <CustomColumnMappingsDialog titleKey={reportName} columns={this.columns} selectedColumns={exportColumns} onColumnChanges={this.onColumnChanges} closeDialog={this.manageColumns}></CustomColumnMappingsDialog>
                        }

                        <Row>
                            <Col>
                                <CurrentItemStatusReportGrid currentItemStatusList={currentItemStatusList} onScrollEnd={this.onScrollEnd} selectedColumns={exportColumns} />
                            </Col>
                        </Row>
                        {
                            hasMore &&
                            <Row>
                                <Col>
                                    <Button color="link" className="show-more" onClick={this.onShowMoreClick}>
                                        {localise("BUTTON_SHOW_MORE")}
                                    </Button>
                                </Col>
                            </Row>
                        }
                    </CardBody>
                </Card>
            </div>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/reports/components/CabinetItemReports/CurrentItemStatusReport/CurrentItemStatusReport.tsx