import * as React from "react";
import { Row, Col, Input } from "reactstrap";
import { contextService, localise, lookupService } from "src/modules/shared/services";
import { FormField, FormAuditField } from "src/modules/shared/components/Form";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { RoleDropDown } from "../RoleDropDown/RoleDropDown";

interface State {
    role: string;
}

export class RoleDetailsTab extends React.Component<DetailFormProps, State> {
    constructor(props: DetailFormProps) {
        super(props);
        this.onRoleChange = this.onRoleChange.bind(this);
        this.state = { role: props.item.role };
    }

    onRoleChange(e: any, p: any) {
        let role = e.target.value;
        p.onChange(e);
        this.setState({ role: role });
    }

    render() {
        const { item, isNew } = this.props;
        const { role } = this.state;
        const customerId = contextService.getCurrentCustomerId();
        const description = lookupService.getRemark('LIST_ROLES', role);

        return (
            <>
                <Row className="mb-3">
                    <Col>
                        <small className="text-muted">{localise("TEXT_PAGE_DESCRIPTION")}</small>
                    </Col>
                    <Col md="auto">
                        <small className="text-muted">{localise('TEXT_REQUIRED_FIELD')}</small>
                    </Col>
                </Row>
                <FormField name="role" labelKey="TEXT_ROLE" remarksKey="REMARK_ROLE" required={true} disabled={!isNew} component={(props: any) =>
                    <RoleDropDown {...props} customerId={customerId} onChange={(e: any) => this.onRoleChange(e, props)} />} />
                {
                    role &&
                    <FormField name="description" labelKey="TEXT_DESCRIPTION" remarksKey="REMARK_DESCRIPTION"
                        component={() => <Input value={description} disabled />} />
                }

                <FormAuditField updatedOnUtc={item.updatedOnUtc} updatedByName={item.updatedByName} />
            </>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/security/components/PermissionDetails/RoleDetailsTab.tsx