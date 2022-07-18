import * as React from "react";
import { SearchFilterBox, SearchFilterBoxProps, SearchFilterField } from "../../../shared/components/SearchFilterBox";
import { SiteSearchCriteria } from "../../types/dto";
import { contextService } from "../../../shared/services";
import { Col, Row } from "reactstrap";
import AutoCompleteSearchField from "src/modules/shared/components/AutoCompleteSearchField/AutoCompleteSearchField";
import { siteService } from "../../services/site.service";

export class SiteFilterBox extends SearchFilterBox<SiteSearchCriteria>{
    
    siteNameList: string[] = [];
    siteAddressList: string[] = [];

    constructor(props: SearchFilterBoxProps) {
        super(props, {
            name: '',
            address: ''
        });      
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
        siteService.getSites(customerId).then(sites => {          
            {
                this.siteNameList = [];
                this.siteAddressList = [];

                sites.forEach((site) => {    
                    this.siteNameList.push(site.name);     
                    if(site.location && site.location.address != undefined){
                        this.siteAddressList.push(site.location.address);   
                    }                                        
                });
            }               
        }); 
    }

  
    getFields(): JSX.Element {
        const { name, address} = this.state;

        return <Row className="filter-fields">
            <Col lg={6} xl={2}>
                <SearchFilterField titleKey="TEXT_SITE_NAME">
                    <AutoCompleteSearchField name="name" value={name} onChange={this.handleChange} data={this.siteNameList} />
                </SearchFilterField>
            </Col>
            <Col lg={6} xl={2}>
                <SearchFilterField titleKey="TEXT_SITE_ADDRESS">
                    <AutoCompleteSearchField name="address" value={address} onChange={this.handleChange} data={this.siteAddressList} />
                </SearchFilterField>
            </Col>      
        </Row>
    }

    validateCriteria(criteria: SiteSearchCriteria): boolean {
        return true;
    }
}



// WEBPACK FOOTER //
// ./src/modules/sites/components/SiteManagement/SiteFilterBox.tsx