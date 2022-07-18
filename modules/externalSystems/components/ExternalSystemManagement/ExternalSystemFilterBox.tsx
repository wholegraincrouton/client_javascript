import * as React from "react";
import { Row, Col } from "reactstrap";
import { SearchFilterBox, SearchFilterBoxProps, SearchFilterField } from "src/modules/shared/components/SearchFilterBox";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import { contextService } from "src/modules/shared/services";
import { ExternalSystemSearchCriteria } from "../../types/dto";
import "./../../external-systems.css";

export class ExternalSystemFilterBox extends SearchFilterBox<ExternalSystemSearchCriteria>{
    constructor(props: SearchFilterBoxProps) {

        const initialState = {
            // '*' customer is not allowed for cabinets.
            contextCustomerId: contextService.getCurrentCustomerId(),
            integrationSystem: 'any',
            integrationStatus: 'any'
        }

        super(props, initialState);
    }

    getFields(): JSX.Element {
        const { contextCustomerId, integrationSystem, integrationStatus } = this.state;

        return <Row className="filter-fields">          
            <Col lg={6} xl={2}>
                <SearchFilterField titleKey="TEXT_INTEGRATION_SYSTEM">
                    <LookupDropDown name="integrationSystem" lookupKey="LIST_INTEGRATION_SYSTEMS" customerId={contextCustomerId}
                        value={integrationSystem} onChange={this.handleChange} allowAny={true} textAny="TEXT_ANY_SYSTEM" />
                </SearchFilterField>
            </Col>
            <Col lg={6} xl={2}>
                <SearchFilterField titleKey="TEXT_INTEGRATION_STATUS">
                    <LookupDropDown name="integrationStatus" lookupKey="LIST_INTEGRATION_STATUS" customerId={contextCustomerId}
                        value={integrationStatus} onChange={this.handleChange} allowAny={true} textAny="TEXT_ANY_STATUS" />
                </SearchFilterField>
            </Col>
        </Row>
    }

    validateCriteria(criteria: ExternalSystemSearchCriteria): boolean {
        return criteria.contextCustomerId.length > 0
            && criteria.integrationSystem.length > 0
            && criteria.integrationStatus.length > 0;
    }
}



// WEBPACK FOOTER //
// ./src/modules/externalSystems/components/ExternalSystemManagement/ExternalSystemFilterBox.tsx