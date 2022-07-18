import * as React from "react";
import { FilterGrid, FilterGridProps } from "../../../shared/components/FilterGrid/FilterGrid";
import { localise } from "../../../shared/services";
import { TooltipCell } from "../../../shared/components/DataGrid/Cells/TooltipCell";

interface Props {
    show?: boolean;
    view?: string;
    data?: any;
}

interface State {
    currentFilter?: FilterGridProps;
    filterText: string;
    dropdownId: string;
}

export default class CabinetControlCenterFilter extends React.Component<Props, State> {
    constructor(props: any) {
        super(props);
        this.onFilterChange = this.onFilterChange.bind(this);
        this.state = {
            filterText: '',
            dropdownId: ''
        };
    }

    onFilterChange(primaryFilter: string, dropdownId: string) {
        this.setState({ ...this.state, filterText: primaryFilter, dropdownId: dropdownId })
    }

    componentDidMount() {
        this.setFilterProps(this.props.view || '');
    }

    getFilteredData(filter: string, secondaryFilter: string) {
        let items = this.props.data;
        let currentFilter = this.state.currentFilter;
        let filterProp = (currentFilter && currentFilter.primaryFilter && currentFilter.primaryFilter.filterProp) || '';
        let secondaryFilterProp = (currentFilter && currentFilter.secondaryFilter && currentFilter.secondaryFilter.filterProp) || '';

        return items && items.filter((item: any) => {
            return (currentFilter && currentFilter.secondaryFilter) ?
                (item[filterProp].toLowerCase().includes(filter.toLowerCase())
                    && (secondaryFilter == "*" || secondaryFilter == "" || item[secondaryFilterProp].toLowerCase() == secondaryFilter.toLowerCase())) :
                (item[filterProp].toLowerCase().includes(filter.toLowerCase()));
        });
    }

    setFilterProps(view: string) {
        let columns = this.getColumns(view);

        switch (view) {
            case "configuration":
                this.setState({
                    ...this.state,
                    currentFilter: {
                        primaryFilter: {
                            filterProp: 'key',
                            labelKey: 'TEXT_CABINET_CONFIGURATION_KEY',
                            remarkKey: 'REMARK_FILTER_CONFIGURATION_KEY'
                        },
                        columns: columns
                    }
                });
                break;
            case "states":
                this.setState({
                    ...this.state,
                    currentFilter: {
                        primaryFilter: {
                            filterProp: 'key',
                            labelKey: 'TEXT_STATE',
                            remarkKey: 'REMARK_FILTER_STATE',
                        },
                        columns: columns
                    }
                });
                break;
            case "items":
                this.setState({
                    ...this.state,
                    currentFilter: {
                        primaryFilter: {
                            filterProp: 'key',
                            labelKey: 'TEXT_ITEM',
                            remarkKey: 'REMARK_FILTER_ITEM',
                        },
                        secondaryFilter: {
                            filterProp: 'value',
                            dropdownKey: 'LIST_ITEM_STATES',
                            allowAll: true,
                            allText: localise('TEXT_ALLSTATES'),
                            labelKey: 'TEXT_STATE',
                            remarkKey: 'REMARK_SELECT_STATE',
                        },
                        columns: columns
                    }
                });
                break;
        }
    }

    getColumns(view: string) {
        switch (view) {
            case "configuration":
                return [
                    { field: 'key', titleKey: 'TEXT_CABINET_CONFIGURATION_KEY', cell: TooltipCell() },
                    { field: 'value', titleKey: 'TEXT_CABINET_CONFIGURATION_VALUE' }
                ]
            case "states":
                return [
                    { field: 'key', titleKey: 'TEXT_STATE' },
                    { field: 'value', titleKey: 'TEXT_CABINET_CONFIGURATION_VALUE' }
                ]
            case "items":
                return [
                    { field: 'key', titleKey: 'TEXT_ITEM_NAME' },
                    { field: 'value', titleKey: 'TEXT_STATE' },
                    { field: 'lastAccessedBy', titleKey: 'TEXT_LAST_ACCESSED_BY' }
                ]
        }
        return [];
    }

    render() {
        const { currentFilter, filterText, dropdownId } = this.state;
        
        return (
            <>
                {
                    this.props.show && currentFilter
                    &&
                    <FilterGrid onHandleFilterChange={this.onFilterChange}
                        key={this.props.view}
                        data={this.getFilteredData(filterText, dropdownId)}
                        columns={currentFilter.columns}
                        primaryFilter={currentFilter.primaryFilter}
                        secondaryFilter={currentFilter.secondaryFilter} />
                }
            </>
        );
    }
}


// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetControlCenter/CabinetControlCenterFilter.tsx