import * as React from 'react';
import * as qs from "query-string";
import { History } from 'history';
import { localise, customerService, permissionService } from 'src/modules/shared/services';
import { mapService } from 'src/modules/shared/services/map.service';
import { CabinetSnapshot } from 'src/modules/dashboard/types/dto';
import '../dashboard.css';

interface Props {
    customerId?: string;
    site?: string
    cabinetId?: string
    cabinetList?: CabinetSnapshot[];
    history: History;
}

export class CabinetMapWidget extends React.Component<Props> {
    map: any;

    constructor(props: Props) {
        super(props);
        this.constructMap = this.constructMap.bind(this);
        this.onMapReady = this.onMapReady.bind(this);
        this.navigateToCreateNewCabinet = this.navigateToCreateNewCabinet.bind(this);
        this.navigateToCabinetDetails = this.navigateToCabinetDetails.bind(this);
        this.navigateToCabinetManagement = this.navigateToCabinetManagement.bind(this);
    }

    componentDidMount() {
        this.constructMap();
    }

    componentDidUpdate() {
        this.constructMap();
    }

    navigateToCreateNewCabinet() {
        var customerId = this.props.customerId;
        var site = this.props.site;

        let newCabinetCriteria: any = {};
        Object.assign(newCabinetCriteria, {
            contextCustomerId: customerId,
            site: site,
            listQuery: qs.stringify({
                contextCustomerId: customerId,
                site: site, name: '', includeDeleted: false, country: 'any', state: 'any', area: 'any',
            })
        });

        this.props.history.push({
            pathname: "/cabinet/cabinetmanagement/new",
            search: qs.stringify(newCabinetCriteria)
        });
    }

    navigateToCabinetDetails() {
        var searchParam = Object.assign({ ['contextCustomerId']: this.props.customerId });
        const criteria = qs.parse(this.props.history.location.search);

        var cabinetWithoutAddress: any = this.props.cabinetList &&
            this.props.cabinetList.find((item: any) => item.latitude == undefined && item.longitude == undefined);

        this.props.history.push({
            pathname: "/cabinet/cabinetmanagement/" + cabinetWithoutAddress.cabinetId,
            search: qs.stringify(Object.assign(criteria, searchParam))
        });
    }

    navigateToCabinetManagement() {
        var searchParam = Object.assign(
            { ['area']: "any" },
            { ['contextCustomerId']: this.props.customerId },
            { ['site']: this.props.site },
            { ['includeDeleted']: false },
            { ['itemCount']: 0 },
            { ['name']: "" },
            { ['firmwareVersion']: "any" });

        const criteria = qs.parse(this.props.history.location.search);

        this.props.history.push({
            pathname: "/cabinet/cabinetmanagement",
            search: qs.stringify(Object.assign(criteria, searchParam))
        });
    }

    //#region Map-related functions

    constructMap() {
        const { cabinetList } = this.props;

        if (this.map)
            mapService.disposeMap(this.map);

        if (cabinetList && cabinetList.some((item) => item.latitude != undefined && item.longitude != undefined)) {
            let positions: any[] = [];

            for (let cabinet of cabinetList) {
                if (cabinet.latitude && cabinet.longitude &&
                    !positions.some(p => p[0] == cabinet.longitude && p[1] == cabinet.latitude))
                    positions.push([cabinet.longitude, cabinet.latitude]);
            }

            if (positions.length == 1) {
                this.map = mapService.createMap('dashboardCabinetMap', [positions[0][0], positions[0][1]], 14, false);
            }
            else {
                this.map = mapService.createBoundedMap('dashboardCabinetMap', positions);
            }
        }
        else {
            this.map = mapService.createMap('dashboardCabinetMap', undefined, 1, false);
        }

        this.map.controls.add(mapService.createZoomControl(), { position: "bottom-right" });
        this.map.events.add('ready', this.onMapReady);
    }

    onMapReady() {
        const { customerId, cabinetList } = this.props;
        var mapObj = this.map;
        var self = this;

        if (cabinetList) {
            var dataSource = mapService.createDataSource();
            mapService.addSourceToMap(mapObj, dataSource);

            cabinetList.forEach((item) => {
                if (item.latitude && item.longitude)
                    dataSource.add(mapService.createFeature(mapService.createPoint([item.longitude, item.latitude]),
                        {
                            name: item.cabinetName,
                            siteName: item.siteName,
                            customer: customerService.getCustomerName(customerId || ''),
                            address: item.address,
                            itemCount: item.itemCount,
                            overdueCount: item.overdueItemCount,
                            alarmStatus: item.activeAlarmCount,
                            markerColor: (item.activeAlarmCount > 0) ? "marker-red" : "marker-blue",
                            isConnected: item.isConnected ? localise("TEXT_YES") : localise("TEXT_NO"),
                        }));
            });

            var symbolLayer = mapService.createSymbolLayer(dataSource, {
                iconOptions: {
                    image: [
                        'case',
                        ['has', 'markerColor'],
                        ['get', 'markerColor'],
                        'marker-blue'
                    ],
                    allowOverlap: true,
                    ignorePlacement: true
                }
            });
            mapService.addLayerToMap(mapObj, symbolLayer);

            var popup: any;

            mapObj.events.add('mouseover', symbolLayer,
                (e: any) => {
                    if (e.shapes && e.shapes.length > 0) {
                        var coordinate = e.shapes[0].getCoordinates();

                        if (popup)
                            mapService.removePopup(popup);

                        popup = mapService.createPopup(
                            coordinate, self.getPopupContent(e.shapes), [0, -18], false);
                        mapService.showPopup(mapObj, popup);

                        if (popup) {
                            document.getElementsByClassName('popup-container')[0]
                                .addEventListener('mouseleave', () => mapService.hidePopup(popup));

                            var map = document.getElementById('dashboardCabinetMap');

                            if (map)
                                map.addEventListener('mouseleave', () => mapService.hidePopup(popup));
                        }
                    }
                });
            mapObj.events.add('mousedown',
                () => mapService.hidePopup(popup));
            mapObj.events.add('wheel',
                () => mapService.hidePopup(popup));
        }
    }

