import * as React from "react";
import { Row, Col, Label, Card, CardHeader, Input, CardBody } from "reactstrap";
import { localise } from "src/modules/shared/services";
import { ListItem } from "src/modules/shared/types/dto";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { cabinetService } from "src/modules/cabinet/services/cabinet.service";
import { permissionService } from '../../../../shared/services/permission.service';
import { Site } from "src/modules/sites/types/dto";
import { siteService } from "src/modules/sites/services/site.service";
import { CabinetBasicDetails } from "src/modules/cabinet/types/dto";

interface Props {
    customerId: string;
    cabinetIds: string[];
}

interface State {
    selectedCabinets: string[];
    selectedSites: string[];
}

interface TempSiteCabinets {
    siteId: string,
    siteName: string,
    cabinets: any[],
    isSelected?: boolean
}

export class DeviceUpdateCabinetsTab extends React.Component<DetailFormProps & Props, State> {
    cabinets: ListItem[] = [];
    sites: Site[] = [];
    allCabinets: CabinetBasicDetails[] = [];

    constructor(props: DetailFormProps & Props) {
        super(props);
        this.onAllSiteSelectionChange = this.onAllSiteSelectionChange.bind(this);
        this.onAllCabinetSelectionChange = this.onAllCabinetSelectionChange.bind(this);
        this.onSiteSelectionChange = this.onSiteSelectionChange.bind(this);
        this.onCabinetSelectionChange = this.onCabinetSelectionChange.bind(this);

        this.state = {
            selectedCabinets: [],
            selectedSites: []
        }
    }

    componentDidMount() {

        siteService.getSites(this.props.customerId)
            .then((sites) => {
                cabinetService.getCabinets(this.props.customerId)
                    .then((cabinets) => {
                        let selectedSites: string[] = [];
                        let selectedCabinets: string[] = [];
                        let self = this;
                        this.allCabinets = cabinets;
                        let tempSiteCabinetsList: TempSiteCabinets[] = [];
                        
                        sites = sites.filter(s => cabinets.some(c => c.site === s.id));
                        this.sites = sites;

                        cabinets.forEach(cabinet => {
                            let site = sites.find(s => s.id == cabinet.site);
                            if (site && site.id) {
                                let tempSiteCabinets: TempSiteCabinets = {
                                    siteId: site.id,
                                    siteName: site.name,
                                    cabinets: cabinets.filter(cabinet => cabinet.site === site!.id)
                                }
                                tempSiteCabinetsList.push(tempSiteCabinets)
                            }

                            if (self.props.cabinetIds.includes(cabinet.id)) {
                                selectedCabinets.push(cabinet.id);

                                if (!selectedSites.includes(cabinet.site)) {
                                    selectedSites.push(cabinet.site);
                                }
                            }
                            if(selectedSites.includes(cabinet.site)) {
                                this.cabinets.push(cabinet);
                            }
                        });

                        if(selectedSites.length < 1 && sites && sites.length > 0) {
                            selectedSites.push(sites[0].id);
                            cabinets.forEach(cabinet => {
                                if(!this.cabinets.some(c => c.id === cabinet.id) && cabinet.site === selectedSites[0]){
                                    this.cabinets.push(cabinet);
                                }
                            });
                        }

                        this.setState({
                            ...this.state,
                            selectedSites: selectedSites,
                            selectedCabinets: selectedCabinets
                        });
                    });
            });
    }

    onAllSiteSelectionChange(e: any) {
        let checked = e.target.checked;

        this.cabinets = checked ? this.allCabinets.filter(c => this.sites.some(s => s.id === c.site)) : [];

        let newSelectedCabinets = checked ? this.state.selectedCabinets : [];

        this.setState({
            ...this.state,
            selectedSites: checked ? this.sites.map(s => {return s.id}) : [],
            selectedCabinets: newSelectedCabinets
        });

        this.props.change("cabinetIds", newSelectedCabinets);
    }

    onAllCabinetSelectionChange(e: any) {
        let checked = e.target.checked;

        let newSelectedCabinets = checked ? this.cabinets.map(cg => { return cg.id; }) : [];

        this.setState({
            ...this.state,
            selectedCabinets: checked ? this.cabinets.map(cg => { return cg.id; }) : []
        });

        this.props.change("cabinetIds", newSelectedCabinets);
    }

