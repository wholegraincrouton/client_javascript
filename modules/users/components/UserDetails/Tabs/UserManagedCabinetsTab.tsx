import * as React from "react";
import { connect } from "react-redux";
import { Row, Col, Card, CardBody } from "reactstrap";
import { Grid, GridColumn, GridHeaderSelectionChangeEvent, GridSelectionChangeEvent, GridSortChangeEvent } from "@progress/kendo-react-grid";
import { orderBy, SortDescriptor } from "@progress/kendo-data-query";
import { store, StoreState } from "src/redux/store";
import { localise, permissionService } from "src/modules/shared/services";
import { CustomerCabinets, UserCustomerRole } from "src/modules/users/types/dto";
import { CabinetBasicDetails } from "src/modules/cabinet/types/dto";
import { cabinetService } from "src/modules/cabinet/services/cabinet.service";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { LookupTextCell } from "src/modules/shared/components/DataGrid";

interface Props {
    customerId: string;
}

interface State {
    sort: SortDescriptor[];
    managedCabinets: CustomerCabinets[];
    customerCabinets: GridCabinet[];
}

interface GridCabinet extends CabinetBasicDetails {
    rowSelected: boolean;
    address: string;
}

export class UserManagedCabinetsTab extends React.Component<DetailFormProps & Props, State> {
    constructor(props: DetailFormProps & Props) {
        super(props);
        this.onSortChange = this.onSortChange.bind(this);
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.onHeaderSelectionChange = this.onHeaderSelectionChange.bind(this);
        this.onCabinetsChange = this.onCabinetsChange.bind(this);

        const { customerCabinets } = props.initialValues as any;

        this.state = {
            managedCabinets: JSON.parse(customerCabinets),
            customerCabinets: [],
            sort: [{ field: 'name', dir: 'asc' }],
        }
    }

    componentDidMount() {
        const { customerId } = this.props;
        this.getCabinetsForCustomer(customerId);
    }

    componentDidUpdate(previousProps: any) {
        const previousCustomerId = previousProps.customerId;
        const customerId = this.props.customerId;

        if (customerId != previousCustomerId) {
            this.getCabinetsForCustomer(customerId);
        }
    }

