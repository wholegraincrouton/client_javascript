import * as React from 'react';
import { SidebarMenuGroup } from './SidebarMenuGroup';
import { sidebarRoutes } from '../../routes/sidebar-routes';
import { routeService } from 'src/routes/route.service';
import { configService } from 'src/modules/shared/services';
import { connect } from 'react-redux';
import { StoreState } from 'src/redux/store';
import { Row, Col } from 'reactstrap';

import { permissionService, customerService } from 'src/modules/shared/services';
import AlarmNotificationIconContainer from 'src/modules/eventAlarms/components/Alarms/AlarmNotificationIcon/AlarmNotificationIconContainer';
import { CustomerList } from 'src/modules/shared/components/CustomerList/CustomerList';

import UserMenu from '../Header/UserMenu';
export interface State {
    menuOpen: boolean;
}

class Menu extends React.Component<any, State>{
    constructor(props: any) {
        super(props);
        this.onLogoClick = this.onLogoClick.bind(this);
        this.toggleMenu = this.toggleMenu.bind(this);

        this.state = {
            menuOpen: false
        }
    }

    toggleMenu() {
        this.setState({ ...this.state, menuOpen: !this.state.menuOpen });
    }

    onLogoClick() {
        this.props.history.push("/overview");
    }

    render() {
        const { customerId, location, isCollapsed, toggleSidebar } = this.props;
        const currentRoute = routeService.getCurrentRoute();
        const imageURL = isCollapsed ? configService.getConfigurationValue('URL_IMG_LOGO_PRODUCT_SYMBOL', '*', '*') :
            configService.getConfigurationValue('URL_IMG_LOGO_PRODUCT_BG_DARK', '*', '*');

        const customerList = customerService.getCustomerList();

        const canUpdateAlarms = permissionService.checkIfPermissionExists('NAV_ALARMS') &&
            permissionService.checkIfPermissionExists('ALARMS_UPDATE');

        let routes = [...sidebarRoutes];

        if (customerId == '*') {
            const adminRoutes = ['/dashboard', '/users', '/configuration', '/help'];
            routes = routes.filter(r => adminRoutes.includes(r.path));
        }

        return (
            <div id="header-menu">
                <div>
                    <Row>
                        <Col xs={4} className="headerMenu1">
                            <span className="sidebar-toggle"></span>
                            <a onClick={toggleSidebar} href="javascript:void(0);">
                                <i className={`ty ty-ic_dehaze${isCollapsed ? ' color-blue' : ''}`}></i>
                            </a>
                        </Col>
                        <Col xs={4} className="headerMenu2 text-align:center align-items: center">
                            <span className="sidebar-logo">
                                <img src={imageURL} alt="Brand Logo" className="brand-and-img" onClick={this.onLogoClick} />
                            </span>
                        </Col>
                        <Col xs={4} className="headerMenu3">
                            <Row>
                                {permissionService.checkIfPermissionExists('ALARMS_SEARCH') &&
                                    <AlarmNotificationIconContainer {...this.props as any} canView={canUpdateAlarms} />
                                }
                                <ul className="userLogo">
                                    <UserMenu {...this.props as any} />
                                </ul>
                            </Row>
                        </Col>
                    </Row>
                </div>
                <div className="sidebar-items">
                    <ul className="sidebar-menu scrollable pos-r">
                        {customerList.length > 1 &&
                            <div className="searchBox" >
                                <CustomerList {...this.props as any} list={customerList} isSelect={false} />
                            </div>
                        }
                        {
                            routes.map((r, key) =>
                                <SidebarMenuGroup currentActiveRoute={currentRoute} isSidebarCollapsed={isCollapsed}
                                    route={r} location={location} key={key} />)
                        }
                    </ul>

                    <div className="portal-version">
                        v{configService.getPortalVersion()}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (store: StoreState) => {
    return { customerId: store.customer };
}

export default connect(mapStateToProps)(Menu);



// WEBPACK FOOTER //
// ./src/layouts/Sidebar/Menu.tsx