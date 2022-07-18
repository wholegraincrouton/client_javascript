import * as React from "react";
import { SearchFilterBox, SearchFilterBoxProps, SearchFilterField } from "../../../shared/components/SearchFilterBox";
import { ItemGroupSearchCriteria } from "../../types/dto";
import { Col, Row } from "reactstrap";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import { contextService } from "src/modules/shared/services";
import { itemGroupService } from "../../services/itemGroup.service";
import AutoCompleteSearchField from "src/modules/shared/components/AutoCompleteSearchField/AutoCompleteSearchField";

export class ItemGroupFilterBox extends SearchFilterBox<ItemGroupSearchCriteria>{
    itemGroupNameList: string[] = [];

    constructor(props: SearchFilterBoxProps) {
        super(props, {
            contextCustomerId: contextService.getCurrentCustomerId(),
            name: '',
            maxItemsPerUser: 'any'
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
        let customerId = contextService.getCurrentCustomerId();
        itemGroupService.getItemGroups(customerId).then(groups => {
            {
                this.itemGroupNameList = [];
                groups.forEach((group) => {
                    this.itemGroupNameList.push(group.name);
                });
            }
        });
    }

    getFields(): JSX.Element {
        const { maxItemsPerUser, name } = this.state;

        return <Row className="filter-fields">
            <Col lg={6} xl={4}>
                <SearchFilterField titleKey="TEXT_ITEM_GROUP_NAME">
                    <AutoCompleteSearchField name="name" value={name} onChange={this.handleChange} data={this.itemGroupNameList} />
                </SearchFilterField>
            </Col>
            <Col lg={6} xl={4}>
                <SearchFilterField titleKey="TEXT_MAX_ITEMS_PER_USER">
                    <LookupDropDown allowAny={true} textAny="TEXT_ANY" name="maxItemsPerUser" value={maxItemsPerUser}
                        lookupKey="LIST_MAXIMUM_KEYS_PER_USER" onChange={this.handleChange} />
                </SearchFilterField>
            </Col>
        </Row>
    }

    validateCriteria(criteria: ItemGroupSearchCriteria): boolean {
        return criteria.contextCustomerId.length > 0 && criteria.maxItemsPerUser.length > 0;
    }
}



// WEBPACK FOOTER //
// ./src/modules/itemGroups/components/ItemGroupManagement/ItemGroupFilterBox.tsx