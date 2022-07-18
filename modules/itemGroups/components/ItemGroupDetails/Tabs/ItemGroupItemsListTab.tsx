import * as React from "react";
import { Row, Col, Card, CardBody, Label, Input } from "reactstrap";
import { GridSortChangeEvent, Grid, GridColumn } from "@progress/kendo-react-grid";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { localise } from "src/modules/shared/services";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { itemGroupService } from "src/modules/itemGroups/services/itemGroup.service";
import { ItemGroupItem } from "src/modules/itemGroups/types/dto";
import { LookupTextCell } from "src/modules/shared/components/DataGrid";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import { ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import CabinetList from "src/modules/cabinet/shared/Cabinet/CabinetList";
import { NumericInput } from "src/modules/shared/components/NumericInput/NumericInput";
import { permissionService } from '../../../../shared/services/permission.service';
import SiteList from "src/modules/sites/shared/SiteList";

interface State {
    items: ItemGroupItem[];
    filteredItems: ItemGroupItem[];
    sort: SortDescriptor[];
    filter: Filter;
}

interface Filter {
    cabinetGroup: string;
    cabinet: string;
    number: string;
    name: string;
    type: string;
    site: string;
}

export class ItemGroupItemsListTab extends React.Component<DetailFormProps, State> {
    constructor(props: DetailFormProps) {
        super(props);

        this.onSort = this.onSort.bind(this);
        this.onRowRender = this.onRowRender.bind(this);
        this.onCabinetGroupFilterChange = this.onCabinetGroupFilterChange.bind(this);
        this.onCabinetSiteChange = this.onCabinetSiteChange.bind(this);
        this.onCabinetNameFilterChange = this.onCabinetNameFilterChange.bind(this);
        this.onItemNoChange = this.onItemNoChange.bind(this);
        this.onItemNameChange = this.onItemNameChange.bind(this);
        this.onItemTypeChange = this.onItemTypeChange.bind(this);
        this.onSearch = this.onSearch.bind(this);

        this.state = {
            items: [],
            filteredItems: [],
            sort: [{ field: "number", dir: "asc" }],
            filter: {
                number: "",
                name: "",
                type: "any",
                cabinet: "any",
                cabinetGroup: "any",
                site: 'any'
            }
        }
    }

    componentDidMount() {
        const { item } = this.props;
        itemGroupService.getItemGroupItems(item.id).then(data => this.setState({ items: data, filteredItems: data }));
    }

    //#region Filter

    onCabinetGroupFilterChange(e: any) {
        this.setState({ ...this.state, filter: { ...this.state.filter, cabinetGroup: e.target.value } });
    }

    onCabinetSiteChange(e: any) {
        this.setState({ ...this.state, filter: { ...this.state.filter, site: e.target.value } });
    }

    onCabinetNameFilterChange(e: any) {
        this.setState({ ...this.state, filter: { ...this.state.filter, cabinet: e.target.value } });
    }

    onItemNoChange(e: any) {
        this.setState({ ...this.state, filter: { ...this.state.filter, number: e.target.value } });
    }

    onItemNameChange(e: any) {
        this.setState({ ...this.state, filter: { ...this.state.filter, name: e.target.value } });
    }

    onItemTypeChange(e: any) {
        this.setState({ ...this.state, filter: { ...this.state.filter, type: e.target.value } });
    }

    onSearch() {
        const { filter, items } = this.state;

        let filteredItems = items.filter(i =>
            (!filter.name || i.name.trim().toLowerCase().includes(filter.name.trim().toLowerCase())) &&
            (!filter.number || i.number.toString().trim().includes(filter.number.trim())) &&
            (filter.type == 'any' || i.type == filter.type) &&
            (filter.cabinet == 'any' || i.cabinetId == filter.cabinet) &&
            (filter.site == 'any' || i.site == filter.site));

        this.setState({ ...this.state, filteredItems: filteredItems });
    }

    //#endregion

    onSort(e: GridSortChangeEvent) {
        this.setState({
            ...this.state,
            sort: e.sort
        })
    }

    onRowRender(tr: any) {
        return React.cloneElement(tr, {
            ...tr.props,
            className: tr.props.className + ' non-selectable-row'
        }, tr.props.children);
    }

    render() {
        const { item } = this.props;
        const { sort, filter, filteredItems } = this.state;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');
        
        return (
            <>
                <Row className="mb-2">
                    <Col>
                        <small className="text-muted">{localise("REMARK_ITEM_LIST")}</small>
                    </Col>
                </Row>
                <Row className="mb-3 filter-box">
                    <Col sm={8} md={7} lg={9} xl={10}>
                        <Row>
                            <Col sm={6} lg={4} xl={3} className="filter-column">
                                <Row>
                                    <Col>
                                        <Label className="system-label mb-0">{localise("TEXT_SITE")}</Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <SiteList customerId={item.customerId} value={filter.site}
                                            onChange={this.onCabinetSiteChange} allowAny={true} />
                                    </Col>
                                </Row>
                            </Col>
                            <Col sm={6} lg={4} xl={3} className="filter-column">
                                <Row>
                                    <Col>
                                        <Label className="system-label mb-0">{localise("TEXT_CABINET")}</Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <CabinetList customerId={item.customerId} value={filter.cabinet} site={filter.site}
                                            onChange={this.onCabinetNameFilterChange} allowAny={true} />
                                    </Col>
                                </Row>
                            </Col>
                            <Col sm={6} lg={4} xl={3} className="filter-column">
                                <Row>
                                    <Col>
                                        <Label className="system-label mb-0">{localise("TEXT_ITEM_NO")}</Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <NumericInput onChange={this.onItemNoChange} value={filter.number} />
                                    </Col>
                                </Row>
                            </Col>
                            <Col sm={6} lg={4} xl={3} className="filter-column">
                                <Row>
                                    <Col>
                                        <Label className="system-label mb-0">{localise("TEXT_ITEM_NAME")}</Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Input onChange={this.onItemNameChange} value={filter.name} />
                                    </Col>
                                </Row>
                            </Col>
                            <Col sm={6} lg={4} xl={3} className="filter-column">
                                <Row>
                                    <Col>
                                        <Label className="system-label mb-0">{localise("TEXT_ITEM_TYPE")}</Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <LookupDropDown lookupKey="LIST_CABINET_ITEM_TYPES" value={filter.type}
                                            onChange={this.onItemTypeChange} allowAny={true} textAny="TEXT_ANY" />
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Col>
                    <Col sm={4} md={5} lg={3} xl={2} className="text-right pl-0">
                        <ActionButton textKey="BUTTON_SEARCH" color="primary" onClick={this.onSearch}
                            icon="fa-search" disableDefaultMargin={true} />
                    </Col>
                </Row>
                <hr />
                {
                    filteredItems.length > 0 ?
                        <Row>
                            <Col>
                                <Grid data={orderBy(filteredItems, sort)}
                                    sort={this.state.sort}
                                    sortable={{ allowUnsort: false, mode: 'single' }}
                                    onSortChange={this.onSort}
                                    rowRender={this.onRowRender}
                                    className={isPermittedToEdit ? "" : "disabled-grid"}>
                                    <GridColumn title={localise("TEXT_ITEM_NO")} field="number" />
                                    <GridColumn title={localise("TEXT_ITEM_NAME")} field="name" />
                                    <GridColumn title={localise("TEXT_ITEM_TYPE")} field="type"
                                        cell={LookupTextCell("LIST_CABINET_ITEM_TYPES")} />
                                    <GridColumn title={localise("TEXT_CABINET")} field="cabinetName" />
                                    <GridColumn title={localise("TEXT_SITE")} field="siteName" />
                                </Grid>
                            </Col>
                        </Row>
                        :
                        <Card className="text-muted text-center mb-0">
                            <CardBody>
                                <span>{localise("ERROR_SEARCH_RESULT")}</span>
                            </CardBody>
                        </Card>
                }
            </>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/itemGroups/components/ItemGroupDetails/Tabs/ItemGroupItemsListTab.tsx