    onSiteSelectionChange(e: any, id: string) {
        const { selectedCabinets, selectedSites } = this.state;
        let checked = e.target.checked;

        let site = this.sites.find(s => s.id == id);

        if (site) {
            this.cabinets = checked ? [...this.cabinets, ...this.allCabinets.filter(c => c.site == site!.id)] :
                [...this.cabinets.filter(c => { return !(site && this.allCabinets.filter(c => c.site == site!.id).some(i => i.id == c.id)) })];

            let newSelectedCabinets = checked ? selectedCabinets : [...selectedCabinets.filter((c) => {
                return !(site && this.allCabinets.filter(c => c.site == site!.id).some(i => i.id == c));
            })];

            this.setState({
                ...this.state,
                selectedSites: checked ? [...selectedSites, id] : [...selectedSites.filter(s => { return s != id })],
                selectedCabinets: newSelectedCabinets
            });

            this.props.change("cabinetIds", newSelectedCabinets);
        }
    }

    onCabinetSelectionChange(e: any, id: string) {
        const { selectedCabinets } = this.state;
        let checked = e.target.checked;

        let newSelectedCabinets = checked ? [...selectedCabinets, id] : [...selectedCabinets.filter(c => { return c != id })];

        this.setState({
            ...this.state,
            selectedCabinets: newSelectedCabinets
        });

        this.props.change("cabinetIds", newSelectedCabinets);
    }

