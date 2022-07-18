import * as React from "react";
import { SearchFilterBox, SearchFilterBoxProps, SearchFilterField } from "../../../shared/components/SearchFilterBox";
import { TemplateSearchCriteria } from "../../types/dto";
import { Col, Row } from "reactstrap";
import { contextService, lookupService } from "../../../shared/services";
import { LookupDropDown } from "../../../shared/components/LookupDropDown/LookupDropDown";
import AutoCompleteSearchField from "src/modules/shared/components/AutoCompleteSearchField/AutoCompleteSearchField";

export class TemplateFilterBox extends SearchFilterBox<TemplateSearchCriteria> {
  templateKeyList: string[] = [];
  templateLookups: any[] = [];

  constructor(props: SearchFilterBoxProps) {
    super(props, {
      contextCustomerId: contextService.getCurrentCustomerId(),
      culture: "any",
      section: "any",
      key: "",
      channel: ""
    });

    this.handleKeyBlur = this.handleKeyBlur.bind(this);
  }

  componentDidMount() {
    this.getData();
    super.componentDidMount();
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    const previousCustomerId = prevProps.customerId;
    const prevChannel = prevState.channel;
    let customerId = contextService.getCurrentCustomerId();

    if (customerId != previousCustomerId || this.state.channel != prevChannel) {
      this.getData();
    }
  }

  getData() {
    let customerId = contextService.getCurrentCustomerId();
    this.templateKeyList = [];
    this.templateLookups = [];

    switch (this.state.channel) {
      case "EMAIL":
        this.templateLookups = lookupService.getListByCustomer(["LIST_EMAIL_TEMPLATES"], customerId);
        break;
      case "SMS":
        this.templateLookups = lookupService.getListByCustomer(["LIST_SMS_TEMPLATES"], customerId);
        break;
    }

    this.templateLookups.forEach(item => {
      this.templateKeyList.push(item.text);
    });
  }

  getFields(): JSX.Element {
    const { state } = this;
    return (<Row className="filter-fields">
      <Col lg={6} xl={2}>
        <SearchFilterField titleKey="TEXT_CULTURE">
          <LookupDropDown name="culture" lookupKey="LIST_CULTURE" allowAny={true} textAny="TEXT_ANY_CULTURE"
            value={state.culture} onChange={this.handleChange} />
        </SearchFilterField>
      </Col>
      <Col lg={6} xl={2}>
        <SearchFilterField titleKey="TEXT_SECTION">
          <LookupDropDown name="section" lookupKey="LIST_SECTION" allowAny={true} textAny="TEXT_ANY_SECTION"
            value={state.section} onChange={this.handleChange} />
        </SearchFilterField>
      </Col>
      <Col lg={6} xl={2}>
        <SearchFilterField titleKey="TEXT_CHANNEL">
          <LookupDropDown name="channel" lookupKey="LIST_ALERT_CHANNELS" value={state.channel}
            onChange={this.handleChange} />
        </SearchFilterField>
      </Col>
      <Col lg={6} xl={2}>
        <SearchFilterField titleKey="TEXT_KEY">
          <AutoCompleteSearchField name="key" value={state.key} onChange={this.handleChange} data={this.templateKeyList} onBlur={this.handleKeyBlur} />
        </SearchFilterField>
      </Col>
    </Row>
    );
  }

  validateCriteria(criteria: TemplateSearchCriteria): boolean {
    return (
      criteria.contextCustomerId.length > 0 && criteria.culture.length > 0 &&
      criteria.section.length > 0 && criteria.channel.length > 0
    );
  }

  handleChange(event: any) {
    const { name, value } = event.target;
    this.setState(Object.assign({ ...this.state as any }, { [name]: value }));
  }

  handleKeyBlur(event: any) {
    const { name, value } = event.target;
    var selectedLookup = this.templateLookups.find(lookup => lookup.text == value);
    this.setState({ ...this.state, [name]: selectedLookup != undefined ? selectedLookup.value : value.toUpperCase() });
  }
}



// WEBPACK FOOTER //
// ./src/modules/template/components/TemplateManagement/TemplateFilterBox.tsx