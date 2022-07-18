import * as React from 'react';
import * as qs from "query-string";
import { Location } from 'history';
import { Link, NavLink } from 'react-router-dom';
import { Collapse, DropdownToggle, DropdownMenu, Dropdown } from 'reactstrap';
import { AppRouteInfo } from '../../routes/types';
import { localise, permissionService, contextService } from '../../modules/shared/services';

interface Props {
    route: AppRouteInfo;
    currentActiveRoute: AppRouteInfo | undefined;
    location: Location;
    isSidebarCollapsed: boolean;
}

interface State {
    openMenu: boolean;
}

const SidebarIconMenu = (props: { name?: string, icon?: string }) =>
    <React.Fragment>
        <span className="icon-holder mr-1">
            <i className={"ty " + props.icon}></i>
        </span>
        <span className="title">{props.name}</span>
    </React.Fragment>

export class SidebarMenuGroup extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.toggleMenu = this.toggleMenu.bind(this);
        this.isRouteActive = this.isRouteActive.bind(this);
        this.isSubrouteActive = this.isSubrouteActive.bind(this);

        this.state = { openMenu: (this.isRouteActive(props.route) && !props.isSidebarCollapsed) || false };
    }

    toggleMenu() {
        this.setState({
            ...this.state,
            openMenu: !this.state.openMenu
        })
    }

    isRouteActive(route: AppRouteInfo) {
        const { currentActiveRoute } = this.props;
        return currentActiveRoute && currentActiveRoute.path.split('/')[1] == route.path.split('/')[1];
    }

    isSubrouteActive(route: AppRouteInfo) {
        const { currentActiveRoute } = this.props;
        return currentActiveRoute && currentActiveRoute.path.split('/')[1] == route.path.split('/')[1] &&
            currentActiveRoute.path.split('/')[2] == route.path.split('/')[2];
    }

    getInitialRoute(route: AppRouteInfo) {
        const currentCustomer = contextService.getCurrentCustomerId();

        if (route.section == "DASHBOARD") {
            return route.path;
        }

        let queryObject = { ...route.intialSearchQueryObject };

        if (route.section != "CUSTOMER") {
            queryObject['contextCustomerId'] = currentCustomer;
        }

        let queryString = qs.stringify(queryObject);
        return route.path + '?' + queryString;
    }

    render() {
        const { route, isSidebarCollapsed } = this.props;
        const { openMenu } = this.state;
        const name = route.titleKey ? localise(route.titleKey, route.section) : '';
        const icon = route.icon;
        const isRouteActive = this.isRouteActive(route);
        permissionService.InitializeNavigationRoutes(this.props.route.children);

        if (route.children && route.children.length > 1) {
            var permittedRoutes = route.children.filter(a => a.canAccess);

            return permittedRoutes.length > 0 &&
                <>
                    {
                        !isSidebarCollapsed ?
                            <li className={"nav-item " + (isRouteActive ? "active" : "")} title={name}>
                                <div className="dropdown-parent-item" onClick={this.toggleMenu}>
                                    <SidebarIconMenu name={name} icon={icon} />
                                    <span className="icon-expand">
                                        <i className={"fas " + (!openMenu ? "fas fa-chevron-left" : "fa-chevron-down")}></i>
                                    </span>
                                </div>
                                <Collapse isOpen={openMenu}>
                                    <ul className="dropdown-ul">
                                        {
                                            route.children.map((r, key) => {
                                                let isSubrouteActive = this.isSubrouteActive(r);

                                                return (
                                                    r.canAccess &&
                                                    <li key={key} className={"nav-item " + (isSubrouteActive ? "active bg-blue" : "")}>
                                                        <NavLink to={this.getInitialRoute(r)} activeClassName="active">
                                                            {r.titleKey ? localise(r.titleKey, r.section) : ''}
                                                        </NavLink>
                                                    </li>
                                                );
                                            })
                                        }
                                    </ul>
                                </Collapse>
                            </li>
                            :
                            <Dropdown tag="li" direction="right" isOpen={openMenu} toggle={this.toggleMenu} className={"nav-item nav-dropdown " + (isRouteActive ? "active" : "")}>
                                <DropdownToggle tag="a" href="javascript:void(0);" className="nav-link nav-dropdown-toggle">
                                    <SidebarIconMenu name={name} icon={icon} />
                                </DropdownToggle>
                                <DropdownMenu tag="ul" className="">
                                    {
                                        route.children.map((r, key) => {
                                            let isSubrouteActive = this.isSubrouteActive(r);

                                            return (
                                                r.canAccess &&
                                                <li key={key} className={"nav-item " + (isSubrouteActive ? "active bg-blue" : "")}>
                                                    <NavLink to={this.getInitialRoute(r)} activeClassName="active">
                                                        {r.titleKey ? localise(r.titleKey, r.section) : ''}
                                                    </NavLink>
                                                </li>
                                            );
                                        })
                                    }
                                </DropdownMenu>
                            </Dropdown>
                    }
                </>
        }
        else {
            //Don't display a sub menu if there's only one child route.
            let singleRoute = (route.children && route.children.length == 1) ? route.children[0] : route;

            return singleRoute.canAccess &&
                <li className={"nav-item " + (isRouteActive ? "active" : "")} title={name}>
                    <Link to={this.getInitialRoute(singleRoute)} className="sidebar-link">
                        <SidebarIconMenu name={name} icon={icon} />
                    </Link>
                </li>
        }
    }
}



// WEBPACK FOOTER //
// ./src/layouts/Sidebar/SidebarMenuGroup.tsx