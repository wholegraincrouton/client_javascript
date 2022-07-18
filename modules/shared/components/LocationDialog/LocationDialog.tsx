import * as React from "react";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Row, Col, Input, Label } from "reactstrap";
import { localise, globalDirtyService } from "src/modules/shared/services";
import { BackButton, SaveButton, ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { mapService } from "../../services/map.service";
import { AutoComplete } from "@progress/kendo-react-dropdowns";
import { Location } from "src/modules/shared/types/dto";

interface Props {
    location: Location;
    onBackClick?: () => void;
    onSaveClick?: (location: Location) => void;
}

interface State {
    isDirty: boolean;
    location: Location;
    coordinateString: string;
    showError: boolean;
    errorKey?: string;
    suggestions?: any[];
}

export class LocationDialog extends React.Component<Props, State> {
    map: any;
    searchURL: any;

    constructor(props: Props) {
        super(props);
        this.onAddressChange = this.onAddressChange.bind(this);
        this.onCoordinatesChange = this.onCoordinatesChange.bind(this);
        this.onBack = this.onBack.bind(this);
        this.onSave = this.onSave.bind(this);
        this.onMapClick = this.onMapClick.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.searchAddress = this.searchAddress.bind(this);
        this.searchCoordinates = this.searchCoordinates.bind(this);
        this.dirtyPageHandler = this.dirtyPageHandler.bind(this);

        var location = this.props.location;
        this.state = {
            isDirty: false,
            showError: false,
            location: location,
            coordinateString: (location.latitude && location.longitude) ?
                location.latitude + ", " + location.longitude : ""
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
        const { location } = this.props;

        if (this.map)
            mapService.disposeMap(this.map);

        var center = location.longitude && location.latitude ? [location.longitude, location.latitude] : undefined;
        var zoom = location.longitude && location.latitude ? 14 : 0;
        this.map = mapService.createMap('locationSelectionMap', center, zoom, false);
        this.map.controls.add(mapService.createZoomControl(), { position: "bottom-right" });
        this.searchURL = mapService.createSearchURL();

        if (location.address && location.latitude && location.longitude) {
            var mapObj = this.map;

            this.map.events.add('ready', function () {
                mapService.addPinToMap(mapObj, [location.longitude || 80, location.latitude || 0]);
            });
        }

        this.map.events.add('click', this.onMapClick);
    }

    onBack() {
        const { onBackClick } = this.props;
        const { isDirty } = this.state;

        if (onBackClick) {
            if (isDirty) {
                globalDirtyService.showDirtyConfirmation(() => {
                    window.removeEventListener("beforeunload", this.dirtyPageHandler);
                    onBackClick();
                })
                return;
            }
            onBackClick();
        }
    }

    onSave() {
        const { location } = this.state;
        const { onSaveClick } = this.props;

        window.removeEventListener("beforeunload", this.dirtyPageHandler);
        onSaveClick && onSaveClick(location);
    }

    onMapClick(e: any) {
        this.searchCoordinates([e.position[0], e.position[1]]);
    }

    onSearch() {
        const { location, coordinateString } = this.state;

        if ((!location.address && !coordinateString) || (coordinateString && coordinateString.split(',').length != 2)) {
            this.setState({
                ...this.state,
                showError: true,
                errorKey: "ERROR_CABINET_LOCATION_INVALID"
            });
            return;
        }

        if (location.address && !coordinateString) {
            this.searchAddress(location.address);
        }
        else if (!location.address && coordinateString && location.longitude && location.latitude) {
            this.searchCoordinates([location.longitude, location.latitude], true);
        }
    }

    searchAddress(address: string) {
        mapService.searchAddress(this.searchURL, address)
            .then((response) => {
                if (response.results) {
                    var result = response.results[0];

                    if (result.position && result.position.lat && result.position.lon) {
                        this.setState({
                            ...this.state,
                            showError: false,
                            isDirty: true,
                            location: {
                                ...this.state.location,
                                latitude: result.position.lat,
                                longitude: result.position.lon
                            },
                            coordinateString: result.position.lat + ", " + result.position.lon
                        });
                        mapService.clearPinsFromMap(this.map);
                        mapService.addPinToMap(this.map, [result.position.lon, result.position.lat]);
                        mapService.setCamera(this.map, [result.position.lon, result.position.lat], 14);
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
                        this.setState({
                            ...this.state,
                            showError: false,
                            isDirty: true,
                            location: {
                                ...this.state.location,
                                address: result.address.freeformAddress,
                                latitude: latitude,
                                longitude: longitude
                            },
                            coordinateString: `${latitude}, ${longitude}`
                        });
                        mapService.clearPinsFromMap(this.map);
                        mapService.addPinToMap(this.map, [longitude, latitude]);

                        if (setCamera)
                            mapService.setCamera(this.map, [longitude, latitude], 14);
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

            this.setState({
                ...this.state,
                showError: false,
                isDirty: true,
                location: {
                    ...this.state.location,
                    address: value,
                    latitude: data.position.lat,
                    longitude: data.position.lon
                },
                coordinateString: `${data.position.lat}, ${data.position.lon}`,
                suggestions: []
            });
            mapService.clearPinsFromMap(this.map);
            mapService.addPinToMap(this.map, [data.position.lon, data.position.lat]);
            mapService.setCamera(this.map, [data.position.lon, data.position.lat], 14);
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

    render() {
        const { location, coordinateString, showError, errorKey, suggestions } = this.state;

        return (
            <Dialog className="site-location-dialog">
                <Row>
                    <Col>
                        <BackButton onClick={this.onBack} />
                        <SaveButton onClick={this.onSave} disabled={!this.state.isDirty} />
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <Row style={{ marginLeft: -5 }}>
                            <Col>
                                <Label className="system-label">{localise('TEXT_SEARCH_LOCATION')}</Label>
                            </Col>
                        </Row>
                        <Row style={{ marginLeft: 5 }}>
                            <Col lg={5}>
                                <AutoComplete data={suggestions} value={location.address || ""}
                                    onChange={this.onAddressChange} textField="address.freeformAddress"
                                    placeholder={localise("TEXT_ENTER_ADDRESS")}
                                    popupSettings={{ className: "suggestions-container" }} />
                            </Col>
                            <Col className="separator-column">
                                OR
                            </Col>
                            <Col lg={3}>
                                <Input onKeyPress={this.checkNumericInput} onChange={this.onCoordinatesChange}
                                    value={coordinateString || ""} placeholder={localise("TEXT_ENTER_COORDINATES")} />
                            </Col>
                            <Col>
                                <ActionButton textKey="BUTTON_SEARCH" color="primary" onClick={this.onSearch}
                                    icon="fa-search" disableDefaultMargin={true} />
                            </Col>
                        </Row>
                        <Row style={{ marginLeft: 5 }}>
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
                        <div id="locationSelectionMap"></div>
                    </Col>
                </Row>
            </Dialog>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/shared/components/LocationDialog/LocationDialog.tsx