    getPopupContent(points: any[]) {
        var content = '';

        for (var i = 0; i < points.length; i++) {
            var properties = points[i].getProperties();
            content = content.concat(`
                <div class="point-content">
                    <div class="title">${properties.name}</div>
                    <div><b>${localise("TEXT_SITE")}</b>: ${properties.siteName}</div>
                    <div><b>${localise("TEXT_CUSTOMER")}</b>: ${properties.customer}</div>
                    <div><b>${localise("TEXT_ADDRESS")}</b>: ${properties.address}</div>
                    <div><b>${localise("TEXT_ITEM_COUNT")}</b>: ${properties.itemCount}</div>
                    <div><b>${localise("TEXT_OVERDUE_ITEM_COUNT")}</b>: ${properties.overdueCount}</div>
                    <div><b>${localise("TEXT_ACTIVE_ALARMS")}</b>: ${properties.alarmStatus}</div>
                    <div><b>${localise("TEXT_ONLINE")}</b>: ${properties.isConnected}</div>
                </div>
            `);

            if (i != points.length - 1)
                content = content.concat(`<hr class="mt-0 mb-0" />`);
        }

        return `<div class="popup-content">${content}</div>`;
    }

    //#endregion

    render() {
        const { customerId, cabinetList } = this.props;

        return <>
            <CabinetAddressInfo customerId={customerId} cabinetList={cabinetList}
                navigateToCreateNewCabinet={this.navigateToCreateNewCabinet}
                navigateToCabinetDetails={this.navigateToCabinetDetails}
                navigateToCabinetManagement={this.navigateToCabinetManagement} />
            <OfflineCabinetInfo cabinetList={cabinetList} navigateToCabinetManagement={this.navigateToCabinetManagement} />
            <div id="dashboardCabinetMap"></div>
        </>;
    }
}

const OfflineCabinetInfo = (props: any) => {
    const { cabinetList, navigateToCabinetManagement } = props;
    var offlineCabinets = cabinetList && cabinetList.filter((item: any) => !item.isConnected);

    // when only one cabinet is offline
    if (offlineCabinets && offlineCabinets.length == 1) {
        return (
            <div className="message-red">
                <a onClick={navigateToCabinetManagement} className="clickable">
                    <img src="/images/svg/offline.svg" className="mr-2" height={12} />
                    1 {localise("REMARK_CABINET_OFFLINE")}
                </a>
            </div>
        );
    }
    // when multiple cabinets are offline
    else if (offlineCabinets && offlineCabinets.length > 1) {
        return (
            <div className="message-red">
                <a onClick={navigateToCabinetManagement} className="clickable">
                    <img src="/images/svg/offline.svg" className="mr-2" height={12} />
                    {offlineCabinets.length} {localise("REMARK_CABINETS_OFFLINE")}
                </a>
            </div>
        );
    }

    return null;
}

const CabinetAddressInfo = (props: any) => {
    const { customerId, cabinetList, navigateToCreateNewCabinet, navigateToCabinetDetails, navigateToCabinetManagement } = props;
    var cabinetWithoutAddress = cabinetList &&
        cabinetList.filter((item: any) => item.latitude == undefined && item.longitude == undefined);

    //when only one cabinet does not have address details
    if (cabinetWithoutAddress && cabinetWithoutAddress.length == 1) {
        var localiseTextSplit = localise("TEXT_MAP_WHEN_ONE_CABINET_ADDRESS_NOT_FOUND").split("#CabinetName");
        let content = (
            <>
                <i className="fas fa-map-marker-alt mr-2" />
                {localiseTextSplit[0]} {cabinetWithoutAddress[0].cabinetName} {localiseTextSplit[1]}
            </>
        );

        return (
            <div className="message-red">
                {
                    permissionService.checkIfPermissionExistsForCustomer("CABINET_UPDATE", customerId) ?
                        <a onClick={navigateToCabinetDetails} className="clickable">{content}</a> : content
                }
            </div>
        );
    }
    //when multiple cabinets do not have address details
    else if (cabinetWithoutAddress && cabinetWithoutAddress.length > 1) {
        var localiseTextSplit = localise("TEXT_MAP_WHEN_MULTIPLE_CABINETS_ADDRESS_NOT_FOUND").split("#Count");

        return (
            <div className="message-red" >
                <a onClick={navigateToCabinetManagement} className="clickable" >
                    <i className="fas fa-map-marker-alt mr-2" />
                    {cabinetWithoutAddress.length.toString()} {localiseTextSplit[1]}
                </a>
            </div>
        );
    }
    //when no cabinet found
    else if (cabinetList && cabinetList.length === 0) {
        let text = localise("TEXT_MAP_WHEN_NO_CABINET_FOUND");
        return (
            <div className="message-red">
                {
                    permissionService.checkIfPermissionExistsForCustomer("CABINET_NEW", customerId) ?
                        <a className="clickable" onClick={navigateToCreateNewCabinet}>{text}</a> : text
                }
            </div>
        );
    }

    return null;
}


// WEBPACK FOOTER //
// ./src/modules/dashboard/widgets/CabinetMapWidget.tsx