import * as React from "react";
import { Row, Col, Input } from "reactstrap";
import { localise } from "src/modules/shared/services";
import { ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { mapService } from "../../services/map.service";
import { AutoComplete } from "@progress/kendo-react-dropdowns";
import { Location } from "src/modules/shared/types/dto";
import { DefaultLocation } from "../../constants/default.location.constants";

interface Props {
    locationProps: any;
    onChanges: (location: any) => void
}

interface State {
    isDirty: boolean;
    location?: Location;
    coordinateString: string;
    showError: boolean;
    errorKey?: string;
    suggestions?: any[];
}

export class LocationField extends React.Component<Props, State> {
    map: any;
    searchURL: any;
    

    constructor(props: Props) {
        super(props);
        this.constructMap = this.constructMap.bind(this);
        this.onAddressChange = this.onAddressChange.bind(this);
        this.onCoordinatesChange = this.onCoordinatesChange.bind(this);
        this.onMapClick = this.onMapClick.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.searchAddress = this.searchAddress.bind(this);
        this.searchCoordinates = this.searchCoordinates.bind(this);
        this.dirtyPageHandler = this.dirtyPageHandler.bind(this);
        this.setChanges = this.setChanges.bind(this);

        let location = this.props.locationProps;
        this.state = {
            isDirty: false,
            showError: false,
            location: location,
            coordinateString: DefaultLocation.Latitude + ", " + DefaultLocation.Longitude
        }
        window.addEventListener("beforeunload", this.dirtyPageHandler);
    }

    componentDidMount() {
        this.constructMap();
    }

    dirtyPageHandler(e: any) {
        if (this.state.isDirty) {
            e.returnValue = "";
            return "";
        }
        return;
    }

    constructMap() {
        const { location } = this.state;
        const { locationProps } = this.props;

        let data = locationProps ? locationProps : location;

        if (this.map)
            mapService.disposeMap(this.map);

        if (data && data.longitude && data.latitude) {
            this.map = mapService.createMap('locationSelectionMap', [data.longitude, data.latitude], 14, false);
            this.searchURL = mapService.createSearchURL();

            var mapObj = this.map;

            this.map.events.add('ready', function () {
                mapService.addPinToMap(mapObj, [data.longitude || 80, data.latitude || 0]);
            });

            
        }
        this.map.events.add('click', this.onMapClick);
        this.map.controls.add(mapService.createZoomControl(), { position: "bottom-right" });

        this.setState({
            ...this.state,
            coordinateString: `${data.longitude}, ${data.latitude}`
        });
    }

    onMapClick(e: any) {
        this.searchCoordinates([e.position[0], e.position[1]]);
    }

    onSearch() {
        const { coordinateString } = this.state;
        const { location } = this.state;

        if ((location && !location.address && !coordinateString) || (coordinateString && coordinateString.split(',').length != 2)) {
            this.setState({
                ...this.state,
                showError: true,
                errorKey: "ERROR_CABINET_LOCATION_INVALID"
            });
            return;
        }

        if (location && location.address && !coordinateString) {
            this.searchAddress(location.address);
        }
        else if (location && !location.address && coordinateString && location.longitude && location.latitude) {
            this.searchCoordinates([location.longitude, location.latitude], true);
        }
    }

    searchAddress(address: string) {
        mapService.searchAddress(this.searchURL, address)
            .then((response) => {
                if (response.results) {
                    var result = response.results[0];

                    if (result.position && result.position.lat && result.position.lon) {
                        let location = { 
                            ...this.state.location,
                            latitude: result.position.lat,
                            longitude: result.position.lon
                        }
                        this.setState({
                            ...this.state,
                            showError: false,
                            isDirty: true,
                            location: location,
                            coordinateString: result.position.lat + ", " + result.position.lon
                        });
                        mapService.clearPinsFromMap(this.map);
                        mapService.addPinToMap(this.map, [result.position.lon, result.position.lat]);
                        mapService.setCamera(this.map, [result.position.lon, result.position.lat], 14);

                        this.setChanges(location);
                    }
                }
            })
            .catch(() => {
                this.setState({
                    ...this.state,
                    showError: true,
                    errorKey: "ERROR_CABINET_LOCATION_INVALID"
                });
            });
    }

    searchCoordinates(coordinates: number[], setCamera: boolean = false) {        
        let longitude = parseFloat(coordinates[0].toFixed(4));
        let latitude = parseFloat(coordinates[1].toFixed(4));

        mapService.searchCoordinates(this.searchURL, [longitude, latitude])
            .then((response) => {
                if (response.addresses) {                    
                    var result = response.addresses[0];

                    if (result.address) {                        
                        let location = {
                            ...this.state.location,
                            address: result.address.freeformAddress,
                            latitude: latitude,
                            longitude: longitude
                        }
                        
                        this.setState({
                            ...this.state,
                            showError: false,
                            isDirty: true,
                            location: location,
                            coordinateString: '-20.2073, 23.12'
                        });
                        mapService.clearPinsFromMap(this.map);
                        mapService.addPinToMap(this.map, [longitude, latitude]);

                        if (setCamera)
                            mapService.setCamera(this.map, [longitude, latitude], 14);

                        this.setChanges(location);
                    }
                }
            })
            .catch(() => {
                this.setState({
                    ...this.state,
                    showError: true,
                    errorKey: "ERROR_CABINET_LOCATION_INVALID"
                });
            });
    }

    onAddressChange(event: any) {
        const { suggestions } = this.state;
        let value = event.target.value;        

        if (event.syntheticEvent.type == "click" && suggestions) {
            let data = suggestions.find(a => a.address.freeformAddress == value);
            let location = {
                ...this.state.location,
                address: value,
                latitude: data.position.lat,
                longitude: data.position.lon
            }
            this.setState({
                ...this.state,
                showError: false,
                isDirty: true,
                location: location,
                coordinateString: `${data.position.lat}, ${data.position.lon}`,
                suggestions: []
            });
            mapService.clearPinsFromMap(this.map);
            mapService.addPinToMap(this.map, [data.position.lon, data.position.lat]);
            mapService.setCamera(this.map, [data.position.lon, data.position.lat], 14);

            this.setChanges(location);
        }
        else {            
            if (value.length > 1) {
                mapService.getAutocompleteResults(value)
                    .then((response: any) => {
                        this.setState({
                            ...this.state,
                            suggestions: response.data.results
                        });
                    });
            }

            this.setState({
                ...this.state,
                isDirty: true,
                location: {
                    ...this.state.location,
                    address: value,
                    latitude: undefined,
                    longitude: undefined
                },
                coordinateString: ""
            });            
        }
    }

    onCoordinatesChange(event: any) {
        let values = (event.target.value as string).split(',');

        this.setState({
            ...this.state,
            isDirty: true,
            location: {
                ...this.state.location,
                address: "",
                latitude: values[0] ? parseFloat(values[0]) : undefined,
                longitude: values[1] ? parseFloat(values[1]) : undefined
            },
            coordinateString: event.target.value
        });
    }

    checkNumericInput(event: any) {        
        if (!(event.which == 44 || event.which == 46 ||
            (event.which <= 57 && event.which >= 48))) {
            event.preventDefault();
        }
    }

    setChanges(location: any) {
        const { onChanges } = this.props;        
        onChanges(location);
    }

    render() {
        const { coordinateString, showError, errorKey, suggestions, location } = this.state;        

        return (
            <>
                <Row className="map-widget">
                    <Row>
                        <Col>
                            <Row>
                                <Col lg={5}>
                                    <AutoComplete data={suggestions} value={location!.address}
                                        onChange={this.onAddressChange} textField="address.freeformAddress"
                                        placeholder={localise("TEXT_ENTER_ADDRESS")}
                                        popupSettings={{ className: "suggestions-container" }} />
                                </Col>
                                <Col className="separator-column">
                                    OR
                                </Col>
                                <Col lg={3}>
                                    <Input onChange={this.onCoordinatesChange}
                                        value={coordinateString || ""} placeholder={localise("TEXT_ENTER_COORDINATES")} key={coordinateString + location!.address}
                                        />
                                </Col>
                                <Col>
                                    <ActionButton textKey="BUTTON_SEARCH" color="primary" onClick={this.onSearch}
                                        icon="fa-search" disableDefaultMargin={true} />
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    {
                                        showError && errorKey ?
                                            <small className="text-danger">{localise(errorKey)}</small>
                                            :
                                            <small className="text-muted">{localise("REMARK_SEARCH_LOCATION")}</small>
                                    }
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <br/>
                            <div id="locationSelectionMap"></div>
                        </Col>
                    </Row>
                </Row>
            </>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/shared/components/LocationField/LocationField.tsx