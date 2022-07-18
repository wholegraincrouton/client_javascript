import * as React from "react";
import { Row, Col, Label, Input } from "reactstrap";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { FilterColumn, FilterField } from "./dto";
import { localise } from "../../services/localisation.service";
import { LookupDropDown } from "../../components/LookupDropDown/LookupDropDown";
import "./filter-grid.css";

export interface FilterGridProps {
    data?: any[];
    columns?: FilterColumn[];
    primaryFilter?: FilterField;
    secondaryFilter?: FilterField;
    onHandleFilterChange?: (text: string, secondaryFilter: string) => void;
}

interface FilterGridState {
    data?: any[];
    filterText?: string;
    dropdownId?: string;
}

export class FilterGrid extends React.Component<FilterGridProps, FilterGridState> {

    constructor(props: any) {
        super(props);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleDropdownChange = this.handleDropdownChange.bind(this);

        this.state = {
            data: this.props.data && this.props.data.map((item) => {
                let stateItem = {};
                this.props.columns && this.props.columns.map((column) => {
                    stateItem[column.field] = item[column.field];
                })
                return stateItem;
            })
        }
    }

    handleTextChange(event: any) {
        let filter = event.target.value;
        let secondaryFilter = this.state.dropdownId || '';
        
        this.setState({
            ...this.state,
            filterText: filter
        });

        this.props.onHandleFilterChange && this.props.onHandleFilterChange(filter, secondaryFilter);
    }

    handleDropdownChange(event: any) {
        let filter = this.state.filterText || '';
        let secondaryFilter = event.target.value;
        
        this.setState({
            ...this.state,
            dropdownId: secondaryFilter
        });

        this.props.onHandleFilterChange && this.props.onHandleFilterChange(filter, secondaryFilter);
    }

    render() {
        const { columns, primaryFilter, secondaryFilter } = this.props;

        return (
            <div className="filter-grid">
                {
                    this.props.data && primaryFilter
                    &&
                    <Row>
                        <Col>
                            <Row>
                                <Col className="primary-filter-column">
                                    <Row>
                                        <Col>
                                            <Label className="system-label">
                                                {localise(primaryFilter.labelKey)}
                                            </Label>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Input maxLength={50} onChange={this.handleTextChange} />
                                        </Col>
                                    </Row>
                                    {
                                        primaryFilter.remarkKey
                                        &&
                                        <Row>
                                            <Col>
                                                <small className="text-muted">
                                                    {localise(primaryFilter.remarkKey)}
                                                </small>
                                            </Col>
                                        </Row>
                                    }
                                </Col>
                                {
                                    secondaryFilter && secondaryFilter.dropdownKey
                                    &&
                                    <Col>
                                        <Row>
                                            <Col>
                                                <Label className="system-label">
                                                    {localise(secondaryFilter.labelKey)}
                                                </Label>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <LookupDropDown lookupKey={secondaryFilter.dropdownKey} onChange={this.handleDropdownChange}
                                                    allowAll={secondaryFilter.allowAll} textAll={secondaryFilter.allText} />
                                            </Col>
                                        </Row>
                                        {
                                            secondaryFilter.remarkKey
                                            &&
                                            <Row>
                                                <Col>
                                                    <small className="text-muted">
                                                        {localise(secondaryFilter.remarkKey)}
                                                    </small>
                                                </Col>
                                            </Row>
                                        }
                                    </Col>
                                }
                            </Row>
                            <Row>
                                <Col className="grid-column">
                                    {
                                        this.props.data && this.props.data.length > 0 &&
                                            columns && columns.length > 0 ?
                                            <Grid data={this.props.data}>
                                                {
                                                    columns.map((column, key) => {
                                                        return <GridColumn key={key} field={column.field} title={localise(column.titleKey)}
                                                            width={column.width} cell={column.cell} />
                                                    })
                                                }
                                            </Grid>
                                            :
                                            <div>
                                                <hr />
                                                <div className="text-muted text-center">{localise("ERROR_SEARCH_RESULT")}</div>
                                            </div>
                                    }
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                }
            </div>
        );
    }
}


// WEBPACK FOOTER //
// ./src/modules/shared/components/FilterGrid/FilterGrid.tsx