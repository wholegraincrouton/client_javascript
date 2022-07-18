import * as React from 'react';
import { Row, Col, Label, Alert } from 'reactstrap';
import { TabStrip, TabStripTab } from '@progress/kendo-react-layout';
import { localise, permissionService } from 'src/modules/shared/services';
import { DetailFormProps } from 'src/modules/shared/components/DetailPage/DetailForm';
import { DetailPage, DetailFormBodyComponent, DetailPageContainer } from '../../../shared/components/DetailPage';
import { PermissionConfig } from '../../types/dto';
import { PermissionsGrid } from './PermissionsGrid';
import { RoleDetailsTab } from './RoleDetailsTab';
import "./role-details.css";
import { SubmissionError } from 'redux-form';

class PermissionDetails extends DetailPage<PermissionConfig> {
    detailFormBody: DetailFormBodyComponent = FormBody;
    listPagePath: string = "/users/permissionmanagement";

    validateItem(item: PermissionConfig): any {
        return {};
    }

    objectToFormValues(permission: PermissionConfig) {
        if (permission.permissions == undefined)
            permission.permissions = [];

        return { ...permission, permissions: JSON.stringify(permission.permissions) };
    }

    formValuesToObject(values: any): PermissionConfig {
        let permissions = JSON.parse(values.permissions);
        return { ...values, permissions };
    }

    beforeSave(item: PermissionConfig): boolean {
        let error = this.validate(item);

        if (error) {
            throw new SubmissionError({
                _error: error
            });
        }
        return true;
    }

    validate(item: PermissionConfig) {
        if (!item.permissions || item.permissions.length == 0) {
            return "PERMISSIONS:ERROR_ROLE_PERMISSIONS_REQUIRED";
        }
        
        return null;
    }

    hideDescriptionHeader() {
        return true;
    }
}

interface State {
    selectedTab: number;
    webPermissions: string[];
    cabinetPermissions: string[];
}

class FormBody extends React.Component<DetailFormProps, State> {
    constructor(props: DetailFormProps) {
        super(props);
        this.onSelectTab = this.onSelectTab.bind(this);
        this.onWebPermissionsChange = this.onWebPermissionsChange.bind(this);
        this.onCabinetPermissionsChange = this.onCabinetPermissionsChange.bind(this);

        const permissions: string[] = props.item.permissions || [];

        this.state = {
            selectedTab: 0,
            webPermissions: permissions.filter(p => !p.startsWith("DEV_CAB")),
            cabinetPermissions: permissions.filter(p => p.startsWith("DEV_CAB"))
        };
    }

    onSelectTab(e: any) {
        this.setState({ ...this.state, selectedTab: e.selected });
    }

    getTabHeader(titleKey: string, hasError: boolean = false, isDisabled: boolean = false) {
        return (
            <>
                <Label className="mt-1 mb-1" title={hasError ? localise("TEXT_ERROR_VERIFY_DATA_TAB") :
                    isDisabled ? localise("TEXT_PLEASE_SAVE_TO_PROCEED") : ""}>
                    {localise(titleKey)} {hasError && <i className="fas fa-exclamation-circle error-tab-icon"></i>}
                </Label>
            </>
        );
    }

    getErrorAlertRow(errorMsg: string) {
        return (
            <Row className="mt-2 mb-2">
                <Col>
                    <Alert className="mb-0" color="danger">
                        <small className="text-danger">{localise(errorMsg)}</small>
                    </Alert>
                </Col>
            </Row>
        );
    }

    onWebPermissionsChange(permissions: string[]) {
        const { cabinetPermissions } = this.state;
        const { change } = this.props;

        let allPermissions = cabinetPermissions.concat(permissions)

        change("permissions", JSON.stringify(allPermissions));
        permissionService.clearRoleList();
        this.setState({
            ...this.state,
            webPermissions: permissions
        });
        
    }

    onCabinetPermissionsChange(permissions: string[]) {
        const { webPermissions } = this.state;
        const { change } = this.props;

        let allPermissions = webPermissions.concat(permissions)

        change("permissions", JSON.stringify(allPermissions));
        permissionService.clearRoleList();
        this.setState({
            ...this.state,
            cabinetPermissions: permissions
        });
    }

    render() {
        const { props } = this;
        const { selectedTab, webPermissions, cabinetPermissions } = this.state;
        const errorTab = props.error && props.error.split(":")[0];
        const errorMsg = props.error && props.error.split(":")[1];

        return (
            <TabStrip className="role-tabs" selected={selectedTab} onSelect={this.onSelectTab} keepTabsMounted={true}>
                <TabStripTab title={this.getTabHeader("TEXT_DETAILS")} contentClassName="role-details-tab">
                    <RoleDetailsTab {...props} />
                </TabStripTab>
                <TabStripTab title={this.getTabHeader("TEXT_PERMISSIONS_FOR_WEB", errorTab == "PERMISSIONS")}
                    contentClassName="role-web-permissions-tab">
                    {errorTab == "PERMISSIONS" && this.getErrorAlertRow(errorMsg)}
                    <PermissionsGrid permissions={webPermissions} onChange={this.onWebPermissionsChange}
                        lookupKey="LIST_WEB_PERMISSIONS" excludedLookupKey="LIST_EXCLUDED_WEB_PERMISSIONS"
                        descriptionKey="REMARK_WEB_PERMISSIONS" readOnly={props.item.isExternalRole} 
                        item={props.item}/>
                </TabStripTab>
                <TabStripTab title={this.getTabHeader("TEXT_PERMISSIONS_FOR_CABINET", errorTab == "PERMISSIONS")}
                    contentClassName="role-cabinet-permissions-tab">
                    {errorTab == "PERMISSIONS" && this.getErrorAlertRow(errorMsg)}
                    <PermissionsGrid permissions={cabinetPermissions} onChange={this.onCabinetPermissionsChange}
                        lookupKey="LIST_CABINET_PERMISSIONS" excludedLookupKey="LIST_EXCLUDED_CABINET_PERMISSIONS"
                        descriptionKey="REMARK_CABINET_PERMISSIONS" readOnly={props.item.isExternalRole}
                        item={props.item}/>
                </TabStripTab>
            </TabStrip>
        );
    }
}

export default DetailPageContainer(PermissionDetails, "PermissionDetails", "permissions");



// WEBPACK FOOTER //
// ./src/modules/security/components/PermissionDetails/PermissionDetails.tsx