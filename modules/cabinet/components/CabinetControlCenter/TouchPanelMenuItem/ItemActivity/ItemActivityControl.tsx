import * as React from "react";
import Row from "reactstrap/lib/Row";
import Button from "reactstrap/lib/Button";
import { StoreState } from "src/redux/store";
import { connect } from "react-redux";
import { cabinetControlCenterActions } from "src/modules/cabinet/actions/cabinet-control-center.actions";
import { VirtualCabinetItem } from "src/modules/cabinet/types/store";
import { touchScreenCommonService } from "../../shared/touch-screen-util.service";
import Col from "reactstrap/lib/Col";
import { TouchScreenMode, CabinetItemStatus } from "src/modules/cabinet/types/dto";
import { cabinetItemStatusService } from "../../shared/cabinet-item-status.service";
import { History } from "history"
import { navService } from "src/modules/shared/services";

export interface Props {
    items?: VirtualCabinetItem[];
    loggedInUserId?: string;
    touchScreenMode?: TouchScreenMode;
    blinkItem: (index?: number) => void;
    triggerMulticustodyLogin: (item: VirtualCabinetItem, previousTouchScreenMode: TouchScreenMode) => void;
    switchTouchScreenMode: (touchScreenMode: TouchScreenMode, callbackFunc: () => void, item?: VirtualCabinetItem) => void;
    triggerTouchScreenInteraction: (callbackFunc: () => void, loggedInUserId?: string) => void;
    history: History;
}

export interface LocalState {
    lastViewedRecordsCount: number;
}

class ItemActivityControl extends React.Component<Props, LocalState>
{
    pageSize: number = 10;

    constructor(props: Props) {
        super(props);
        this.onKeyClick = this.onKeyClick.bind(this);
        this.scrollUp = this.scrollUp.bind(this);
        this.scrollDown = this.scrollDown.bind(this);
        this.redirectBackToCabinetList = this.redirectBackToCabinetList.bind(this);

        this.state = {
            lastViewedRecordsCount: 0,
        }
    }

    redirectBackToCabinetList() {
        navService.goBackToListPage("/cabinet/cabinetmanagement", this.props.history);
    }

    onKeyClick(e: any) {
        const { items, touchScreenMode, loggedInUserId } = this.props;
        let data = e.target.value.split(':');
        let index = data[0];

        if (touchScreenMode == TouchScreenMode.ITEM_HISTORY) {
            let item = items && items.find(i => i.itemIndex == index);
            this.props && this.props.switchTouchScreenMode(TouchScreenMode.ITEM_HISTORY_ITEM, () => this.redirectBackToCabinetList(), item);
        }
        else {
            this.props.blinkItem(undefined);
            if (items) {
                var thisVar = this;

                //Reset the selected key after 2 seconds
                setTimeout(function () {
                    thisVar.props.blinkItem(undefined);
                }, 2000);

                this.props.blinkItem(index);

                let selectedItem = items.find(item => item.itemIndex == index);
                if (selectedItem && touchScreenMode != undefined && selectedItem.status == CabinetItemStatus.MultiCustody && selectedItem.multiCustodyWitnessCount && selectedItem.multiCustodyWitnessCount > 0) {
                    this.props.triggerMulticustodyLogin(selectedItem, touchScreenMode);
                }
                this.props.triggerTouchScreenInteraction(() => this.redirectBackToCabinetList, loggedInUserId);
            }
        }
    }

    generateKeys() {
        var filteredItems = this.getFilteredItems();

        if (filteredItems == undefined)
            return null;

        const availableItems = filteredItems.filter((k) => {return k.status !=CabinetItemStatus.Disabled})

        var rows = []
        for (let i = this.state.lastViewedRecordsCount; i < (this.state.lastViewedRecordsCount + this.pageSize); i++) {
            var key = availableItems[i];

            if (key) {   
                let buttonColor = touchScreenCommonService.getItemButtonColor(key);

                rows.push(
                    <Row key={'key-row-' + i} className="mb-2 ml-2 mr-2 text-truncate">
                        <Button key={'key-' + i} style={{ width: '100%', backgroundColor: buttonColor, borderColor: buttonColor }}
                            value={key.itemIndex + ':' + key.hardwareId} onClick={this.onKeyClick}>
                            {key.name == '' ? key.itemIndex : key.name}
                        </Button>
                    </Row>
                )
            }
        }
        return rows;
    }

    scrollUp() {
        var lastViewRecordCount = this.state.lastViewedRecordsCount;
        if (lastViewRecordCount - this.pageSize >= 0)
            this.setState({ lastViewedRecordsCount: lastViewRecordCount - this.pageSize });
    }

    scrollDown() {
        var lastViewRecordCount = this.state.lastViewedRecordsCount;

        var filteredItems = this.getFilteredItems();

        if (lastViewRecordCount + this.pageSize < (filteredItems == undefined
            ? 0 : filteredItems.length))
            this.setState({ lastViewedRecordsCount: lastViewRecordCount + this.pageSize });
    }

    getFilteredItems() {
        const { items } = this.props

        if (items == undefined)
            return items;

        const filteredItems = items.filter(this.itemsFilterPredicateFunc, this);
        return filteredItems;
    }

    itemsFilterPredicateFunc(item: VirtualCabinetItem) {
        const { touchScreenMode } = this.props
        return cabinetItemStatusService.isItemShownInTouchScreen(item, touchScreenMode)
    }

    render() {
        var filteredItems = this.getFilteredItems();
        var filteredItemsCount = filteredItems && filteredItems.length;

        return <div>
            {this.generateKeys()}
            <Row style={{ textAlign: "center" }}>
                <Col className="col-sm-12 col-md-6 offset-md-3">
                    {(filteredItemsCount == undefined ? 0 : filteredItemsCount > (this.state.lastViewedRecordsCount + this.pageSize))
                        && <i style={{ cursor: "pointer" }} className="fas fa-caret-down fa-3x" onClick={() => { this.scrollDown(); }}></i>}
                    {
                        (this.state.lastViewedRecordsCount - this.pageSize >= 0)
                        && <i style={{ cursor: "pointer" }} className="fas fa-caret-up fa-3x" onClick={() => { this.scrollUp(); }}></i>
                    }
                </Col>
            </Row>
        </div>
    }
}
const mapStateToProps = (store: StoreState) => {
    const { loggedInUserId, items, touchScreenMode } = store.cabinetSimulation
    return { loggedInUserId, items, touchScreenMode };
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        blinkItem: (index: number) => dispatch(cabinetControlCenterActions.blinkItem(index)),
        triggerTouchScreenInteraction: (callbackFunc: () => void, loggedInUserId?: string) => dispatch(cabinetControlCenterActions.triggerTouchScreenInteraction(() => callbackFunc(), loggedInUserId)),
        triggerMulticustodyLogin: (item: VirtualCabinetItem, previousTouchScreenMode: TouchScreenMode) =>
            dispatch(cabinetControlCenterActions.triggerMultiCustodyLogin(item, previousTouchScreenMode)),
        switchTouchScreenMode: (touchScreenMode: TouchScreenMode, callbackFunc: () => void, item?: VirtualCabinetItem) =>
            dispatch(cabinetControlCenterActions.switchTouchScreenMode(touchScreenMode, () => callbackFunc(), item))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ItemActivityControl)




// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetControlCenter/TouchPanelMenuItem/ItemActivity/ItemActivityControl.tsx