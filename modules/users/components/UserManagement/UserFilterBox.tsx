import * as React from "react";
import { Col, Row } from "reactstrap";
import { UserSearchCriteria } from "../../types/dto";
import { LookupDropDown } from "../../../shared/components/LookupDropDown/LookupDropDown";
import { SearchFilterBox, SearchFilterBoxProps, SearchFilterField } from "../../../shared/components/SearchFilterBox";
import { RoleFilter } from "src/modules/shared/components/RoleFilter/RoleFilter";
import { contextService } from "src/modules/shared/services";
import { userService } from "src/modules/users/services/user.service";
import AutoCompleteSearchField from "src/modules/shared/components/AutoCompleteSearchField/AutoCompleteSearchField";

export class UserFilterBox extends SearchFilterBox<UserSearchCriteria>{
    userNameList: string[] = [];
    userEmailList: string[] = [];
    userMobileList: string[] = [];

    constructor(props: SearchFilterBoxProps) {
        super(props, {
            name: '',
            role: 'any',
            email: '',
            mobileNumber: ''
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
        userService.getUsers(customerId, false).then(users => {
            {
                this.userNameList = [];
                this.userEmailList = [];
                this.userMobileList = [];

                users.forEach((user) => {
                    this.userNameList.push(user.name);
                    if (user.email != undefined && user.email !== "") {
                        this.userEmailList.push(user.email)
                    }
                    if (user.mobileNumber != undefined && user.mobileNumber !== "") {
                        this.userMobileList.push(user.mobileNumber)
                    }
                });
            }
        });
    }

    getFields(): JSX.Element {
        const { role, name, email, mobileNumber } = this.state;
        const customerId = contextService.getCurrentCustomerId();

        return <Row className="filter-fields">
            <Col lg={6} xl={3}>
                <SearchFilterField titleKey="TEXT_ROLE">
                    <LookupDropDown allowAny={true} textAny="TEXT_ANY_ROLE" name="role" customerId={customerId}
                        lookupKey={"LIST_ROLES"} value={role} onChange={this.handleChange} filter={RoleFilter} />
                </SearchFilterField>
            </Col>
            <Col lg={6} xl={3}>
                <SearchFilterField titleKey="TEXT_NAME">
                    <AutoCompleteSearchField name="name" value={name} onChange={this.handleChange} data={this.userNameList} />
                </SearchFilterField>
            </Col>
            <Col lg={6} xl={3}>
                <SearchFilterField titleKey="TEXT_EMAIL">
                    <AutoCompleteSearchField name="email" value={email} onChange={this.handleChange} data={this.userEmailList} />
                </SearchFilterField>

            </Col>
            <Col lg={6} xl={3}>
                <SearchFilterField titleKey="TEXT_MOBILE">
                    <AutoCompleteSearchField name="mobileNumber" value={mobileNumber} onChange={this.handleChange} data={this.userMobileList} />
                </SearchFilterField>
            </Col>
        </Row>
    }

    validateCriteria(criteria: UserSearchCriteria): boolean {
        return criteria.role.length > 0;
    }
}


// WEBPACK FOOTER //
// ./src/modules/users/components/UserManagement/UserFilterBox.tsx