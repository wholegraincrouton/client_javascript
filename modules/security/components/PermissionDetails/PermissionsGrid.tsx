import * as React from "react";
import { Row, Col } from "reactstrap";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { lookupService, permissionService, contextService, localise } from "src/modules/shared/services";

interface Props {
    permissions: string[];
    onChange: (permissions: string[]) => void;
    lookupKey: string;
    excludedLookupKey: string;
    descriptionKey?: string;
    readOnly?: boolean;
    item?: any;
}

interface State {
    permissionData: PermissionGridItem[];
}

interface PermissionGridItem {
    value: string;
    text: string;
    remark: string;
    rowSelected: boolean;
}

export class PermissionsGrid extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.onAllSelectionChange = this.onAllSelectionChange.bind(this);
        this.onPermissionsChange = this.onPermissionsChange.bind(this);

        let permissionLookup = lookupService.getList(props.lookupKey);
        let canViewExcludedPermissions = permissionService.checkIfPermissionExistsForCustomer(
            "VIEW_EXCLUDED_PERMISSIONS", contextService.getCurrentCustomerId());

        if (!canViewExcludedPermissions) {
            let excludedPermissionLookup = lookupService.getList(props.excludedLookupKey);
            permissionLookup = permissionLookup.filter(p => !excludedPermissionLookup.some(e => e.value == p.value));
        }

        this.state = {
            permissionData: permissionLookup.map(l => {
                let item: PermissionGridItem = {
                    value: l.value || '',
                    text: l.text || '',
                    remark: l.remark || '',
                    rowSelected: props.permissions.includes(l.value || '')
                };
                return item;
            })
        }
    }

    onSelectionChange(e: any) {
        const { permissionData } = this.state;
        const isSelected = e.syntheticEvent.target.checked;
        const value = e.dataItem.value;

        let item = permissionData.find(p => p.value == value);

        if (item)
            item.rowSelected = isSelected;

        this.onPermissionsChange(permissionData);
    }

    onAllSelectionChange(e: any) {
        const { permissionData } = this.state;
        const isSelected = e.syntheticEvent.target.checked;

        permissionData.forEach(p => p.rowSelected = isSelected);

        this.onPermissionsChange(permissionData);
    }

    onPermissionsChange(permissionData: PermissionGridItem[]) {
        const { onChange } = this.props;
        onChange(permissionData.filter(p => p.rowSelected).map(p => p.value));

        this.setState({
            ...this.state,
            permissionData: permissionData
        });
    }

    render() {
        const { descriptionKey, readOnly, item } = this.props;
        const { permissionData } = this.state;
        const allSelected = permissionData.every(item => item.rowSelected);
        const isPermittedToEdit = permissionService.isActionPermittedForCustomer(item.id ? 'UPDATE' : 'NEW');

        return (
            <>
                {
                    descriptionKey &&
                    <Row className="mb-3">
                        <Col>
                            <small className="text-muted">{localise(descriptionKey)}</small>
                        </Col>
                    </Row>
                }
                <Row>
                    <Col>
                        <Grid className="permissions-grid" data={permissionData} selectedField="rowSelected"
                            onSelectionChange={this.onSelectionChange} onHeaderSelectionChange={this.onAllSelectionChange}>
                            { (isPermittedToEdit && !readOnly) && <GridColumn field="rowSelected" width="auto" className="checkbox-grid-column"
                                headerClassName="checkbox-grid-column" headerSelectionValue={allSelected}/>}
                            <GridColumn field="text" title={localise('TEXT_PERMISSION')} />
                            <GridColumn field="remark" title={localise('TEXT_DESCRIPTION')} />
                        </Grid>
                    </Col>
                </Row>
            </>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/security/components/PermissionDetails/PermissionsGrid.tsx