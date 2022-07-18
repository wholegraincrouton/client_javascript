import * as React from "react";
import { connect } from "react-redux";
import { Card, CardBody, Col, Label, Row } from "reactstrap";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { orderBy, SortDescriptor } from "@progress/kendo-data-query";
import { StoreState } from "src/redux/store";
import { accountSessionService, localise, lookupService, permissionService, utilityService } from "src/modules/shared/services";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { PermissionConfig } from "src/modules/security/types/dto";
import { UserCustomerRole } from "src/modules/users/types/dto";
import { softwareRoles } from "src/modules/users/constants/user-roles.constants";

interface Props {
    customerId: string;
}

interface State {
    webGridSort: SortDescriptor[];
    cabinetGridSort: SortDescriptor[];
    userCustomerRoles: UserCustomerRole[];
    customerWebRoles: GridRole[];
    customerCabinetRoles: GridRole[];
}

interface GridRole extends PermissionConfig {
    name: string;
    description: string;
    rowSelected: boolean;
}

class UserRolesTab extends React.Component<DetailFormProps & Props, State> {
    webGridName: string = 'web-roles-grid';
    cabinetGridName: string = 'cabinet-roles-grid';

    constructor(props: DetailFormProps & Props) {
        super(props);
        this.onSortChange = this.onSortChange.bind(this);
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.onHeaderSelectionChange = this.onHeaderSelectionChange.bind(this);
        this.onRolesChange = this.onRolesChange.bind(this);

        const { customerRoles } = props.initialValues as any;

        this.state = {
            userCustomerRoles: JSON.parse(customerRoles),
            customerWebRoles: [],
            customerCabinetRoles: [],
            webGridSort: [{ field: 'name', dir: 'asc' }],
            cabinetGridSort: [{ field: 'name', dir: 'asc' }]
        }
    }

    componentDidMount() {
        const { customerId } = this.props;
        this.getRolesForCustomer(customerId);
    }

    componentDidUpdate(previousProps: any) {
        const previousCustomerId = previousProps.customerId;
        const customerId = this.props.customerId;

        if (customerId != previousCustomerId) {
            this.getRolesForCustomer(customerId);
        }
    }

