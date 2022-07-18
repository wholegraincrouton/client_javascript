import * as React from "react";
import { Row, Col, Card, CardBody, Label } from "reactstrap";
import { GridSortChangeEvent, Grid, GridColumn } from "@progress/kendo-react-grid";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { contextService, localise } from "src/modules/shared/services";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import { ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { CabinetBasicDetails } from "src/modules/cabinet/types/dto";
import { LocationAddressCell } from "src/modules/shared/components/DataGrid/Cells/LocationAddressCell";
import { cabinetService } from "src/modules/cabinet/services/cabinet.service";
import { AutoComplete } from "@progress/kendo-react-dropdowns";
import { LookupTextCell } from "src/modules/shared/components/DataGrid";

interface State {
    cabinets: CabinetBasicDetails[];
    filteredCabinets: CabinetBasicDetails[];
    sort: SortDescriptor[];
    filter: Filter;
}

interface Filter {
    cabinet: string;
    items: string;
}

export class SiteCabinetsTab extends React.Component<DetailFormProps, State> {
    constructor(props: DetailFormProps) {
        super(props);

        this.onSort = this.onSort.bind(this);
        this.onRowRender = this.onRowRender.bind(this);
        this.onCabinetNameChange = this.onCabinetNameChange.bind(this);
        this.onItemCountChange = this.onItemCountChange.bind(this);
        this.onSearch = this.onSearch.bind(this);

        this.state = {
            cabinets: [],
            filteredCabinets: [],
            sort: [{ field: "name", dir: "asc" }],
            filter: {
                cabinet: "",
                items: "any"
            }
        }
    }

    componentDidMount() {
        const { item } = this.props;
        var customerId = contextService.getCurrentCustomerId();
        cabinetService.clearCabinetList();
        cabinetService.getCabinets(customerId).then((data: CabinetBasicDetails[]) => {
            var cabinetsAtSite = data.filter(a => a.site == item.id);
            this.setState({
                cabinets: cabinetsAtSite,
                filteredCabinets: cabinetsAtSite
            })
        });

    }

    onCabinetNameChange(e: any) {
        this.setState({ ...this.state, filter: { ...this.state.filter, cabinet: e.target.value } });
    }

    onItemCountChange(e: any) {
        this.setState({ ...this.state, filter: { ...this.state.filter, items: e.target.value } });
    }

    onSearch() {
        const { filter, cabinets } = this.state;

        let filteredCabinets = cabinets.filter(c =>
            (!filter.cabinet || c.name.trim().toLowerCase().includes(filter.cabinet.trim().toLowerCase())) &&
            (filter.items == 'any' || c.itemCount.toString() == filter.items));

        this.setState({ ...this.state, filteredCabinets: filteredCabinets });
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
        const { sort, filter, filteredCabinets, cabinets } = this.state;
        const filteredCabinetNames = cabinets.filter(u => u.name.toLowerCase().includes(filter.cabinet.toLowerCase())).map(u => u.name);

        return (
            <>
                <Row className="mb-3 filter-box">
                    <Col sm={8} md={7} lg={9} xl={10}>
                        <Row>
                            <Col sm={6} lg={6} xl={6} className="filter-column">
                                <Row>
                                    <Col>
                                        <Label className="system-label mb-0">{localise("TEXT_CABINET")}</Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <AutoComplete data={filteredCabinetNames} value={filter.cabinet} popupSettings={{ className: 'site-cabinet-name-suggest-popover' }}
                                         onChange={this.onCabinetNameChange} />
                                    </Col>
                                </Row>
                            </Col>
                            <Col sm={6} lg={6} xl={6} className="filter-column">
                                <Row>
                                    <Col>
                                        <Label className="system-label mb-0">{localise("TEXT_ITEM_COUNT")}</Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <LookupDropDown lookupKey="LIST_CABINET_ITEMCOUNTS" value={filter.items}
                                            onChange={this.onItemCountChange} allowAny={true} textAny="TEXT_ANY" />
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
                    filteredCabinets.length > 0 ?
                        <Row>
                            <Col>
                                <Grid data={orderBy(filteredCabinets, sort)}
                                    sort={this.state.sort}
                                    sortable={{ allowUnsort: false, mode: 'single' }}
                                    onSortChange={this.onSort}
                                    rowRender={this.onRowRender}>
                                    <GridColumn title={localise("TEXT_CABINET_NAME")} field="name" />
                                    <GridColumn title={localise("TEXT_ITEM_COUNT")} field="itemCount" />
                                    <GridColumn title={localise("TEXT_DESCRIPTION")} field="description" />
                                    <GridColumn field="address" title={localise("TEXT_ADDRESS")} cell={LocationAddressCell("cabinetLocation")}/>
                                    <GridColumn title={localise("TEXT_AREA")} field="area" cell={LookupTextCell("LIST_AREAS")}/>
                                </Grid>
                            </Col>
                        </Row>
                        :
                        <Card className="text-muted text-center mb-0">
                            <CardBody>
                                <span>{localise("ERROR_CABINET_SITES_SEARCH_RESULT")}</span>
                            </CardBody>
                        </Card>
                }
            </>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/sites/components/SiteDetails/Tabs/SiteCabinetsTab.tsx