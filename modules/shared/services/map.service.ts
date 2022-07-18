import {
    Map, AuthenticationType, HtmlMarker, Popup, Pixel, data, source,
    layer, getSubscriptionKey, SymbolLayerOptions, control
} from "azure-maps-control";
import { SubscriptionKeyCredential, MapsURL, SearchURL, Aborter } from "azure-maps-rest";
import { configService } from "src/modules/shared/services";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import "node_modules/azure-maps-control/dist/atlas.min.css";

export const mapService =
{
    createMap, createBoundedMap, disposeMap,
    createPopup, removePopup, createDataSource,
    createSymbolLayer, createPoint, createFeature,
    createZoomControl, createSearchURL, addPinToMap,
    clearPinsFromMap, setCamera, addSourceToMap,
    addLayerToMap, showPopup, hidePopup,
    searchAddress, searchCoordinates, getAutocompleteResults
};

function createMap(container: string, center?: data.Position, zoom?: number,
    readonly?: boolean) {
    return new Map(container, {
        center: center,
        zoom: zoom,
        language: 'en-US',
        authOptions: {
            authType: AuthenticationType.subscriptionKey,
            subscriptionKey: configService.getConfigurationValue("AZURE_MAPS_SUBSCRIPTION_KEY")
        },
        interactive: !readonly,
        dragRotateInteraction: false,
        keyboardInteraction: false,
        showLogo: false,
        renderWorldCopies: false
    });
}

function createBoundedMap(container: string, points: data.Position[]) {
    return new Map(container, {
        language: 'en-US',
        authOptions: {
            authType: AuthenticationType.subscriptionKey,
            subscriptionKey: configService.getConfigurationValue("AZURE_MAPS_SUBSCRIPTION_KEY")
        },
        dragRotateInteraction: false,
        keyboardInteraction: false,
        showLogo: false,
        padding: 100,
        renderWorldCopies: false,
        bounds: data.BoundingBox.fromPositions(points)
    });
}

function disposeMap(map: Map) {
    map.dispose();
}

function createPopup(position?: any, content?: HTMLElement | string, pixelOffset?: Pixel, closeButton?: boolean) {
    return new Popup({
        position: position,
        content: content,
        pixelOffset: pixelOffset,
        closeButton: closeButton
    });
}

function removePopup(popup: Popup) {
    popup.remove();
}

function createDataSource() {
    return new source.DataSource();
}

function createSymbolLayer(source: source.DataSource, options: SymbolLayerOptions) {
    return new layer.SymbolLayer(source, undefined, options);
}

function createPoint(coordinates: data.Position) {
    return new data.Point(coordinates);
}

function createFeature(geometry: data.Geometry, properties?: any) {
    return new data.Feature(geometry, properties);
}

function createZoomControl() {
    return new control.ZoomControl();
}

function addPinToMap(map: Map, position: data.Position, color?: string, popup?: Popup) {
    var marker = new HtmlMarker({
        position: position,
        color: color,
        popup: popup
    });
    map.markers.add(marker);
}

function clearPinsFromMap(map: Map) {
    map.markers.clear();
}

function addSourceToMap(map: Map, source: source.Source) {
    map.sources.add(source);
}

function addLayerToMap(map: Map, layer: layer.Layer) {
    map.layers.add(layer);
}

function showPopup(map: Map, popup: Popup) {
    popup && popup.open(map);
}

function hidePopup(popup: any) {
    popup && popup.close();
}

function createSearchURL() {
    var subscriptionKeyCredential = new SubscriptionKeyCredential(getSubscriptionKey());
    var pipeline = MapsURL.newPipeline(subscriptionKeyCredential);
    return new SearchURL(pipeline);
}

function searchAddress(searchURL: SearchURL, address: string) {
    return searchURL.searchAddress(Aborter.timeout(10000), address);
}

function searchCoordinates(searchURL: SearchURL, coordinates: data.Position) {
    return searchURL.searchAddressReverse(Aborter.timeout(10000), coordinates);
}

function setCamera(map: Map, center: data.Position, zoom?: number) {
    map.setCamera({
        center: center,
        zoom: zoom
    });
}

function getAutocompleteResults(query: string) {
    const key = configService.getConfigurationValue("AZURE_MAPS_SUBSCRIPTION_KEY");
    let url = `https://atlas.microsoft.com/search/address/json?typeahead=true&subscription-key=${key}&api-version=1&query=${query}&language=en-US&view=Auto`;

    let requestConfig: AxiosRequestConfig = {
        method: 'get',
        url: url,
        withCredentials: false
    };

    return axios.request(requestConfig)
        .then((response: AxiosResponse) => {
            return response;
        });
}



// WEBPACK FOOTER //
// ./src/modules/shared/services/map.service.ts