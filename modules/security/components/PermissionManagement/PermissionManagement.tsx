import * as React from 'react';
import { GridColumn } from '@progress/kendo-react-grid';
import { SearchPage, SearchPageContainer } from '../../../shared/components/SearchPage';
import { localise } from '../../../shared/services';
import { SortDescriptor } from '@progress/kendo-data-query';
import { PermissionFilterBox } from './PermissionFilterBox';
import { PermissionSearchCriteria } from '../../types/dto';
import { DataGrid, DateTimeFormatCell } from '../../../shared/components/DataGrid';
import { RoleLookupTextCell } from '../RoleLookupTextCell/RoleLookupTextCell';
import { PermissionExistLookupCell } from 'src/modules/security/components/PermissionExistLookupCell/PermissionExistLookupCell';
import { LookupTextCell } from 'src/modules/shared/components/DataGrid/Cells/LookupTextCell';
import { DefaultTypeCell } from 'src/modules/shared/components/DataGrid/Cells/DefaultTypeCell';

const gridName = "PermissionsGrid";
const apiController = "permissions";

class PermissionManagement extends SearchPage<PermissionSearchCriteria> {

    defaultSort: SortDescriptor = { field: "role", dir: `asc` };

    render() {
        return (
            <>
                <PermissionFilterBox history={this.props.history} onNewClick={this.goToAddNewPage} />

                <div className="largeScreen">
                    <DataGrid name={gridName} history={this.props.history} onRowClick={this.goToDetailPage}>
                        <GridColumn field="role" title={localise("TEXT_ROLE")} cell={RoleLookupTextCell()} />
                        <GridColumn field="webPermissions" sortable={false} title={localise("TEXT_PERMISSIONS_FOR_WEB")} cell={PermissionExistLookupCell("LIST_WEB_PERMISSIONS")} />
                        <GridColumn field="cabinetPermission" sortable={false} title={localise("TEXT_PERMISSIONS_FOR_CABINET")} cell={PermissionExistLookupCell("LIST_CABINET_PERMISSIONS")} />
                        <GridColumn field="isDefault" title={localise("TEXT_TYPE")} cell={DefaultTypeCell()} />
                        <GridColumn sortable={false} title={localise('TEXT_PERMISSION_DESCRIPTION')} cell={LookupTextCell("LIST_ROLES", "remark", "role")} />
                        <GridColumn field="userCount" title={localise("TEXT_USERS")} />
                        <GridColumn field="updatedOnUtc" title={localise("TEXT_LAST_UPDATE")} cell={DateTimeFormatCell()} />
                        <GridColumn field="updatedByName" title={localise("TEXT_LAST_UPDATED_BY")} />
                    </DataGrid>
                </div>
                <div className="smallScreen user-grid">
                    <DataGrid name={gridName} history={this.props.history} onRowClick={this.goToDetailPage}>
                        <GridColumn field="role" title={localise("TEXT_ROLE")} cell={RoleLookupTextCell()} />
                        <GridColumn field="webPermissions" sortable={false} title={localise("TEXT_PERMISSIONS_FOR_WEB")} cell={PermissionExistLookupCell("LIST_WEB_PERMISSIONS")} />
                        <GridColumn field="cabinetPermission" sortable={false} title={localise("TEXT_PERMISSIONS_FOR_CABINET")} cell={PermissionExistLookupCell("LIST_CABINET_PERMISSIONS")} />
                    </DataGrid>
                </div>
            </>
        )
    }
}

export default SearchPageContainer(PermissionManagement, gridName, apiController);


// WEBPACK FOOTER //
// ./src/modules/security/components/PermissionManagement/PermissionManagement.tsx