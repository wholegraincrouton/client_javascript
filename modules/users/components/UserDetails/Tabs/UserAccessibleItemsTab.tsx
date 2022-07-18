import * as React from "react";
import { connect } from "react-redux";
import { Row, Col, Card, CardBody } from "reactstrap";
import { Grid, GridCellProps, GridColumn, GridSortChangeEvent } from "@progress/kendo-react-grid";
import { orderBy, SortDescriptor } from "@progress/kendo-data-query";
import { StoreState } from "src/redux/store";
import { localise, lookupService } from "src/modules/shared/services";
import { dateTimeUtilService } from "src/modules/shared/services/datetime-util.service";
import { DateTimeFormatCell } from "src/modules/shared/components/DataGrid";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { userService } from "src/modules/users/services/user.service";
import { AccessibleItem } from "src/modules/users/types/dto";
import { permissionService } from '../../../../shared/services/permission.service';

interface Props {
    customerId: string;
}

interface State {
    sort: SortDescriptor[];
    accessibleItems: AccessibleItem[];
}

export class UserAccessibleItemsTab extends React.Component<DetailFormProps & Props, State> {
    constructor(props: DetailFormProps & Props) {
        super(props);
        this.onSortChange = this.onSortChange.bind(this);

        this.state = {
            accessibleItems: [],
            sort: [],
        }
    }

    componentDidMount() {
        const { customerId } = this.props;
        this.getAccessibleItemsForCustomer(customerId);
    }

    componentDidUpdate(previousProps: any) {
        const previousCustomerId = previousProps.customerId;
        const customerId = this.props.customerId;

        if (customerId != previousCustomerId) {
            this.getAccessibleItemsForCustomer(customerId);
        }
    }

    getAccessibleItemsForCustomer(customerId: string) {
        const { item } = this.props;

        if (customerId) {
            userService.getAccessibleItems(customerId, item.id).then((items) => {
                this.setState({
                    accessibleItems: items
                });
            });
        }
    }

    onRowRender(tr: any, props: any) {
        return React.cloneElement(tr, {
            ...tr.props,
            className: tr.props.className + ' non-selectable-row'
        }, tr.props.children);
    }

    onSortChange(event: GridSortChangeEvent) {
        this.setState({ ...this.state, sort: event.sort })
    }

    render() {
        const { item } = this.props;
        const { sort, accessibleItems } = this.state;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');

        return (
            <>
                <Row className="mb-2">
                    <Col xs="auto">
                        <small className="text-muted">{localise("REMARK_ACCESSIBLE_ITEMS")}</small>
                    </Col>
                </Row>
                {
                    accessibleItems.length > 0 ?
                        <Row>
                            <Col>
                                <div className="largeScreen">
                                    <Grid data={orderBy(accessibleItems, sort)}
                                        rowRender={this.onRowRender}
                                        sort={sort}
                                        sortable={{ allowUnsort: true, mode: 'single' }}
                                        onSortChange={this.onSortChange}
                                        className={!isPermittedToEdit ? "disabled-grid" : ""}>
                                        <GridColumn field="itemNumber" title={localise('TEXT_ITEM_NUMBER')} className="color-blue" width={100} />
                                        <GridColumn field="cabinetName" title={localise('TEXT_CABINET_NAME')} className="color-blue" />
                                        <GridColumn field="accessGroupName" title={localise('TEXT_ACCESS_GROUP')} />
                                        <GridColumn field="accessStartsOn" title={localise('TEXT_ACCESS_START')}
                                            cell={DateTimeFormatCell(undefined, true, undefined, undefined, localise('TEXT_UNLIMITED'))} />
                                        <GridColumn field="accessEndsOn" title={localise('TEXT_ACCESS_END')}
                                            cell={DateTimeFormatCell(undefined, true, undefined, undefined, localise('TEXT_UNLIMITED'))} />
                                        <GridColumn sortable={false} field="scheduleList" title={localise('TEXT_DAYS')}
                                            cell={ScheduleDaysTextCell()} headerClassName="non-clickable" />
                                        <GridColumn sortable={false} title={localise('TEXT_TIME')}
                                            cell={ScheduleTimeTextCell()} headerClassName="non-clickable" />
                                    </Grid>
                                </div>
                                <div className="smallScreen accessible-items-grid">
                                    <Grid data={orderBy(accessibleItems, sort)}
                                        rowRender={this.onRowRender}
                                        sort={sort}
                                        sortable={{ allowUnsort: true, mode: 'single' }}
                                        onSortChange={this.onSortChange}
                                        className={!isPermittedToEdit ? "disabled-grid" : ""}>
                                        <GridColumn field="itemNumber" title={localise('TEXT_ITEM_NUMBER')} className="color-blue" width={100} />
                                        <GridColumn field="cabinetName" title={localise('TEXT_CABINET_NAME')} className="color-blue" />
                                    </Grid>
                                </div>

                            </Col>
                        </Row>
                        :
                        <Card>
                            <CardBody>
                                <Row className="text-muted text-center">
                                    <Col>
                                        <span>{localise("ERROR_SEARCH_RESULT")}</span>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                }
            </>
        );
    }
}

const mapStateToProps = (store: StoreState) => {
    return { customerId: store.customer };
};

export default connect(mapStateToProps)(UserAccessibleItemsTab);

const ScheduleDaysTextCell = () => {
    return class extends React.Component<GridCellProps> {
        render() {
            const scheduleList = this.props.dataItem["scheduleList"];
            let text: string = scheduleList && scheduleList.map(
                (dayCode: string) => lookupService.getText("LIST_WEEKDAYS", dayCode)).join(", ");
            return <td>{text || ''}</td>;
        }
    }
}

const ScheduleTimeTextCell = () => {
    return class extends React.Component<GridCellProps> {
        render() {
            const startTime = this.props.dataItem["scheduleStartTime"];
            const endTime = this.props.dataItem["scheduleEndTime"];

            let text: string = '';

            if (startTime && endTime) {
                let start = dateTimeUtilService.getDateDisplayText(`1901-01-01 ${startTime}`, 'h:mm A');
                let end = dateTimeUtilService.getDateDisplayText(`1901-01-01 ${endTime}`, 'h:mm A');
                text = `${start} - ${end}`;
            }

            return <td>{text || localise('TEXT_WHOLE_DAY')}</td>;
        }
    }
}



// WEBPACK FOOTER //
// ./src/modules/users/components/UserDetails/Tabs/UserAccessibleItemsTab.tsx