import * as React from 'react';
import { SubmissionError } from 'redux-form';
import { Row, Col, Label, Alert } from "reactstrap";
import { TabStrip, TabStripTab } from '@progress/kendo-react-layout';
import { contextService, localise } from '../../../shared/services';
import { DetailPage, DetailFormBodyComponent, DetailPageContainer, DetailFormProps } from '../../../shared/components/DetailPage';
import { ItemGroup } from '../../types/dto';
import { ItemGroupDetailsTab } from './Tabs/ItemGroupDetailsTab';
import { ItemGroupItemsListTab } from './Tabs/ItemGroupItemsListTab';
import { itemGroupService } from '../../services/itemGroup.service';
import '../item-groups.css';

class ItemGroupDetails extends DetailPage<ItemGroup>{
    detailFormBody: DetailFormBodyComponent = FormBody;
    listPagePath: string = "/cabinet/itemgroupmanagement";

    validateItem(item: ItemGroup) {
        return {};
    }
    
    beforeSave(item: ItemGroup, isNew: boolean): boolean {
        let error = this.validate(item, isNew);

        if (error) {
            throw new SubmissionError({
                _error: error
            });
        }

        itemGroupService.clearItemGroupList();
        return true;
    }

    afterDelete() {
        itemGroupService.clearItemGroupList();
        return true;
    }

    validate(item: ItemGroup, isNew: boolean) {
        if (!item.name || !item.remark) {
            return "DETAILS:ERROR_REQUIRED_FIELD";
        }
        return null;
    }

    hideDescriptionHeader() {
        return true;
    }
}

interface State {
    selectedTab: number;
}

class FormBody extends React.Component<DetailFormProps, State> {
    constructor(props: DetailFormProps) {
        super(props);
        this.onSelectTab = this.onSelectTab.bind(this);

        this.state = {
            selectedTab: 0
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

    render() {
        const { props } = this;
        const { selectedTab } = this.state;
        const errorTab = props.error && props.error.split(":")[0];
        const errorMsg = props.error && props.error.split(":")[1];

        return (
            <div className="item-group-tabs">
                <TabStrip selected={selectedTab} onSelect={this.onSelectTab} keepTabsMounted={true}>
                    <TabStripTab title={this.getTabHeader("TEXT_DETAILS", errorTab == "DETAILS")}
                        contentClassName="item-group-details-tab">
                        {errorTab == "DETAILS" && this.getErrorAlertRow(errorMsg)}
                        <ItemGroupDetailsTab {...props} />
                    </TabStripTab>
                    <TabStripTab title={this.getTabHeader("TEXT_ITEM_LIST", false, props.isNew)}
                        contentClassName="item-group-item-list-tab" disabled={props.isNew}>
                        <ItemGroupItemsListTab {...props} />
                    </TabStripTab>
                </TabStrip>
            </div>
        );
    }
}

export default DetailPageContainer(ItemGroupDetails, 'ItemGroupDetails', 'ItemGroup', () => {
    //Code to return a new empty object.
    return { id: "", customerId: contextService.getCurrentCustomerId() }
});



// WEBPACK FOOTER //
// ./src/modules/itemGroups/components/ItemGroupDetails/ItemGroupDetails.tsx