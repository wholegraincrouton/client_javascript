import * as React from 'react';
import { GridColumn } from '@progress/kendo-react-grid';
import { ConfigurationFilterBox } from '../shared/ConfigurationFilterBox';
import { ConfigurationSearchCriteria } from '../../types/dto';
import { SearchPage, SearchPageContainer } from '../../../shared/components/SearchPage';
import { localise, contextService } from '../../../shared/services';
import { SortDescriptor } from '@progress/kendo-data-query';
import { DataGrid, LookupTextCell, DateTimeFormatCell } from '../../../shared/components/DataGrid';

const gridName = "LocalizationGrid";
const apiController = "localisationtexts";

class LocalisationManagement extends SearchPage<ConfigurationSearchCriteria> {

    defaultSort: SortDescriptor = { field: "key", dir: "asc" };

    render() {
        return (
            <>
                <ConfigurationFilterBox history={this.props.history} onNewClick={this.goToAddNewPage} name={gridName} customerId={contextService.getCurrentCustomerId()} />
                <div className="screen-change">
                    <DataGrid name={gridName} history={this.props.history} onRowClick={this.goToDetailPage}>
                        <GridColumn field="culture" title={localise("TEXT_CULTURE")} cell={LookupTextCell("LIST_CULTURE")} />
                        <GridColumn field="section" title={localise("TEXT_SECTION")} cell={LookupTextCell("LIST_SECTION")} />
                        <GridColumn field="key" title={localise("TEXT_KEY")} />
                        <GridColumn field="value" title={localise("TEXT_VALUE")} />
                        <GridColumn field="updatedOnUtc" title={localise("TEXT_LAST_UPDATE")} cell={DateTimeFormatCell()} />
                        <GridColumn field="updatedByName" title={localise("TEXT_LAST_UPDATED_BY")} />
                    </DataGrid>
                </div>
            </>
        );
    }
}

export default SearchPageContainer(LocalisationManagement, gridName, apiController);


// WEBPACK FOOTER //
// ./src/modules/configuration/components/LocalisationManagement/LocalisationManagement.tsx