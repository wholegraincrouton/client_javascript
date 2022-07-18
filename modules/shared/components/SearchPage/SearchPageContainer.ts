import { connect } from "react-redux";
import { SortDescriptor } from "@progress/kendo-data-query";
import { dataGridActions } from "../../../shared/actions/data-grid.actions";
import { SearchCriteriaBase } from "../../types/dto";

const mapStateToProps = (gridName: string) => (state: any) => {
    let dataGrid = state.dataGrid[gridName];
    if (dataGrid)
        return { recordsExist: dataGrid.dataItems && dataGrid.dataItems.length > 0 ? true : false };
    return {}
}

const mapDispatchToProps = (gridName: string, apiController: string, actionMethod?: string,
    disableRecordLimit?: boolean, baseService: string = '') => (dispatch: any) => {
        return {
            search: (sort: SortDescriptor, searchCriteria: SearchCriteriaBase) =>
                dispatch(dataGridActions.loadData(gridName, apiController, sort, searchCriteria, actionMethod, disableRecordLimit, baseService)),

        };
    }

export default (searchPageComponent: any, gridName: string, apiController: string, actionMethod?: string,
    disableRecordLimit?: boolean, baseService: string = '') =>
    connect(mapStateToProps(gridName), mapDispatchToProps(gridName, apiController, actionMethod, disableRecordLimit, baseService))(searchPageComponent);


// WEBPACK FOOTER //
// ./src/modules/shared/components/SearchPage/SearchPageContainer.ts