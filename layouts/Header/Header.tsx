import * as React from 'react';
import { Row, Col } from 'reactstrap';
import { localise } from '../../modules/shared/services/localisation.service';
import UserMenu from './UserMenu';
import { routeService } from '../../routes/route.service';
import { permissionService, customerService, configService } from 'src/modules/shared/services';
import AlarmNotificationIconContainer from 'src/modules/eventAlarms/components/Alarms/AlarmNotificationIcon/AlarmNotificationIconContainer';
import DeviceUpdateStatusIconContainer from 'src/modules/deviceUpdates/components/DeviceUpdateStatusIcon/DeviceUpdateStatusIconContainer';
import { CustomerList } from 'src/modules/shared/components/CustomerList/CustomerList';

export default class Header extends React.Component<any> {
    render() {
        const currentRoute = routeService.getCurrentRoute();
        
        let titleKey = (!currentRoute || !currentRoute.titleKey || currentRoute.titleKey == 'TEXT_DETAILS') ? 'TEXT_PAGE_TITLE' : currentRoute.titleKey;

        const canUpdateAlarms = permissionService.checkIfPermissionExists('NAV_ALARMS') &&
                                permissionService.checkIfPermissionExists('ALARMS_UPDATE');

        const customerList = customerService.getCustomerList();
       
        window.document.title = (currentRoute && currentRoute.isDetailPage ?
        `${localise(titleKey)} - ${localise('TEXT_DETAILS')}` : `${localise(titleKey)}`) + ' | ' + configService.getConfigurationValue("PRODUCT_NAME");

        return <div className="header navbar">
            <div className="header-container">
                <Row className="mobileView">
                    <Col className="text-truncate align-self-center text-center order-1 largeScreen">
                        <h1>{localise(titleKey)}</h1>
                    </Col>
                    <Col className="text-truncate align-self-center text-center order-1 smallScreen">
                        <h2>{localise(titleKey)}</h2>
                    </Col>
                </Row>
                <Row className="header-top-row">
                    <Col className="text-truncate align-self-center text-center order-1">
                        <h1>{localise(titleKey)}</h1>
                    </Col>
                    {
                        customerList.length > 1 &&
                        <Col xl="auto" className="order-last order-xl-2 pt-xl-3 text-right mr-4 mr-xl-0 mb-2 mb-xl-0">
                            <CustomerList {...this.props as any} list={customerList} />
                        </Col>
                    }
                    {
                        permissionService.checkIfPermissionExists('DEVICEUPDATE_NEW') &&
                        <Col xs="auto" className="order-3">
                            <DeviceUpdateStatusIconContainer {...this.props as any} />
                        </Col>
                    }
                    {
                        permissionService.checkIfPermissionExists('ALARMS_SEARCH') &&
                        <Col xs="auto" className="order-4">
                            <AlarmNotificationIconContainer {...this.props as any} canView={canUpdateAlarms} />
                        </Col>
                    }
                    <Col xs="auto" className="order-5">
                        <ul className="nav-right">
                            <UserMenu {...this.props as any} />
                        </ul>
                    </Col>
                </Row>
            </div>
        </div>
    }
}



// WEBPACK FOOTER //
// ./src/layouts/Header/Header.tsx