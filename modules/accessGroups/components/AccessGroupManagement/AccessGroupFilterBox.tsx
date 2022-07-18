import * as React from "react";
import { GroupSearchCriteria } from "../../types/dto";
import { SearchFilterBox, SearchFilterBoxProps, SearchFilterField } from "../../../shared/components/SearchFilterBox";
import { Row, Col } from "reactstrap";
import { contextService } from "../../../shared/services";
import AutoCompleteSearchField from "src/modules/shared/components/AutoCompleteSearchField/AutoCompleteSearchField";
import { accessGroupService } from "src/modules/shared/components/AccessGroupList/access-group-list-service";

export class AccessGroupFilterBox extends SearchFilterBox<GroupSearchCriteria> {
    accessGroupNameList: string[] = [];
    constructor(props: SearchFilterBoxProps) {
        super(props, {
            // '*' customer is not allowed for groups.
            contextCustomerId: contextService.getCurrentCustomerId(),
            groupName: '',
        });
    }

    componentDidMount() {
        this.getData();
        super.componentDidMount();
    }

    componentDidUpdate(previousProps: any) {
        const previousCustomerId = previousProps.customerId;
        let customerId = contextService.getCurrentCustomerId();
        if (customerId != previousCustomerId) {
            this.getData();
        }
    }

    getData() {
        accessGroupService.getAccessGroups().then(accessGroups => {
            {
                var list: string[] = [];
                accessGroups.forEach((accessGroup) => {
                    list.push(accessGroup.name);
                });
                this.accessGroupNameList = list;
            }
        });
    }

    getFields(): JSX.Element {
        const { groupName } = this.state;

        return (
            <Row className="filter-fields">               
                <Col lg={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_ACCESSGROUP_NAME">
                        <AutoCompleteSearchField name="groupName" value={groupName} onChange={this.handleChange} data={this.accessGroupNameList} />
                    </SearchFilterField>
                </Col>
            </Row>
        );
    }

    validateCriteria(criteria: GroupSearchCriteria): boolean {
        return criteria.contextCustomerId.length > 0;
    }
}


// WEBPACK FOOTER //
// ./src/modules/accessGroups/components/AccessGroupManagement/AccessGroupFilterBox.tsx