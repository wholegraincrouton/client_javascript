import * as React from "react";
import { Row, Col, CardBody, Card, Form, Label, Input, Button } from "reactstrap";
import { ActionButton, NewButton } from "../ActionButtons/ActionButtons";
import * as qs from "query-string";
import { History, Location, UnregisterCallback } from "history";
import { localise } from "../../services";
import { SearchCriteriaBase } from "../../types/dto";
import "./SearchFilterBox.css";
import { permissionService } from "../../services/permission.service";


export interface SearchFilterBoxProps {
    history: History;
    onNewClick?: () => void;
    recordsExist?: boolean;
    hideIncludeDeleteOption?: boolean;
    searchPermission?: string;
    hideNewButton?: boolean;
    customerId?: string;
    name?: string;
    selectedColumns?: string[];
}

export interface SearchFilterBoxState {
    showFilters: boolean;
    selectedColumns?: string[];
}

export abstract class SearchFilterBox<T extends SearchCriteriaBase>
    extends React.Component<SearchFilterBoxProps, SearchFilterBoxState & T> {

    constructor(props: SearchFilterBoxProps, childState: T) {
        super(props);

        this.initialState = Object.assign({ includeDeleted: false, showFilters: true }, childState);
        (this.state as any) = this.initialState;

        this.toggleShowFilters = this.toggleShowFilters.bind(this);
        this.toggleIncludeDeleted = this.toggleIncludeDeleted.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.isPermittedToSearch = this.isPermittedToSearch.bind(this);
    }

    initialState: T;
    historyUnlisten: UnregisterCallback;

    abstract validateCriteria(criteria: T): boolean;

    getButtons(): JSX.Element[] {
        return [];
    }

    getFields(): JSX.Element {
        return <></>;
    }

    componentDidMount() {
        this.setSearchCriteriaFromUrl(this.props.history.location);
        this.historyUnlisten = this.props.history.listen((location) => {
            this.setSearchCriteriaFromUrl(location);
        });
    }

    componentWillUnmount() {
        this.historyUnlisten();
    }

    setSearchCriteriaFromUrl(location: Location) {
        const criteria = qs.parse(location.search);

        const includeDeleted = criteria.includeDeleted && JSON.parse(criteria.includeDeleted as string) || false;

        this.setState(this.initialState);
        this.setState(Object.assign(criteria as object, {
            includeDeleted: includeDeleted
        }));
    }

    handleChange(event: any) {
        const { name, value } = event.target;
        this.setState(Object.assign(this.state, { [name]: value }));
    }

    onSubmit(event: any) {
        event.preventDefault();

        const criteria = qs.parse(this.props.history.location.search);
        this.props.history.push({
            pathname: "",
            search: qs.stringify(Object.assign(criteria, this.state))
        });
    }

    toggleIncludeDeleted(e: any) {
        this.setState(Object.assign(this.state,
            { includeDeleted: !this.state.includeDeleted }
        ));
    }

    toggleShowFilters() {
        this.setState({ ...this.state, showFilters: !this.state.showFilters });
    }

    isPermittedToSearch() {
        const { searchPermission } = this.props;
        if (searchPermission)
            return permissionService.checkIfPermissionExists(searchPermission);
        return permissionService.canPermissionGrant('SEARCH');
    }

    render() {
        const isValid = this.validateCriteria(this.state);
        const { showFilters } = this.state;

        return (
            <Card className="page-fixed-content search-filter-box compact mt-2">
                <CardBody>
                    {
                        showFilters &&
                        <Form className="mb-2" onSubmit={this.onSubmit}>
                            <Row>
                                <Col xs={12} md>
                                    <Row className="mb-2">
                                        <Col>
                                            {this.getFields()}
                                        </Col>
                                    </Row>
                                    {!this.props.hideIncludeDeleteOption && <Row>
                                        <Col>
                                            <Label check>
                                                <Input type="checkbox" checked={this.state.includeDeleted} onChange={this.toggleIncludeDeleted} />
                                                {localise('CHECK_INCLUDE_DELETED_RECORDS')}
                                            </Label>
                                        </Col>
                                    </Row>}
                                </Col>
                                <Col md={12} lg="auto" className="d-flex flex-column pt-2 pt-lg-0 m-t-5">
                                    {!this.props.hideNewButton && <NewButton onClick={this.props.onNewClick} />}
                                    {...this.getButtons()}
                                    <ActionButton type="submit" className={!this.props.hideNewButton ? "mt-2" : ""}
                                        disabled={!isValid} textKey="BUTTON_SEARCH" color="primary" icon="fa-search"
                                        isPermissionAllowed={this.isPermittedToSearch()} disableDefaultMargin={true} />
                                </Col>
                            </Row>
                        </Form>
                    }
                    <Row className="text-right">
                        <Col>
                            <Button className="pt-0 pb-0" color="link" onClick={this.toggleShowFilters}>
                                <i className={`fas fa-angle-${showFilters ? 'up' : 'down'} fa-lg`} />
                                &nbsp;&nbsp;
                                {localise(`TEXT_${showFilters ? 'HIDE' : 'SHOW_FILTERS'}`)}
                            </Button>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        );
    }
}


// WEBPACK FOOTER //
// ./src/modules/shared/components/SearchFilterBox/SearchFilterBox.tsx