import * as React from "react";
import * as moment from 'moment';
import { Col, Row } from "reactstrap";
import { DateTimePicker } from "@progress/kendo-dateinputs-react-wrapper"; // DateTimePicker from kendo react is the prefered one but it doesnt work with the common redux forms so use this until there is fix.
import { configService } from "src/modules/shared/services";
import { DefaultDateTimeFormats } from "src/modules/shared/constants/datetime.constants";
import { SearchFilterBox, SearchFilterBoxProps, SearchFilterField } from "../../../shared/components/SearchFilterBox";
import { FirmwareSearchCriteria } from "../../types/dto";
import FirmwareVersionList from "../../shared/FirmwareVersionList";

export class FirmwareFilterBox extends SearchFilterBox<FirmwareSearchCriteria>{
    constructor(props: SearchFilterBoxProps) {
        const initialState = {
            version: 'any',
            from: '',
            to: ''
        }

        super(props, initialState);
    }

    onDateChange(event: any, name: string) {
        let value = event.sender.value();

        let e = {
            target: {
                name: name,
                value: value ? moment(value as Date).format(DefaultDateTimeFormats.DateTimeFormat) : undefined
            }
        };

        this.setState({
            ...this.state,
            [name]: value
        }, () => super.handleChange(e));
    }

    getFields(): JSX.Element {
        const { version, from, to } = this.state;

        let fromValid = from && moment(from).isValid();
        let toValid = to && moment(to).isValid();

        return (
            <Row className="filter-fields">
                <Col lg={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_FIRMWARE_VERSION">
                        <FirmwareVersionList name="version" value={version} onChange={this.handleChange} allowAny={true} />
                    </SearchFilterField>
                </Col>
                <Col lg={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_START_DATETIME">
                        <DateTimePicker name="from" value={fromValid ? new Date(from) : undefined}
                            change={(e: any) => this.onDateChange(e, 'from')} max={toValid ? new Date(to) : undefined}
                            format={configService.getKendoDateTimeFormatByCurrentFormat() || configService.getDateTimeFormatConfigurationValue().kendoDateTimeFormat}
                            timeFormat={configService.getKendoTimeFormatByCurrentFormat()} />
                    </SearchFilterField>
                </Col>
                <Col lg={6} xl={3}>
                    <SearchFilterField titleKey="TEXT_END_DATETIME" >
                        <DateTimePicker name="to" value={toValid ? new Date(to) : undefined}
                            change={(e: any) => this.onDateChange(e, 'to')} min={fromValid ? new Date(from) : new Date()}
                            format={configService.getKendoDateTimeFormatByCurrentFormat() || configService.getDateTimeFormatConfigurationValue().kendoDateTimeFormat}
                            timeFormat={configService.getKendoTimeFormatByCurrentFormat()} />
                    </SearchFilterField>
                </Col>
            </Row>
        );
    }

    validateCriteria(criteria: FirmwareSearchCriteria): boolean {
        return criteria.version.length > 0;
    }
}



// WEBPACK FOOTER //
// ./src/modules/firmware/components/FirmwareManagement/FirmwareFilterBox.tsx