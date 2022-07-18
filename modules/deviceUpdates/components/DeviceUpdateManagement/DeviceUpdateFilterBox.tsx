import * as React from "react";
import { SearchFilterBox, SearchFilterBoxProps, SearchFilterField } from "../../../shared/components/SearchFilterBox";
import { DeviceUpdateSearchCriteria } from "../../types/dto";
import { Col, Row, Input } from "reactstrap";
import { contextService } from "../../../shared/services";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";

export class DeviceUpdateFilterBox extends SearchFilterBox<DeviceUpdateSearchCriteria>{

    constructor(props: SearchFilterBoxProps) {
        const initialState = {
            // '*' customer is not allowed for device updates.
            contextCustomerId: contextService.getCurrentCustomerId(),
            label: '',
            type: 'any'
        }
        super(props, initialState);
    }

    getFields(): JSX.Element {
        const { label, type } = this.state;

        return <Row className="filter-fields">            
            <Col lg={6} xl={3}>
                <SearchFilterField titleKey="TEXT_UPDATELABEL">
                    <Input name="label" maxLength={100} value={label} onChange={this.handleChange} />
                </SearchFilterField>
            </Col>
            <Col lg={6} xl={3}>
                <SearchFilterField titleKey="TEXT_UPDATETYPE">
                    <LookupDropDown name="type" lookupKey="LIST_DEVICEUPDATE_TYPES" value={type}
                        allowAny={true} textAny="TEXT_ANY" onChange={this.handleChange} />
                </SearchFilterField>
            </Col>
        </Row>
    }

    validateCriteria(criteria: DeviceUpdateSearchCriteria): boolean {
        return criteria.contextCustomerId.length > 0;
    }
}



// WEBPACK FOOTER //
// ./src/modules/deviceUpdates/components/DeviceUpdateManagement/DeviceUpdateFilterBox.tsx