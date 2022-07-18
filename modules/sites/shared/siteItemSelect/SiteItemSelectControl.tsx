import * as React from "react";
import { Row, Col, Card, CardHeader, CardBody, Label, Input } from "reactstrap";
import { Grid, GridColumn, GridSortChangeEvent } from "@progress/kendo-react-grid";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { localise } from "src/modules/shared/services";
import { CabinetDetail, TempItemDetail, TempCabinetDetail, TempSiteDetail } from "../../../cabinet/types/dto";
import { cabinetItemService } from "../../../cabinet/services/cabinet-item.service";
import "./site-item-select.css";
import { ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import AutoCompleteSearchField from "src/modules/shared/components/AutoCompleteSearchField/AutoCompleteSearchField";

interface Props {
    customerId: string;
    selectedCabinets?: CabinetDetail[];
    onChange: (siteCabinetItems: TempSiteDetail[]) => void;
    siteSelectRemark?: string;
    cabinetSelectRemark?: string;
    cabinetItemSelectRemark?: string;
    readonly?: boolean;
    isItemFilterOption?: boolean;
}

interface State {
    siteCabinetItemList?: TempSiteDetail[];
    itemList?: TempItemDetail[];
    filteredItemList?: TempItemDetail[];
    sort: SortDescriptor[];
    itemNameFilter?: string;
    itemNumberFilter?: string;
    
}

export class SiteItemSelectControl extends React.Component<Props, State> {
    itemNameSuggestions?: string[] = [];
    itemNumberSuggestions?: string[] = [];
    constructor(props: Props) {
        super(props);
        this.getSiteItemList = this.getSiteItemList.bind(this);
        this.onCabinetDeselection = this.onCabinetDeselection.bind(this);
        this.onCabinetSelectionChange = this.onCabinetSelectionChange.bind(this);
        this.onAllItemSelectionChange = this.onAllItemSelectionChange.bind(this);
        this.onItemSelectionChange = this.onItemSelectionChange.bind(this);
        this.getAllCabinetCount = this.getAllCabinetCount.bind(this);
        this.getSelectedCabinetCount = this.getSelectedCabinetCount.bind(this);
        this.getSiteSelectionList = this.getSiteSelectionList.bind(this);
        this.getCabinetSelectionList = this.getCabinetSelectionList.bind(this);
        this.onSortChange = this.onSortChange.bind(this);
        this.onSiteSelectionChange = this.onSiteSelectionChange.bind(this);
        this.onItemNameFilterChange = this.onItemNameFilterChange.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.setItemFilterSuggestions = this.setItemFilterSuggestions.bind(this);
        this.onItemNumberFilterChange = this.onItemNumberFilterChange.bind(this);

        this.state = {
            sort: [{ field: 'siteName', dir: 'asc' }]
        };
    }

    componentDidMount() {        
        let { customerId, selectedCabinets } = this.props;
        cabinetItemService.processSiteCabinetItems(customerId, selectedCabinets || [])
            .then((processedCabinetItems) => {
                this.setState({
                    ...this.state,
                    siteCabinetItemList: processedCabinetItems,
                    itemList: this.getSiteItemList(processedCabinetItems),
                    filteredItemList: this.getSiteItemList(processedCabinetItems)
                });
            })
            .catch();
    }

    getSiteItemList(siteCabinetItemList: TempSiteDetail[]) {
        let itemList: TempItemDetail[] = [];
        siteCabinetItemList.forEach(site => {
            if (site.isSelected) {
                site.cabinets.forEach(cabinet => {
                    cabinet.isSelected && cabinet.items && itemList.push(...cabinet.items)
                });
            }
        });
        this.setItemFilterSuggestions(itemList);
        return itemList;
    }

    setItemFilterSuggestions(itemList: TempItemDetail[]) {
        if (itemList && itemList.length > 0) {
            let nameList: string[] = [];

            let maxItemNumber = Math.max.apply(Math, itemList.map(function (obj) { return obj.number }));
            let numberList: string[] = Array.from({ length: maxItemNumber }, (_, i) => `${i + 1}`);

            itemList.forEach(i => {
                if (i.name)
                    nameList.push(i.name)
            });

            this.itemNameSuggestions = nameList;
            this.itemNumberSuggestions = numberList;
        }
    }

    // To deselect cabinets and items only on site deselection
    onSiteDeselection(site: TempSiteDetail) {
        site.cabinets.forEach(cabinet => {
            cabinet.isSelected = false;
            this.onCabinetDeselection(cabinet);
        });
    }

    // To deselect items only on cabinet deselection
    onCabinetDeselection(cabinet: TempCabinetDetail) {
        cabinet.items && cabinet.items.forEach(item => {
            item.isSelected = false;
        });
    }

    onSiteSelectionChange(checked: boolean, isAllSelection: boolean, siteId?: string) {
        const { onChange } = this.props;
        let { siteCabinetItemList } = this.state;
        if (siteCabinetItemList) {
            if (isAllSelection) {
                siteCabinetItemList.forEach(site => {
                    site.isSelected = checked;
                    if (!checked) {
                        this.onSiteDeselection(site);
                    }
                });
            }
            else {
                let site = siteCabinetItemList.find(s => s.siteId == siteId);
                if (site) {
                    site.isSelected = checked;
                    if (!checked) {
                        this.onSiteDeselection(site);
                    }
                }
            }

            this.setState({
                ...this.state,
                siteCabinetItemList: siteCabinetItemList,
                itemList: this.getSiteItemList(siteCabinetItemList),
                filteredItemList: this.getSiteItemList(siteCabinetItemList)
            });

            onChange(siteCabinetItemList);
        }
    }

    onCabinetSelectionChange(checked: boolean, isAllSelection: boolean, cabinetId?: string) {
        const { onChange } = this.props;
        let { siteCabinetItemList } = this.state;
        if (siteCabinetItemList) {
            siteCabinetItemList.forEach((site) => {
                if (site.isSelected) {
                    if (isAllSelection) {
                        site.cabinets.forEach((cabinet) => {
                            cabinet.isSelected = checked;
                            if (!checked) {
                                this.onCabinetDeselection(cabinet);
                            }
                        });
                    }
                    else {
                        let cabinet = site.cabinets.find(c => c.cabinetId == cabinetId);
                        if (cabinet) {
                            cabinet.isSelected = checked;
                            if (!checked) {
                                this.onCabinetDeselection(cabinet);
                            }
                        }
                    }
                }
            });

            this.setState({
                ...this.state,
                siteCabinetItemList: siteCabinetItemList,
                itemList: this.getSiteItemList(siteCabinetItemList),
                filteredItemList: this.getSiteItemList(siteCabinetItemList),
                itemNameFilter: '',
                itemNumberFilter: undefined
            });

            onChange(siteCabinetItemList);
        }
    }

    onAllItemSelectionChange(event: any) {
        const { onChange } = this.props;
        var checked = event.syntheticEvent.target.checked;
        let { siteCabinetItemList } = this.state;

        if (siteCabinetItemList) {
            siteCabinetItemList.forEach((site) => {
                if (site.isSelected) {
                    site.cabinets.forEach((cabinet) => {
                        if (cabinet.isSelected) {
                            cabinet.items && cabinet.items.forEach((item) => item.isSelected = checked);
                        }
                    });
                }
            });

            this.setState({
                ...this.state,
                siteCabinetItemList: siteCabinetItemList,
                itemList: this.getSiteItemList(siteCabinetItemList),
                filteredItemList: this.getSiteItemList(siteCabinetItemList)
            });

            onChange(siteCabinetItemList);
        }
    }

    onItemSelectionChange(event: any) {
        const { onChange } = this.props;
        var checked = event.syntheticEvent.target.checked;
        var dataItem = event.dataItem as TempItemDetail;

        let { siteCabinetItemList } = this.state;

        if (siteCabinetItemList) {
            let site = siteCabinetItemList.find(s => s.siteId == dataItem.siteId);
            if (site) {
                let cabinet = site.cabinets.find(c => c.cabinetId == dataItem.cabinetId);
                if (cabinet && cabinet.items) {
                    let item = cabinet.items.find(i => i.number == dataItem.number);
                    if (item)
                        item.isSelected = checked;
                }
            }

            this.setState({
                ...this.state,
                siteCabinetItemList: siteCabinetItemList,
                itemList: this.getSiteItemList(siteCabinetItemList)
            });

            onChange(siteCabinetItemList);
        }
    }

    getAllCabinetCount(siteCabinetItemList: TempSiteDetail[]) {
        var cabinetCount = 0;
        siteCabinetItemList.forEach((site) => {
            if (site.isSelected) {
                cabinetCount = cabinetCount + site.cabinets.length;
            }
        });
        return cabinetCount;
    }

    getSelectedCabinetCount(siteCabinetItemList: TempSiteDetail[]) {
        var selectedCabinetCount = 0;
        siteCabinetItemList.forEach((site) => {
            if (site.isSelected) {
                site.cabinets.forEach((cabinet) => {
                    if (cabinet.isSelected) {
                        ++selectedCabinetCount;
                    }
                });
            }
        });
        return selectedCabinetCount;
    }

    getSiteSelectionList(siteCabinetItemList: TempSiteDetail[], onSiteSelectionChange: (checked: boolean, isAllSelection: boolean, groupId?: string) => void) {
        let compList = [];
        const { readonly } = this.props;
        if (siteCabinetItemList && siteCabinetItemList.length > 0) {
            siteCabinetItemList.forEach((site: TempSiteDetail) => {
                compList.push(
                    <>
                        <Label className="checkbox" key={site.siteId}>
                            <Input key={site.siteId} type="checkbox" onChange={(e: any) => onSiteSelectionChange(e.target.checked, false, site.siteId)}
                                checked={site.isSelected} disabled={readonly} />
                            {site.siteName}
                        </Label>
                        <br />
                    </>);
            });
        }
        else {
            compList.push(<Label className="norecords" key={"norecords"} >{localise("TEXT_NO_SITES")}</Label>);
        }
        return compList;
    }

    getCabinetSelectionList(siteCabinetItemList: TempSiteDetail[],
        onCabinetSelectionChange: (checked: boolean, isAllSelection: boolean, cabinetId?: string) => void) {
        const { readonly } = this.props;
        let compList = [];
        if (siteCabinetItemList && siteCabinetItemList.length > 0) {
            siteCabinetItemList.forEach((site: TempSiteDetail) => {
                if (site.isSelected) {
                    site.cabinets.forEach((cabinet) => {
                        compList.push(
                            <>
                                <Label className="checkbox" key={cabinet.cabinetId}>
                                    <Input key={cabinet.cabinetId} type="checkbox" onChange={(e: any) => onCabinetSelectionChange(e.target.checked, false, cabinet.cabinetId)}
                                        checked={cabinet.isSelected} disabled={readonly} />
                                    {cabinet.cabinetName}
                                </Label>
                                <br />
                            </>);
                    });
                }
            });
        }
        else {
            compList.push(<Label className="norecords" key={"norecords"}>{localise("TEXT_NO_CABINETS")}</Label>);
        }
        return compList;
    }

    onSortChange(event: GridSortChangeEvent) {
        this.setState({ ...this.state, sort: event.sort })
    }

    onItemNameFilterChange(event: any) {
        this.setState({ ...this.state, itemNameFilter: event.target.value });
        if (!event.target.value) {
            const { itemList } = this.state;
            this.setState({
                filteredItemList: itemList,
                itemNumberFilter: ''
            });
        }
    }

    onItemNumberFilterChange(event: any) {
        if(event.target.value) {
            if (!isNaN(event.target.value)) {
                this.setState({ ...this.state, itemNumberFilter: event.target.value });
            } else {
                this.setState({ ...this.state, itemNumberFilter: '' });
            }
        } else {
            const { itemList } = this.state;
            this.setState({
                filteredItemList: itemList,
                itemNameFilter: ''
            });
        }
    }

    onSearch() {
        const { itemNameFilter, itemNumberFilter, itemList } = this.state;

        if (itemList) {
            let filteredItemList = itemList;

            if (itemNameFilter && itemNumberFilter)
                filteredItemList = itemList.filter(i => i.name && i.name.toLocaleLowerCase().includes(itemNameFilter.toLocaleLowerCase()) && i.number == +itemNumberFilter);
            else if (itemNameFilter && !itemNumberFilter)
                filteredItemList = itemList.filter(i => i.name && i.name.toLocaleLowerCase().includes(itemNameFilter.toLocaleLowerCase()));
            else if (!itemNameFilter && itemNumberFilter)
                filteredItemList = itemList.filter(i => i.name && i.number == +itemNumberFilter);

            this.setState({
                ...this.state,
                filteredItemList: filteredItemList
            });
        }
    }

    render() {
        const { siteSelectRemark, cabinetSelectRemark, cabinetItemSelectRemark, readonly, isItemFilterOption } = this.props;
        const { itemList, filteredItemList, sort, siteCabinetItemList, itemNameFilter, itemNumberFilter } = this.state;
        const isAllItemsSelected = filteredItemList && filteredItemList.every(i => i.isSelected);
        const selectedCabinetCount = this.getSelectedCabinetCount(siteCabinetItemList || []);
        const allCabinetCount = this.getAllCabinetCount(siteCabinetItemList || []);

        return (
            <div className="cabinet-item-select">
                <div className="largeScreen">
                    <Row>
                        <Col xs={5}>
                            <Label className="system-label mb-0"> {localise("TEXT_SITES")} *</Label>
                            <br />
                            {
                                siteSelectRemark &&
                                <small className="text-muted">
                                    {localise(siteSelectRemark)}
                                </small>
                            }
                            {siteSelectRemark && <br />}
                            <small className="color-blue"> ({siteCabinetItemList != undefined && siteCabinetItemList.filter(s => s.isSelected).length || 0}/{
                                siteCabinetItemList != undefined && siteCabinetItemList.length || 0} {localise('TEXT_SELECTED')}) </small>
                            <Card>
                                <CardHeader className="cardHeader bg-blue">
                                    <Label className="allcheckbox">
                                        <Input type="checkbox" onChange={(e: any) => this.onSiteSelectionChange(e.target.checked, true)}
                                            checked={siteCabinetItemList != undefined &&
                                                siteCabinetItemList.length != 0 &&
                                                siteCabinetItemList.filter(s => s.isSelected).length == siteCabinetItemList.length}
                                            disabled={siteCabinetItemList != undefined && siteCabinetItemList.length == 0 || readonly} />
                                        {localise("TEXT_ALL_SITES")}
                                    </Label>
                                </CardHeader>
                                <CardBody className="cardBody">
                                    {
                                        this.getSiteSelectionList(siteCabinetItemList || [], this.onSiteSelectionChange)
                                    }
                                </CardBody>
                            </Card>
                        </Col>
                        <Col xs={2}>
                            <i className="fas fa-caret-right right-arrow color-blue" />
                        </Col>
                        <Col xs={5}>
                            <Label className="system-label mb-0"> {localise("TEXT_CABINETS")} *</Label>
                            <br />
                            {
                                cabinetSelectRemark &&
                                <small className="text-muted">
                                    {localise(cabinetSelectRemark)}
                                </small>
                            }
                            {cabinetSelectRemark && <br />}
                            <small className="color-blue"> ({siteCabinetItemList != undefined && this.getSelectedCabinetCount(siteCabinetItemList) || 0}/{
                                siteCabinetItemList != undefined && this.getAllCabinetCount(siteCabinetItemList) || 0} {localise('TEXT_SELECTED')}) </small>
                            <Card>
                                <CardHeader className="cardHeader bg-blue">
                                    <Label className="allcheckbox">
                                        <Input type="checkbox" onChange={(e: any) => this.onCabinetSelectionChange(e.target.checked, true)}
                                            checked={siteCabinetItemList != undefined &&
                                                allCabinetCount != 0 &&
                                                selectedCabinetCount == allCabinetCount}
                                            disabled={siteCabinetItemList != undefined && siteCabinetItemList.length == 0 || readonly} />
                                        {localise("TEXT_ALL_CABINETS")}
                                    </Label>
                                </CardHeader>
                                <CardBody className="cardBody">
                                    {this.getCabinetSelectionList(siteCabinetItemList || [], this.onCabinetSelectionChange)}
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </div>
                <div className="smallScreen">
                    <Row>
                        <Col xs={6}>
                            <Label className="system-label mb-0"> {localise("TEXT_SITES")} *</Label>
                            <br />
                            {
                                siteSelectRemark &&
                                <small className="text-muted">
                                    {localise(siteSelectRemark)}
                                </small>
                            }
                            {siteSelectRemark && <br />}
                            <small className="color-blue"> ({siteCabinetItemList != undefined && siteCabinetItemList.filter(g => g.isSelected).length || 0}/{
                                siteCabinetItemList != undefined && siteCabinetItemList.length || 0} {localise('TEXT_SELECTED')}) </small>
                            <Card>
                                <CardHeader className="cardHeader bg-blue">
                                    <Label className="allcheckbox">
                                        <Input type="checkbox" onChange={(e: any) => this.onSiteSelectionChange(e.target.checked, true)}
                                            checked={siteCabinetItemList != undefined &&
                                                siteCabinetItemList.length != 0 &&
                                                siteCabinetItemList.filter(g => g.isSelected).length == siteCabinetItemList.length}
                                            disabled={siteCabinetItemList != undefined && siteCabinetItemList.length == 0 || readonly} />
                                        {localise("TEXT_ALL_SITES")}
                                    </Label>
                                </CardHeader>
                                <CardBody className="cardBody">
                                    {
                                        this.getSiteSelectionList(siteCabinetItemList || [], this.onSiteSelectionChange)
                                    }
                                </CardBody>
                            </Card>
                        </Col>
                        <Col xs={6}>
                            <Label className="system-label mb-0"> {localise("TEXT_CABINETS")} *</Label>
                            <br />
                            {
                                cabinetSelectRemark &&
                                <small className="text-muted">
                                    {localise(cabinetSelectRemark)}
                                </small>
                            }
                            {cabinetSelectRemark && <br />}
                            <small className="color-blue"> ({siteCabinetItemList != undefined && this.getSelectedCabinetCount(siteCabinetItemList) || 0}/{
                                siteCabinetItemList != undefined && this.getAllCabinetCount(siteCabinetItemList) || 0} {localise('TEXT_SELECTED')}) </small>
                            <Card>
                                <CardHeader className="cardHeader bg-blue">
                                    <Label className="allcheckbox">
                                        <Input type="checkbox" onChange={(e: any) => this.onCabinetSelectionChange(e.target.checked, true)}
                                            checked={siteCabinetItemList != undefined &&
                                                allCabinetCount != 0 &&
                                                selectedCabinetCount == allCabinetCount}
                                            disabled={siteCabinetItemList != undefined && siteCabinetItemList.length == 0 || readonly} />
                                        {localise("TEXT_ALL_CABINETS")}
                                    </Label>
                                </CardHeader>
                                <CardBody className="cardBody">
                                    {this.getCabinetSelectionList(siteCabinetItemList || [], this.onCabinetSelectionChange)}
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </div>
                <Row>
                    <Col>
                        <Label className="system-label mb-0"> {localise("TEXT_SELECT_ITEMS")} *</Label>
                        <br />
                        {
                            cabinetItemSelectRemark &&
                            <small className="text-muted">
                                {localise(cabinetItemSelectRemark)}
                            </small>
                        }
                    </Col>
                </Row>
                {
                    isItemFilterOption && itemList && itemList.length > 0 &&
                    <Row>
                        <Col className="mb-2 mt-2 filter-box">
                            <Row>
                                <Col sm={6} lg={4}>
                                    <Row>
                                        <Col>
                                            <Label className="system-label mb-0">{localise("TEXT_ITEM_NAME")}</Label>
                                        </Col>
                                    </Row>
                                    <div className="user-usergroup-search">
                                        <AutoCompleteSearchField name="name"
                                            value={itemNameFilter || ''}
                                            onChange={this.onItemNameFilterChange}
                                            data={this.itemNameSuggestions || []}
                                             />
                                    </div>
                                </Col>

                                <Col sm={6} lg={4}>
                                    <Row>
                                        <Col>
                                            <Label className="system-label mb-0">{localise("TEXT_ITEM_NUMBER")}</Label>
                                        </Col>
                                    </Row>
                                    <div className="user-usergroup-search">
                                        <AutoCompleteSearchField
                                            name="name"
                                            value={itemNumberFilter || ''}
                                            onChange={this.onItemNumberFilterChange}
                                            data={this.itemNumberSuggestions || []} />
                                    </div>
                                </Col>
                                <Col sm={6} lg={4} className="item-search-btn">
                                    <ActionButton textKey="BUTTON_SEARCH" color="primary" onClick={this.onSearch}
                                        icon="fa-search" disableDefaultMargin={true} disabled={!itemNameFilter && !itemNumberFilter} />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                }

                <Row>
                    {filteredItemList && filteredItemList.length > 0 ?
                        <Col>
                            <small className="color-blue"> ({filteredItemList.filter(i => i.isSelected).length || 0}/{filteredItemList.length} {localise('TEXT_SELECTED')}) </small>
                            <div className="access-group-select-items responsive-data-grid">
                                <Grid data={orderBy(filteredItemList, sort)} style={{ maxHeight: '230px' }}
                                    sort={sort} onSortChange={this.onSortChange}
                                    sortable={{ allowUnsort: false, mode: 'single' }}
                                    selectedField="isSelected" scrollable="scrollable"
                                    onSelectionChange={this.onItemSelectionChange}
                                    onHeaderSelectionChange={this.onAllItemSelectionChange}
                                    className={readonly ? "disabled-grid" : ""}
                                >
                                    <GridColumn field="isSelected" className="checkbox-grid-column" headerClassName="checkbox-grid-column"
                                        headerSelectionValue={isAllItemsSelected} />
                                    <GridColumn field="siteName" title={localise('TEXT_SITE')} />
                                    <GridColumn field="cabinetName" title={localise('TEXT_CABINET')} />
                                    <GridColumn field="number" title={localise('TEXT_ITEM_NUMBER')} />
                                    <GridColumn field="name" title={localise('TEXT_ITEM_NAME')} />
                                    <GridColumn field="type" title={localise('TEXT_ITEM_TYPE')} />
                                    <GridColumn field="itemGroup" title={localise('TEXT_ITEM_GROUP_NAME')} />
                                </Grid>
                            </div>
                        </Col>
                        :
                        <Col className="text-center">
                            <hr />
                            <Label className="norecords">{localise("TEXT_NO_CABINET_ITEMS_FOUND")}</Label>
                        </Col>
                    }
                </Row>
            </div>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/sites/shared/siteItemSelect/SiteItemSelectControl.tsx