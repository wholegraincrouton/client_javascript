import * as React from "react";
import { Input, Row, Col } from "reactstrap";
import { localise } from "src/modules/shared/services";
import { DetailFormProps } from "src/modules/shared/components/DetailPage";
import { FormField, FormAuditField } from "src/modules/shared/components/Form";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";
import { permissionService } from '../../../../shared/services/permission.service';

export class ItemGroupDetailsTab extends React.Component<DetailFormProps> {
    nameInput = (props: any) => <Input {...props} maxLength={40} />

    render() {
        const { item } = this.props;
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
                <FormField labelKey="TEXT_ITEM_GROUP_NAME" remarksKey="REMARK_ITEM_GROUP_NAME"
                    name="name" required={true} component={this.nameInput} disabled={!isPermittedToEdit}/>
                <FormField labelKey="TEXT_REMARK" remarksKey="REMARK_REMARK"
                    name="remark" required={true} component={Input} disabled={!isPermittedToEdit}/>
                <FormField labelKey="TEXT_MAX_ITEMS_PER_USER" remarksKey="REMARK_MAX_ITEMS_PER_USER"
                    name="maxItemsPerUser" required={true} component={(props: any) =>
                        <LookupDropDown {...props} lookupKey="LIST_MAXIMUM_KEYS_PER_USER" />} disabled={!isPermittedToEdit} />
                <FormAuditField updatedOnUtc={item.updatedOnUtc} updatedByName={item.updatedByName} />
            </>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/itemGroups/components/ItemGroupDetails/Tabs/ItemGroupDetailsTab.tsx