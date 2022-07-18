import * as React from 'react';
import { SidebarMenuGroup } from './SidebarMenuGroup';
import { sidebarRoutes } from '../../routes/sidebar-routes';
import { routeService } from 'src/routes/route.service';
import { configService } from 'src/modules/shared/services';
import { connect } from 'react-redux';
import { StoreState } from 'src/redux/store';

class Sidebar extends React.Component<any>{
    constructor(props: any) {
        super(props);
        this.onLogoClick = this.onLogoClick.bind(this);
    }

    onLogoClick() {
        this.props.history.push("/overview");
    }

    render() {
        const { customerId, location, isCollapsed, toggleSidebar } = this.props;
        const currentRoute = routeService.getCurrentRoute();
        const imageURL = isCollapsed ? configService.getConfigurationValue('URL_IMG_LOGO_PRODUCT_SYMBOL', '*', '*') :
            configService.getConfigurationValue('URL_IMG_LOGO_PRODUCT_BG_DARK', '*', '*');

        let routes = [...sidebarRoutes];

        if (customerId == '*') {
            const adminRoutes = ['/dashboard', '/users', '/configuration', '/help'];
            routes = routes.filter(r => adminRoutes.includes(r.path));
        }

        return (
            <div className="sidebar">
                <div className="sidebar-inner">
                    <div className="sidebar-brand">
                        <div className="sidebar-logo text-center pt-2">
                            <img src={imageURL} alt="Brand Logo" className="brand-and-img" onClick={this.onLogoClick} />
                        </div>
                        <div className="sidebar-toggle">
                            <ul>
                                <li>
                                    <a onClick={toggleSidebar} href="javascript:void(0);">
                                        <i className={`ty ty-ic_dehaze${isCollapsed ? ' color-blue' : ''}`}></i>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="sidebar-items">
                        <ul className="sidebar-menu scrollable pos-r">
                            {
                                routes.map((r, key) =>
                                    <SidebarMenuGroup currentActiveRoute={currentRoute} isSidebarCollapsed={isCollapsed}
                                        route={r} location={location} key={key} />)
                            }
                        </ul>
                    </div>
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

export default connect(mapStateToProps)(Sidebar);



// WEBPACK FOOTER //
// ./src/layouts/Sidebar/Sidebar.tsx