    getRolesForCustomer(customerId: string) {
        const { userCustomerRoles } = this.state;
        if (customerId) {
            let roleLookup = lookupService.getList('LIST_ROLES', customerId);

            permissionService.getConfiguredRoles(customerId).then((roles: PermissionConfig[]) => {
                this.setState({
                    customerWebRoles: roles.filter(r => softwareRoles.includes(r.role || '')).map((r) => {
                        let item = roleLookup.find(i => i.value == r.role);

                        return {
                            ...r,
                            customerId: customerId,
                            name: (item && item.text) || '',
                            description: (item && item.remark) || '',
                            rowSelected: userCustomerRoles.some(cr => cr.customerId == customerId && cr.role == r.role),
                            gridPermissions: []
                        };
                    }),
                    customerCabinetRoles: roles.filter(r => !softwareRoles.includes(r.role || '')).map((r) => {
                        let item = roleLookup.find(i => i.value == r.role);

                        return {
                            ...r,
                            customerId: customerId,
                            name: (item && item.text) || '',
                            description: (item && item.remark) || '',
                            rowSelected: userCustomerRoles.some(cr => cr.customerId == customerId && cr.role == r.role),
                            gridPermissions: []
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

    onSortChange(event: any) {
        const gridName = event.target._reactInternalFiber.key;

        this.setState({
            ...this.state,
            webGridSort: gridName == this.webGridName ? event.sort : this.state.webGridSort,
            cabinetGridSort: gridName == this.cabinetGridName ? event.sort : this.state.cabinetGridSort
        })
    }

    onSelectionChange(event: any) {
        const gridName = event.target._reactInternalFiber.key;
        const { role } = event.dataItem;
        const { customerId } = this.props;
        let { customerWebRoles, customerCabinetRoles, userCustomerRoles } = this.state;
        let rolesList = gridName == this.webGridName ? customerWebRoles : customerCabinetRoles;

        const customerRole = rolesList.find(cr => cr.customerId == customerId && cr.role == role);

        if (customerRole) {
            customerRole.rowSelected = !customerRole.rowSelected;

            if (customerRole.rowSelected) {
                userCustomerRoles.push({ customerId: customerId, role: role });
            }
            else {
                let userCustomerRole = userCustomerRoles.find(cr => cr.customerId == customerId && cr.role == role);

                if (userCustomerRole) {
                    userCustomerRoles.splice(userCustomerRoles.indexOf(userCustomerRole), 1);
                }
            }
            userCustomerRoles = utilityService.getSortedList(userCustomerRoles, 'customerId', 'role');

            this.onRolesChange(userCustomerRoles);

            this.setState({
                ...this.state,
                customerWebRoles: gridName == this.webGridName ? rolesList : customerWebRoles,
                customerCabinetRoles: gridName == this.cabinetGridName ? rolesList : customerCabinetRoles,
                userCustomerRoles: userCustomerRoles
            });
        }
    }

    onHeaderSelectionChange(event: any) {
        const gridName = event.target._reactInternalFiber.key;
        const isSelected = event.nativeEvent.target.checked;
        const { customerId } = this.props;
        let { customerWebRoles, customerCabinetRoles, userCustomerRoles } = this.state;
        let rolesList = gridName == this.webGridName ? customerWebRoles : customerCabinetRoles;

        rolesList.forEach(cr => cr.rowSelected = isSelected);

        if (isSelected) {
            rolesList.forEach(cr => {
                userCustomerRoles.push({ customerId: customerId, role: cr.role || '' });
            });
        }
        else {
            userCustomerRoles = userCustomerRoles.filter(cr => cr.customerId != customerId);
        }
        userCustomerRoles = utilityService.getSortedList(userCustomerRoles, 'customerId', 'role');

        this.onRolesChange(userCustomerRoles);

        this.setState({
            ...this.state,
            customerWebRoles: gridName == this.webGridName ? rolesList : customerWebRoles,
            customerCabinetRoles: gridName == this.cabinetGridName ? rolesList : customerCabinetRoles,
            userCustomerRoles: userCustomerRoles
        });
    }

    onRolesChange(roles: UserCustomerRole[]) {
        this.props.change('customerRoles', JSON.stringify(roles));
    }

    render() {
        const { item } = this.props;
        const { webGridSort, cabinetGridSort } = this.state;
        let { customerWebRoles, customerCabinetRoles } = this.state;
        const allWebRolesSelected = customerWebRoles.every(r => r.rowSelected);
        const allCabinetRolesSelected = customerCabinetRoles.every(r => r.rowSelected);
        const gridNames = [this.webGridName, this.cabinetGridName];
        const isRoleAdmin = permissionService.isActionPermittedForCustomer('ROLES_ADMIN');
        const disableGrid = item.externalSystemId != null || (accountSessionService.getLoggedInUserId() == item.id && !isRoleAdmin);
        const canViewExcludedRoles = permissionService.checkIfPermissionExistsForCustomer('VIEW_EXCLUDED_ROLES');

        if (!isRoleAdmin) {
            if (canViewExcludedRoles) {
                customerWebRoles = customerWebRoles.filter(r => r.role != 'PLATFORM_ADMIN');
            }
            else {
                customerWebRoles = customerWebRoles.filter(r => r.role != 'CUSTOMER_ADMIN');
            }
        }
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');

        return (
            <>
                <Row className="mb-2">
                    <Col xs="auto">
                        <small className="text-muted">{localise("REMARK_USER_ROLES")}</small>
                    </Col>
                </Row>
                {
                    gridNames.map(n =>
                        <Row className={n == this.webGridName ? 'mb-3' : ''}>
                            <Col>
                                <Row className="system-label pl-1">
                                    <Col>
                                        <Label>{localise(n == this.webGridName ? 'TEXT_WEB_ROLES' : 'TEXT_CABINET_ROLES')}</Label>
                                    </Col>
                                </Row>
                                {
                                    (n == this.webGridName && customerWebRoles.length > 0) ||
                                        (n == this.cabinetGridName && customerCabinetRoles.length > 0) ?
                                        <Row>
                                            <Col>
                                                <Grid key={n}
                                                    data={orderBy(
                                                        n == this.webGridName ? customerWebRoles : customerCabinetRoles,
                                                        n == this.webGridName ? webGridSort : cabinetGridSort
                                                    )}
                                                    className={disableGrid || !isPermittedToEdit ? "disabled-grid" : ""}
                                                    rowRender={this.onRowRender}
                                                    sort={n == this.webGridName ? webGridSort : cabinetGridSort}
                                                    sortable={{ allowUnsort: false, mode: 'single' }}
                                                    onSortChange={this.onSortChange}
                                                    selectedField="rowSelected"
                                                    onSelectionChange={this.onSelectionChange}
                                                    onHeaderSelectionChange={this.onHeaderSelectionChange}>
                                                    <GridColumn field="rowSelected" width="auto" className="checkbox-grid-column"
                                                        headerClassName="checkbox-grid-column" headerSelectionValue={n == this.webGridName ?
                                                            allWebRolesSelected : allCabinetRolesSelected} />
                                                    <GridColumn field="name" title={localise('TEXT_ROLE')} />
                                                    <GridColumn field="description" title={localise('TEXT_DESCRIPTION')} />
                                                </Grid>
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
                            </Col>
                        </Row>
                    )
                }
            </>
        );
    }
}

const mapStateToProps = (store: StoreState) => {
    return { customerId: store.customer };
};

export default connect(mapStateToProps)(UserRolesTab);




// WEBPACK FOOTER //
// ./src/modules/users/components/UserDetails/Tabs/UserRolesTab.tsx