import * as React from "react";
import { SearchFilterBox, SearchFilterBoxProps, SearchFilterField } from "../../../shared/components/SearchFilterBox";
import { CabinetSearchCriteria } from "../../types/dto";
import { Col, Row } from "reactstrap";
import { LookupDropDown } from "../../../shared/components/LookupDropDown/LookupDropDown";
import { contextService } from "../../../shared/services";
import FirmwareVersionList from "src/modules/firmware/shared/FirmwareVersionList";
import AutoCompleteSearchField from "src/modules/shared/components/AutoCompleteSearchField/AutoCompleteSearchField";
import { cabinetService } from "../../services/cabinet.service";
import SiteList from "src/modules/sites/shared/SiteList";

export class CabinetFilterBox extends SearchFilterBox<CabinetSearchCriteria>{
    cabinetNameList: string[] = [];
    constructor(props: SearchFilterBoxProps) {
        super(props, {
            name: '',
            itemCount: 0,
            area: 'any',
            firmwareVersion: 'any',
            site: 'any'
        });      

        this.handleItemCountChange = this.handleItemCountChange.bind(this);
    }

    componentDidMount() {
        this.getData();
        super.componentDidMount();
    }

    componentDidUpdate(previousProps: any){
        const previousCustomerId = previousProps.customerId;  
        let customerId = contextService.getCurrentCustomerId();
        if (customerId != previousCustomerId) {
            this.getData();
        }
    }

    getData(){
        let customerId = contextService.getCurrentCustomerId();
        cabinetService.clearCabinetList();
        cabinetService.getCabinets(customerId).then(cabinets => {          
            {
                var list: string[] = [];
                cabinets.forEach((cabinet) => {    
                    list.push(cabinet.name);                             
                });
                this.cabinetNameList = list;
            }               
        });
    }

    handleItemCountChange(event: any) {
        let { name, value } = event.target;
        if (value == 'any') {
            value = 0;
        }
        this.setState({ ...this.state, [name]: value });
    }

    getFields(): JSX.Element {
        const { name, site, area, itemCount, firmwareVersion } = this.state;
        const customerId = contextService.getCurrentCustomerId();

        return <Row className="filter-fields">
            <Col lg={6} xl={2}>
                <SearchFilterField titleKey="TEXT_SITE">
                    <SiteList key={customerId} customerId={customerId} name="site" allowAny={true} value={site} onChange={this.handleChange} />
                </SearchFilterField>
            </Col>
            <Col md={6} lg={2}>
                <SearchFilterField titleKey="TEXT_CABINET">
                    <AutoCompleteSearchField name="name" value={name} onChange={this.handleChange} data={this.cabinetNameList} />
                </SearchFilterField>
            </Col>
            <Col md={6} lg={2}>
                <SearchFilterField titleKey="TEXT_ITEM">
                    <LookupDropDown allowAny={true} textAny="TEXT_ANY" name="itemCount" customerId={customerId} lookupKey="LIST_CABINET_ITEMCOUNTS"
                        value={itemCount == 0 ? 'any' : itemCount.toString()} onChange={this.handleItemCountChange} />
                </SearchFilterField>
            </Col>
            <Col md={6} lg={2}>
                <SearchFilterField titleKey="TEXT_AREA">
                    <LookupDropDown allowAny={true} textAny="TEXT_ANY_AREA" name="area" customerId={customerId} lookupKey="LIST_AREAS"
                        value={area} onChange={this.handleChange} />
                </SearchFilterField>
            </Col>
            <Col lg={6} xl={2}>
                <SearchFilterField titleKey="TEXT_FIRMWARE_VERSION">
                    <FirmwareVersionList name="firmwareVersion" value={firmwareVersion} onChange={this.handleChange}
                        allowAny={true} allowVC={true} filterActive={true} />
                </SearchFilterField>
            </Col>
        </Row>
    }

    validateCriteria(criteria: CabinetSearchCriteria): boolean {
        return criteria.itemCount != undefined && criteria.area.length > 0;
    }
}



// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetManagement/CabinetFilterBox.tsx