import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import Menu from '../Sidebar/Menu';
import { customerService, routeService, uiDomService } from 'src/modules/shared/services';

interface State {
    isSidebarCollapsed: boolean;
}

export class AuthenticatedLayout extends React.Component<any, State>{
    constructor(props: any) {
        super(props);

        const collapsed = window.sessionStorage.getItem("sidebar-collapsed");
        this.state = {
            isSidebarCollapsed: collapsed == "1"
        };

        this.toggleSidebar = this.toggleSidebar.bind(this);
    }

    componentDidMount() {
        //This is to resize elements on every route change.
        uiDomService.adjustDynamicPageContentSizes()
    }

    toggleSidebar() {
        const collapsed = !this.state.isSidebarCollapsed;
        this.setState({ ...this.state, isSidebarCollapsed: collapsed })
        window.sessionStorage.setItem("sidebar-collapsed", collapsed ? "1" : "0");
    }

    render() {
        const { isSidebarCollapsed } = this.state;
        const multiCustomer = customerService.getCustomerList().length > 1;
        return (
            <div className={isSidebarCollapsed ? "is-collapsed" : ""}>
                 <div id="menuBar">
                        <Menu {...this.props} isCollapsed={isSidebarCollapsed} toggleSidebar={this.toggleSidebar} />
                    </div>
                <div className="page-container">
                    <Header {...this.props} />
                    <div className={`main-content ${multiCustomer ? 'multi-customer-content' : ''}`}>
                        <Switch>
                            {
                                routeService.routes.filter(r => !r.isPublic).map((route, key) =>
                                    <Route path={route.path} component={route.component} key={key} />
                                )
                            }
                        </Switch>
                    </div>
                </div>
                <div id="leftSideBar">
                    <Sidebar {...this.props} isCollapsed={isSidebarCollapsed} toggleSidebar={this.toggleSidebar} />
                </div>
            </div>
        );
    }
}



// WEBPACK FOOTER //
// ./src/layouts/AuthenticatedLayout/AuthenticatedLayout.tsx