    getCabinetsForCustomer(customerId: string) {
        const { managedCabinets } = this.state;

        if (customerId) {
            cabinetService.getCabinets(customerId, false, true).then((data: CabinetBasicDetails[]) => {
                let customerCabinetList = managedCabinets.find(c => c.customerId == customerId);

                this.setState({
                    customerCabinets: data.map((c) => {
                        return {
                            ...c,
                            address: (c.cabinetLocation && c.cabinetLocation.address) || '',
                            rowSelected: customerCabinetList ? customerCabinetList.cabinetList.some(d => d == c.id) : false
                            
                        };
                    })
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

    onSelectionChange(event: GridSelectionChangeEvent) {
        const { customerId } = this.props;
        const { customerCabinets, managedCabinets } = this.state;

        const customerCabinet = customerCabinets.find(c => c.id == event.dataItem.id);

        if (customerCabinet) {
            customerCabinet.rowSelected = !customerCabinet.rowSelected;

            let managedCabinet = managedCabinets.find(c => c.customerId == customerId);

            if (managedCabinet) {
                if (customerCabinet.rowSelected) {
                    managedCabinet.cabinetList.push(customerCabinet.id);
                }
                else {
                    let index = managedCabinet.cabinetList.indexOf(customerCabinet.id);
                    managedCabinet.cabinetList.splice(index, 1);
                }
            }
            else {
                if (customerCabinet.rowSelected) {
                    managedCabinet = { customerId: customerId, cabinetList: [customerCabinet.id] };
                    managedCabinets.push(managedCabinet);
                }
            }

            this.onCabinetsChange(managedCabinets);

            this.setState({
                ...this.state,
                customerCabinets: customerCabinets,
                managedCabinets: managedCabinets,
            });
        }
    }

    onHeaderSelectionChange(event: GridHeaderSelectionChangeEvent) {
        const { customerId } = this.props;
        const { customerCabinets, managedCabinets } = this.state;

        const isSelected = event.nativeEvent.target.checked;
        customerCabinets.forEach(u => u.rowSelected = isSelected);

        let managedCabinet = managedCabinets.find(c => c.customerId == customerId);

        if (managedCabinet) {
            if (isSelected) {
                managedCabinet.cabinetList = [];
                customerCabinets.forEach(c => managedCabinet && managedCabinet.cabinetList.push(c.id));
            }
            else {
                managedCabinet.cabinetList = [];
            }
        }
        else {
            if (isSelected) {
                managedCabinet = { customerId: customerId, cabinetList: customerCabinets.map(c => c.id) };
                managedCabinets.push(managedCabinet);
            }
        }

        this.onCabinetsChange(managedCabinets);

        this.setState({
            ...this.state,
            customerCabinets: customerCabinets
        });
    }

    onCabinetsChange(cabinets: CustomerCabinets[]) {
        this.props.change('customerCabinets', JSON.stringify(cabinets));
    }

    render() {
        const { customerId, item } = this.props;
        const { sort, customerCabinets } = this.state;
        const canManageCabinets = permissionService.isActionPermittedForCustomer("CABINETS", customerId);
        const allItemsSelected = customerCabinets.every(item => item.rowSelected);

        const user = store.getState().form.UserDetailsForm.values as any;
        const customerRoles = ((user.customerRoles && JSON.parse(user.customerRoles)) || []) as UserCustomerRole[];
        const isWebUser = permissionService.hasWebPermissions(
            customerId, customerRoles.filter(c => c.customerId == customerId).map(r => r.role || ''));
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');
        return (
            <>
                <Row className="mb-2">
                    <Col xs="auto">
                        <small className="text-muted">{localise("REMARK_MANAGED_CABINETS")}</small>
                    </Col>
                </Row>
                {
                    !isWebUser &&
                    <Row className="mb-2">
                        <Col xs="auto">
                            <small className="text-danger">
                                {localise('REMARK_WEB_PERMISSION_NEEDED_FOR_CUSTOMER')}
                            </small>
                        </Col>
                    </Row>
                }
                {
                    customerCabinets.length > 0 ?
                        <Row>
                            <Col>
                                <div className="largeScreen">
                                    <Grid data={orderBy(customerCabinets, sort)}
                                        className={!isPermittedToEdit || !canManageCabinets ? "disabled-grid" : ""}
                                        rowRender={this.onRowRender}
                                        selectedField="rowSelected"
                                        onSelectionChange={this.onSelectionChange}
                                        onHeaderSelectionChange={this.onHeaderSelectionChange}
                                        sort={sort}
                                        sortable={{ allowUnsort: false, mode: 'single' }}
                                        onSortChange={this.onSortChange} >
                                        <GridColumn field="rowSelected" width="auto" className="checkbox-grid-column"
                                            headerClassName="checkbox-grid-column" headerSelectionValue={allItemsSelected} />
                                        <GridColumn field="name" title={localise('TEXT_CABINET_NAME')} />
                                        <GridColumn field="itemCount" title={localise('TEXT_ITEMS')} />
                                        <GridColumn field="description" title={localise('TEXT_DESCRIPTION')} />
                                        <GridColumn field="siteName" title={localise('TEXT_SITE')} />
                                        <GridColumn field="address" title={localise('TEXT_ADDRESS')} />
                                        <GridColumn field="area" title={localise('TEXT_AREA')} cell={LookupTextCell('LIST_AREAS')} />
                                    </Grid>
                                </div>
                                <div className="smallScreen">
                                    <Grid data={orderBy(customerCabinets, sort)}
                                        className={!isPermittedToEdit || !canManageCabinets ? "disabled-grid" : ""}
                                        rowRender={this.onRowRender}
                                        selectedField="rowSelected"
                                        onSelectionChange={this.onSelectionChange}
                                        onHeaderSelectionChange={this.onHeaderSelectionChange}
                                        sort={sort}
                                        sortable={{ allowUnsort: false, mode: 'single' }}
                                        onSortChange={this.onSortChange} >
                                        <GridColumn field="rowSelected" width="auto" className="checkbox-grid-column"
                                            headerClassName="checkbox-grid-column" headerSelectionValue={allItemsSelected} />
                                        <GridColumn field="name" title={localise('TEXT_CABINET_NAME')} />
                                        <GridColumn field="itemCount" title={localise('TEXT_ITEMS')} />
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

export default connect(mapStateToProps)(UserManagedCabinetsTab);



// WEBPACK FOOTER //
// ./src/modules/users/components/UserDetails/Tabs/UserManagedCabinetsTab.tsx