import * as React from 'react';
import { GridColumn } from '@progress/kendo-react-grid';
import { ConfigurationSearchCriteria } from '../../types/dto';
import { ConfigurationFilterBox } from '../shared/ConfigurationFilterBox';
import { LookupValueCell } from './LookupValueCell';
import { SearchPage, SearchPageContainer } from '../../../shared/components/SearchPage';
import { localise, contextService } from '../../../shared/services';
import { SortDescriptor } from '@progress/kendo-data-query';
import { DataGrid, LookupTextCell, DateTimeFormatCell } from '../../../shared/components/DataGrid';

const gridName = "LookupGrid";
const apiController = "lookups";

class LookupManagement extends SearchPage<ConfigurationSearchCriteria> {

    defaultSort: SortDescriptor = { field: "key", dir: `asc` };

    render() {
        return (
            <>
                <ConfigurationFilterBox history={this.props.history} onNewClick={this.goToAddNewPage} name={gridName} customerId={contextService.getCurrentCustomerId()} />
                <div className="screen-change">
                    <DataGrid name={gridName} history={this.props.history} onRowClick={this.goToDetailPage}>
                        <GridColumn field="culture" title={localise("TEXT_CULTURE")} cell={LookupTextCell("LIST_CULTURE")} />
                        <GridColumn field="section" title={localise("TEXT_SECTION")} cell={LookupTextCell("LIST_SECTION")} />
                        <GridColumn field="key" title={localise("TEXT_KEY")} />
                        <GridColumn field="itemValueList" sortable={false} title={localise("TEXT_VALUE")} cell={LookupValueCell} />
                        <GridColumn field="updatedOnUtc" title={localise("TEXT_LAST_UPDATE")} cell={DateTimeFormatCell()} />
                        <GridColumn field="updatedByName" title={localise("TEXT_LAST_UPDATED_BY")} />
                    </DataGrid>
                </div>
            </>
        )
    }
}

export default SearchPageContainer(LookupManagement, gridName, apiController);


// WEBPACK FOOTER //
// ./src/modules/configuration/components/LookupManagement/LookupManagement.tsx