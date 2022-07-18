import * as React from "react";
import { Input, Row, Col } from "reactstrap";
import { localise } from "src/modules/shared/services";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { FormField, FormAuditField } from "src/modules/shared/components/Form";
import { permissionService } from '../../../../shared/services/permission.service';

export class UserGroupDetailsTab extends React.Component<DetailFormProps> {
    nameInput = (props: any) => <Input {...props} />

    render() {
        const { item } = this.props;
        const isExternalUserGroup = item.externalSystemId ? true : false;
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');

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
                <FormField labelKey={localise("TEXT_USER_GROUP") + " " + localise("TEXT_NAME")} remarksKey="REMARK_USER_GROUP_NAME"
                    name="name" required={true} disabled={!isPermittedToEdit || isExternalUserGroup}
                    tooltip={isExternalUserGroup ? localise("ERROR_CANNOT_EDIT_EXTERNAL_SYSTEM_USERGROUPS") : ""} component={this.nameInput} />
                <FormField labelKey="TEXT_REMARK" remarksKey="REMARK_REMARK"
                    name="remark" required={false} disabled={!isPermittedToEdit || isExternalUserGroup}
                    tooltip={isExternalUserGroup ? localise("ERROR_CANNOT_EDIT_EXTERNAL_SYSTEM_USERGROUPS") : ""} component={Input} />
                <FormAuditField updatedOnUtc={item.updatedOnUtc} updatedByName={item.updatedByName} />
            </>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/userGroups/components/UserGroupDetails/Tabs/UserGroupDetailsTab.tsx