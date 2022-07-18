import * as React from "react";
import { SearchFilterBox, SearchFilterBoxProps } from "../../../shared/components/SearchFilterBox";
import { BulkDataOperationType } from "../../types/dto";
import { contextService, apiService, permissionService } from "../../../shared/services";
import { ActionButton } from "src/modules/shared/components/ActionButtons/ActionButtons";
import { store } from "src/redux/store";
import { dataGridActions } from "src/modules/shared/actions/data-grid.actions";
import { ImportPopup } from "../BulkDataImport/ImportPopup/ImportPopup";
import { SearchCriteriaBase } from "src/modules/shared/types/dto";

export class BulkDataFilterBox extends SearchFilterBox<SearchCriteriaBase>{
    constructor(props: SearchFilterBoxProps) {
        super(props, {});
        this.exportClick = this.exportClick.bind(this);
    }

    exportClick() {
        const customerId = contextService.getCurrentCustomerId();

        apiService.post('bulkData', undefined, { operationTypeCode: BulkDataOperationType.Export, customerId: customerId }).then(() => {
            store.dispatch<any>(dataGridActions.refreshGrid('BulkDataGrid'));
        });
    }

    getButtons(): JSX.Element[] {
        const customerId = contextService.getCurrentCustomerId();
        let canPerformBulkDataOperation = permissionService.isActionPermittedForCustomer("SEARCH", customerId);

        let elements = [];
        
        if (canPerformBulkDataOperation) {
            elements.push(<ActionButton className="float-right" key="exportbtn" textKey="TEXT_EXPORT" color="secondary"
                icon="fa-download" onClick={this.exportClick} />);
            elements.push(<ImportPopup history={this.props.history} parentPageCustomerId={customerId}
                key={customerId} />);
        }
        return elements;
    }

    validateCriteria() { return true }
}



// WEBPACK FOOTER //
// ./src/modules/bulkData/components/BulkDataManagement/BulkDataFilterBox.tsx