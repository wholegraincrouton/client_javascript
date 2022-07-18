import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import { routeService } from '../../routes/route.service';
import { configService } from 'src/modules/shared/services';
import Footer from '../Footer/Footer';

export class AnonymousLayout extends React.Component {
    render() {
        const urlProductLogoWhiteBG = configService.getConfigurationValue('URL_IMG_LOGO_PRODUCT_BG_WHITE_HORIZONTAL', '*', '*');

        return (
            <div className="container-fluid d-flex flex-column align-items-stretch">
                <Row className="login-page-container">
                    <Col className="d-sm-flex justify-content-center align-items-center p-0">
                        <Row className="login-form-container">
                            <Col>
                                <Row className="logo-container mb-4 text-center">
                                    <Col>
                                        <img src={urlProductLogoWhiteBG} />
                                    </Col>
                                </Row>
                                <Row className="form-container">
                                    <Col>
                                        <Switch>
                                            {
                                                routeService.routes.map((route, key) =>
                                                    <Route path={route.path} component={route.component} key={key} />
                                                )
                                            }
                                        </Switch>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Footer />
            </div>
        );
    }
}



// WEBPACK FOOTER //
// ./src/layouts/AnonymousLayout/AnonymousLayout.tsx