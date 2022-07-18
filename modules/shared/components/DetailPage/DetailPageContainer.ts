import { connect } from 'react-redux';
import { StoreState } from '../../../../redux/store';
import { DetailObject } from '../../types/store';
import { detailPageActions } from '../../actions/detail-page.actions';

const mapStateToProps = (pageName: string) => (state: StoreState) => {

    const pageState = (state as any).detailPage[pageName];
    return {
        pageName: pageName,
        item: pageState && pageState.item
    }
}

const mapDispatchToProps = (pageName: string, apiController: string, newObjectGenerator?: () => any, baseService? : string) => <T extends DetailObject>(dispatch: any) => {
    return {
        loadData: (id: string) => {
            return dispatch(detailPageActions.loadData(pageName, apiController, id, newObjectGenerator, baseService))
        },
        saveData: (item: T) => {
            return dispatch(detailPageActions.saveData(pageName, apiController, item, baseService))
        },
        delete: (id: string) => {
            return dispatch(detailPageActions.deleteItem(pageName, apiController, id, baseService))
        },
        clearStore: () => {
            dispatch(detailPageActions.clearStore(pageName))
        }
    }
}

export default <T extends DetailObject>(
    detailPageComponent: any,
    pageName: string,
    apiController: string,    
    newObjectGenerator?: () => any,
    baseService? : string) =>
        connect(mapStateToProps(pageName), mapDispatchToProps(pageName, apiController, newObjectGenerator, baseService))(detailPageComponent);


// WEBPACK FOOTER //
// ./src/modules/shared/components/DetailPage/DetailPageContainer.ts