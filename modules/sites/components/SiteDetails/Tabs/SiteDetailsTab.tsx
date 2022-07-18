import * as React from "react";
import * as qs from "query-string";
import { Input, Row, Col } from "reactstrap";
import { localise } from "src/modules/shared/services";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { FormField, FormAuditField } from "src/modules/shared/components/Form";
import { CountryList, CountryStateList } from "src/modules/shared/components/CountryLocationList";
import { ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { LocationDialog } from "src/modules/shared/components/LocationDialog/LocationDialog";
import { mapService } from "src/modules/shared/services/map.service";
import { Location } from "src/modules/shared/types/dto";
import { permissionService } from 'src/modules/shared/services/permission.service';
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";

interface State {
    showLocationPopup: boolean;
    location: any;
    country?: string;
}

export class SiteDetailsTab extends React.Component<DetailFormProps, State> {
    nameInput = (props: any) => <Input {...props} maxLength={40} />
    map: any;

    constructor(props: DetailFormProps) {
        super(props);
        this.onCountryChange = this.onCountryChange.bind(this);
        this.onLocationChange = this.onLocationChange.bind(this);
        this.showLocationPopup = this.showLocationPopup.bind(this);
        this.hideLocationPopup = this.hideLocationPopup.bind(this);

        this.state = {
            showLocationPopup: false,
            location: this.props.item.location
        }
    }

    componentDidMount() {
        const { location } = this.state;

        if (this.props.isNew && this.props.history) {
            let queryObject = qs.parse(this.props.history.location.search);

            let groupId = queryObject.groupId;

            if (groupId) {
                this.props.change("groupId", groupId);
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

    onLocationChange(location: Location) {
        const { props: formProps } = this;
        formProps.change("location", location);

        if (location.longitude && location.latitude && this.map) {
            mapService.clearPinsFromMap(this.map);
            mapService.addPinToMap(this.map, [location.longitude, location.latitude]);
            mapService.setCamera(this.map, [location.longitude, location.latitude], 14);
        }
        else {
            this.map = undefined;
        }

        this.setState({
            ...this.state,
            location: location
        });
        this.hideLocationPopup();
    }

    showLocationPopup() {
        this.setState({ showLocationPopup: true });
    }

    hideLocationPopup() {
        this.setState({ showLocationPopup: false });
    }

    onCountryChange(event: any, inputProps: any) {
        const { props: formProps } = this;
        this.setState({ country: event.target.value });
        inputProps.onChange(event);
        formProps.change("state", "");
    }

    render() {
        const { item } = this.props;
        const { showLocationPopup, location, country } = this.state;
        const isExternalSite = item.externalSystemId != null;
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
                <FormField labelKey="TEXT_SITE_NAME" remarksKey="REMARK_SITE_NAME"
                    name="name" required={true} component={this.nameInput} disabled={isExternalSite || !isPermittedToEdit} />
                <FormField remarksKey="REMARK_SITE_LOCATION" labelKey="TEXT_ADDRESS" name="location"
                    component={(props: any) =>
                        <Row>
                            {
                                props.value.address &&
                                <Col lg={7}>
                                    <div className="site-component">
                                        <Input disabled={true} value={props.value.address} />
                                    </div>
                                </Col>
                            }
                            {
                                props.value && props.value.latitude && props.value.longitude &&
                                <Col lg={2}>
                                    <div className="site-component">
                                        <Input disabled={true} value={props.value.latitude + ", " + props.value.longitude} />
                                    </div>
                                </Col>
                            }
                            <Col lg={2}>
                                <div className="site-component">
                                    <ActionButton onClick={this.showLocationPopup} textKey="BUTTON_SET_LOCATION"
                                        color="secondary" icon="fa-map-marker-alt" disabled={!isPermittedToEdit}/>
                                    {
                                        showLocationPopup &&
                                        <>
                                            <div className="dialog-largescreen">
                                                <LocationDialog location={props.value} onSaveClick={this.onLocationChange}
                                                    onBackClick={this.hideLocationPopup} />
                                            </div>
                                            <div className="dialog-smallscreen">
                                                <LocationDialog location={props.value} onSaveClick={this.onLocationChange}
                                                    onBackClick={this.hideLocationPopup} />
                                            </div>
                                        </>
                                    }
                                </div>
                            </Col>
                        </Row>
                    }
                />
                {
                    location && location.latitude && location.longitude &&
                    <Row style={{ marginBottom: 10 }}>
                        <Col>
                            <div id="detailFormMap" onClick={isPermittedToEdit ? this.showLocationPopup: undefined}></div>
                        </Col>
                    </Row>
                }
                <FormField name="country" required={true} remarksKey="REMARK_COUNTRY" labelKey="TEXT_COUNTRY"
                    disabled={isExternalSite || !isPermittedToEdit} component={(props: any) => <CountryList {...props} allowAny={false}
                        onChange={(e: any) => this.onCountryChange(e, props)} />} />
                <FormField name="state" required={true} remarksKey="REMARK_STATE" labelKey="TEXT_STATE"
                    disabled={isExternalSite || !isPermittedToEdit} component={(props: any) => <CountryStateList {...props}
                        selectedCountry={country || item.country} />} />
                <FormField labelKey="TEXT_AUTOMATIC_UPDATES_INTERVAL" remarksKey="REMARK_AUTOMATIC_UPDATES_INTERVAL"
                    name="automaticUpdatesInterval" component={(props: any) =>
                        <LookupDropDown {...props} lookupKey="LIST_AUTOMATIC_UPDATE_INTERVALS"
                            allowBlank={true} textBlank="N/A" />} disabled={!isPermittedToEdit}/>        
                <FormField remarksKey="REMARK_SITE_REMARK" labelKey="TEXT_REMARK" name="remark"
                    required={true} disabled={isExternalSite || !isPermittedToEdit} component={Input} />
                <FormAuditField updatedOnUtc={item.updatedOnUtc} updatedByName={item.updatedByName} />
            </>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/sites/components/SiteDetails/Tabs/SiteDetailsTab.tsx