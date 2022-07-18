import * as React from "react";
import { Col, Row } from "reactstrap";
import { ConfigurationSearchCriteria } from "../../types/dto";
import { LookupDropDown } from "../../../shared/components/LookupDropDown/LookupDropDown";
import { SearchFilterBox, SearchFilterBoxProps, SearchFilterField } from "../../../shared/components/SearchFilterBox";
import { contextService, lookupService, configService } from "../../../shared/services";
import AutoCompleteSearchField from "src/modules/shared/components/AutoCompleteSearchField/AutoCompleteSearchField";
import { getLocalisationsByCustomer } from "src/modules/shared/services/localisation.service";

export class ConfigurationFilterBox extends SearchFilterBox<ConfigurationSearchCriteria> {
    keyList: string[] = [];
    constructor(props: SearchFilterBoxProps) {
        super(props, {
            contextCustomerId: contextService.getCurrentCustomerId(),
            culture: 'any',
            section: 'any',
            key: ''
        });

        this.handleKeyBlur = this.handleKeyBlur.bind(this);
    }

    componentDidMount() {
        this.getData();
        super.componentDidMount();
    }

    componentDidUpdate(previousProps: any) {
        const previousCustomerId = previousProps.customerId;
        let customerId = contextService.getCurrentCustomerId();
        if (customerId != previousCustomerId) {
            this.getData();
        }
    }

    getData() {
        let customerId = contextService.getCurrentCustomerId();
        var gridName = this.props.name;
        this.keyList = [];
        switch (gridName) {
            case "LookupGrid":
                let lookups = lookupService.getLookupsByCustomer(customerId);
                lookups.forEach(lookup => {
                    this.keyList.push(lookup.key);
                })
                break;
            case "LocalizationGrid":
                var localizations = getLocalisationsByCustomer(customerId);
                localizations.forEach(text => {
                    this.keyList.push(text.key);
                })
                break;
            case "ConfigurationGrid":
                configService.getConfigurationsByCustomer(customerId).then(configs => {
                    {          
                        configs.forEach(config => {
                            this.keyList.push(config.key);
                        })
                    }
                });               
                break;
        }
    }

    getFields(): JSX.Element {
        const { state } = this;
        return <Row className="filter-fields">
            <Col lg={6} xl={3}>
                <SearchFilterField titleKey="TEXT_CULTURE">
                    <LookupDropDown name="culture" lookupKey="LIST_CULTURE" allowAny={true} textAny="TEXT_ANY_CULTURE" value={state.culture} onChange={this.handleChange} />
                </SearchFilterField>
            </Col>
            <Col lg={6} xl={3}>
                <SearchFilterField titleKey="TEXT_SECTION">
                    <LookupDropDown name="section" lookupKey="LIST_SECTION" allowAny={true} textAny="TEXT_ANY_SECTION" value={state.section} onChange={this.handleChange} />
                </SearchFilterField>
            </Col>
            <Col lg={6} xl={3}>
                <SearchFilterField titleKey="TEXT_KEY">
                    <AutoCompleteSearchField name="key" value={state.key} onChange={this.handleChange} data={this.keyList} onBlur={this.handleKeyBlur} />
                </SearchFilterField>
            </Col>
        </Row>
    }

    validateCriteria(criteria: ConfigurationSearchCriteria): boolean {
        return criteria.contextCustomerId.length > 0 && criteria.culture.length > 0 && criteria.section.length > 0;;
    }

    //Make the configuration "Key" input uppercase.
    handleKeyBlur(event: any) {
        const { name, value } = event.target;
        this.setState({ ...this.state, [name]: value.toUpperCase() });
    }
}


// WEBPACK FOOTER //
// ./src/modules/configuration/components/shared/ConfigurationFilterBox.tsx