import * as React from "react";
import { PermissionSearchCriteria } from "../../types/dto";
import { SearchFilterBox, SearchFilterBoxProps, SearchFilterField } from "../../../shared/components/SearchFilterBox";
import { Row, Col } from "reactstrap";
import { contextService } from "../../../shared/services";
import { ConfiguredRoleDropDown } from "src/modules/security/components/ConfiguredRoleDropDown/ConfiguredRoleDropDown";

export class PermissionFilterBox extends SearchFilterBox<PermissionSearchCriteria> {
    constructor(props: SearchFilterBoxProps) {
        const initialState = {
            role: 'any'
        }
        super(props, initialState);
    }

    getFields(): JSX.Element {
        const { role } = this.state;
        const customerId = contextService.getCurrentCustomerId();

        return <Row>          
            <Col md={6} lg={3}>
                <SearchFilterField titleKey="TEXT_ROLE">
                    <ConfiguredRoleDropDown key={customerId} name="role" customerId={customerId} allowAny={true} 
                        textAny="TEXT_ANY_ROLE" value={role} onChange={this.handleChange} />
                </SearchFilterField>
            </Col>
        </Row>
    }

    validateCriteria(criteria: PermissionSearchCriteria): boolean {
        return criteria.role.length > 0;
    }
}


// WEBPACK FOOTER //
// ./src/modules/security/components/PermissionManagement/PermissionFilterBox.tsx