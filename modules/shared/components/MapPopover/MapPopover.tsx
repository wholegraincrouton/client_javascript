import * as React from "react";
import { mapService } from "../../services/map.service";
import { Popup } from "@progress/kendo-react-popup";
import "./map-popover.css";

interface Props {
    location: number[];
    imageURL: string;
}

interface State {
    showPopover: boolean;
}

export class MapPopover extends React.Component<Props, State> {
    anchor: any;
    map: any;

    constructor(props: Props) {
        super(props);
        this.onIconClick = this.onIconClick.bind(this);
        this.onPopupOpen = this.onPopupOpen.bind(this);

        this.state = { showPopover: false };
    }

    componentDidMount() {
        document.body.addEventListener("click", (e: any) => {
            if (!e.target.className.includes("k-popup")) {
                this.setState({
                    showPopover: false
                })
            }
        })
    }

    onIconClick() {
        this.setState({ showPopover: !this.state.showPopover });
    }

    onPopupOpen() {
        this.map = mapService.createMap("popoverMap", this.props.location, 8, true);
        var mapObj = this.map;
        var self = this;
        this.map.events.add('ready', function () {
            mapService.addPinToMap(mapObj, self.props.location);
        });
    }

    render() {
        const { imageURL } = this.props;
        const { showPopover } = this.state;

        return (
            <span>
                <img className="map-icon" onClick={this.onIconClick} src={imageURL} ref={(ref) => { this.anchor = ref; }} />
                <Popup className="map-popover" anchor={this.anchor} show={showPopover} animate={true}
                    anchorAlign={{ horizontal: 'center', vertical: 'center' }} open={this.onPopupOpen}
                    popupAlign={{ horizontal: 'right', vertical: 'top' }} >
                    <div id="popoverMap" />
                </Popup>
            </span>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/shared/components/MapPopover/MapPopover.tsx