import * as React from "react";
import * as qs from "query-string";
import { Input, Row, Col } from "reactstrap";
import { mapService } from "src/modules/shared/services/map.service";
import { contextService, localise } from "src/modules/shared/services";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { FormField, FormAuditField } from "src/modules/shared/components/Form";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import { Location } from "src/modules/shared/types/dto";
import 'mapbox-gl/dist/mapbox-gl.css';
import SiteList from "src/modules/sites/shared/SiteList";
import { siteService } from "src/modules/sites/services/site.service";
import { permissionService } from '../../../../shared/services/permission.service';

interface State {
    site: string;
    location?: Location;
    country?: string;
}

export class CabinetDetailsTab extends React.Component<DetailFormProps, State> {
    map: any;
    noOfSites: number;

    constructor(props: DetailFormProps) {
        super(props);
        this.onSiteChange = this.onSiteChange.bind(this);

        siteService.getSites(contextService.getCurrentCustomerId()).then(sites => {
            {
                this.noOfSites = sites.length;
            }
        });

        this.state = {
            site: this.props.item.site,
        }
    }

    componentDidMount() {
        siteService.getSite(this.props.item.site).then((site) => {            
            this.setState({
                ...this.state,
                location: site.location
            });
        });
        
        const { location } = this.state;

        if (this.props.isNew && this.props.history) {
            let queryObject = qs.parse(this.props.history.location.search);

            let site = queryObject.site;

            if (site) {
                this.props.change("site", site);
            }
        }

        if (location && location.latitude && location.longitude)
            this.initializeMap(location);
    }

    componentDidUpdate() {
        const { location } = this.state;

        if (!this.map && location && location.latitude && location.longitude)
            this.initializeMap(location);
    }

    initializeMap(location: any) {
        this.map = mapService.createMap('detailFormMap',
            [location.longitude, location.latitude], 14, true);

        var mapObj = this.map;

        this.map.events.add('ready', function () {
            mapService.addPinToMap(mapObj, [location.longitude, location.latitude]);
        });
    }

    onSiteChange(event: any) {
        let siteId = event.target.value;
        const { props: formProps } = this;

        if (siteId == "") {
            formProps.change("site", null);
            this.map = undefined;
            this.setState({
                ...this.state,
                location: undefined
            });
        } else {
            formProps.change("site", siteId);

            siteService.getSite(siteId).then((site) => {
                if (site.location && site.location.longitude && site.location.latitude && this.map) {
                    mapService.clearPinsFromMap(this.map);
                    mapService.addPinToMap(this.map, [site.location.longitude, site.location.latitude]);
                    mapService.setCamera(this.map, [site.location.longitude, site.location.latitude], 14);
                }
                else {
                    this.map = undefined;
                }

                this.setState({
                    ...this.state,
                    location: site.location
                });
            });
        }
    }

    render() {
        const { item, isNew } = this.props;
        const { location } = this.state;
        const customerId = contextService.getCurrentCustomerId();
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');

        return (
            <>
                <Row className="mb-3">
                    <Col>
                        <small className="text-muted">{localise("TEXT_PAGE_DESCRIPTION")}</small>
                    </Col>
                    <Col md="auto">
                        <small className="text-muted">{localise('TEXT_REQUIRED_FIELD')}</small>
                    </Col>
                </Row>
                <FormField remarksKey="REMARK_CABINET_NAME" required={true} labelKey="TEXT_CABINET_NAME" name="name"
                    component={Input} disabled={!isPermittedToEdit} />
                {!isNew && <FormField remarksKey="REMARK_PROVISIONING_KEY" labelKey="TEXT_PROVISIONING_KEY"
                    name="provisioningKey" disabled component={(props: any) =>
                        <div>
                            <span className="badge badge-secondary font-weight-normal provisioning-key-label">{props.value}</span>
                        </div>} />}
                <FormField name="itemCount" disabled={!isNew || !isPermittedToEdit} required={true} remarksKey="REMARK_ITEM_COUNT"
                    labelKey="TEXT_ITEM_COUNT" component={(props: any) =>
                        <LookupDropDown {...props} lookupKey="LIST_CABINET_ITEMCOUNTS" />} />

                <FormField name="timeZone" required={true} remarksKey="REMARK_TIMEZONE" labelKey="TEXT_TIMEZONE"
                    component={(props: any) => <LookupDropDown {...props} lookupKey="LIST_TIMEZONE" />}
                    disabled={!isPermittedToEdit} />

                <Row className="remark-site">
                    <Col>
                        <FormField name="site" required={true} remarksKey="REMARK_SITE_CABINET" labelKey="TEXT_SITE" disabled={!isPermittedToEdit}
                            component={(props: any) =>
                                <SiteList customerId={customerId} value={props.value} name="site" onChange={this.onSiteChange} disabled={!isPermittedToEdit} />
                            }
                        />
                    </Col>
                </Row>

                {
                    this.noOfSites == 0 &&
                    <Row>
                        <Col lg={7}>
                            <small className="text-muted">{localise('REMARK_CREATE_SITES')}</small>
                        </Col>
                    </Row>
                }
                {
                    location && location.address &&
                    <Row style={{ marginTop: 10 }}>
                        <Col lg={7}>
                            <small className="text-muted" style={{ fontSize: 14 }}>{location.address}</small>
                        </Col>
                    </Row>
                }
                {
                    location && location.latitude && location.longitude &&
                    <Row>
                        <Col>
                            <div id="detailFormMap"></div>
                        </Col>
                    </Row>
                }
                <Row className="remark-area">
                    <Col>
                        <FormField name="area" required={true} remarksKey="REMARK_AREA" labelKey="TEXT_AREA"
                            component={(props: any) => <LookupDropDown {...props} lookupKey="LIST_AREAS"
                                customerId={customerId} />} disabled={!isPermittedToEdit} />
                    </Col>
                </Row>
                <FormField remarksKey="REMARK_CABINET_REMARK" labelKey="TEXT_REMARK" name="remark"
                    required={true} component={Input} disabled={!isPermittedToEdit} />
                <FormField name="automaticUpdatesInterval" labelKey="TEXT_AUTOMATIC_UPDATES_INTERVAL"
                    remarksKey="REMARK_AUTOMATIC_UPDATES_INTERVAL" component={(props: any) =>
                        <LookupDropDown {...props} lookupKey="LIST_AUTOMATIC_UPDATE_INTERVALS"
                            allowBlank={true} textBlank="N/A" />} disabled={!isPermittedToEdit} />
                <FormAuditField updatedOnUtc={item.updatedOnUtc} updatedByName={item.updatedByName} />
            </>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetDetails/Tabs/CabinetDetailsTab.tsx