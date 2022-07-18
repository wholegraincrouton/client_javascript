import * as React from "react";
import { Col, Row } from "reactstrap";
import { contextService, lookupService } from "../../../shared/services";
import { SearchFilterBox, SearchFilterBoxProps, SearchFilterField } from "../../../shared/components/SearchFilterBox";
import { LookupItem } from "src/modules/shared/types/dto";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import UserListByRoles from "src/modules/dashboard/shared/UserList";
import { ReportSubscriptionSearchCriteria } from "../../types/dto";

export class ReportSubscriptionFilterBox extends SearchFilterBox<ReportSubscriptionSearchCriteria> {
    excludedReports: LookupItem[];

    constructor(props: SearchFilterBoxProps) {
        const initialState = {
            // '*' customer is not allowed for cabinets.
            contextCustomerId: contextService.getCurrentCustomerId(),
            report: 'any',
            user: 'any'
        }
        super(props, initialState);
        this.excludedReportsFilter = this.excludedReportsFilter.bind(this);
        this.handleUserChange = this.handleUserChange.bind(this);
        this.excludedReports = lookupService.getList("LIST_EXCLUDED_SUBSCRIPTION_REPORTS");
    }

    excludedReportsFilter(item: LookupItem) {
        return !this.excludedReports.find(r => r.value == item.value);
    }

    handleUserChange(event?: any) {
        this.handleChange({ target: { name: event.name, value: event.value } })
    }

    getFields(): JSX.Element {
        const { contextCustomerId, report, user } = this.state;

        return (
            <Row className="filter-fields">
                <Col lg={6} xl={4}>
                    <SearchFilterField titleKey="TEXT_REPORT">
                        <LookupDropDown name="report" customerId={contextCustomerId} lookupKey="LIST_SUBSCRIPTION_REPORTS"
                            value={report} onChange={this.handleChange} filter={this.excludedReportsFilter}
                            allowAny={true} textAny="TEXT_ANY" />
                    </SearchFilterField>
                </Col>
                <Col lg={6} xl={4}>
                    <SearchFilterField titleKey="TEXT_USER">
                        <UserListByRoles name="user" customerId={contextCustomerId} key={contextCustomerId} role='any'
                            value={user} onChange={this.handleUserChange} allowAny={true} textAny="TEXT_ANY" />
                    </SearchFilterField>
                </Col>
            </Row>
        );
    }

    validateCriteria(criteria: ReportSubscriptionSearchCriteria): boolean {
        return criteria.contextCustomerId.length > 0 && criteria.report.length > 0 && criteria.user.length > 0;
    }
}



// WEBPACK FOOTER //
// ./src/modules/subscriptions/components/SubscriptionManagement/SubscriptionFilterBox.tsx