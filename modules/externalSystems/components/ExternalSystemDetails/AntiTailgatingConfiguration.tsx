import * as React from "react";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { CabinetDetail, TempSiteDetail } from "src/modules/cabinet/types/dto";
import { store } from "src/redux/store";
import { formValueSelector } from "redux-form";
import { Row, Col, Label, Input } from "reactstrap";
import { localise, permissionService } from "src/modules/shared/services";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import { AntiTailgatingStatus } from "../../types/dto";
import { cabinetItemService } from "src/modules/cabinet/services/cabinet-item.service";
import { SiteItemSelectControl } from "src/modules/sites/shared/siteItemSelect/SiteItemSelectControl";

interface State {
    antiTailgatingStatus: string;
    itemsetName: string;
    selectedCabinets?: CabinetDetail[];
}

export class AntiTailgatingConfiguration extends React.Component<DetailFormProps, State> {
    constructor(props: DetailFormProps) {
        super(props);
        this.onAntiTailgatingStatusChange = this.onAntiTailgatingStatusChange.bind(this);
        this.onItemsetNameChange = this.onItemsetNameChange.bind(this);
        this.onCabinetItemsChange = this.onCabinetItemsChange.bind(this);

        const selector = formValueSelector(this.props.form);
        const formState = store.getState();
        var selectedCabinets = selector(formState, 'antiTailgatingItemset');
        var antiTailgatingStatus = selector(formState, 'antiTailgatingStatus');
        var itemsetName = selector(formState, 'antiTailgatingItemsetName');

        this.state = {
            selectedCabinets: selectedCabinets,
            antiTailgatingStatus: antiTailgatingStatus,
            itemsetName: itemsetName
        };
    }

    onAntiTailgatingStatusChange(e: any) {
        const { item } = this.props;

        let value = e.target.value;
        let name = value == AntiTailgatingStatus.Active ? this.state.itemsetName || localise("TEXT_ANTI_TAILGATING_ITEM_SET") : '';
        let displayName = value == AntiTailgatingStatus.Active ?
            this.state.itemsetName || localise("TEXT_ANTI_TAILGATING_ITEM_SET") : this.state.itemsetName;

        this.props.change("antiTailgatingStatus", value);
        this.props.change("antiTailgatingItemsetName", name);

        if (value == AntiTailgatingStatus.Inactive)
            this.props.change("tempSiteDetails", []);
        else
            cabinetItemService.processSiteCabinetItems(item.customerId, this.state.selectedCabinets || [])
                .then((cabinetItems) => {
                    this.props.change("tempSiteDetails", cabinetItems);
                });

        this.setState({ ...this.state, antiTailgatingStatus: value, itemsetName: displayName });
    }

    onItemsetNameChange(e: any) {
        let value = e.target.value;
        this.props.change("antiTailgatingItemsetName", value);
        this.setState({ ...this.state, itemsetName: value });
    }

    onCabinetItemsChange(sites: TempSiteDetail[]) {
        this.props.change("tempSiteDetails", sites);

        let selectedCabinets: CabinetDetail[] = [];

        sites.forEach(site => {
            if (site.isSelected) {
                site.cabinets.forEach(cabinet => {
                    if (cabinet.isSelected && cabinet.items) {
                        let itemIndexes: number[] = [];
                        cabinet.items.forEach(i => {
                            if (i.isSelected)
                                itemIndexes.push(i.number);
                        });
                        selectedCabinets.push({ cabinetId: cabinet.cabinetId, itemIndexes: itemIndexes })
                    }
                });
            }
        });

        this.setState({ ...this.state, selectedCabinets: selectedCabinets });
    }

    render() {
        const { item } = this.props;
        const { antiTailgatingStatus, itemsetName, selectedCabinets } = this.state;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');

        return (
            <>
                <Row className="mt-2 mb-3">
                    <Col>
                        <small className="text-muted">{localise("REMARK_ANTI_TAILGATING")}</small>
                    </Col>
                </Row>
                <Row className="mt-2 mb-3">
                    <Col>
                        <Row className="mb-3">
                            <Col xs={2} className="pt-1">
                                <Label className="system-label">{localise('TEXT_ANTI_TAILGATING_STATUS')}</Label>
                            </Col>
                            <Col>
                                <Row>
                                    <Col xs={6}>
                                        <LookupDropDown lookupKey="LIST_ANTI_TAILGATING_STATUS" disabled={!isPermittedToEdit}
                                            value={antiTailgatingStatus} onChange={this.onAntiTailgatingStatusChange} />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <small className="text-muted">{localise("REMARK_ANTI_TAILGATING_STATUS")}</small>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col xs={2} className="pt-1">
                                <Label className="system-label">{localise('TEXT_ITEM_SET_NAME')}</Label>
                            </Col>
                            <Col>
                                <Row>
                                    <Col xs={6}>
                                        <Input value={itemsetName} onChange={this.onItemsetNameChange} maxLength={40}
                                            disabled={antiTailgatingStatus == AntiTailgatingStatus.Inactive || !isPermittedToEdit} />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <small className="text-muted">{localise("REMARK_ITEM_SET_NAME")}</small>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col xs={2} className="pt-1">
                                <Label className="system-label">{localise('TEXT_VIRTUAL_ENTRY_READER')}</Label>
                            </Col>
                            <Col>
                                <Row>
                                    <Col xs={6}>
                                        <Input value={itemsetName && `${itemsetName} - ${localise("TEXT_ENTRY_READER")}`} disabled />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <small className="text-muted">{localise("REMARK_VIRTUAL_ENTRY_READER")}</small>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={2} className="pt-1">
                                <Label className="system-label">{localise('TEXT_VIRTUAL_EXIT_READER')}</Label>
                            </Col>
                            <Col>
                                <Row>
                                    <Col xs={6}>
                                        <Input value={itemsetName && `${itemsetName} - ${localise("TEXT_EXIT_READER")}`} disabled />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <small className="text-muted">{localise("REMARK_VIRTUAL_EXIT_READER")}</small>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                {
                    antiTailgatingStatus == AntiTailgatingStatus.Active &&
                    <Row>
                        <Col>
                            <SiteItemSelectControl customerId={item.customerId} selectedCabinets={selectedCabinets} readonly={!isPermittedToEdit}
                                onChange={this.onCabinetItemsChange} siteSelectRemark="REMARK_ANTI_TAILGATING_SITE_SELECT"
                                cabinetSelectRemark="REMARK_ANTI_TAILGATING_CABINET_SELECT" cabinetItemSelectRemark="REMARK_ANTI_TAILGATING_CABINET_ITEMS_SELECT" />
                        </Col>
                    </Row>
                }
            </>
        );
    }
}


// WEBPACK FOOTER //
// ./src/modules/externalSystems/components/ExternalSystemDetails/AntiTailgatingConfiguration.tsx