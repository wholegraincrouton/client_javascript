import * as React from "react";
import { SearchFilterBox, SearchFilterBoxProps, SearchFilterField } from "../../../shared/components/SearchFilterBox";
import { UserGroupSearchCriteria } from "../../types/dto";
import { Col, Row } from "reactstrap";
import { contextService } from "src/modules/shared/services";
import AutoCompleteSearchField from "src/modules/shared/components/AutoCompleteSearchField/AutoCompleteSearchField";
import { userGroupService } from "../../services/userGroup.service";

export class UserGroupFilterBox extends SearchFilterBox<UserGroupSearchCriteria>{
    userGroupNameList: string[] = [];
    constructor(props: SearchFilterBoxProps) {
        super(props, {
            contextCustomerId: contextService.getCurrentCustomerId(),
            name: ''
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
        
        userGroupService.getUserGroups(customerId).then(userGroups => {          
            {
                var list: string[] = [];
                userGroups.forEach((userGroup) => {                                    
                    list.push(userGroup.name);    
                });
                this.userGroupNameList = list;
            }               
        });
    }

    getFields(): JSX.Element {
        const { name } = this.state;

        return <Row className="filter-fields">
            <Col lg={6} xl={4}>
                <SearchFilterField titleKey="TEXT_USER_GROUP">
                    <AutoCompleteSearchField name="name" value={name} onChange={this.handleChange} data={this.userGroupNameList} />
                </SearchFilterField>
            </Col>
        </Row>
    }

    validateCriteria(criteria: UserGroupSearchCriteria): boolean {
        return criteria.contextCustomerId.length > 0 ;
    }
}



// WEBPACK FOOTER //
// ./src/modules/userGroups/components/UserGroupManagement/UserGroupFilterBox.tsx