    render() {
        const { selectedCabinets, selectedSites } = this.state;
        const { readonly } = this.props;
        const { item } = this.props;

        let sitesCount = this.sites.length;
        let cabinetCount = this.cabinets.length;
        let selectedSitesCount = selectedSites.length;
        let selectedCabinetCount = selectedCabinets.length;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');

        return (
            <>
                <Row className="mb-3">
                    <Col>
                        <small className="text-muted">{localise("REMARK_DEVICEUPDATE_CABINETS")}</small>
                    </Col>
                </Row>
                <div className="largeScreen">
                    <Row>
                        <Col xs={5}>
                            <Label className="system-label mb-0">{localise("TEXT_SITES")} *</Label>
                            <br />
                            <small className="text-muted">{localise("REMARK_SITE_SELECT")}</small>
                            <br />
                            <small className="color-blue">({selectedSitesCount}/{sitesCount} {localise('TEXT_SELECTED')})</small>
                            <Card>
                                <CardHeader className="bg-blue">
                                    <Label className="checkbox-all">
                                        <Input type="checkbox" checked={sitesCount > 0 && sitesCount == selectedSitesCount}
                                            onChange={this.onAllSiteSelectionChange} disabled={readonly || sitesCount == 0 || !isPermittedToEdit} />
                                        {localise("TEXT_ALL_SITES")}
                                    </Label>
                                </CardHeader>
                                {
                                    sitesCount == 0 ?
                                        <CardBody><Label className="norecords" key={"norecords"} >{localise("TEXT_NO_SITES")}</Label></CardBody>
                                        :
                                        <CardBody>
                                            {
                                                this.sites.map(s => {
                                                    return (
                                                        <>
                                                            <Label className="checkbox" key={s.id}>
                                                                <Input key={s.id} type="checkbox" checked={selectedSites.includes(s.id)}
                                                                    onChange={(e: any) => this.onSiteSelectionChange(e, s.id)}
                                                                    disabled={readonly || !isPermittedToEdit} />
                                                                {s.name}
                                                            </Label>
                                                            <br />
                                                        </>
                                                    );
                                                })
                                            }
                                        </CardBody>
                                }
                            </Card>
                        </Col>
                        <Col xs={2}>
                            <i className="fas fa-caret-right right-arrow color-blue" />
                        </Col>
                        <Col xs={5}>
                            <Label className="system-label mb-0">{localise("TEXT_CABINETS")} *</Label>
                            <br />
                            <small className="text-muted">{localise("REMARK_CABINETS_SELECT")}</small>
                            <br />
                            <small className="color-blue">({selectedCabinetCount}/{cabinetCount} {localise('TEXT_SELECTED')})</small>
                            <Card>
                                <CardHeader className="bg-blue">
                                    <Label className="checkbox-all">
                                        <Input type="checkbox" checked={cabinetCount > 0 && cabinetCount == selectedCabinetCount}
                                            onChange={this.onAllCabinetSelectionChange} disabled={readonly || cabinetCount == 0 || !isPermittedToEdit} />
                                        {localise("TEXT_ALL_CABINETS")}
                                    </Label>
                                </CardHeader>
                                {
                                    sitesCount == 0 ?
                                        <CardBody><Label className="norecords" key={"norecords"}>{localise("TEXT_NO_CABINETS")}</Label></CardBody>
                                        :
                                        <CardBody>
                                            {
                                                this.cabinets.map(c => {
                                                    return (
                                                        <>
                                                            <Label className="checkbox" key={c.id}>
                                                                <Input key={c.id} type="checkbox" checked={selectedCabinets.includes(c.id)}
                                                                    onChange={(e: any) => this.onCabinetSelectionChange(e, c.id)} disabled={readonly || !isPermittedToEdit} />
                                                                {c.name}
                                                            </Label>
                                                            <br />
                                                        </>
                                                    );
                                                })
                                            }
                                        </CardBody>
                                }

                            </Card>
                        </Col>
                    </Row>
                </div>
                <div className="smallScreen">
                    <Row>
                        <Col xs={6}>
                            <Label className="system-label mb-0">{localise("TEXT_SITES")} *</Label>
                            <br />
                            <small className="text-muted">{localise("REMARK_SITES_SELECT")}</small>
                            <br />
                            <small className="color-blue">({selectedSitesCount}/{sitesCount} {localise('TEXT_SELECTED')})</small>
                            <Card>
                                <CardHeader className="bg-blue">
                                    <Label className="checkbox-all">
                                        <Input type="checkbox" checked={sitesCount > 0 && sitesCount == selectedSitesCount}
                                            onChange={this.onAllSiteSelectionChange} disabled={readonly || sitesCount == 0 || !isPermittedToEdit} />
                                        {localise("TEXT_ALL_SITES")}
                                    </Label>
                                </CardHeader>
                                {
                                    sitesCount == 0 ?
                                        <CardBody><Label className="norecords" key={"norecords"} >{localise("TEXT_NO_SITES")}</Label></CardBody>
                                        :
                                        <CardBody>
                                            {
                                                this.sites.map(s => {
                                                    return (
                                                        <>
                                                            <Label className="checkbox" key={s.id}>
                                                                <Input key={s.id} type="checkbox" checked={selectedSites.includes(s.id)}
                                                                    onChange={(e: any) => this.onSiteSelectionChange(e, s.id)}
                                                                    disabled={readonly || !isPermittedToEdit} />
                                                                {s.name}
                                                            </Label>
                                                            <br />
                                                        </>
                                                    );
                                                })
                                            }
                                        </CardBody>
                                }
                            </Card>
                        </Col>
                        <Col xs={6}>
                            <Label className="system-label mb-0">{localise("TEXT_CABINETS")} *</Label>
                            <br />
                            <small className="text-muted">{localise("REMARK_CABINETS_SELECT")}</small>
                            <br />
                            <small className="color-blue">({selectedCabinetCount}/{cabinetCount} {localise('TEXT_SELECTED')})</small>
                            <Card>
                                <CardHeader className="bg-blue">
                                    <Label className="checkbox-all">
                                        <Input type="checkbox" checked={cabinetCount > 0 && cabinetCount == selectedCabinetCount}
                                            onChange={this.onAllCabinetSelectionChange} disabled={readonly || cabinetCount == 0 || !isPermittedToEdit} />
                                        {localise("TEXT_ALL_CABINETS")}
                                    </Label>
                                </CardHeader>
                                {
                                    sitesCount == 0 ?
                                        <CardBody><Label className="norecords" key={"norecords"}>{localise("TEXT_NO_CABINETS")}</Label></CardBody>
                                        :
                                        <CardBody>
                                            {
                                                this.cabinets.map(c => {
                                                    return (
                                                        <>
                                                            <Label className="checkbox" key={c.id}>
                                                                <Input key={c.id} type="checkbox" checked={selectedCabinets.includes(c.id)}
                                                                    onChange={(e: any) => this.onCabinetSelectionChange(e, c.id)} disabled={readonly || !isPermittedToEdit} />
                                                                {c.name}
                                                            </Label>
                                                            <br />
                                                        </>
                                                    );
                                                })
                                            }
                                        </CardBody>
                                }
                            </Card>
                        </Col>
                    </Row>
                </div>
            </>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/deviceUpdates/components/DeviceUpdateDetails/Tabs/DeviceUpdateCabinetsTab.tsx