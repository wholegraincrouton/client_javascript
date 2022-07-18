import * as React from "react";
import { Col, Row } from "reactstrap";
import { CustomerSearchCriteria } from "../../types/dto";
import { SearchFilterBox, SearchFilterBoxProps, SearchFilterField } from "../../../shared/components/SearchFilterBox";
import { applicationService } from "src/modules/shared/services";
import AutoCompleteSearchField from "src/modules/shared/components/AutoCompleteSearchField/AutoCompleteSearchField";

export class CustomerFilterBox extends SearchFilterBox<CustomerSearchCriteria> {
    customerList: string[] = [];
    constructor(props: SearchFilterBoxProps) {
        super(props, {
            name: '',
        });
    }

    componentDidMount() {
        this.getData();
        super.componentDidMount();
    }

    getData() {
        applicationService.customerList.forEach(customer => {
            this.customerList.push(customer.name);
        });
    }

    getFields(): JSX.Element {
        const { name } = this.state;
        return <Row className="filter-fields">
            <Col lg={6} xl={3}>
                <SearchFilterField titleKey="TEXT_CUSTOMER">
                    <AutoCompleteSearchField name="name" value={name} onChange={this.handleChange} data={this.customerList} />
                </SearchFilterField>
            </Col>
        </Row>
    }

    validateCriteria(): boolean {
        return true;
    }
}


// WEBPACK FOOTER //
// ./src/modules/customers/components/CustomerManagement/CustomerFilterBox.tsx