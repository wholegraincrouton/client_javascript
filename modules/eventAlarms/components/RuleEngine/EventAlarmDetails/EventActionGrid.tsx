import * as React from "react";
import { Row, Col, Input } from "reactstrap";
import {
    Grid, GridColumn, GridSortChangeEvent, GridCellProps,
    GridSelectionChangeEvent, GridHeaderSelectionChangeEvent
} from "@progress/kendo-react-grid";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { lookupService, localise } from "src/modules/shared/services";
import { ActionConfig } from "src/modules/eventAlarms/types/dto";
import { LookupDropDown } from "src/modules/shared/components/LookupDropDown/LookupDropDown";

interface Props {
    customerId: string;
    actions: ActionConfig[];
    onChange: (actions: ActionConfig[]) => void;
    defaultActions?: ActionConfig[];
    readonly?: boolean;
}

interface State {
    actions: GridAction[];
    totalCount: number;
    selectedCount: number;
    sort: SortDescriptor[];
}

interface GridAction extends ActionConfig {
    actionName: string;
    rowSelected: boolean;
    rowExpanded: boolean;
    description: string;
    isDefault: boolean;
}

export class EventActionGrid extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.onHeaderSelectionChange = this.onHeaderSelectionChange.bind(this);
        this.onDurationChange = this.onDurationChange.bind(this);
        this.onPopupContentChange = this.onPopupContentChange.bind(this);
        this.changeConfigs = this.changeConfigs.bind(this);
        this.getPopupContentTextarea = this.getPopupContentTextarea.bind(this);
        this.onSort = this.onSort.bind(this);

        let allActions = lookupService.getList("LIST_CABINET_ACTIONS", props.customerId);
        let existingActions = props.actions;

        this.state = {
            actions: allActions.map(i => {
                let item = existingActions.find(a => a.name == i.value);
                let action: GridAction = {
                    name: i.value || '',
                    actionName: i.text || '',
                    rowSelected: item != undefined,
                    rowExpanded: item != undefined && i.value == "TOUCH_SCREEN_POPUP_SHOW",
                    duration: (item && item.duration) || '',
                    description: i.remark || '',
                    content: (item && item.content) || '',
                    isDefault: (props.defaultActions && props.defaultActions.some(a => a.name == i.value)) || false
                };
                return action;
            }),
            totalCount: allActions.length,
            selectedCount: existingActions.length,
            sort: [{ field: 'actionName', dir: 'asc' }]
        }
    }

    onSelectionChange(event: GridSelectionChangeEvent) {
        const { actions } = this.state;
        const action = actions.find(a => a.name == event.dataItem.name);

        if (action) {
            action.rowSelected = !action.rowSelected;
            action.rowExpanded = action.rowSelected && action.name == "TOUCH_SCREEN_POPUP_SHOW";

            if (!action.rowSelected) {
                action.duration = '';
                action.content = '';
            }
        }

        this.changeConfigs(actions, actions.filter(a => a.rowSelected).length);
    }

    onHeaderSelectionChange(event: GridHeaderSelectionChangeEvent) {
        const { actions, totalCount } = this.state;
        const isSelected = event.nativeEvent.target.checked;
        actions.forEach(a => {
            a.rowSelected = isSelected;
            a.rowExpanded = isSelected && a.name == "TOUCH_SCREEN_POPUP_SHOW";
        });

        if (!isSelected) {
            actions.forEach(a => {
                a.duration = '';
                a.content = '';
            });
        }

        this.changeConfigs(actions, isSelected ? totalCount : 0);
    }

    onDurationChange(event: any, name: string) {
        const { actions } = this.state;
        const action = actions.find(a => a.name == name);

        if (action)
            action.duration = event.target.value;

        this.changeConfigs(actions, actions.filter(a => a.rowSelected).length);
    }

    onPopupContentChange(event: any) {
        const { actions } = this.state;
        const action = actions.find(a => a.name == "TOUCH_SCREEN_POPUP_SHOW");

        if (action)
            action.content = event.target.value;

        this.changeConfigs(actions, actions.filter(a => a.rowSelected).length);
    }

    changeConfigs(actions: GridAction[], selectedCount: number) {
        const { onChange } = this.props;

        onChange(actions.filter(a => a.rowSelected).map(a => {
            let action: ActionConfig = {
                name: a.name,
                duration: a.duration,
                content: a.content
            }
            return action;
        }));

        this.setState({
            ...this.state,
            actions: actions,
            selectedCount: selectedCount
        });
    }

    onSort(e: GridSortChangeEvent) {
        this.setState({
            ...this.state,
            sort: e.sort
        })
    }

    getPopupContentTextarea(e: any) {
        let content = e.dataItem.content;

        return (
            <Input type="textarea" placeholder={localise("REMARK_POPUP_CONTENT")}
                value={content} onChange={this.onPopupContentChange} maxLength={320} />
        );
    }

    onRowRender(tr: any) {
        var isDefault = tr.props.children[0].props.dataItem.isDefault;
        tr = React.cloneElement(tr, {
            ...tr.props,
            className: tr.props.className + (isDefault ? ' is-default' : '')
        }, tr.props.children);
        return tr;
    }

    render() {
        const { actions, totalCount, selectedCount, sort } = this.state;
        const allItemsSelected = actions.every(a => a.rowSelected);
        const { readonly } = this.props;
        return (
            <Row>
                <Col>
                    <Row>
                        <Col>
                            <small className="grid-selection-count">({selectedCount}/{totalCount} {localise("TEXT_SELECTED")})</small>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Grid data={orderBy(actions, sort)}
                                rowRender={this.onRowRender}
                                selectedField="rowSelected"
                                expandField="rowExpanded"
                                detail={this.getPopupContentTextarea}
                                onSelectionChange={this.onSelectionChange}
                                onHeaderSelectionChange={this.onHeaderSelectionChange}
                                sort={sort}
                                sortable={{ allowUnsort: false, mode: 'single' }}
                                onSortChange={this.onSort}
                                className={readonly ? "disabled-grid" : ""}>
                                <GridColumn field="rowSelected" width="auto" className="checkbox-grid-column"
                                    headerClassName="checkbox-grid-column" headerSelectionValue={allItemsSelected} />
                                <GridColumn field="actionName" title={localise("TEXT_ACTION")} />
                                <GridColumn field="duration" title={localise("TEXT_DURATION")} cell={GetActionDurationCell(this.onDurationChange)} />
                                <GridColumn field="description" title={localise("TEXT_DESCRIPTION")} />
                            </Grid>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}

function GetActionDurationCell(onDurationChange: any) {
    return class extends React.Component<GridCellProps> {
        constructor(props: GridCellProps) {
            super(props);
        }

        render() {
            let name = this.props.dataItem['name'];
            let selectedValue = this.props.dataItem["duration"];
            let rowSelected = this.props.dataItem["rowSelected"];

            return (
                <td>
                    <LookupDropDown lookupKey="LIST_TIME_DURATIONS" value={selectedValue}
                        disabled={!rowSelected} onChange={(e: any) => onDurationChange(e, name)} />
                    <div id='errorDiv' />
                </td>
            )
        }
    };
}



// WEBPACK FOOTER //
// ./src/modules/eventAlarms/components/RuleEngine/EventAlarmDetails/EventActionGrid.tsx